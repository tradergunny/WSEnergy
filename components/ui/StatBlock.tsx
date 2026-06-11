import type { ReactNode } from "react";

/**
 * StatBlock — big-number authority tile used in "Why choose WS Energy" rows.
 * Pair on the bone-card surface; the icon slot floats bottom-right.
 */
export function StatBlock({
  value,
  label,
  icon,
  className = "",
}: {
  value: ReactNode;
  label: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative flex h-full flex-col justify-between rounded-xl bg-card-50 p-6 text-card-ink ${className}`}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div>
        <div className="font-medium tracking-tight" style={{ fontSize: 40, lineHeight: 1.05 }}>
          {value}
        </div>
        <div className="mt-2 text-body text-card-ink/70">{label}</div>
      </div>
      {icon ? (
        <div className="mt-6 self-end text-gold-600/70" aria-hidden="true">
          {icon}
        </div>
      ) : null}
    </div>
  );
}
