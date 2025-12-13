"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/features/auth/queries/get-auth";
import { prisma } from "@/lib/prisma";
import { ticketsPath } from "@/paths";
import { Prisma } from "@prisma/client";

export interface DeleteCompletedTicketsResult {
  success: boolean;
  deletedCount?: number;
  error?: string;
  details?: {
    ticketsDeleted: number;
    commentsDeleted: number;
    attachmentsDeleted: number;
    ticketIds: string[];
  };
}

/**
 * Deleta todos os tickets com status CONCLUÍDO
 * Apenas administradores podem executar esta ação
 *
 * @returns Resultado da operação com detalhes sobre os registros deletados
 */
export async function adminDeleteCompletedTickets(): Promise<DeleteCompletedTicketsResult> {
  try {
    // 1. Verificação de autenticação e autorização
    const { user } = await getAuth();

    if (!user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    if (user.role !== "ADMIN") {
      return {
        success: false,
        error: "Somente administradores podem executar esta ação",
      };
    }

    // 2. Buscar todos os tickets concluídos antes de deletar
    const completedTickets = await prisma.ticket.findMany({
      where: {
        status: "CONCLUÍDO",
      },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
    });

    if (completedTickets.length === 0) {
      return {
        success: true,
        deletedCount: 0,
        details: {
          ticketsDeleted: 0,
          commentsDeleted: 0,
          attachmentsDeleted: 0,
          ticketIds: [],
        },
      };
    }

    // 3. Extrair IDs dos tickets para deletar
    const ticketIds = completedTickets.map((ticket) => ticket.id);

    // 4. Contar registros relacionados antes da exclusão
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

    // 5. Executar exclusão em transação para garantir integridade
    const result = await prisma.$transaction(
      async (tx) => {
        // Deletar comentários primeiro (devido às foreign keys)
        await tx.comment.deleteMany({
          where: {
            ticketId: {
              in: ticketIds,
            },
          },
        });

        // Deletar anexos
        await tx.fileAttachment.deleteMany({
          where: {
            ticketId: {
              in: ticketIds,
            },
          },
        });

        // Finalmente, deletar os tickets
        const deletedTickets = await tx.ticket.deleteMany({
          where: {
            status: "CONCLUÍDO",
          },
        });

        return deletedTickets;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000, // 5 segundos
        timeout: 10000, // 10 segundos
      }
    );

    // 6. Auditoria da operação
    const auditLog = {
      ticketIds,
      timestamp: new Date().toISOString(),
    };

    // 7. Revalidar cache das páginas afetadas
    revalidatePath(ticketsPath());
    revalidatePath("/admin");
    revalidatePath("/");

    return {
      success: true,
      deletedCount: result.count,
      details: {
        ticketsDeleted: result.count,
        commentsDeleted: commentsCount,
        attachmentsDeleted: attachmentsCount,
        ticketIds,
      },
    };
  } catch (error) {
    console.error("Erro ao deletar tickets concluídos:", error);

    // Tratamento específico de erros do Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return {
          success: false,
          error: "Erro de integridade referencial ao deletar tickets",
        };
      }
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao deletar tickets",
    };
  }
}

/**
 * Obtém estatísticas sobre tickets concluídos antes da exclusão
 * Útil para mostrar ao usuário o que será deletado
 */
export async function getCompletedTicketsStats() {
  try {
    const { user } = await getAuth();

    if (!user || user.role !== "ADMIN") {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const stats = await prisma.ticket.findMany({
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

    const totalComments = stats.reduce(
      (sum, ticket) => sum + ticket._count.comments,
      0
    );
    const totalAttachments = stats.reduce(
      (sum, ticket) => sum + ticket._count.attachments,
      0
    );

    // Agrupar por filial
    const byFilial = stats.reduce((acc, ticket) => {
      const filial = ticket.filial || "Sem Filial";
      acc[filial] = (acc[filial] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      success: true,
      stats: {
        totalTickets: stats.length,
        totalComments,
        totalAttachments,
        byFilial,
        tickets: stats,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return {
      success: false,
      error: "Erro ao buscar estatísticas",
    };
  }
}
