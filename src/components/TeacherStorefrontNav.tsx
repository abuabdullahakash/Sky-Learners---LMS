"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";

export interface TeacherNavItem {
  name: string;
  href: string;
  isActive?: boolean;
}

interface TeacherStorefrontNavProps {
  navLinks: TeacherNavItem[];
}

/**
 * High-Performance Gliding Spring Pill Navigation (Shared Layout Animation)
 * Glides smoothly across all intermediate items without jumping.
 */
export default function TeacherStorefrontNav({ navLinks }: TeacherStorefrontNavProps) {
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  // Find currently active link from URL/props
  const activeLink = navLinks.find((l) => l.isActive);
  const [optimisticActiveHref, setOptimisticActiveHref] = useState<string>(activeLink?.href || navLinks[0]?.href || "/");

  // Keep optimistic state in sync when URL changes
  useEffect(() => {
    if (activeLink?.href) {
      setOptimisticActiveHref(activeLink.href);
    }
  }, [activeLink?.href]);

  return (
    <nav 
      className="relative flex items-center p-1 rounded-full bg-foreground/[0.04] dark:bg-foreground/[0.07] border border-foreground/10 backdrop-blur-md shadow-xs select-none"
      onMouseLeave={() => setHoveredHref(null)}
      aria-label="Teacher Academy Navigation"
    >
      {navLinks.map((item) => {
        const isSelected = item.href === optimisticActiveHref;
        const isHovered = hoveredHref === item.href;

        return (
          <Link
            key={item.href + item.name}
            href={item.href}
            onClick={() => setOptimisticActiveHref(item.href)}
            onMouseEnter={() => setHoveredHref(item.href)}
            className="relative px-4 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition-colors duration-200 inline-flex items-center justify-center cursor-pointer"
          >
            {/* 1. Frosted Hover Indicator (Follows cursor smoothly) */}
            {isHovered && !isSelected && (
              <motion.div
                layoutId="teacherNavHoverPill"
                className="absolute inset-0 rounded-full bg-foreground/[0.06] dark:bg-foreground/[0.12] pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}

            {/* 2. Active Spring Physics Sliding Pill (Glides continuously across intermediate items) */}
            {isSelected && (
              <motion.div
                layoutId="teacherNavActivePill"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 shadow-md shadow-orange-500/30 pointer-events-none"
                transition={{
                  type: "spring",
                  stiffness: 340,
                  damping: 26,
                  mass: 0.6
                }}
              />
            )}

            {/* 3. Text Label with crisp transition */}
            <span
              className={`relative z-10 transition-colors duration-200 ${
                isSelected
                  ? "text-white font-bold drop-shadow-xs"
                  : isHovered
                  ? "text-orange-500 dark:text-orange-400"
                  : "text-foreground/75 hover:text-foreground"
              }`}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
