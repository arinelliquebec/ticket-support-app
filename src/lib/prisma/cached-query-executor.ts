// src/lib/prisma/cached-query-executor.ts
import { redis } from "@/lib/redis/client";
import { prisma } from "@/lib/prisma/optimized-client";
import crypto from "crypto";

/**
 * Executor de queries com cache automático
 */
export class CachedQueryExecutor {
  /**
   * Gera hash único para a query baseado em seus parâmetros
   */
  private static generateQueryHash(
    model: string,
    operation: string,
    args: any
  ): string {
    const querySignature = JSON.stringify({ model, operation, args });
    return crypto.createHash("sha256").update(querySignature).digest("hex");
  }

  /**
   * Executa query com cache automático
   */
  static async executeWithCache<T>(
    model: keyof typeof prisma,
    operation: string,
    args: any,
    ttl: number = 300 // 5 minutos por padrão
  ): Promise<T> {
    const cacheKey = `query:${this.generateQueryHash(String(model), operation, args)}`;

    try {
      // Tenta buscar do cache
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached as string);
      }
    } catch (error) {
      console.warn("Cache read error:", error);
    }

    // Executa a query
    const result = await (prisma[model] as any)[operation](args);

    // Armazena no cache de forma assíncrona
    redis
      .set(cacheKey, JSON.stringify(result), { ex: ttl })
      .catch((err) => console.warn("Cache write error:", err));

    return result;
  }

  /**
   * Invalida cache para um modelo específico
   */
  static async invalidateModelCache(model: string, id?: string) {
    const pattern = id ? `query:*${model}*${id}*` : `query:*${model}*`;

    // Usa SCAN para encontrar e deletar chaves
    const keys: string[] = [];
    let cursor = "0";
    do {
      const [nextCursor, foundKeys] = await redis.scan(cursor, {
        match: pattern,
        COUNT: 100,
      });
      cursor = nextCursor;
      if (Array.isArray(foundKeys)) {
        // Ensure only string keys are pushed
        keys.push(
          ...foundKeys
            .filter((k): k is string => typeof k === "string")
        );
      }
    } while (cursor !== "0");

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
