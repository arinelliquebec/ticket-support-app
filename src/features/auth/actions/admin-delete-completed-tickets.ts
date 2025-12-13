"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/features/auth/queries/get-auth";
import { prisma } from "@/lib/prisma";
import { ticketsPath } from "@/paths";
import { Prisma } from "@prisma/client";

/**
 * Interface de resultado para operação de exclusão em massa
 * @interface DeleteCompletedTicketsResult
 * @property {boolean} success - Indica se a operação foi bem-sucedida
 * @property {number} [deletedCount] - Número total de tickets deletados
 * @property {string} [error] - Mensagem de erro, se houver
 * @property {Object} [details] - Detalhes granulares sobre a operação
 */
export interface DeleteCompletedTicketsResult {
  success: boolean;
  deletedCount?: number;
  error?: string;
  details?: {
    ticketsDeleted: number;
    commentsDeleted: number;
    attachmentsDeleted: number;
    ticketIds: string[];
    deletedByFilial?: Record<string, number>;
    executionTimeMs?: number;
  };
}

/**
 * Interface para estatísticas de tickets concluídos
 * @interface CompletedTicketsStats
 */
export interface CompletedTicketsStats {
  success: boolean;
  error?: string;
  stats?: {
    totalTickets: number;
    totalComments: number;
    totalAttachments: number;
    byFilial: Record<string, number>;
    byUser?: Array<{ username: string; count: number }>;
    oldestTicketDate?: Date;
    newestTicketDate?: Date;
    tickets: Array<{
      id: string;
      title: string;
      createdAt: Date;
      filial: string | null;
      user: { username: string } | null;
      _count: {
        comments: number;
        attachments: number;
      };
    }>;
  };
}

/**
 * Deleta todos os tickets com status CONCLUÍDO de forma segura e transacional
 *
 * @description Esta função implementa uma exclusão em massa com as seguintes características:
 * - Validação rigorosa de permissões (apenas ADMIN)
 * - Transação atômica para garantir integridade referencial
 * - Logging detalhado para auditoria
 * - Revalidação seletiva de cache
 * - Tratamento específico de erros do Prisma
 *
 * @returns {Promise<DeleteCompletedTicketsResult>} Resultado detalhado da operação
 *
 * @example
 * const result = await adminDeleteCompletedTickets();
 * if (result.success) {
 *   console.log(`${result.deletedCount} tickets deletados`);
 * }
 */
export async function adminDeleteCompletedTickets(): Promise<DeleteCompletedTicketsResult> {
  const startTime = performance.now();

  try {
    // ==========================
    // 1. VALIDAÇÃO DE SEGURANÇA
    // ==========================
    const { user } = await getAuth();

    if (!user) {
      return {
        success: false,
        error: "Usuário não autenticado. Acesso negado.",
      };
    }

    if (user.role !== "ADMIN") {
      // Log tentativa de acesso não autorizado para auditoria
      console.warn(
        `[SECURITY] Non-admin user ${user.username} (${user.id}) attempted bulk delete operation`
      );

      return {
        success: false,
        error:
          "Somente administradores podem executar operações de exclusão em massa",
      };
    }

    // =======================================
    // 2. ANÁLISE PRÉ-EXCLUSÃO COM AGREGAÇÕES
    // =======================================
    const completedTickets = await prisma.ticket.findMany({
      where: {
        status: "CONCLUÍDO",
      },
      select: {
        id: true,
        title: true,
        filial: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
    });

    // Verificação de early return se não houver tickets
    if (completedTickets.length === 0) {
      return {
        success: true,
        deletedCount: 0,
        details: {
          ticketsDeleted: 0,
          commentsDeleted: 0,
          attachmentsDeleted: 0,
          ticketIds: [],
          executionTimeMs: performance.now() - startTime,
        },
      };
    }

    // Extração de IDs para operações em batch
    const ticketIds = completedTickets.map((ticket) => ticket.id);

    // Análise de distribuição por filial
    const deletedByFilial = completedTickets.reduce((acc, ticket) => {
      const filial = ticket.filial || "Sem Filial";
      acc[filial] = (acc[filial] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // ==========================================
    // 3. CONTAGEM DE REGISTROS RELACIONADOS
    // ==========================================
    const [commentsCount, attachmentsCount] = await Promise.all([
      prisma.comment.count({
        where: {
          ticketId: {
            in: ticketIds,
          },
        },
      }),
      prisma.fileAttachment.count({
        where: {
          ticketId: {
            in: ticketIds,
          },
        },
      }),
    ]);

    // =========================================
    // 4. TRANSAÇÃO ATÔMICA COM ISOLAMENTO ALTO
    // =========================================
    const transactionResult = await prisma.$transaction(
      async (tx) => {
        // 4.1 Deletar comentários (tabela dependente)
        const deletedComments = await tx.comment.deleteMany({
          where: {
            ticketId: {
              in: ticketIds,
            },
          },
        });

        // 4.2 Deletar anexos (tabela dependente)
        const deletedAttachments = await tx.fileAttachment.deleteMany({
          where: {
            ticketId: {
              in: ticketIds,
            },
          },
        });

        // 4.3 Deletar tickets principais
        const deletedTickets = await tx.ticket.deleteMany({
          where: {
            status: "CONCLUÍDO",
          },
        });

        return {
          tickets: deletedTickets,
          comments: deletedComments,
          attachments: deletedAttachments,
        };
      },
      {
        // Configurações de transação para máxima consistência
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000, // Tempo máximo de espera na fila de transações
        timeout: 10000, // Timeout total da transação
      }
    );

    // ===============================
    // 5. LOGGING DETALHADO PARA AUDITORIA
    // ===============================
    const executionTime = performance.now() - startTime;

    console.log(
      JSON.stringify(
        {
          event: "ADMIN_BULK_DELETE_COMPLETED_TICKETS",
          timestamp: new Date().toISOString(),
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
          },
          operation: {
            ticketsDeleted: transactionResult.tickets.count,
            commentsDeleted: transactionResult.comments.count,
            attachmentsDeleted: transactionResult.attachments.count,
            ticketIds: ticketIds,
            deletedByFilial,
            executionTimeMs: executionTime,
          },
          metadata: {
            ip:
              process.env.NODE_ENV === "production"
                ? "[REDACTED]"
                : "localhost",
            userAgent: "[SERVER_ACTION]",
          },
        },
        null,
        2
      )
    );

    // ======================================
    // 6. INVALIDAÇÃO SELETIVA DE CACHE
    // ======================================
    // Revalidar apenas as rotas afetadas pela exclusão
    const pathsToRevalidate = [
      ticketsPath(), // Lista principal de tickets
      "/admin", // Dashboard administrativo
      "/admin/tickets", // Página de gerenciamento
      "/", // Homepage com estatísticas
      "/api/dashboard-stats", // Endpoint de estatísticas
    ];

    // Executar revalidações em paralelo para performance
    await Promise.all(pathsToRevalidate.map((path) => revalidatePath(path)));

    // ======================================
    // 7. RETORNO COM DADOS COMPLETOS
    // ======================================
    return {
      success: true,
      deletedCount: transactionResult.tickets.count,
      details: {
        ticketsDeleted: transactionResult.tickets.count,
        commentsDeleted: transactionResult.comments.count,
        attachmentsDeleted: transactionResult.attachments.count,
        ticketIds,
        deletedByFilial,
        executionTimeMs: executionTime,
      },
    };
  } catch (error) {
    // ======================================
    // 8. TRATAMENTO ESPECÍFICO DE ERROS
    // ======================================
    const executionTime = performance.now() - startTime;

    console.error(
      JSON.stringify(
        {
          event: "ADMIN_BULK_DELETE_ERROR",
          timestamp: new Date().toISOString(),
          error: {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            type: error?.constructor?.name,
          },
          executionTimeMs: executionTime,
        },
        null,
        2
      )
    );

    // Tratamento específico para erros do Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2003":
          return {
            success: false,
            error:
              "Erro de integridade referencial: existem registros dependentes que impedem a exclusão",
          };
        case "P2025":
          return {
            success: false,
            error:
              "Registros não encontrados: os tickets podem ter sido modificados por outro processo",
          };
        case "P2034":
          return {
            success: false,
            error:
              "Conflito de transação: múltiplas operações simultâneas detectadas",
          };
        default:
          return {
            success: false,
            error: `Erro de banco de dados: ${error.code} - ${error.message}`,
          };
      }
    }

    // Erro genérico
    return {
      success: false,
      error:
        error instanceof Error
          ? `Erro ao executar exclusão: ${error.message}`
          : "Erro desconhecido ao processar exclusão em massa",
    };
  }
}

/**
 * Obtém estatísticas detalhadas sobre tickets concluídos antes da exclusão
 *
 * @description Fornece uma visão completa dos dados que serão afetados pela exclusão,
 * permitindo ao administrador tomar uma decisão informada
 *
 * @returns {Promise<CompletedTicketsStats>} Estatísticas detalhadas
 */
export async function getCompletedTicketsStats(): Promise<CompletedTicketsStats> {
  try {
    // Validação de segurança
    const { user } = await getAuth();

    if (!user || user.role !== "ADMIN") {
      return {
        success: false,
        error: "Acesso negado: privilégios administrativos necessários",
      };
    }

    // Query otimizada com seleção específica de campos
    const tickets = await prisma.ticket.findMany({
      where: {
        status: "CONCLUÍDO",
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        filial: true,
        user: {
          select: {
            username: true,
          },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Cálculo de agregações
    const totalComments = tickets.reduce(
      (sum, ticket) => sum + ticket._count.comments,
      0
    );
    const totalAttachments = tickets.reduce(
      (sum, ticket) => sum + ticket._count.attachments,
      0
    );

    // Agrupamento por filial
    const byFilial = tickets.reduce((acc, ticket) => {
      const filial = ticket.filial || "Sem Filial";
      acc[filial] = (acc[filial] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Agrupamento por usuário
    const byUser = tickets.reduce((acc, ticket) => {
      const username = ticket.user?.username || "Usuário Removido";
      if (!acc[username]) {
        acc[username] = { username, count: 0 };
      }
      acc[username].count++;
      return acc;
    }, {} as Record<string, { username: string; count: number }>);

    // Identificar intervalo de datas
    const dates = tickets
      .map((t) => t.createdAt)
      .sort((a, b) => a.getTime() - b.getTime());
    const oldestTicketDate = dates[0];
    const newestTicketDate = dates[dates.length - 1];

    return {
      success: true,
      stats: {
        totalTickets: tickets.length,
        totalComments,
        totalAttachments,
        byFilial,
        byUser: Object.values(byUser),
        oldestTicketDate,
        newestTicketDate,
        tickets: tickets.slice(0, 100), // Limitar a 100 para evitar payload muito grande
      },
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas de tickets concluídos:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? `Erro ao carregar estatísticas: ${error.message}`
          : "Erro desconhecido ao processar estatísticas",
    };
  }
}

/**
 * Deleta tickets concluídos com filtros específicos (função avançada)
 *
 * @param filters - Critérios de filtragem para exclusão seletiva
 * @returns {Promise<DeleteCompletedTicketsResult>} Resultado da operação
 */
export async function adminDeleteCompletedTicketsWithFilters(filters: {
  beforeDate?: Date;
  filial?: string;
  excludeWithComments?: boolean;
  excludeWithAttachments?: boolean;
}): Promise<DeleteCompletedTicketsResult> {
  // Implementação futura para exclusão seletiva com filtros
  // Este é um placeholder para extensibilidade
  throw new Error(
    "Função não implementada: exclusão com filtros será adicionada em versão futura"
  );
}
