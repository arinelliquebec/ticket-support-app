// src/lib/redis/cache-invalidator.ts
import { CacheService, CacheKeys } from "./cache-service";

/**
 * Gerencia invalidação inteligente de cache baseada em eventos
 */
export class CacheInvalidator {
  /**
   * Invalida caches relacionados quando um ticket é criado/atualizado
   */
  static async onTicketChange(ticketId: string, userId?: string) {
    const invalidations = [
      // Cache específico do ticket
      CacheService.invalidate(CacheKeys.ticket(ticketId)),

      // Invalidar todas as páginas de lista do usuário
      CacheService.invalidateByTag(`tickets:user:${userId}`),

      // Invalidar estatísticas
      CacheService.invalidate(
        CacheKeys.dashboardStats(userId || "anonymous"),
        CacheKeys.adminStats()
      ),
    ];

    await Promise.all(invalidations);
  }

  /**
   * Invalida caches quando uma categoria é modificada
   */
  static async onCategoryChange(categoryId?: string) {
    const invalidations = [
      CacheService.invalidate(CacheKeys.categories()),
      CacheService.invalidateByTag("categories"),
    ];

    if (categoryId) {
      invalidations.push(
        CacheService.invalidate(CacheKeys.category(categoryId))
      );
    }

    await Promise.all(invalidations);
  }

  /**
   * Invalida caches relacionados a um usuário
   */
  static async onUserChange(userId: string) {
    await Promise.all([
      CacheService.invalidateByTag(`user:${userId}`),
      CacheService.invalidate(CacheKeys.dashboardStats(userId)),
    ]);
  }

  /**
   * Invalida todos os caches (usar com cuidado!)
   */
  static async invalidateAll() {
    // Implementar limpeza completa se necessário
    console.warn("Invalidating all caches - use with caution!");

    // Tags principais
    const mainTags = ["tickets", "categories", "dashboard", "stats"];

    await Promise.all(mainTags.map((tag) => CacheService.invalidateByTag(tag)));
  }

  /**
   * Invalida caches por múltiplas tags
   */
  static async invalidateByTags(tags: string[]) {
    await Promise.all(tags.map((tag) => CacheService.invalidateByTag(tag)));
  }
}
