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

import { useState } from "react";
import Image from "next/image";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconDownload,
  IconStarFilled,
  IconCircleFilled,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
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
    fullDatasheet: "Full datasheet",
    certified: "Certified",
    datasheet: "Datasheet",
  },
  th: {
    manufacturer: "ผู้ผลิต",
    class: "ประเภท",
    inStock: "มีสินค้า",
    authorized: "ได้รับอนุญาต",
    fullDatasheet: "ดาต้าชีตฉบับเต็ม",
    certified: "ผ่านการรับรอง",
    datasheet: "ดาต้าชีต",
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

/* ─── Component ──────────────────────────────────────────────── */

export function ProductDetailHeader(props: ProductDetailHeaderProps) {
  const {
    locale,
    mpn,
    manufacturer,
    classification,
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
    datasheetMeta = "PDF",
    quoteHref = "/quote",
    contactHref = "/contact",
    quoteLabel = { en: "Request a Quote", th: "ขอใบเสนอราคา" },
    contactLabel = { en: "Talk to a sales engineer", th: "ติดต่อวิศวกรขาย" },
  } = props;

  const t = UI[locale];

  const [activeTabId, setActiveTabId] = useState(specGroups[0]?.id);
  const activeGroup =
    specGroups.find((g) => g.id === activeTabId) ?? specGroups[0];

  return (
    <ScrollReveal>
      <section className="border-b border-mist-800 bg-forest-900 text-mist-50">
        {/* ── 1. Status strip ─────────────────────────────────── */}
        <div className="border-b border-mist-800 bg-forest-950">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-y-2 px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.14em]">
            <Field label={t.manufacturer} value={manufacturer} />
            <Divider className="hidden md:inline-block" />
            <span className="hidden items-center md:inline-flex">
              <Field
                label={t.class}
                value={dominant(classification, locale)}
              />
            </span>
            <div className="flex-1" />
            {inStock && (
              <span className="inline-flex items-center gap-2 text-mist-50">
                <IconCircleFilled
                  size={8}
                  className="rounded-full text-forest-400 ring-4 ring-forest-400/20"
                />
                {t.inStock} · {stockLocation}
              </span>
            )}
          </div>
        </div>

        {/* ── 2. Hero band ────────────────────────────────────── */}
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-10 lg:grid-cols-[minmax(420px,0.85fr)_1.15fr]">
          {/* Image well */}
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
              <Image
                src={imageSrc}
                alt={imageAlt || title}
                width={420}
                height={300}
                className="relative z-10 max-h-full w-auto object-contain"
              />
            ) : (
              <ProductPlaceholder caption={`[ ${title} · ${mpn} ]`} />
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

            {stats.length > 0 && (
              <div className="mt-8 grid grid-cols-2 overflow-hidden rounded-2xl border border-mist-800">
                {stats.slice(0, 4).map((s, i) => (
                  <div
                    key={s.label.en}
                    className={
                      "@container flex flex-col gap-2.5 px-5 py-[18px] " +
                      // checker pattern across the 2×2 grid: tint cells 0 and 3
                      ((i === 0 || i === 3) ? "bg-black/10 " : "") +
                      // left border on right column (cells 1, 3)
                      ((i % 2 === 1) ? "border-l border-mist-800 " : "") +
                      // top border on bottom row (cells 2, 3)
                      ((i >= 2) ? "border-t border-mist-800 " : "")
                    }
                  >
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-mist-400">
                        {dominant(s.label, locale)}
                      </div>
                      {secondary(s.label, locale) && (
                        <div className="mt-0.5 text-[10px] leading-snug text-mist-400/70">
                          {secondary(s.label, locale)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 whitespace-nowrap">
                      <span
                        className="font-mono font-medium tracking-[-0.015em] text-mist-50 tabular-nums"
                        style={{ fontSize: "clamp(15px, 15cqw, 26px)" }}
                      >
                        {s.value}
                      </span>
                      {s.unit && (
                        <span
                          className="font-mono text-mist-400"
                          style={{ fontSize: "clamp(10px, 5.5cqw, 13px)" }}
                        >
                          {s.unit}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
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
                    className="min-w-0 -mb-px whitespace-nowrap border-b-2 border-transparent px-3 py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-mist-400 transition-colors hover:text-mist-200 data-[active=true]:border-gold-500 data-[active=true]:text-mist-50 md:px-4 md:py-3.5 md:text-[11px] md:tracking-[0.14em]"
                  >
                    {dominant(g.label, locale)}
                  </button>
                );
              })}
              <div className="flex-1" />
              {datasheetHref && (
                <a
                  href={datasheetHref}
                  className="hidden shrink-0 items-center gap-2 whitespace-nowrap py-3.5 font-mono text-[11px] uppercase tracking-[0.14em] text-gold-500 hover:underline lg:inline-flex"
                >
                  {t.fullDatasheet}
                  <IconArrowUpRight size={11} stroke={1.5} />
                </a>
              )}
            </div>

            <div
              key={activeGroup.id}
              className="grid grid-cols-1 gap-x-12 pb-7 pt-3 md:grid-cols-2"
            >
              {activeGroup.rows.map((row) => (
                <div
                  key={row.label.en}
                  className="grid grid-cols-[1fr_auto] items-baseline gap-4 border-t border-mist-800/45 py-3 first:border-t-0 md:[&:nth-child(2)]:border-t-0"
                >
                  <div>
                    <div className="text-[14px] leading-snug text-mist-200">
                      {dominant(row.label, locale)}
                    </div>
                    {secondary(row.label, locale) && (
                      <div className="mt-0.5 text-[12px] leading-snug text-mist-400">
                        {secondary(row.label, locale)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 whitespace-nowrap font-mono text-[13px] font-medium text-mist-50">
                    <span>{row.value}</span>
                    {row.unit && (
                      <span className="text-mist-400">{row.unit}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 4. Footer strip: certs + datasheet meta ─────────── */}
        {(certifications.length > 0 || datasheetHref) && (
          <div className="border-t border-mist-800 bg-forest-950">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-4 px-6 py-5">
              {certifications.length > 0 && (
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
              )}

              <div className="flex-1" />

              {datasheetHref && (
                <a
                  href={datasheetHref}
                  className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-mist-400 hover:text-mist-50"
                >
                  <IconDownload size={12} stroke={1.5} />
                  {t.datasheet} · {datasheetMeta}
                </a>
              )}
            </div>
          </div>
        )}
      </section>
    </ScrollReveal>
  );
}

/* ─── Internal atoms ─────────────────────────────────────────── */

function Field({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center">
      <span className="text-mist-400">{label}</span>
      <span className="ml-2.5 text-mist-50">{value}</span>
    </span>
  );
}

function Divider({ className = "" }: { className?: string }) {
  return (
    <span
      className={`mx-5 h-3.5 w-px bg-mist-800 ${className}`}
      aria-hidden
    />
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

function ProductPlaceholder({ caption }: { caption: string }) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-4 text-mist-200/70">
      <svg
        width="200"
        height="160"
        viewBox="0 0 200 160"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        aria-hidden
      >
        <rect x="20" y="20" width="160" height="120" rx="8" />
        <rect x="40" y="40" width="120" height="80" rx="4" />
      </svg>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist-400">
        {caption}
      </div>
    </div>
  );
}
