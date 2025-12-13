// src/middleware/rate-limit.ts
import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis/client";

// Configurar rate limiter com estratégia sliding window
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requisições por 10 segundos
  analytics: true,
  prefix: "@upstash/ratelimit",
});

// Rate limits específicos por rota
const routeLimits = {
  "/api/auth": Ratelimit.slidingWindow(5, "1 m"), // 5 req/min para auth
  "/api/upload": Ratelimit.slidingWindow(5, "5 m"), // 5 uploads/5min
  "/api/tickets": Ratelimit.slidingWindow(30, "1 m"), // 30 req/min para tickets
  default: Ratelimit.slidingWindow(60, "1 m"), // 60 req/min padrão
};

export async function rateLimitMiddleware(request: NextRequest) {
  // Skip rate limiting em desenvolvimento se configurado
  if (
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_RATE_LIMIT_DEV !== "true"
  ) {
    return null;
  }

  // Skip para requisições internas
  if (request.headers.get("X-Internal-Request") === "true") {
    return null;
  }

  try {
    // Identificador baseado em IP ou sessão
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip =
      forwardedFor?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const identifier = ip;

    // Determinar rate limit baseado na rota
    const pathname = request.nextUrl.pathname;
    let limiter = ratelimit;

    // Aplicar rate limit específico se existir
    for (const [route, limit] of Object.entries(routeLimits)) {
      if (pathname.startsWith(route)) {
        limiter = new Ratelimit({
          redis,
          limiter: limit,
          analytics: true,
          prefix: `@upstash/ratelimit:${route}`,
        });
        break;
      }
    }

    // Verificar rate limit
    const { success, limit, reset, remaining } = await limiter.limit(
      identifier
    );

    // Adicionar headers de rate limit na resposta
    const response = success
      ? null
      : NextResponse.json(
          {
            error: "Too many requests",
            message: "Por favor, aguarde antes de tentar novamente",
          },
          { status: 429 }
        );

    // Headers de rate limit (adicionar em todas as respostas)
    const headers = {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": new Date(reset).toISOString(),
    };

    if (response) {
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    // Se passou, retornar null mas guardar headers para adicionar depois
    return null;
  } catch (error) {
    console.error("Rate limit error:", error);
    // Em caso de erro, permitir a requisição
    return null;
  }
}
