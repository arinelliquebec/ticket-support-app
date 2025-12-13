// next.config.ts
import type { NextConfig } from "next";

const config: NextConfig = {
  // Disable TypeScript errors during builds
  typescript: {
    ignoreBuildErrors: true,
  },

  // React Strict Mode
  reactStrictMode: false,

  // Image optimizations
  images: {
    minimumCacheTTL: 60,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },

  // Experimental features with build optimization
  experimental: {
    optimizePackageImports: [
      "@supabase/supabase-js",
      "@upstash/redis",
      "lucide-react",
    ],
    taint: true,
  },

  // Compression
  compress: true,

  // Build output configuration
  output: "standalone",

  // Turbopack configuration (Next.js 16)
  turbopack: {
    root: process.cwd(),
  },
};

export default config;
