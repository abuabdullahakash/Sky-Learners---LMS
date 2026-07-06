"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors relative overflow-hidden flex items-center justify-center w-10 h-10"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 absolute transition-all dark:-translate-y-10 dark:opacity-0" />
      <Moon className="h-5 w-5 absolute transition-all translate-y-10 opacity-0 dark:translate-y-0 dark:opacity-100" />
    </button>
  );
}
