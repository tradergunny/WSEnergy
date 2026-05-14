"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Card — the warm-bone Taayo-style card that sits on the forest canvas.
 * Hover lifts -2px and swaps to a deeper shadow (BRIEF §7.9).
 */
type CardSurface = "bone" | "forest-deep" | "forest";

const surfaceMap: Record<CardSurface, string> = {
  bone: "bg-card-50 text-card-ink",
  "forest-deep": "bg-forest-950 text-mist-50 border border-mist-800",
  forest: "bg-forest-800 text-mist-50 border border-mist-800",
};

type CommonProps = {
  surface?: CardSurface;
  className?: string;
  children: ReactNode;
};

export function Card({
  surface = "bone",
  className = "",
  children,
  href,
}: CommonProps & { href?: string }) {
  const base =
    "group/card relative overflow-hidden rounded-xl transition-all duration-300 ease-out";
  const interactive = href
    ? "hover:-translate-y-0.5"
    : "";
  const classes = `${base} ${surfaceMap[surface]} ${interactive} ${className}`.trim();
  const style =
    surface === "bone"
      ? { boxShadow: "var(--shadow-card)" }
      : undefined;

  const content = (
    <motion.div
      className={classes}
      style={style}
      whileHover={
        href
          ? { boxShadow: "var(--shadow-card-hover)" }
          : undefined
      }
    >
      {children}
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
