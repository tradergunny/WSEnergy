import { urlFor } from "@/lib/sanity/client";

/**
 * BrandLogoBadge — BRIEF §8.10
 *
 * Small warm-bone pill that wraps a manufacturer logo. Used as an overlay
 * on the product card image area (top-left) and anywhere else a brand
 * needs to be visually claimed — product detail header, related-products
 * strip, brand-pillar sections.
 *
 * Surface (`bg-card-50`) ties to the warm-bone language used by
 * `<Card surface="bone">`, so the pill sits naturally on the forest
 * canvas AND on a white product photo without color clashing.
 *
 * Positioning is the caller's responsibility — pass `className` with
 * `absolute top-3 left-3` (or wherever) to place it.
 *
 * Renders nothing when `logo` is missing, so callers can pass it
 * unconditionally and the badge falls away for brands without an
 * uploaded logo asset.
 */

type SanityImageRef = Parameters<typeof urlFor>[0] | undefined | null;

export type BrandLogoBadgeSize = "sm" | "md";

type BrandLogoBadgeProps = {
  /** Sanity image asset from `brand->logo`. Badge renders nothing if absent. */
  logo: SanityImageRef;
  /** Brand display name — used as alt text. */
  name?: string | null;
  /** `sm` = 24px tall pill, `md` = 32px tall pill (default). */
  size?: BrandLogoBadgeSize;
  /** Extra classes — typically positioning (`absolute top-3 left-3`). */
  className?: string;
};

// h-6/h-8 = 24/32px pill height; padding leaves a 16/20px inner logo height.
const sizeMap: Record<BrandLogoBadgeSize, { pill: string; logoHeightPx: number }> = {
  sm: { pill: "h-6 px-2 py-1", logoHeightPx: 16 },
  md: { pill: "h-8 px-2.5 py-1.5", logoHeightPx: 20 },
};

export function BrandLogoBadge({
  logo,
  name,
  size = "md",
  className = "",
}: BrandLogoBadgeProps) {
  if (!logo) return null;
  const { pill, logoHeightPx } = sizeMap[size];
  // Request 2x the display height from Sanity so the logo stays crisp on
  // high-DPI screens. Sanity scales source images on the fly.
  const retinaHeight = logoHeightPx * 2;
  return (
    <span
      className={`bg-card-50 text-card-ink inline-flex items-center rounded-full ${pill} ${className}`.trim()}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={urlFor(logo).height(retinaHeight).url()}
        alt={name ?? ""}
        className="block h-full w-auto object-contain"
      />
    </span>
  );
}
