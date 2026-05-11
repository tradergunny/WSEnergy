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
  authorized: "bg-brand-50 text-brand-800",
  exclusive: "bg-brand-50 text-brand-800",
  brand: "border border-graphite-200 text-graphite-800 bg-transparent",
  "safety-critical": "bg-safety-50 text-safety-800",
  "in-stock":
    "bg-[var(--color-success-bg)] text-[var(--color-success-text)] border border-[var(--color-success-border)]",
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
