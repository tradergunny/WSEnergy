import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import type { ReactNode } from "react";

/**
 * AudienceTile — BRIEF §8.7.
 * Routes segmented visitors. Primary tile (EPC/installer) gets darker bg
 * to set expectation; secondaries stay on white.
 */

export type AudienceTileProps = {
  primary?: boolean;
  title: string;
  description: string;
  ctaText: string;
  href: string;
  icon?: ReactNode;
};

export function AudienceTile({
  primary = false,
  title,
  description,
  ctaText,
  href,
  icon,
}: AudienceTileProps) {
  const bg = primary
    ? "bg-forest-950 text-mist-50 border-gold-500"
    : "bg-forest-800 text-mist-50 border-mist-800";
  const descColor = primary ? "text-mist-200" : "text-mist-400";
  const ctaColor = "text-gold-500";

  return (
    <Link
      href={href}
      className={`group flex flex-col gap-3 rounded-xl border p-6 transition-colors ${bg}`}
    >
      {icon && (
        <span className="text-gold-500">
          {icon}
        </span>
      )}
      <h3 className="text-h3 font-medium">{title}</h3>
      <p className={`text-body ${descColor}`}>{description}</p>
      <span
        className={`text-body mt-2 inline-flex items-center gap-1 font-medium ${ctaColor}`}
      >
        {ctaText}
        <IconArrowRight
          size={16}
          stroke={1.5}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}
