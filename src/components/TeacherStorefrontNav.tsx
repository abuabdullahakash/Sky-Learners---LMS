"use client";

import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import { Link } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";

export interface TeacherNavItem {
  name: string;
  href: string;
  isActive?: boolean;
}

interface TeacherStorefrontNavProps {
  navLinks: TeacherNavItem[];
}

interface ElementRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * High-Performance Container-Relative Spring Pill Navigation
 * 100% Immune to Page Scroll, Route Changes & Layout Projection jumps.
 * Glides strictly along the horizontal axis with smooth spring physics.
 */
export default function TeacherStorefrontNav({ navLinks }: TeacherStorefrontNavProps) {
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  // Find currently active link from URL/props
  const activeLink = navLinks.find((l) => l.isActive);
  const [optimisticActiveHref, setOptimisticActiveHref] = useState<string>(
    activeLink?.href || navLinks[0]?.href || "/"
  );

  const [activeRect, setActiveRect] = useState<ElementRect | null>(null);
  const [hoverRect, setHoverRect] = useState<ElementRect | null>(null);

  // Keep optimistic state in sync when active link changes
  useEffect(() => {
    if (activeLink?.href) {
      setOptimisticActiveHref(activeLink.href);
    }
  }, [activeLink?.href]);

  // Measure element relative to the parent nav container (completely immune to page scrollY)
  const measureElement = useCallback((href: string): ElementRect | null => {
    const el = itemRefs.current.get(href);
    if (!el || !navRef.current) return null;

    return {
      left: el.offsetLeft,
      top: el.offsetTop,
      width: el.offsetWidth,
      height: el.offsetHeight,
    };
  }, []);

  // Update active pill position whenever active item or navLinks change
  const updateActivePosition = useCallback(() => {
    const rect = measureElement(optimisticActiveHref);
    if (rect) {
      setActiveRect(rect);
    } else if (navLinks[0]?.href) {
      const fallbackRect = measureElement(navLinks[0].href);
      if (fallbackRect) setActiveRect(fallbackRect);
    }
  }, [optimisticActiveHref, navLinks, measureElement]);

  // Use layout effect for instantaneous initial measurement
  useLayoutEffect(() => {
    updateActivePosition();
  }, [updateActivePosition]);

  // ResizeObserver to automatically adjust pill on window resize or font load
  useEffect(() => {
    if (!navRef.current) return;
    const observer = new ResizeObserver(() => {
      updateActivePosition();
    });
    observer.observe(navRef.current);
    return () => observer.disconnect();
  }, [updateActivePosition]);

  // Handle hover measurements
  const handleMouseEnter = (href: string) => {
    setHoveredHref(href);
    const rect = measureElement(href);
    if (rect) setHoverRect(rect);
  };

  const handleMouseLeave = () => {
    setHoveredHref(null);
    setHoverRect(null);
  };

  const handleItemClick = (href: string) => {
    setOptimisticActiveHref(href);
    const rect = measureElement(href);
    if (rect) setActiveRect(rect);
  };

  return (
    <nav
      ref={navRef}
      className="relative flex items-center p-1 rounded-full bg-foreground/[0.04] dark:bg-foreground/[0.07] border border-foreground/10 backdrop-blur-md shadow-xs select-none"
      onMouseLeave={handleMouseLeave}
      aria-label="Teacher Academy Navigation"
    >
      {/* 1. Frosted Hover Indicator (Follows cursor smoothly without affecting active pill) */}
      <AnimatePresence>
        {hoveredHref && hoverRect && hoveredHref !== optimisticActiveHref && (
          <motion.div
            key="teacher-hover-pill"
            className="absolute rounded-full bg-foreground/[0.06] dark:bg-foreground/[0.12] pointer-events-none"
            initial={{ opacity: 0, left: hoverRect.left, top: hoverRect.top, width: hoverRect.width, height: hoverRect.height }}
            animate={{ opacity: 1, left: hoverRect.left, top: hoverRect.top, width: hoverRect.width, height: hoverRect.height }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 450, damping: 35 }}
          />
        )}
      </AnimatePresence>

      {/* 2. Active Spring Physics Sliding Pill (Strictly horizontal glide, zero vertical jump) */}
      {activeRect && (
        <motion.div
          className="absolute rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 shadow-md shadow-orange-500/30 pointer-events-none"
          initial={false}
          animate={{
            left: activeRect.left,
            top: activeRect.top,
            width: activeRect.width,
            height: activeRect.height,
          }}
          transition={{
            type: "spring",
            stiffness: 340,
            damping: 26,
            mass: 0.6,
          }}
        />
      )}

      {/* 3. Navigation Links */}
      {navLinks.map((item) => {
        const isSelected = item.href === optimisticActiveHref;
        const isHovered = hoveredHref === item.href;

        return (
          <Link
            key={item.href + item.name}
            ref={(el) => {
              if (el) {
                itemRefs.current.set(item.href, el);
              } else {
                itemRefs.current.delete(item.href);
              }
            }}
            href={item.href}
            onClick={() => handleItemClick(item.href)}
            onMouseEnter={() => handleMouseEnter(item.href)}
            className="relative px-4 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition-colors duration-200 inline-flex items-center justify-center cursor-pointer"
          >
            {/* Text Label with crisp transition */}
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
