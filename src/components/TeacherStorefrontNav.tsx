"use client";

import React, { useState } from "react";
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
 * Buttery-Smooth Floating Sliding Pill Navigation
 * Powered by Framer Motion spring physics layoutId
 */
export default function TeacherStorefrontNav({ navLinks }: TeacherStorefrontNavProps) {
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  return (
    <div 
      className="relative flex items-center p-1 rounded-full bg-foreground/[0.04] dark:bg-foreground/[0.07] border border-foreground/10 backdrop-blur-md shadow-xs select-none"
      onMouseLeave={() => setHoveredHref(null)}
      role="navigation"
      aria-label="Teacher Academy Navigation"
    >
      {navLinks.map((item) => {
        const isSelected = item.isActive;
        const isHovered = hoveredHref === item.href;

        return (
          <Link
            key={item.href + item.name}
            href={item.href}
            onMouseEnter={() => setHoveredHref(item.href)}
            className="relative px-4 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition-colors duration-200 inline-flex items-center justify-center"
          >
            {/* 1. Subtle Frosted Hover Pill (for smooth cursor following) */}
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

            {/* 2. Active Animated Spring Sliding Indicator Pill */}
            {isSelected && (
              <motion.div
                layoutId="teacherNavActivePill"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/30 pointer-events-none"
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 30,
                  mass: 0.8
                }}
              />
            )}

            {/* 3. Text Label */}
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
    </div>
  );
}
