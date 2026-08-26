"use client";

import React from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

/**
 * Modern BN | EN Sliding Pill Language Switcher
 * Exclusively designed for Teacher Storefront & Dashboard
 */
export function TeacherLanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitch = (newLocale: "bn" | "en") => {
    if (locale === newLocale) return;
    router.replace(pathname, { locale: newLocale });
  };

  const isBn = locale === "bn";

  return (
    <div 
      className="relative flex items-center p-0.5 rounded-full bg-foreground/[0.06] dark:bg-foreground/[0.08] border border-foreground/10 backdrop-blur-md shadow-xs select-none"
      role="group"
      aria-label="Language Switcher"
    >
      {/* Animated Sliding Background Indicator */}
      <div
        className={`absolute top-0.5 bottom-0.5 w-[30px] sm:w-[32px] rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-sm shadow-orange-500/30 transition-all duration-300 ease-out pointer-events-none ${
          isBn ? "left-0.5" : "left-[calc(100%-32.5px)] sm:left-[calc(100%-34.5px)]"
        }`}
      />

      {/* BN Button */}
      <button
        type="button"
        onClick={() => handleSwitch("bn")}
        className={`relative z-10 w-[30px] sm:w-[32px] h-6 sm:h-7 flex items-center justify-center text-[10px] sm:text-xs font-black transition-colors duration-200 ${
          isBn ? "text-white drop-shadow-xs" : "text-foreground/70 hover:text-foreground"
        }`}
        aria-pressed={isBn}
      >
        বাং
      </button>

      {/* EN Button */}
      <button
        type="button"
        onClick={() => handleSwitch("en")}
        className={`relative z-10 w-[30px] sm:w-[32px] h-6 sm:h-7 flex items-center justify-center text-[10px] sm:text-xs font-black transition-colors duration-200 ${
          !isBn ? "text-white drop-shadow-xs" : "text-foreground/70 hover:text-foreground"
        }`}
        aria-pressed={!isBn}
      >
        EN
      </button>
    </div>
  );
}

/**
 * Animated Ambient Theme Toggle
 * Exclusively designed for Teacher Storefront & Dashboard
 */
export function TeacherThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === "dark";

  if (!mounted) {
    return (
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-foreground/5 border border-foreground/10" />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative p-1.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-foreground/[0.06] hover:bg-orange-500/10 dark:bg-foreground/[0.08] dark:hover:bg-amber-500/10 border border-foreground/10 hover:border-orange-500/30 transition-all duration-300 flex items-center justify-center group overflow-hidden shadow-xs"
      aria-label="Toggle Theme"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {/* Background Micro Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/0 via-amber-500/0 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Sun Icon for Light Mode */}
      <Sun 
        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 absolute transition-all duration-300 transform ${
          isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />

      {/* Moon Icon for Dark Mode */}
      <Moon 
        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 absolute transition-all duration-300 transform ${
          isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
        }`}
      />
    </button>
  );
}
