import { NextRequest, NextResponse } from "next/server";

// src/proxy.ts - Headers de cache otimizados (migrado de middleware para proxy no Next.js 16)
export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Cache agressivo para assets
  if (pathname.match(/\.(js|css|woff2?|ttf|otf|ico|png|jpg|jpeg|svg|webp)$/)) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
    response.headers.set("CDN-Cache-Control", "public, max-age=31536000");
  }

  // SWR para páginas dinâmicas
  if (pathname.startsWith("/tickets")) {
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300"
    );
    response.headers.set(
      "CDN-Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=3600"
    );
  }

  // API routes com cache curto
  if (pathname.startsWith("/api/")) {
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=10, stale-while-revalidate=60"
    );
  }

  return response;
}

