"use client";

import { LucideMoon, LucideSun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="rounded-full border-muted/30 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-300"
      aria-label="Toggle theme"
    >
      <LucideSun
        className="
          h-4 w-4 rotate-0 scale-100 transition-all duration-300
          dark:-rotate-90 dark:scale-0
        "
      />
      <LucideMoon
        className="
          absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300
          dark:rotate-0 dark:scale-100
        "
      />

      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export { ThemeSwitcher };
