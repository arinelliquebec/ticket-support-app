// src/features/ticket/queries/ultra-optimized-tickets.ts
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis/client";
import { unstable_cache } from "next/cache";

// Advanced query optimization types
interface OptimizedTicketQuery {
  filters: TicketFilters;
  pagination: PaginationParams;
  userId?: string;
  isAdmin: boolean;
}

interface TicketFilters {
  search?: string;
  status?: string;
  categoryId?: string;
  filial?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface PaginationParams {
  page: number;
  pageSize: number;
  cursor?: string;
}

// Optimized Prisma Select for minimal data transfer
const TICKET_LIST_SELECT = {
  id: true,
  title: true,
  content: true,
  status: true,
  createdAt: true,
  deadline: true,
  filial: true,
  userId: true,
  categoryId: true,
  // Optimized relation loading
  user: {
    select: {
      username: true,
      email: true,
      avatarUrl: true,
    },
  },
  category: {
    select: {
      id: true,
      name: true,
      color: true,
    },
  },
  // Use aggregations instead of loading all records
  _count: {
    select: {
      attachments: true,
      comments: true,
    },
  },
} satisfies Prisma.TicketSelect;

// Connection pool optimization
const optimizedPrisma = prisma.$extends({
  query: {
    $allOperations({ operation, args, query }) {
      // Add query timing in development
      if (process.env.NODE_ENV === "development") {
        const start = performance.now();
        return query(args).finally(() => {
          const duration = performance.now() - start;
          if (duration > 100) {
            console.warn(
              `Slow query detected: ${operation} took ${duration}ms`
            );
          }
        });
      }
      return query(args);
    },
  },
});

// Multi-level caching strategy
class TicketQueryOptimizer {
  // L1 Cache: In-memory LRU cache for hot data
  private static memoryCache = new Map<
    string,
    { data: any; expires: number }
  >();
  private static readonly MEMORY_CACHE_SIZE = 100;
  private static readonly MEMORY_CACHE_TTL = 30 * 1000; // 30 seconds

  // Generate deterministic cache key
  private static generateCacheKey(params: OptimizedTicketQuery): string {
    const sortedParams = JSON.stringify(params, Object.keys(params).sort());
    return `tickets:v2:${Buffer.from(sortedParams).toString("base64")}`;
  }

  // Memory cache management
  private static getFromMemory(key: string): any | null {
    const cached = this.memoryCache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    this.memoryCache.delete(key);
    return null;
  }

  private static setInMemory(key: string, data: any): void {
    // Implement LRU eviction
    if (this.memoryCache.size >= this.MEMORY_CACHE_SIZE) {
      const firstKey = this.memoryCache.keys().next().value;
      if (typeof firstKey === "string") {
        this.memoryCache.delete(firstKey);
      }
    }
    this.memoryCache.set(key, {
      data,
      expires: Date.now() + this.MEMORY_CACHE_TTL,
    });
  }

  // Main optimized query method
  static async getOptimizedTickets(params: OptimizedTicketQuery) {
    const cacheKey = this.generateCacheKey(params);

    // L1: Check memory cache
    const memoryResult = this.getFromMemory(cacheKey);
    if (memoryResult) {
      return { ...memoryResult, source: "memory-cache" };
    }

    // L2: Check Redis cache
    try {
      const redisResult = await redis.get(cacheKey);
      if (redisResult) {
        const data = JSON.parse(redisResult as string);
        this.setInMemory(cacheKey, data);
        return { ...data, source: "redis-cache" };
      }
    } catch (error) {
      console.warn("Redis cache read failed:", error);
    }

    // L3: Execute optimized database query
    const result = await this.executeOptimizedQuery(params);

    // Populate caches asynchronously
    this.populateCaches(cacheKey, result).catch(console.error);

    return { ...result, source: "database" };
  }

  // Optimized database query execution
  private static async executeOptimizedQuery(params: OptimizedTicketQuery) {
    const { filters, pagination, userId, isAdmin } = params;

    // Build WHERE clause with index-aware conditions
    const where: Prisma.TicketWhereInput = this.buildOptimizedWhere(
      filters,
      userId,
      isAdmin
    );

    // Use cursor-based pagination for better performance
    const queryOptions = this.buildPaginationOptions(pagination);

    // Execute count and data queries in parallel
    const [tickets, totalCount] = await Promise.all([
      optimizedPrisma.ticket.findMany({
        where,
        select: TICKET_LIST_SELECT,
        ...queryOptions,
        // Use index hints for better performance
        orderBy: [
          { createdAt: "desc" },
          { id: "desc" }, // Secondary sort for stable pagination
        ],
      }),
      // Optimized count query
      optimizedPrisma.ticket.count({ where }),
    ]);

    // Calculate pagination metadata
    const hasNextPage = tickets.length > pagination.pageSize;
    const items = hasNextPage ? tickets.slice(0, -1) : tickets;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    return {
      items,
      pagination: {
        totalCount,
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalPages: Math.ceil(totalCount / pagination.pageSize),
        hasNextPage,
        nextCursor,
      },
      filters,
    };
  }

  // Build optimized WHERE clause considering indexes
  private static buildOptimizedWhere(
    filters: TicketFilters,
    userId?: string,
    isAdmin?: boolean
  ): Prisma.TicketWhereInput {
    const where: Prisma.TicketWhereInput = {};

    // User permission filter (uses index)
    if (!isAdmin && userId) {
      where.userId = userId;
    }

    // Status filter (uses composite index)
    if (filters.status) {
      where.status = filters.status as any;
    }

    // Category filter (uses index)
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    // Filial filter (uses partial index)
    if (filters.filial) {
      where.filial = filters.filial;
    }

    // Date range filter (uses index on deadline)
    if (filters.dateFrom || filters.dateTo) {
      where.deadline = {};
      if (filters.dateFrom) {
        where.deadline.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.deadline.lte = filters.dateTo;
      }
    }

    // Full-text search (consider using PostgreSQL FTS)
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { content: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return where;
  }

  // Build pagination options
  private static buildPaginationOptions(pagination: PaginationParams) {
    if (pagination.cursor) {
      // Cursor-based pagination
      return {
        take: pagination.pageSize + 1,
        cursor: { id: pagination.cursor },
        skip: 1,
      };
    } else {
      // Offset-based pagination (fallback)
      return {
        take: pagination.pageSize + 1,
        skip: pagination.page * pagination.pageSize,
      };
    }
  }

  // Populate caches asynchronously
  private static async populateCaches(key: string, data: any): Promise<void> {
    // Set in memory cache
    this.setInMemory(key, data);

    // Set in Redis with appropriate TTL
    const ttl = this.calculateOptimalTTL(data);
    await redis.set(key, JSON.stringify(data), { ex: ttl });

    // Warm up related caches
    await this.warmRelatedCaches(data);
  }

  // Calculate optimal TTL based on data characteristics
  private static calculateOptimalTTL(data: any): number {
    const baseTime = 300; // 5 minutes base

    // Shorter TTL for frequently changing data
    if (data.filters?.status === "ABERTO") {
      return baseTime / 2;
    }

    // Longer TTL for completed tickets
    if (data.filters?.status === "CONCLUÍDO") {
      return baseTime * 4;
    }

    return baseTime;
  }

  // Pre-warm related caches
  private static async warmRelatedCaches(data: any): Promise<void> {
    // Pre-warm individual ticket caches
    const promises = data.items.slice(0, 5).map(async (ticket: any) => {
      const ticketKey = `ticket:detail:${ticket.id}`;
      await redis.set(ticketKey, JSON.stringify(ticket), { ex: 600 });
    });

    await Promise.all(promises);
  }

  // Cache invalidation strategy
  static async invalidateTicketCaches(patterns: string[]): Promise<void> {
    // Clear memory cache
    for (const pattern of patterns) {
      for (const [key] of this.memoryCache) {
        if (key.includes(pattern)) {
          this.memoryCache.delete(key);
        }
      }
    }

    // Clear Redis caches using pattern matching
    for (const pattern of patterns) {
      const keys = await this.scanRedisKeys(`tickets:*${pattern}*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  }

  // Scan Redis keys with pattern
  private static async scanRedisKeys(pattern: string): Promise<string[]> {
    const keys: string[] = [];
    let cursor = "0";

    do {
      const [nextCursor, foundKeys] = await redis.scan(cursor, {
        match: pattern,
        count: 100,
      });
      cursor = nextCursor;
      keys.push(...(foundKeys as string[]));
    } while (cursor !== "0");

    return keys;
  }
}

// Export optimized query function with Next.js caching
export const getUltraOptimizedTickets = unstable_cache(
  async (params: OptimizedTicketQuery) => {
    return TicketQueryOptimizer.getOptimizedTickets(params);
  },
  ["ultra-optimized-tickets"],
  {
    revalidate: 60, // Revalidate every 60 seconds
    tags: ["tickets"], // Enable tag-based invalidation
  }
);

// Export cache invalidation helper
export const invalidateTicketCache = async (
  userId?: string,
  ticketId?: string
) => {
  const patterns = [];

  if (userId) patterns.push(userId);
  if (ticketId) patterns.push(ticketId);

  await TicketQueryOptimizer.invalidateTicketCaches(patterns);

  // Next.js cache invalidation
  const { revalidateTag } = await import("next/cache");
  revalidateTag("tickets");
};
