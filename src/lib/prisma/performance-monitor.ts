// src/lib/prisma/performance-monitor.ts
export class PrismaPerformanceMonitor {
  private static queryMetrics = new Map<
    string,
    {
      count: number;
      totalTime: number;
      avgTime: number;
    }
  >();

  /**
   * Middleware para coletar métricas
   */
  static createMetricsMiddleware() {
    return async (params: any, next: any) => {
      const start = process.hrtime.bigint();
      const result = await next(params);
      const end = process.hrtime.bigint();

      const duration = Number(end - start) / 1_000_000; // Convert to ms
      const key = `${params.model}.${params.action}`;

      const current = this.queryMetrics.get(key) || {
        count: 0,
        totalTime: 0,
        avgTime: 0,
      };

      current.count++;
      current.totalTime += duration;
      current.avgTime = current.totalTime / current.count;

      this.queryMetrics.set(key, current);

      // Log queries lentas
      if (duration > 100) {
        console.warn(`Slow query detected: ${key} took ${duration}ms`);
      }

      return result;
    };
  }

  /**
   * Exporta métricas para análise
   */
  static getMetrics() {
    return Array.from(this.queryMetrics.entries())
      .map(([query, metrics]) => ({ query, ...metrics }))
      .sort((a, b) => b.avgTime - a.avgTime);
  }
}
