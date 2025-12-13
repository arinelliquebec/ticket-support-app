// src/lib/prisma/raw-query-executor.ts
import { prisma } from '../prisma'; // Adjust the path if your prisma client is elsewhere

export class RawQueryExecutor {
  /**
   * Executa queries complexas que seriam ineficientes com Prisma
   */
  static async getTicketAnalytics(
    startDate: Date,
    endDate: Date,
    filial?: string
  ) {
    const filialCondition = filial ? `AND t.filial = $3` : "";

    const query = `
      WITH ticket_metrics AS (
        SELECT 
          DATE_TRUNC('day', t."createdAt") as date,
          t.status,
          t."categoryId",
          COUNT(*) as count,
          AVG(
            EXTRACT(EPOCH FROM (
              COALESCE(t."updatedAt", CURRENT_TIMESTAMP) - t."createdAt"
            )) / 3600
          ) as avg_resolution_hours
        FROM "Ticket" t
        WHERE t."createdAt" BETWEEN $1 AND $2
          ${filialCondition}
        GROUP BY DATE_TRUNC('day', t."createdAt"), t.status, t."categoryId"
      ),
      category_names AS (
        SELECT id, name, color 
        FROM "TicketCategory"
      )
      SELECT 
        tm.date,
        tm.status,
        tm.count,
        tm.avg_resolution_hours,
        cn.name as category_name,
        cn.color as category_color
      FROM ticket_metrics tm
      LEFT JOIN category_names cn ON tm."categoryId" = cn.id
      ORDER BY tm.date DESC, tm.count DESC
    `;

    const params = filial ? [startDate, endDate, filial] : [startDate, endDate];

    return await prisma.$queryRawUnsafe(query, ...params);
  }

  /**
   * Full-text search otimizado
   */
  static async searchTickets(
    searchTerm: string,
    userId?: string,
    limit: number = 20
  ) {
    const userCondition = userId ? `AND t."userId" = $2` : "";

    const query = `
      SELECT 
        t.id,
        t.title,
        t.content,
        t.status,
        ts_rank(
          to_tsvector('portuguese', t.title || ' ' || t.content),
          plainto_tsquery('portuguese', $1)
        ) as rank,
        u.username,
        c.name as category_name,
        c.color as category_color
      FROM "Ticket" t
      LEFT JOIN "User" u ON t."userId" = u.id
      LEFT JOIN "TicketCategory" c ON t."categoryId" = c.id
      WHERE 
        to_tsvector('portuguese', t.title || ' ' || t.content) 
        @@ plainto_tsquery('portuguese', $1)
        ${userCondition}
      ORDER BY rank DESC
      LIMIT ${limit}
    `;

    const params = userId ? [searchTerm, userId] : [searchTerm];

    return await prisma.$queryRawUnsafe(query, ...params);
  }
}
