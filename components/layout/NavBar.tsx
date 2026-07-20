"use client";

/**
 * NavBar — the site header. Client component rendered by the Header server
 * wrapper (components/layout/Header.tsx), which feeds it the Sanity-backed
 * Products panel data. Adapted from an Aceternity-style hover menu: what
 * survives from that reference is the spring config, the shared-layout
 * (`layoutId`) panel morph, and the hover-intent open/close; palette, type,
 * and radii are all BRIEF §7.
 *
 * Shape:
 * - Slim utility bar (Projects/Contact + phone/LINE) that collapses on
 *   scroll; primary sections live in the main row below it.
 * - Products dropdown is a photo-card mega-panel: each category shows its
 *   Sanity heroImage (icon-tile fallback until one is uploaded), a
 *   one-liner, and brand-logo chips.
 * - Spring-animated panels that morph between items via `layoutId`.
 * - Spring-driven mobile sheet with staggered rows and animated accordions,
 *   rendered OUTSIDE the blurred header (see MobileSheet).
 */

import type { ComponentType } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import {
  IconArrowRight,
  IconBattery3,
  IconBolt,
  IconBrandLine,
  IconChargingPile,
  IconChevronDown,
  IconCpu,
  IconMenu2,
  IconPhone,
  IconSettingsBolt,
  IconStack2,
  IconTool,
  IconX,
  type IconProps,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LocaleToggle } from "@/components/layout/LocaleToggle";
import { urlFor } from "@/lib/sanity/client";
import {
  mainNav,
  secondaryNav,
  withLocale,
  type NavItem,
} from "@/lib/navigation";
import type { Locale } from "@/lib/i18n/config";

type SanityImageRef = Parameters<typeof urlFor>[0] | null;

export type NavBrand = { name: string; slug: string; logo: SanityImageRef };

/** Per-category data behind each Products mega-panel photo card. */
export type NavCategoryMeta = {
  heroImage: SanityImageRef;
  descriptionEn: string | null;
  descriptionTh: string | null;
  brands: NavBrand[];
};

/** Fallback icon per category slug, shown until a heroImage is uploaded. */
const CATEGORY_ICON: Record<string, ComponentType<IconProps>> = {
  inverters: IconBolt,
  "battery-storage": IconBattery3,
  optimizers: IconSettingsBolt,
  "micro-inverters": IconCpu,
  "ev-chargers": IconChargingPile,
  accessories: IconTool,
};

const SPRING: Transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

/** Extract the category slug from a "/products/<slug>" href. */
function categorySlugFromHref(href: string): string | null {
  const m = href.match(/^\/products\/([^/]+)/);
  return m?.[1] ?? null;
}

export function NavBar({
  locale,
  navLabels,
  actionLabels,
  exclusiveLabel,
  productCategories,
}: {
  locale: Locale;
  navLabels: Record<string, string>;
  actionLabels: { requestQuote: string; callUs: string; lineOA: string };
  exclusiveLabel: string;
  productCategories: Record<string, NavCategoryMeta>;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduceMotion = useReducedMotion();
  const transition: Transition = reduceMotion ? { duration: 0 } : SPRING;

  // Thai labels run ~30% wider than English, so the full desktop nav needs
  // more room. Hand off to the mobile sheet one breakpoint earlier for Thai
  // (xl / 1280) than English (lg / 1024). These must be complete literal
  // class strings — Tailwind's scanner can't see interpolated variants.
  const isThai = locale === "th";
  const navClass = isThai ? "hidden xl:block" : "hidden lg:block";
  const clusterClass = isThai ? "hidden xl:flex" : "hidden lg:flex";
  const triggerClass = isThai ? "inline-flex xl:hidden" : "inline-flex lg:hidden";
  const utilityClass = isThai ? "hidden xl:block" : "hidden lg:block";
  const sheetHideClass = isThai ? "xl:hidden" : "lg:hidden";

  // Condense the bar + collapse the utility strip once scrolled. Site-wide
  // Lenis suppresses native `scroll` events, so subscribe to its own emitter
  // (event-driven — fires on real wheel/touch and programmatic scrolls). A
  // native `scroll` listener covers the reduced-motion case where Lenis
  // never initializes. Lenis mounts in a sibling effect that can run after
  // this one, so latch onto it as soon as it appears.
  useEffect(() => {
    const read = () => setScrolled(window.scrollY > 16);
    read();
    window.addEventListener("scroll", read, { passive: true });

    type LenisLike = {
      on: (e: "scroll", cb: () => void) => void;
      off: (e: "scroll", cb: () => void) => void;
    };
    let lenis: LenisLike | null = null;
    let poll = 0;
    const attach = () => {
      const l = (window as unknown as { lenis?: LenisLike }).lenis;
      if (l) {
        lenis = l;
        l.on("scroll", read);
        if (poll) {
          window.clearInterval(poll);
          poll = 0;
        }
      }
    };
    attach();
    if (!lenis) poll = window.setInterval(attach, 150);

    return () => {
      window.removeEventListener("scroll", read);
      lenis?.off("scroll", read);
      if (poll) window.clearInterval(poll);
    };
  }, []);

  // Escape closes whichever layer is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActive(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <>
    <header
      className={`sticky top-0 z-40 border-b transition-[background-color,border-color] duration-300 ${
        scrolled
          ? "border-mist-800/60 bg-forest-900/90 backdrop-blur-xl"
          : "border-transparent bg-forest-900/40 backdrop-blur-md"
      }`}
    >
      {/* Utility bar — secondary links (left) + contact icons (right). Slim
          and quiet; collapses on scroll so only the main bar stays sticky,
          keeping the decluttered feel without paying its height while
          reading. Hidden below the desktop breakpoint (mobile sheet owns
          these links). */}
      <div
        className={`${utilityClass} overflow-hidden transition-[max-height,opacity] duration-300 ${
          scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
        }`}
      >
        <Container>
          <div className="text-caption flex items-center justify-between border-b border-mist-800/40 py-1.5 text-mist-400">
            <nav aria-label="Secondary">
              <ul className="flex items-center gap-5">
                {secondaryNav.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={withLocale(locale, item.href)}
                      className="whitespace-nowrap transition-colors hover:text-gold-500"
                    >
                      {navLabels[item.key] ?? item.key}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex items-center gap-4">
              <a
                href="tel:+66870538668"
                className="inline-flex items-center gap-1 whitespace-nowrap transition-colors hover:text-gold-500"
              >
                <IconPhone size={14} stroke={1.5} />
                {actionLabels.callUs}
              </a>
              <a
                href="https://line.me/R/ti/p/@ws.energy"
                className="inline-flex items-center gap-1 whitespace-nowrap transition-colors hover:text-gold-500"
              >
                <IconBrandLine size={14} stroke={1.5} />
                {actionLabels.lineOA}
              </a>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div
          className={`flex items-center justify-between gap-4 transition-[padding] duration-300 ${
            scrolled ? "py-2.5" : "py-4"
          }`}
        >
          <Link
            href={withLocale(locale, "/")}
            aria-label="WS Energy — home"
            className="inline-flex shrink-0 items-center"
          >
            <Image
              src="/WSLogo.png"
              alt="WS Energy"
              width={160}
              height={40}
              priority
              className={`w-auto transition-[height] duration-300 ${
                scrolled ? "h-7" : "h-9"
              }`}
            />
          </Link>

          {/* Desktop nav — primary sections only; Projects/Contact live in
              the utility bar above. */}
          <nav
            aria-label="Main"
            className={navClass}
            onMouseLeave={() => setActive(null)}
          >
            <ul className="flex items-center">
              {mainNav.map((item) => (
                <DesktopItem
                  key={item.key}
                  item={item}
                  locale={locale}
                  navLabels={navLabels}
                  exclusiveLabel={exclusiveLabel}
                  productCategories={productCategories}
                  active={active}
                  setActive={setActive}
                  transition={transition}
                  reduceMotion={!!reduceMotion}
                />
              ))}
            </ul>
          </nav>

          {/* Right cluster — locale stays here (always visible); CTA. */}
          <div className={`${clusterClass} shrink-0 items-center gap-3`}>
            <LocaleToggle current={locale} />
            <Button
              href={withLocale(locale, "/quote")}
              variant="primary"
              size="sm"
              className="whitespace-nowrap"
            >
              {actionLabels.requestQuote}
              <IconArrowRight size={14} stroke={2} />
            </Button>
          </div>

          {/* Mobile trigger */}
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            className={`${triggerClass} items-center p-2 text-mist-200 transition-colors hover:text-gold-500`}
          >
            <IconMenu2 size={24} stroke={1.5} />
          </button>
        </div>
      </Container>
    </header>

      {/* The sheet must live OUTSIDE the blurred <header>: backdrop-filter
          creates a containing block, so a `fixed inset-0` descendant would
          size itself to the bar's height instead of the viewport (this was
          the root-cause bug in the previous mobile menu). */}
      <MobileSheet
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        locale={locale}
        navLabels={navLabels}
        actionLabels={actionLabels}
        exclusiveLabel={exclusiveLabel}
        reduceMotion={!!reduceMotion}
        hideClass={sheetHideClass}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop                                                             */
/* ------------------------------------------------------------------ */

function DesktopItem({
  item,
  locale,
  navLabels,
  exclusiveLabel,
  productCategories,
  active,
  setActive,
  transition,
  reduceMotion,
}: {
  item: NavItem;
  locale: Locale;
  navLabels: Record<string, string>;
  exclusiveLabel: string;
  productCategories: Record<string, NavCategoryMeta>;
  active: string | null;
  setActive: (key: string | null) => void;
  transition: Transition;
  reduceMotion: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const label = navLabels[item.key] ?? item.key;
  const hasChildren = !!item.children?.length;
  const open = active === item.key;

  return (
    <li
      ref={ref}
      className="relative"
      onMouseEnter={() => setActive(item.key)}
      onFocus={() => setActive(item.key)}
      onBlur={(e) => {
        // Close only when focus leaves this item entirely.
        if (!ref.current?.contains(e.relatedTarget as Node)) setActive(null);
      }}
    >
      <Link
        href={withLocale(locale, item.href)}
        aria-expanded={hasChildren ? open : undefined}
        className={`text-body relative inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 font-medium transition-colors xl:px-3.5 ${
          open ? "text-gold-500" : "text-mist-200 hover:text-gold-500"
        }`}
      >
        {/* Hover pill that slides between items */}
        {open && (
          <motion.span
            layoutId={reduceMotion ? undefined : "nav-pill"}
            transition={transition}
            className="absolute inset-0 rounded-full bg-mist-50/[0.06]"
            aria-hidden="true"
          />
        )}
        <span className="relative">{label}</span>
        {hasChildren && (
          <IconChevronDown
            size={14}
            stroke={1.5}
            className={`relative transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        )}
      </Link>

      {/* Panel — mounts whenever any menu is open (per the reference) so
          the layoutId morph carries position + size between items. */}
      {hasChildren && active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {open && (
            <div
              className={`absolute top-full pt-3 ${
                // The Products mega-panel is too wide to center under its
                // left-side trigger without clipping — left-anchor it. Narrow
                // link panels stay centered under their item.
                item.key === "products"
                  ? "left-0"
                  : "left-1/2 -translate-x-1/2"
              }`}
            >
              <motion.div
                layoutId={reduceMotion ? undefined : "nav-panel"}
                transition={transition}
                className="overflow-hidden rounded-2xl border border-mist-800 bg-forest-800/95 shadow-card backdrop-blur-xl"
              >
                <motion.div layout className="h-full w-max max-w-[min(88vw,44rem)]">
                  {item.key === "products" ? (
                    <ProductsPanel
                      item={item}
                      locale={locale}
                      navLabels={navLabels}
                      productCategories={productCategories}
                    />
                  ) : (
                    <LinkListPanel
                      item={item}
                      locale={locale}
                      navLabels={navLabels}
                      exclusiveLabel={exclusiveLabel}
                    />
                  )}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </li>
  );
}

/** Simple one-column dropdown for Safety / Solutions / Resources / About. */
function LinkListPanel({
  item,
  locale,
  navLabels,
  exclusiveLabel,
}: {
  item: NavItem;
  locale: Locale;
  navLabels: Record<string, string>;
  exclusiveLabel: string;
}) {
  return (
    <ul className="flex min-w-64 flex-col p-2">
      {item.children!.map((child) => (
        <li key={child.key}>
          <Link
            href={withLocale(locale, child.href)}
            className="text-body flex items-center justify-between gap-6 rounded-lg px-3 py-2 text-mist-200 transition-colors hover:bg-mist-50/5 hover:text-gold-500"
          >
            <span>{navLabels[child.key] ?? child.key}</span>
            {child.exclusive && (
              <span className="text-eyebrow rounded-full bg-gold-500/15 px-2 py-0.5 text-gold-500">
                ★ {exclusiveLabel}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Products mega-panel (Option A): a photo card per category — heroImage
 *  (icon-tile fallback), one-liner, and brand-logo chips. Replaces the
 *  live header's cascading right-flyout. */
function ProductsPanel({
  item,
  locale,
  navLabels,
  productCategories,
}: {
  item: NavItem;
  locale: Locale;
  navLabels: Record<string, string>;
  productCategories: Record<string, NavCategoryMeta>;
}) {
  return (
    <div className="grid w-[min(88vw,44rem)] grid-cols-2 gap-1 p-2 sm:grid-cols-3">
      {item.children!.map((child) => {
        const catSlug = categorySlugFromHref(child.href);
        const meta = catSlug ? productCategories[catSlug] : undefined;
        const brands = meta?.brands ?? [];
        const description =
          (locale === "th" ? meta?.descriptionTh : meta?.descriptionEn) ?? null;
        const Icon = (catSlug && CATEGORY_ICON[catSlug]) || IconStack2;
        return (
          <Link
            key={child.key}
            href={withLocale(locale, child.href)}
            className="group/card flex flex-col rounded-xl p-2 transition-colors hover:bg-mist-50/5"
          >
            {/* Photo tile — heroImage when present, else a dark placeholder
                with a gold category icon (reads as intentional, not empty). */}
            <div
              className={`relative aspect-[16/10] overflow-hidden rounded-lg ${
                meta?.heroImage
                  ? "bg-card-50"
                  : "border border-mist-800/70 bg-forest-950/60"
              }`}
            >
              {meta?.heroImage ? (
                <Image
                  src={urlFor(meta.heroImage)
                    .width(440)
                    .height(275)
                    .fit("crop")
                    .url()}
                  alt=""
                  width={220}
                  height={138}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-[1.03]"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-gold-500/80 transition-transform duration-300 group-hover/card:scale-110">
                  <Icon size={26} stroke={1.5} />
                </span>
              )}
            </div>

            <p className="text-body mt-2 font-medium text-mist-50 transition-colors group-hover/card:text-gold-500">
              {navLabels[child.key] ?? child.key}
            </p>
            {description && (
              <p className="text-caption mt-0.5 line-clamp-2 text-mist-400">
                {description}
              </p>
            )}

            {brands.length > 0 && (
              <span className="mt-2 flex flex-wrap items-center gap-1">
                {brands.map((b) => (
                  <BrandChip key={b.slug} brand={b} />
                ))}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

/** A single brand marker inside a category card: warm-bone logo pill when a
 *  logo asset exists, else a compact text pill so every brand still reads. */
function BrandChip({ brand }: { brand: NavBrand }) {
  if (brand.logo) {
    return (
      <span
        className="bg-card-50 inline-flex h-5 items-center rounded px-1.5"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={urlFor(brand.logo).height(32).url()}
          alt={brand.name}
          className="block h-3 w-auto object-contain"
        />
      </span>
    );
  }
  return (
    <span className="text-caption bg-card-50 text-card-ink inline-flex h-5 items-center rounded px-1.5 leading-none">
      {brand.name}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile                                                              */
/* ------------------------------------------------------------------ */

function MobileSheet({
  open,
  onClose,
  locale,
  navLabels,
  actionLabels,
  exclusiveLabel,
  reduceMotion,
  hideClass,
}: {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  navLabels: Record<string, string>;
  actionLabels: { requestQuote: string; callUs: string; lineOA: string };
  exclusiveLabel: string;
  reduceMotion: boolean;
  /** Breakpoint at which the sheet is suppressed — matches the trigger so
   *  Thai (xl) and English (lg) hand off to the desktop nav consistently. */
  hideClass: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const sheetSpring: Transition = reduceMotion
    ? { duration: 0 }
    : { type: "spring", damping: 26, stiffness: 240 };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={`fixed inset-0 z-50 ${hideClass}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="absolute inset-0 bg-forest-950/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={sheetSpring}
            className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col border-l border-mist-800/60 bg-forest-950 text-mist-50"
          >
            <div className="flex items-center justify-between border-b border-mist-800/60 px-4 py-3">
              <Image
                src="/WSLogo.png"
                alt="WS Energy"
                width={160}
                height={40}
                className="h-8 w-auto"
              />
              <button
                type="button"
                aria-label="Close menu"
                onClick={onClose}
                className="p-2 text-mist-200 transition-colors hover:text-gold-500"
              >
                <IconX size={22} stroke={1.5} />
              </button>
            </div>

            <motion.nav
              aria-label="Main"
              className="flex-1 overflow-y-auto px-2 py-3"
              initial="hidden"
              animate="show"
              variants={{
                show: {
                  transition: reduceMotion ? undefined : { staggerChildren: 0.04 },
                },
              }}
            >
              <ul className="flex flex-col">
                {mainNav.map((item) => {
                  const label = navLabels[item.key] ?? item.key;
                  const hasChildren = !!item.children?.length;
                  const isOpen = expanded === item.key;
                  return (
                    <motion.li
                      key={item.key}
                      variants={{
                        hidden: reduceMotion ? {} : { opacity: 0, x: 24 },
                        show: { opacity: 1, x: 0 },
                      }}
                      className="border-b border-mist-800/40"
                    >
                      <div className="flex items-center">
                        <Link
                          href={withLocale(locale, item.href)}
                          onClick={onClose}
                          className="text-body flex-1 px-3 py-3.5 font-medium text-mist-200 transition-colors hover:text-gold-500"
                        >
                          {label}
                        </Link>
                        {hasChildren && (
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            aria-label={`Toggle ${label}`}
                            onClick={() => setExpanded(isOpen ? null : item.key)}
                            className="p-3 text-mist-400 transition-colors hover:text-gold-500"
                          >
                            <IconChevronDown
                              size={18}
                              stroke={1.5}
                              className={`transition-transform duration-200 ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        )}
                      </div>
                      {hasChildren && (
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={
                                reduceMotion
                                  ? { duration: 0 }
                                  : { duration: 0.25, ease: "easeOut" }
                              }
                              className="overflow-hidden"
                            >
                              <ul className="flex flex-col rounded-lg bg-forest-900 pb-2">
                                {item.children!.map((child) => (
                                  <li key={child.key}>
                                    <Link
                                      href={withLocale(locale, child.href)}
                                      onClick={onClose}
                                      className="text-body flex items-center gap-2 px-6 py-2.5 text-mist-200 transition-colors hover:text-gold-500"
                                    >
                                      <span>{navLabels[child.key] ?? child.key}</span>
                                      {child.exclusive && (
                                        <span className="text-eyebrow rounded-full bg-gold-500/15 px-2 py-0.5 text-gold-500">
                                          ★ {exclusiveLabel}
                                        </span>
                                      )}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </motion.li>
                  );
                })}
                {secondaryNav.map((item) => (
                  <motion.li
                    key={item.key}
                    variants={{
                      hidden: reduceMotion ? {} : { opacity: 0, x: 24 },
                      show: { opacity: 1, x: 0 },
                    }}
                    className="border-b border-mist-800/40"
                  >
                    <Link
                      href={withLocale(locale, item.href)}
                      onClick={onClose}
                      className="text-body block px-3 py-3.5 font-medium text-mist-200 transition-colors hover:text-gold-500"
                    >
                      {navLabels[item.key] ?? item.key}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.nav>

            <div className="border-t border-mist-800/60 px-4 py-4">
              <Button
                href={withLocale(locale, "/quote")}
                variant="primary"
                size="md"
                className="w-full justify-center"
              >
                {actionLabels.requestQuote}
                <IconArrowRight size={14} stroke={2} />
              </Button>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <a
                    href="tel:+66870538668"
                    className="text-caption inline-flex items-center gap-1 text-mist-400 transition-colors hover:text-gold-500"
                  >
                    <IconPhone size={14} stroke={1.5} />
                    {actionLabels.callUs}
                  </a>
                  <a
                    href="https://line.me/R/ti/p/@ws.energy"
                    className="text-caption inline-flex items-center gap-1 text-mist-400 transition-colors hover:text-gold-500"
                  >
                    <IconBrandLine size={14} stroke={1.5} />
                    {actionLabels.lineOA}
                  </a>
                </div>
                <LocaleToggle current={locale} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
