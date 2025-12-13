// src/features/ticket/queries/optimized-batch-queries.ts
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/optimized-client";

/**
 * Classe para operações em batch otimizadas
 */
export class BatchQueryExecutor {
  /**
   * Executa múltiplas queries em uma única transação
   * Reduz round-trips ao banco de dados
   */
  static async batchTicketOperations<T extends Prisma.PrismaPromise<any>[]>(
    operations: [...T]
  ): Promise<{ [K in keyof T]: Awaited<T[K]> }> {
    return (await prisma.$transaction(operations, {
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    })) as any;
  }

  /**
   * Atualização em massa otimizada
   */
  static async bulkUpdateTickets(
    updates: Array<{ id: string; data: Prisma.TicketUpdateInput }>
  ) {
    // Usa transação interativa para melhor controle
    return await prisma.$transaction(async (tx) => {
      const results: Array<{ id: string; status: string }> = [];

      for (const update of updates) {
        results.push(
          await tx.ticket.update({
            where: { id: update.id },
            data: update.data,
            select: { id: true, status: true },
          })
        );
      }

      return results;
    });
  }
}
