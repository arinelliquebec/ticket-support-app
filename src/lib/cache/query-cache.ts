// src/lib/cache/query-cache.ts
import { unstable_cache } from "next/cache";
import { redis } from "@/lib/redis/client";
import { CacheTTL } from "@/lib/redis/cache-service";

interface CacheConfig {
  ttl?: number;
  tags?: string[];
  revalidate?: number;
}

/**
 * Wrapper para cache de queries com suporte a revalidação e tags
 * Usa unstable_cache do Next.js para cache server-side com revalidação automática
 */
export function createCachedQuery<TArgs extends any[], TResult>(
  queryFn: (...args: TArgs) => Promise<TResult>,
  keyGenerator: (...args: TArgs) => string,
  config: CacheConfig = {}
) {
  return async (...args: TArgs): Promise<TResult> => {
    const key = keyGenerator(...args);

    // Usar unstable_cache do Next.js com suporte a tags e revalidação
    const cachedFn = unstable_cache(
      async () => {
        // Tentar buscar do Redis primeiro
        try {
          const cached = await redis.get(key);
          if (cached) {
            return JSON.parse(cached as string) as TResult;
          }
        } catch (error) {
          console.warn(`Redis cache miss for ${key}:`, error);
        }

        // Se não encontrar no Redis, executar a query
        const result = await queryFn(...args);

        // Armazenar no Redis de forma assíncrona
        redis
          .set(key, JSON.stringify(result), {
            ex: config.ttl || CacheTTL.MEDIUM,
          })
          .catch(console.error);

        return result;
      },
      [key],
      {
        revalidate: config.revalidate || config.ttl || CacheTTL.MEDIUM,
        tags: config.tags || [key],
      }
    );

    return cachedFn();
  };
}
