import type { ReactNode } from "react";

/**
 * MonoLabel — the editorial "_OUR SOLUTIONS" eyebrow from BRIEF §7.
 * Renders an underscore prefix + uppercase mono text + a hairline rule.
 */
export function MonoLabel({
  children,
  tone = "mist",
  className = "",
}: {
  children: ReactNode;
  tone?: "mist" | "forest" | "gold";
  className?: string;
}) {
  const colorMap = {
    mist: "text-mist-400",
    forest: "text-forest-900/70",
    gold: "text-gold-500",
  } as const;
  return (
    <span
      className={`text-eyebrow inline-flex items-center gap-2 ${colorMap[tone]} ${className}`}
    >
      <span aria-hidden="true">_</span>
      {children}
    </span>
  );
}
