import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { MuiProvider } from "@/components/theme/mui-provider";
import { Toaster } from "@/components/ui/sonner";
import { FuturisticBackground } from "@/components/futuristic-background";
import { TicketRulesPopup } from "@/components/ticket-rules-popup";

export const metadata: Metadata = {
  title: "Suporte Fradema",
  description: "Suporte de ticket Fradema - Sistema Futurista 2026",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TKT - Suporte",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning={true}
      lang="pt-BR"
      className="dark"
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="antialiased dark scrollbar-futuristic">
        <ThemeProvider>
          <MuiProvider>
            {/* Futuristic Background Effects */}
            <FuturisticBackground />

            <Header />
            <main
              className="
                min-h-screen flex-1
                overflow-y-auto overflow-x-hidden
                py-24 px-8
                bg-secondary/10
                flex flex-col
                relative z-10
              "
            >
              {children}
            </main>
            <Toaster
              toastOptions={{
                className: "dark glass-ultra",
                style: {
                  background: "rgba(14, 20, 33, 0.9)",
                  color: "hsl(210 15% 95%)",
                  border: "1px solid rgba(14, 165, 233, 0.2)",
                  backdropFilter: "blur(16px)",
                  boxShadow:
                    "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(14, 165, 233, 0.1)",
                },
              }}
            />

            <TicketRulesPopup />
          </MuiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
