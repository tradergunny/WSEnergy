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
    ? "bg-graphite-900 text-graphite-50 border-graphite-900"
    : "bg-white text-graphite-900 border-graphite-200";
  const titleColor = primary ? "text-graphite-50" : "text-graphite-900";
  const descColor = primary ? "text-graphite-200" : "text-graphite-600";
  const ctaColor = primary ? "text-brand-200" : "text-brand-600";

  return (
    <Link
      href={href}
      className={`group flex flex-col gap-3 rounded-lg border p-6 transition-colors ${bg}`}
    >
      {icon && (
        <span className={`${primary ? "text-brand-200" : "text-brand-600"}`}>
          {icon}
        </span>
      )}
      <h3 className={`text-h3 font-medium ${titleColor}`}>{title}</h3>
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
