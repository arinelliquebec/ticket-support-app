import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
export { supabase };

import { prisma } from "@/lib/prisma";

// Habilitar logs detalhados para depuração
const DEBUG = true;

/**
 * Logger de depuração aprimorado
 */
const debug = {
  log: (...args: any[]) => {
    if (DEBUG) console.log("[UploadService]", ...args);
  },
  error: (...args: any[]) => {
    if (DEBUG) console.error("[UploadService ERROR]", ...args);
  },
  info: (...args: any[]) => {
    if (DEBUG) console.info("[UploadService INFO]", ...args);
  },
  warn: (...args: any[]) => {
    if (DEBUG) console.warn("[UploadService WARN]", ...args);
  },
};

/**
 * Verifica e mostra o status da conexão com o Supabase
 */
export const TICKET_ATTACHMENTS_BUCKET = "ticket-attachments";
export const checkSupabaseConnection = async () => {
  try {
    debug.log("Verificando conexão com Supabase...");

    // Verificar se as variáveis de ambiente estão definidas
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      debug.error("Variáveis de ambiente do Supabase não configuradas:");
      debug.error("- NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
      debug.error("- NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseKey ? "✓" : "✗");
      return {
        success: false,
        error:
          "Variáveis de ambiente do Supabase não configuradas corretamente",
      };
    }

    // Testar a conexão com o Supabase listando buckets
    debug.log("Testando API do Supabase...");
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      debug.error("Erro ao conectar com Supabase:", error);
      return {
        success: false,
        error: `Erro de conexão com Supabase: ${error.message}`,
      };
    }

    // Verificar se o bucket existe
    const bucketExists = buckets?.some(
      (bucket: { name: any }) => bucket.name === TICKET_ATTACHMENTS_BUCKET
    );

    if (!bucketExists) {
      debug.warn(`Bucket "${TICKET_ATTACHMENTS_BUCKET}" não encontrado!`);
      return {
        success: false,
        error: `Bucket "${TICKET_ATTACHMENTS_BUCKET}" não encontrado. Execute o script de inicialização.`,
      };
    }

    debug.info("Conexão com Supabase OK!");
    debug.info(
      "Buckets disponíveis:",
      buckets.map((b: { name: any }) => b.name).join(", ")
    );

    return {
      success: true,
      buckets,
    };
  } catch (e) {
    debug.error("Erro ao verificar conexão:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro desconhecido",
    };
  }
};

/**
 * Upload de arquivo para o Supabase com logs detalhados
 */
export const uploadTicketAttachment = async (
  file: File,
  ticketId: string,
  userId: string
): Promise<{
  success: boolean;
  attachment?: any;
  error?: string;
  details?: any;
}> => {
  try {
    debug.log(
      `Iniciando upload: "${file.name}" (${file.size} bytes, tipo: ${file.type}) para ticket: ${ticketId}`
    );

    // Passo 1: Verificar tamanho do arquivo
    if (file.size > 10 * 1024 * 1024) {
      debug.warn(`Arquivo muito grande: ${file.size} bytes`);
      return {
        success: false,
        error: "O arquivo excede o limite de 10MB",
      };
    }

    // Passo 2: Verificar a conexão com o Supabase
    const connectionCheck = await checkSupabaseConnection();
    if (!connectionCheck.success) {
      return connectionCheck;
    }

    // Passo 3: Gerar nome de arquivo exclusivo
    const fileExtension = file.name.split(".").pop() || "";
    const fileName = `ticket_${ticketId}_${Date.now()}_${Math.floor(
      Math.random() * 10000
    )}.${fileExtension}`;
    debug.log(`Nome do arquivo gerado: ${fileName}`);

    // Passo 4: Converter o arquivo para ArrayBuffer
    debug.log("Convertendo arquivo para ArrayBuffer...");
    let buffer: Uint8Array;
    try {
      const arrayBuffer = await file.arrayBuffer();
      buffer = new Uint8Array(arrayBuffer);
      debug.log(`Arquivo convertido: ${buffer.length} bytes`);
    } catch (conversionError) {
      debug.error("Erro ao converter arquivo:", conversionError);
      return {
        success: false,
        error: "Erro ao processar o arquivo",
        details: conversionError,
      };
    }

    // Passo 5: Upload para o Supabase com retry
    debug.log(
      `Iniciando upload para o bucket "${TICKET_ATTACHMENTS_BUCKET}"...`
    );

    let uploadAttempt = 0;
    let uploadResult = null;
    const maxRetries = 2;

    while (uploadAttempt <= maxRetries) {
      try {
        uploadAttempt++;
        debug.log(`Tentativa de upload ${uploadAttempt}/${maxRetries + 1}`);

        const { data, error } = await supabase.storage
          .from(TICKET_ATTACHMENTS_BUCKET)
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: true,
            cacheControl: "3600",
          });

        if (error) {
          debug.warn(`Tentativa ${uploadAttempt} falhou:`, error);

          // Se for o último retry, propagar o erro
          if (uploadAttempt > maxRetries) {
            throw error;
          }

          // Aguardar antes do próximo retry (exponential backoff)
          await new Promise((r) => setTimeout(r, 1000 * uploadAttempt));
          continue;
        }

        uploadResult = data;
        debug.info("Upload bem-sucedido!", data);
        break;
      } catch (retryError) {
        if (uploadAttempt > maxRetries) {
          throw retryError;
        }
      }
    }

    if (!uploadResult) {
      throw new Error("Todas as tentativas de upload falharam");
    }

    // Passo 6: Obter URL pública
    debug.log("Obtendo URL pública do arquivo...");
    const { data: publicUrlData } = supabase.storage
      .from(TICKET_ATTACHMENTS_BUCKET)
      .getPublicUrl(fileName);

    if (!publicUrlData.publicUrl) {
      debug.error("Falha ao obter URL pública");
      return {
        success: false,
        error: "Falha ao obter URL pública do arquivo",
      };
    }

    debug.log(`URL pública obtida: ${publicUrlData.publicUrl}`);

    // Passo 7: Criar registro no banco de dados
    debug.log("Criando registro no banco de dados...");
    const attachment = await prisma.fileAttachment.create({
      data: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileUrl: publicUrlData.publicUrl,
        ticketId,
        userId,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    debug.info("Registro criado com sucesso!", attachment.id);

    return {
      success: true,
      attachment,
    };
  } catch (error) {
    debug.error("Erro durante o upload:", error);

    // Criar um objeto de detalhes do erro para depuração
    const errorDetails = {
      message: error instanceof Error ? error.message : "Erro desconhecido",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    };

    return {
      success: false,
      error: errorDetails.message,
      details: errorDetails,
    };
  }
};

/**
 * Obter anexos de um ticket com controle de acesso
 */
export const getTicketAttachments = async (
  ticketId: string,
  userId: string,
  isAdmin: boolean
) => {
  try {
    debug.log(
      `Buscando anexos para ticket: ${ticketId}, usuário: ${userId}, isAdmin: ${isAdmin}`
    );

    // Verificar se o ticket existe e se o usuário tem permissão
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, userId: true },
    });

    if (!ticket) {
      debug.warn(`Ticket não encontrado: ${ticketId}`);
      return {
        success: false,
        error: "Ticket não encontrado",
      };
    }

    // Verificar permissão - apenas o criador do ticket ou admin pode ver os anexos
    if (!isAdmin && ticket.userId !== userId) {
      debug.warn(
        `Acesso negado para usuário: ${userId}, ticketUserId: ${ticket.userId}`
      );
      return {
        success: false,
        error: "Você não tem permissão para ver estes anexos",
      };
    }

    // Buscar anexos no banco de dados
    const attachments = await prisma.fileAttachment.findMany({
      where: { ticketId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { username: true },
        },
      },
    });

    debug.info(
      `${attachments.length} anexos encontrados para o ticket ${ticketId}`
    );

    return {
      success: true,
      attachments,
    };
  } catch (error) {
    debug.error("Erro ao buscar anexos:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      details: error,
    };
  }
};

/**
 * Excluir um anexo com verificação de permissão
 */
export const deleteTicketAttachment = async (
  attachmentId: string,
  userId: string,
  isAdmin: boolean
) => {
  try {
    debug.log(
      `Tentando excluir anexo: ${attachmentId}, usuário: ${userId}, isAdmin: ${isAdmin}`
    );

    // Buscar o anexo com informações do ticket
    const attachment = await prisma.fileAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        ticket: {
          select: { userId: true },
        },
      },
    });

    if (!attachment) {
      debug.warn(`Anexo não encontrado: ${attachmentId}`);
      return {
        success: false,
        error: "Anexo não encontrado",
      };
    }

    // Verificar permissão - apenas o criador do anexo, o dono do ticket ou admin pode excluir
    if (
      !isAdmin &&
      attachment.userId !== userId &&
      attachment.ticket.userId !== userId
    ) {
      debug.warn(`Permissão negada para usuário: ${userId}`);
      return {
        success: false,
        error: "Você não tem permissão para excluir este anexo",
      };
    }

    // Extrair nome do arquivo da URL
    const filePathMatch = attachment.fileUrl.match(/\/([^/?]+)(?:\?|$)/);
    const filePath = filePathMatch ? filePathMatch[1] : null;

    if (!filePath) {
      debug.warn(
        `Não foi possível extrair o caminho do arquivo da URL: ${attachment.fileUrl}`
      );
      return {
        success: false,
        error: "Formato de URL inválido",
      };
    }

    debug.log(`Excluindo arquivo do Supabase: ${filePath}`);

    // Excluir arquivo do Supabase
    const { error: supabaseError } = await supabase.storage
      .from(TICKET_ATTACHMENTS_BUCKET)
      .remove([filePath]);

    if (supabaseError) {
      debug.warn(
        `Erro ao excluir arquivo do Supabase: ${supabaseError.message}`
      );
      // Continuar mesmo com erro - pode ser que o arquivo já não exista
    }

    // Excluir registro do banco de dados
    debug.log(`Excluindo registro do banco de dados: ${attachmentId}`);
    await prisma.fileAttachment.delete({
      where: { id: attachmentId },
    });

    debug.info(`Anexo ${attachmentId} excluído com sucesso`);

    return {
      success: true,
      message: "Anexo excluído com sucesso",
    };
  } catch (error) {
    debug.error("Erro ao excluir anexo:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      details: error,
    };
  }
};
