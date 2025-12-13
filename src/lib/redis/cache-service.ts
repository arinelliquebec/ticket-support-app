// src/lib/redis/cache-service.ts
import { redis, CacheOptions, CacheTTL } from "./client";

export class CacheService {
  /**
   * Busca valor do cache ou executa função e armazena resultado
   */
  static async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    try {
      // Tentar buscar do cache primeiro
      const cached = await redis.get<T>(key);
      if (cached !== null) {
        return cached;
      }
    } catch (error) {
      console.warn(`Cache get error for ${key}:`, error);
    }

    // Se não houver cache, executar função
    const fresh = await fetcher();

    // Armazenar no cache de forma assíncrona (não bloquear resposta)
    this.set(key, fresh, options).catch((error) => {
      console.warn(`Cache set error for ${key}:`, error);
    });

    return fresh;
  }

  /**
   * Armazena valor no cache
   */
  static async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const ttl = options.ttl || CacheTTL.MEDIUM;

    try {
      await redis.set(key, JSON.stringify(value), { ex: ttl });

      // Se houver tags, armazenar relação para invalidação em grupo
      if (options.tags && options.tags.length > 0) {
        for (const tag of options.tags) {
          await redis.sadd(`tag:${tag}`, key);
          await redis.expire(`tag:${tag}`, ttl);
        }
      }
    } catch (error) {
      console.error(`Failed to set cache for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Invalida uma ou mais chaves do cache
   */
  static async invalidate(...keys: string[]): Promise<void> {
    try {
      if (keys.length === 0) return;
      await redis.del(...keys);
    } catch (error) {
      console.error("Failed to invalidate cache:", error);
    }
  }

  /**
   * Invalida todas as chaves associadas a uma tag
   */
  static async invalidateByTag(tag: string): Promise<void> {
    try {
      const keys = await redis.smembers(`tag:${tag}`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      await redis.del(`tag:${tag}`);
    } catch (error) {
      console.error(`Failed to invalidate tag ${tag}:`, error);
    }
  }

  /**
   * Verifica se uma chave existe no cache
   */
  static async exists(key: string): Promise<boolean> {
    try {
      return (await redis.exists(key)) === 1;
    } catch (error) {
      console.warn(`Cache exists check error for ${key}:`, error);
      return false;
    }
  }
}

// Chaves de cache padronizadas
export const CacheKeys = {
  // Tickets
  ticket: (id: string) => `ticket:${id}`,
  ticketList: (userId: string, page: number = 0) =>
    `tickets:list:${userId}:${page}`,
  ticketCount: (userId: string) => `tickets:count:${userId}`,

  // Categorias
  categories: () => "categories:all",
  category: (id: string) => `category:${id}`,

  // Dashboard
  dashboardStats: (userId: string) => `dashboard:stats:${userId}`,
  adminStats: () => "admin:stats",

  // Rate limiting
  rateLimit: (identifier: string, window: string) =>
    `ratelimit:${identifier}:${window}`,
} as const;
export { CacheTTL };
