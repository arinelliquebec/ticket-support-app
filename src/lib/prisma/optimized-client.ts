// src/lib/prisma/optimized-client.ts
import { PrismaClient } from "@prisma/client";

/**
 * Cliente Prisma otimizado com configurações de performance
 */
class OptimizedPrismaClient {
  private static instance: PrismaClient | null = null;

  static getInstance(): PrismaClient {
    if (!this.instance) {
      this.instance = new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["query", "info", "warn", "error"]
            : ["error"],

        // Configurações de performance do pool de conexões
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      });

      // Configuração de pool via URL parameters
      // DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=30"

      // Middleware para logging de performance
      if (process.env.ENABLE_QUERY_METRICS === "true") {
        this.instance.$use(async (params, next) => {
          const before = Date.now();
          const result = await next(params);
          const after = Date.now();

          console.log(
            `Query ${params.model}.${params.action} took ${after - before}ms`
          );

          return result;
        });
      }
    }

    return this.instance;
  }
}

export const prisma = OptimizedPrismaClient.getInstance();
