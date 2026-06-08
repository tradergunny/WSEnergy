import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { BrandLogoBadge } from "@/components/ui/BrandLogoBadge";
import { Button } from "@/components/ui/Button";
import { urlFor } from "@/lib/sanity/client";

/**
 * ProductCard — BRIEF §8.3.
 *
 * Standard card: 1px Graphite 200 border, 12px radius.
 * Featured card (exclusive=true): 2px Brand 600 border — the only place we
 * go thicker. Safety-critical SKUs add a Safety 600 badge but keep the
 * brand border treatment.
 *
 * When the brand has a `logo` asset in Sanity, a warm-bone
 * `<BrandLogoBadge>` is overlaid on the top-left of the image area
 * (BRIEF §8.10). Brands without a logo only get the text chip below.
 */

type SanityImageRef = Parameters<typeof urlFor>[0] | undefined | null;

export type ProductCardProps = {
  brand?: { name?: string | null; logo?: SanityImageRef } | null;
  authorized?: boolean;
  exclusive?: boolean;
  safetyCritical?: boolean;
  image?: SanityImageRef;
  sku?: string | null;
  /** Model title (e.g. SUN2000-15KTL-M5). Falls back to SKU. */
  title?: string | null;
  /** Short description ("15 kW · 3-phase · on-grid"). */
  description?: string | null;
  /** Full locale-prefixed href to the detail page. */
  href: string;
  /** Localized button labels. */
  specsLabel: string;
  quoteLabel: string;
  /** Optional href for the [Quote] CTA — defaults to /quote. */
  quoteHref: string;
  /** "Authorized" badge label (already localized). */
  authorizedLabel?: string;
  exclusiveLabel?: string;
  safetyLabel?: string;
};

export function ProductCard({
  brand,
  authorized,
  exclusive,
  safetyCritical,
  image,
  sku,
  title,
  description,
  href,
  specsLabel,
  quoteLabel,
  quoteHref,
  authorizedLabel = "Authorized",
  exclusiveLabel = "Exclusive in Thailand",
  safetyLabel = "Safety critical",
}: ProductCardProps) {
  const border = exclusive
    ? "border-2 border-gold-500"
    : "border border-mist-800";

  const displayTitle = title ?? sku ?? "";

  return (
    <article
      className={`group bg-forest-800 text-mist-50 flex flex-col overflow-hidden rounded-xl ${border}`}
    >
      <Link
        href={href}
        className="bg-forest-950 relative block aspect-[4/3] w-full overflow-hidden"
      >
        {image ? (
          <Image
            src={urlFor(image).width(640).height(480).fit("crop").url()}
            alt={displayTitle}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="text-mist-400 text-eyebrow flex h-full w-full items-center justify-center">
            {brand?.name ?? "WS Energy"}
          </div>
        )}
        {/* Brand logo overlay — only renders when the brand has a logo */}
        <BrandLogoBadge
          logo={brand?.logo}
          name={brand?.name}
          size="md"
          className="absolute top-3 left-3"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {brand?.name && <Badge variant="brand">{brand.name}</Badge>}
          {authorized && (
            <Badge variant="authorized">★ {authorizedLabel}</Badge>
          )}
          {exclusive && (
            <Badge variant="exclusive">★ {exclusiveLabel}</Badge>
          )}
          {safetyCritical && (
            <Badge variant="safety-critical">{safetyLabel}</Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1">
          {sku && (
            <p className="text-caption text-mist-400 font-mono">{sku}</p>
          )}
          <Link
            href={href}
            className="text-h4 text-mist-50 hover:text-gold-500 font-medium"
          >
            {displayTitle}
          </Link>
          {description && (
            <p className="text-body text-mist-400 mt-1">{description}</p>
          )}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-2">
          <Button variant="outline-primary" size="sm" href={href}>
            {specsLabel}
          </Button>
          <Button variant="primary" size="sm" href={quoteHref}>
            {quoteLabel}
          </Button>
        </div>
      </div>
    </article>
  );
}
