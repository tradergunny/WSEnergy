import type { urlFor } from "@/lib/sanity/client";

/**
 * Shared row shapes for the Sanity data the bespoke /solutions sub-pages fetch
 * (Commercial & Industrial, Residential, Solar Farm). These previously lived in
 * the SolutionPage.tsx template, which is now removed; only the types remain in
 * use.
 */

type SanityImageRef = Parameters<typeof urlFor>[0] | undefined | null;

export type SolutionProductRow = {
  _id: string;
  title?: string;
  sku?: string;
  slug?: string;
  authorized?: boolean;
  exclusive?: boolean;
  safetyCritical?: boolean;
  shortDescription_en?: string;
  shortDescription_th?: string;
  image?: SanityImageRef;
  brand?: { name?: string; slug?: string; logo?: SanityImageRef };
  category?: {
    title_en?: string;
    title_th?: string;
    slug?: string;
    parentSlug?: string;
  };
};

export type SolutionProjectRow = {
  _id: string;
  title_en?: string;
  title_th?: string;
  slug?: string;
  customer?: string;
  sector?: string;
  capacity?: string;
  year?: number;
  heroImage?: SanityImageRef;
};
