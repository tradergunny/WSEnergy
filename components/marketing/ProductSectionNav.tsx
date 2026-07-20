"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n/config";

export type ProductSectionKey =
  | "overview"
  | "specs"
  | "compliance"
  | "documents"
  | "pairs";

type Section = { key: ProductSectionKey; available: boolean };

export type ProductSectionLabels = Record<ProductSectionKey, string>;

/**
 * ProductSectionNav — sticky in-page anchor bar for product detail.
 * Sticks under the global header; highlights the active section in gold via
 * IntersectionObserver scroll-spy. Optionally hosts the page breadcrumb on the
 * same row (left) so the top of the page doesn't stack two identical text bars.
 */
export function ProductSectionNav({
  locale,
  sections,
  labels,
  breadcrumb,
}: {
  locale: Locale;
  sections: Section[];
  labels: ProductSectionLabels;
  breadcrumb?: ReactNode;
}) {
  const visible = sections.filter((s) => s.available);
  const navRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState<ProductSectionKey | null>(
    visible[0]?.key ?? null,
  );

  // Track global header height so the sticky nav sits flush beneath it.
  // Use offsetHeight (layout px), NOT getBoundingClientRect().height (which is
  // scaled by the global html{zoom} and would be double-applied once assigned
  // to `top` under that same zoom — leaving the nav overlapping the header).
  useEffect(() => {
    const header = document.querySelector("header");
    const nav = navRef.current;
    if (!header || !nav) return;
    const apply = () => {
      nav.style.top = `${header.offsetHeight}px`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  // Scroll-spy: highlight whichever section sits in the active band of the viewport.
  useEffect(() => {
    if (visible.length === 0) return;
    const keys = visible.map((s) => s.key);
    const intersecting = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) intersecting.add(e.target.id);
          else intersecting.delete(e.target.id);
        }
        // Walk in document order — first intersecting wins.
        for (const k of keys) {
          if (intersecting.has(k)) {
            setActive(k);
            return;
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );

    keys.forEach((k) => {
      const el = document.getElementById(k);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [visible.map((s) => s.key).join(",")]);

  if (visible.length === 0) return null;

  const handleClick =
    (key: ProductSectionKey) =>
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const target = document.getElementById(key);
      if (!target) return;
      // Pass the ELEMENT (not a computed pixel target) to Lenis with a negative
      // offset for the sticky chrome — the app's proven idiom (see
      // SolarEstimator). Lenis resolves the element's true position itself,
      // which stays correct even though the target sits inside the ZoomScale
      // transform; a hand-computed numeric target or an animated numeric
      // scrollTo both mis-fire here.
      const headerH =
        (document.querySelector("header") as HTMLElement | null)
          ?.getBoundingClientRect().height ?? 0;
      const navH = navRef.current?.getBoundingClientRect().height ?? 0;
      const offset = -(headerH + navH + 8);
      const lenis = (
        window as unknown as {
          lenis?: {
            scrollTo: (t: HTMLElement, o?: { offset?: number }) => void;
          };
        }
      ).lenis;
      if (lenis?.scrollTo) {
        lenis.scrollTo(target, { offset });
      } else {
        target.style.scrollMarginTop = `${Math.ceil(headerH + navH + 8)}px`;
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      // Optimistic highlight while scroll animates.
      setActive(key);
      // Reflect in the URL hash without a hard jump.
      history.replaceState(null, "", `#${key}`);
    };

  return (
    <nav
      ref={navRef as React.RefObject<HTMLElement>}
      aria-label={locale === "th" ? "ส่วนต่าง ๆ ของสินค้า" : "Product sections"}
      className="sticky z-30 border-b border-mist-800 bg-forest-950 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]"
      style={{ top: 0 }}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-2.5">
        {/* Breadcrumb (left) shares the bar so the top of the page doesn't
            stack a separate breadcrumb strip. Hidden on narrow screens where
            the section pills need the full width. */}
        {breadcrumb ? (
          <div className="hidden min-w-0 shrink items-center md:flex">
            {breadcrumb}
          </div>
        ) : null}
        <ul className="-mx-1 flex flex-1 items-center justify-end gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visible.map((s) => {
            const isActive = active === s.key;
            return (
              <li key={s.key} className="flex-none">
                <a
                  href={`#${s.key}`}
                  onClick={handleClick(s.key)}
                  aria-current={isActive ? "true" : undefined}
                  className={
                    "text-caption inline-flex items-center rounded-full px-3.5 py-1.5 font-medium uppercase tracking-wider transition-colors " +
                    // Only the active item is bordered/filled — inactive items are
                    // plain text so a single gold pill anchors the eye instead of
                    // four competing outlines.
                    (isActive
                      ? "border border-gold-500/60 bg-gold-500/10 text-gold-500"
                      : "border border-transparent text-mist-400 hover:text-mist-50")
                  }
                >
                  {labels[s.key]}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
