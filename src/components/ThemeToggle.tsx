"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full bg-foreground/[0.04] hover:bg-foreground/[0.08] dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-foreground/10 dark:border-white/10 transition-all relative overflow-hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 shadow-xs active:scale-95"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-amber-500 absolute transition-all dark:-translate-y-10 dark:opacity-0" />
      <Moon className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-orange-400 absolute transition-all translate-y-10 opacity-0 dark:translate-y-0 dark:opacity-100" />
    </button>
  );
}
