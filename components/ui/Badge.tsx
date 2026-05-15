import type { ReactNode } from "react";

/**
 * Badge — BRIEF §8.2
 * Variants:
 *  - authorized        : ★ Authorized          (Brand 50 bg, Brand 800 text)
 *  - exclusive         : ★ Exclusive in Thailand (Brand 50 bg, Brand 800 text)
 *  - brand             : Manufacturer name      (outlined Graphite)
 *  - safety-critical   : Safety critical        (Safety 50 bg, Safety 800 text)
 *  - in-stock          : In stock               (Success)
 *
 * Never combine more than 3 badges on a single component.
 */

export type BadgeVariant =
  | "authorized"
  | "exclusive"
  | "brand"
  | "safety-critical"
  | "in-stock";

type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
};

const base =
  "inline-flex items-center gap-1 rounded-sm px-2 py-[2px] text-eyebrow whitespace-nowrap";

const variantMap: Record<BadgeVariant, string> = {
  authorized: "bg-gold-500/15 text-gold-500 border border-gold-500/30",
  exclusive: "bg-gold-500 text-forest-900",
  brand: "border border-mist-400/40 text-mist-200 bg-transparent",
  "safety-critical": "bg-safety-600/20 text-safety-400 border border-safety-600/40",
  "in-stock":
    "bg-forest-700 text-mist-50 border border-forest-500",
};

export function Badge({
  variant = "brand",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span className={`${base} ${variantMap[variant]} ${className}`.trim()}>
      {children}
    </span>
  );
}
