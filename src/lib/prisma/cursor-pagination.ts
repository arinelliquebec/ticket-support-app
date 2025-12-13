// src/lib/prisma/cursor-pagination.ts
import { Prisma } from "@prisma/client";

/**
 * Implementação de cursor-based pagination para performance
 * Evita OFFSET que degrada performance em grandes datasets
 */
export class CursorPagination {
  /**
   * Constrói query com cursor pagination
   */
  static buildCursorQuery<T extends { id: string; createdAt: Date }>(
    baseQuery: any,
    cursor?: string,
    limit: number = 20,
    orderBy: "asc" | "desc" = "desc"
  ) {
    const query: any = { ...baseQuery };

    if (cursor) {
      query.cursor = { id: cursor };
      query.skip = 1; // Pula o item do cursor
    }

    query.take = limit + 1; // Pega um a mais para saber se há próxima página
    query.orderBy = [
      { createdAt: orderBy },
      { id: orderBy }, // Garante ordenação determinística
    ];

    return query;
  }

  /**
   * Processa resultado da paginação
   */
  static processResults<T extends { id: string }>(
    results: T[],
    limit: number
  ): {
    items: T[];
    hasNextPage: boolean;
    nextCursor: string | null;
  } {
    const hasNextPage = results.length > limit;
    const items = hasNextPage ? results.slice(0, -1) : results;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    return { items, hasNextPage, nextCursor };
  }
}
