"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode, useEffect } from "react";

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Forçar tema escuro no lado do cliente
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark" // Força o tema escuro independente da escolha do usuário
      enableSystem={false} // Desativa o tema do sistema
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
