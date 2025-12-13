// src/lib/redis/client.ts
import { Redis } from "@upstash/redis";

// Criar cliente Redis singleton
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Verificar conexão no desenvolvimento
if (process.env.NODE_ENV === "development") {
  redis
    .ping()
    .then(() => {
      console.log("✅ Redis conectado com sucesso");
    })
    .catch((error) => {
      console.error("❌ Erro ao conectar ao Redis:", error);
    });
}

// Tipos para melhor type safety
export type CacheOptions = {
  ttl?: number; // Time to live em segundos
  tags?: string[]; // Tags para invalidação em grupo
};

// TTLs padrão para diferentes tipos de dados
export const CacheTTL = {
  SHORT: 60, // 1 minuto - dados muito voláteis
  MEDIUM: 300, // 5 minutos - dados moderadamente estáveis
  LONG: 3600, // 1 hora - dados estáveis
  VERY_LONG: 86400, // 24 horas - dados muito estáveis
} as const;
