"use client";

/**
 * ProductDetailHeader — engineering-ledger SKU header.
 *
 * Replaces the warm-bone hero on the product detail page with a dense,
 * datasheet-style block: status strip, image well, headline + 4-stat grid,
 * tabbed spec ledger (Electrical / Mechanical / Environment / Compliance),
 * action band with quote CTA, certs, and datasheet link.
 *
 * Generic across product families — every label is bilingual (EN/TH), and
 * the dominant language follows the page `locale`.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate, motion, useReducedMotion } from "framer-motion";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconCheck,
  IconCopy,
  IconDownload,
  IconStarFilled,
  IconCircleFilled,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  ProductSchematic,
  schematicVariantForCategory,
} from "@/components/product/ProductSchematic";
import type { Locale } from "@/lib/i18n/config";

/* ─── Types ──────────────────────────────────────────────────── */

export type BiLabel = { en: string; th?: string };

export type SpecRow = {
  label: BiLabel;
  value: string;
  unit?: string;
};

export type SpecGroupId =
  | "electrical"
  | "mechanical"
  | "environment"
  | "compliance";

export type SpecGroup = {
  id: SpecGroupId | string;
  label: BiLabel;
  rows: SpecRow[];
};

export type HeroStat = {
  label: BiLabel;
  value: string;
  unit?: string;
};

export type ProductDetailHeaderProps = {
  locale: Locale;

  mpn: string;
  manufacturer: string;
  classification: BiLabel;
  /** Sanity category slug — selects the schematic drawing variant. */
  categorySlug?: string;

  authorized?: boolean;
  authorizedNote?: BiLabel;

  inStock?: boolean;
  stockLocation?: string;

  title: string;
  summary: BiLabel;

  imageSrc?: string;
  imageAlt?: string;

  stats: HeroStat[];
  specGroups: SpecGroup[];

  certifications: string[];
  datasheetHref?: string;
  datasheetMeta?: string;

  quoteHref?: string;
  contactHref?: string;
  quoteLabel?: BiLabel;
  contactLabel?: BiLabel;
};

/* ─── UI string lookup ───────────────────────────────────────── */

const UI = {
  en: {
    manufacturer: "Manufacturer",
    class: "Class",
    inStock: "In stock",
    authorized: "Authorized",
    certified: "Certified",
    datasheet: "Datasheet",
    copyValue: "Copy value",
    copied: "Copied",
  },
  th: {
    manufacturer: "ผู้ผลิต",
    class: "ประเภท",
    inStock: "มีสินค้า",
    authorized: "ได้รับอนุญาต",
    certified: "ผ่านการรับรอง",
    datasheet: "ดาต้าชีต",
    copyValue: "คัดลอกค่า",
    copied: "คัดลอกแล้ว",
  },
} as const;

/** Pick the locale-dominant side of a BiLabel. */
function dominant(label: BiLabel, locale: Locale): string {
  return locale === "th" ? (label.th ?? label.en) : label.en;
}
/** Pick the locale-secondary side of a BiLabel (shown smaller below). */
function secondary(label: BiLabel, locale: Locale): string | undefined {
  if (locale === "th") return label.th ? label.en : undefined;
  return label.th;
}

/**
 * Parse a spec value into a plain number when it IS one ("3,000" → 3000,
 * "98.3" → 98.3). Compound values ("220 / 230 / 240", "Single-phase (1Ø)")
 * return null — they can't count up or ghost-print meaningfully.
 */
function parseNumeric(value: string): { n: number; decimals: number } | null {
  const cleaned = value.replace(/,/g, "").trim();
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  return { n: Number(cleaned), decimals: (cleaned.split(".")[1] ?? "").length };
}

/* ─── Component ──────────────────────────────────────────────── */

export function ProductDetailHeader(props: ProductDetailHeaderProps) {
  const {
    locale,
    mpn,
    manufacturer,
    categorySlug,
    authorized = true,
    authorizedNote,
    inStock = true,
    stockLocation = "TH",
    title,
    summary,
    imageSrc,
    imageAlt,
    stats,
    specGroups,
    certifications,
    datasheetHref,
    quoteHref = "/quote",
    contactHref = "/contact",
    quoteLabel = { en: "Request a Quote", th: "ขอใบเสนอราคา" },
    contactLabel = { en: "Talk to a sales engineer", th: "ติดต่อวิศวกรขาย" },
  } = props;

  const t = UI[locale];
  const reducedMotion = useReducedMotion();

  const [activeTabId, setActiveTabId] = useState(specGroups[0]?.id);
  const activeGroup =
    specGroups.find((g) => g.id === activeTabId) ?? specGroups[0];

  // Click-to-copy feedback for ledger values.
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyValue = (key: string, text: string) => {
    const confirm = () => {
      setCopiedKey(key);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopiedKey(null), 1400);
    };
    // Async clipboard first; textarea+execCommand fallback for contexts
    // where the API is unavailable or the permission is denied.
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        if (document.execCommand("copy")) confirm();
      } finally {
        ta.remove();
      }
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(confirm, fallback);
    } else {
      fallback();
    }
  };

  // The first stat with a plain numeric value is promoted to display scale
  // (count-up + ghost numeral); the rest render as supporting columns.
  const heroIdx = stats.findIndex((s) => parseNumeric(s.value) !== null);
  const heroStat = heroIdx >= 0 ? stats[heroIdx] : null;
  const heroNumeric = heroStat ? parseNumeric(heroStat.value) : null;
  const supportStats =
    heroIdx >= 0 ? stats.filter((_, i) => i !== heroIdx) : stats;

  // Ledger rows whose label matches a featured stat get a gold tick — the
  // repetition reads as cross-referencing, not accident.
  const featuredLabels = new Set(
    stats.map((s) => s.label.en.trim().toLowerCase()),
  );

  return (
    <ScrollReveal>
      <section className="border-b border-mist-800 bg-forest-900 text-mist-50">
        {/* ── 1. Hero band ────────────────────────────────────── */}
        {/* The former full-width status strip (manufacturer / class / stock)
            was redundant with the breadcrumb + badge row below and added a
            fourth stacked bar at the top; retired. The one non-redundant
            signal — in-stock — now rides in the badge row inside the hero. */}
        <div className="relative isolate mx-auto grid max-w-6xl gap-12 overflow-hidden px-6 py-10 lg:grid-cols-[minmax(420px,0.85fr)_1.15fr]">
          {/* Ghost numeral — the headline spec value as an ambient watermark
              behind the title column. Decorative only. */}
          {heroStat && heroNumeric ? (
            <div
              aria-hidden
              className="pointer-events-none absolute -top-4 right-0 -z-10 select-none whitespace-nowrap font-mono font-medium leading-none tracking-tighter text-mist-50 opacity-[0.045] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
              style={{ fontSize: "clamp(140px, 17vw, 220px)" }}
            >
              {heroStat.value}
            </div>
          ) : null}

          {/* Image well — generative schematic; photo overlays it when present */}
          <div className="relative flex min-h-[380px] items-center justify-center overflow-hidden rounded-[20px] border border-mist-800 bg-forest-950 p-9">
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(184,196,189,0.08) 1px, transparent 1px)",
                backgroundSize: "12px 12px",
                WebkitMaskImage:
                  "radial-gradient(ellipse 75% 70% at 50% 50%, black, transparent)",
                maskImage:
                  "radial-gradient(ellipse 75% 70% at 50% 50%, black, transparent)",
              }}
            />
            <CornerPixelGrid corner="tl" />
            <CornerPixelGrid corner="br" />

            {imageSrc ? (
              <>
                <div className="absolute inset-0 flex items-center justify-center p-9">
                  <ProductSchematic
                    variant={schematicVariantForCategory(categorySlug)}
                    dim
                  />
                </div>
                <Image
                  src={imageSrc}
                  alt={imageAlt || title}
                  width={420}
                  height={300}
                  className="relative z-10 max-h-full w-auto object-contain"
                />
              </>
            ) : (
              <ProductSchematic
                variant={schematicVariantForCategory(categorySlug)}
                caption={`[ ${title} · ${mpn} ]`}
                annotations={stats.slice(0, 3).map((s) => ({
                  label: dominant(s.label, locale),
                  value: s.unit ? `${s.value} ${s.unit}` : s.value,
                }))}
              />
            )}
          </div>

          {/* Headline + stat grid */}
          <div className="flex flex-col">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-mist-800 px-3 py-1 text-[12px] font-medium text-mist-50">
                {manufacturer.toUpperCase()}
              </span>
              {authorized && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-1 text-[12px] font-medium text-gold-500">
                  <IconStarFilled size={11} />
                  {t.authorized}
                </span>
              )}
              {authorizedNote && (
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist-400">
                  {dominant(authorizedNote, locale)}
                </span>
              )}
              {inStock && (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-mist-300">
                  <IconCircleFilled
                    size={7}
                    className="rounded-full text-forest-400 ring-4 ring-forest-400/20"
                  />
                  {t.inStock} · {stockLocation}
                </span>
              )}
            </div>

            <h1 className="m-0 text-[44px] font-medium leading-[1.05] tracking-[-0.018em] text-mist-50 md:text-[52px] md:leading-none">
              {title}
            </h1>
            <p className="mt-2 font-mono text-[12px] tracking-[0.04em] text-mist-400">
              {mpn}
            </p>
            <p className="mt-4 max-w-[56ch] text-[17px] leading-[1.5] text-mist-200">
              {dominant(summary, locale)}
            </p>
            {secondary(summary, locale) && (
              <p className="mt-1 max-w-[56ch] text-[14px] leading-[1.5] text-mist-400">
                {secondary(summary, locale)}
              </p>
            )}

            {/* Featured spec strip — the old bordered 2×2 grid gave every
                number equal, modest weight. Now the first numeric stat gets
                display scale + count-up (persuasion through contrast); the
                rest sit as quiet hairline-divided columns. Secondary-language
                labels are omitted here — the full ledger below carries them. */}
            {stats.length > 0 && (
              <div className="mt-9 border-t border-mist-800 pt-7">
                <div className="flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-10">
                  {heroStat && heroNumeric ? (
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-mist-400">
                        {dominant(heroStat.label, locale)}
                      </div>
                      <div className="mt-2 flex items-baseline gap-2 whitespace-nowrap">
                        <span className="font-mono text-[48px] font-medium leading-none tracking-[-0.02em] text-gold-500 tabular-nums md:text-[60px]">
                          <HeroCountUp
                            to={heroNumeric.n}
                            decimals={heroNumeric.decimals}
                          />
                        </span>
                        {heroStat.unit && (
                          <span className="font-mono text-[17px] text-gold-500/60">
                            {heroStat.unit}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {supportStats.slice(0, 3).length > 0 && (
                    <div
                      className={
                        "flex min-w-0 flex-wrap items-end gap-x-8 gap-y-5 sm:flex-1 " +
                        (heroStat
                          ? "sm:border-l sm:border-mist-800 sm:pl-8"
                          : "")
                      }
                    >
                      {supportStats.slice(0, 3).map((s) => (
                        <div key={s.label.en} className="min-w-0">
                          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-mist-400">
                            {dominant(s.label, locale)}
                          </div>
                          <div className="mt-1.5 flex items-baseline gap-1 whitespace-nowrap">
                            <span className="font-mono text-[17px] font-medium tracking-[-0.015em] text-mist-50 tabular-nums md:text-[19px]">
                              {s.value}
                            </span>
                            {s.unit && (
                              <span className="font-mono text-[11px] text-mist-400">
                                {s.unit}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CTAs sit directly under the stat ledger — primary action close to the data */}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Button variant="primary" size="md" href={quoteHref}>
                {dominant(quoteLabel, locale)}
                <IconArrowRight size={14} stroke={2} />
              </Button>
              <a
                href={contactHref}
                className="inline-flex items-center gap-1.5 text-[14px] font-medium text-mist-50 hover:underline"
              >
                {dominant(contactLabel, locale)}
                <IconArrowUpRight size={12} stroke={1.5} />
              </a>
              {datasheetHref && (
                <a
                  href={datasheetHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[14px] font-medium text-gold-500 hover:text-gold-400 hover:underline"
                >
                  <IconDownload size={14} stroke={1.75} />
                  {t.datasheet}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── 3. Tabbed spec ledger ───────────────────────────── */}
        {specGroups.length > 0 && activeGroup && (
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-end gap-0 border-b border-mist-800">
              {specGroups.map((g) => {
                const active = g.id === activeGroup.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setActiveTabId(g.id)}
                    aria-pressed={active}
                    data-active={active}
                    className="relative min-w-0 -mb-px whitespace-nowrap px-3 py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-mist-400 transition-[color,transform] hover:text-mist-200 active:scale-[0.97] data-[active=true]:text-mist-50 md:px-4 md:py-3.5 md:text-[11px] md:tracking-[0.14em]"
                  >
                    {dominant(g.label, locale)}
                    {active && (
                      <motion.span
                        layoutId="ledger-tab-underline"
                        className="absolute inset-x-2 -bottom-px h-[2px] bg-gold-500"
                        transition={
                          reducedMotion
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 500, damping: 40 }
                        }
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <motion.div
              key={activeGroup.id}
              initial={reducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="grid grid-cols-1 gap-x-12 pb-7 pt-3 md:grid-cols-2"
            >
              {activeGroup.rows.map((row) => {
                const rowKey = `${activeGroup.id}:${row.label.en}`;
                const copied = copiedKey === rowKey;
                const copyText = row.unit
                  ? `${row.value} ${row.unit}`
                  : row.value;
                const featured = featuredLabels.has(
                  row.label.en.trim().toLowerCase(),
                );
                return (
                  <div
                    key={row.label.en}
                    className="group/row -mx-2 grid grid-cols-[1fr_auto] items-baseline gap-4 rounded-md border-t border-mist-800/45 px-2 py-3 transition-colors first:border-t-0 hover:bg-mist-50/[0.03] md:[&:nth-child(2)]:border-t-0"
                  >
                    <div>
                      <div className="text-[14px] leading-snug text-mist-200 transition-colors group-hover/row:text-mist-50">
                        {featured && (
                          <span
                            aria-hidden
                            className="mr-2 inline-block size-[5px] rounded-full bg-gold-500 align-[2px]"
                          />
                        )}
                        {dominant(row.label, locale)}
                      </div>
                      {secondary(row.label, locale) && (
                        <div className="mt-0.5 text-[11px] leading-snug text-mist-400/75">
                          {secondary(row.label, locale)}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyValue(rowKey, copyText)}
                      aria-label={`${t.copyValue}: ${copyText}`}
                      className="flex cursor-pointer items-baseline gap-1 whitespace-nowrap font-mono text-[13px] font-medium text-mist-50 transition-transform active:scale-[0.97]"
                    >
                      <span>{row.value}</span>
                      {row.unit && (
                        <span className="text-mist-400">{row.unit}</span>
                      )}
                      <span
                        className={
                          "inline-flex w-4 shrink-0 justify-end self-center transition-opacity " +
                          (copied
                            ? "opacity-100"
                            : "opacity-0 group-hover/row:opacity-100")
                        }
                      >
                        {copied ? (
                          <IconCheck
                            size={13}
                            stroke={2}
                            className="text-gold-500"
                          />
                        ) : (
                          <IconCopy
                            size={13}
                            stroke={1.5}
                            className="text-mist-600"
                          />
                        )}
                      </span>
                    </button>
                  </div>
                );
              })}
            </motion.div>
          </div>
        )}

        {/* ── 4. Footer strip: certifications ─────────────────── */}
        {/* The datasheet link already lives in the CTA row above — it used to
            repeat here, which was pure noise. Certs only now. */}
        {certifications.length > 0 && (
          <div className="border-t border-mist-800 bg-forest-950">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-4 px-6 py-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist-400">
                  {t.certified}
                </span>
                {certifications.map((c) => (
                  <span
                    key={c}
                    className="rounded-md border border-mist-800 px-2.5 py-[5px] font-mono text-[11px] text-mist-200"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </ScrollReveal>
  );
}

/* ─── Internal atoms ─────────────────────────────────────────── */

/**
 * Mount-driven count-up for the hero stat. The `CountUp` primitive tweens
 * on a GSAP ScrollTrigger, which is pointless (and racy) for an
 * above-the-fold number — this one animates unconditionally on mount.
 * SSR renders the final value so no-JS and crawlers see the real number.
 */
function HeroCountUp({ to, decimals }: { to: number; decimals: number }) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(to);
  useEffect(() => {
    // Reduced motion: keep the initial state, which is already the final value.
    if (reduced) return;
    const controls = animate(0, to, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (latest) => setValue(latest),
    });
    return () => controls.stop();
  }, [to, reduced]);
  return (
    <>
      {value.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </>
  );
}

function CornerPixelGrid({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  const pos = {
    tl: "top-4 left-4",
    tr: "top-4 right-4",
    bl: "bottom-4 left-4",
    br: "bottom-4 right-4",
  }[corner];
  const mask = {
    tl: "linear-gradient(135deg, black, transparent)",
    tr: "linear-gradient(-135deg, black, transparent)",
    bl: "linear-gradient(45deg, black, transparent)",
    br: "linear-gradient(-45deg, black, transparent)",
  }[corner];
  return (
    <div
      aria-hidden
      className={`absolute ${pos} h-20 w-20`}
      style={{
        backgroundImage:
          "radial-gradient(rgba(184,196,189,0.30) 1px, transparent 1px)",
        backgroundSize: "10px 10px",
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    />
  );
}
