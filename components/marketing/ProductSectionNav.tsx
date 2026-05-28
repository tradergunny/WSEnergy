"use client";

import { useEffect, useRef, useState } from "react";
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
 * IntersectionObserver scroll-spy.
 */
export function ProductSectionNav({
  locale,
  sections,
  labels,
}: {
  locale: Locale;
  sections: Section[];
  labels: ProductSectionLabels;
}) {
  const visible = sections.filter((s) => s.available);
  const navRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState<ProductSectionKey | null>(
    visible[0]?.key ?? null,
  );

  // Track global header height so the sticky nav sits flush beneath it.
  useEffect(() => {
    const header = document.querySelector("header");
    const nav = navRef.current;
    if (!header || !nav) return;
    const apply = () => {
      nav.style.top = `${header.getBoundingClientRect().height}px`;
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
      const headerH =
        (document.querySelector("header") as HTMLElement | null)
          ?.offsetHeight ?? 0;
      const navH = navRef.current?.offsetHeight ?? 0;
      const targetTop =
        target.getBoundingClientRect().top + window.scrollY - headerH - navH - 8;
      // Defer to Lenis when present so scrolling stays on-brand.
      const lenis = (window as unknown as { lenis?: { scrollTo: (t: number | string, o?: unknown) => void } }).lenis;
      if (lenis?.scrollTo) {
        lenis.scrollTo(targetTop, { duration: 0.8 });
      } else {
        window.scrollTo({ top: targetTop, behavior: "smooth" });
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
      className="sticky z-30 border-b border-mist-800/60 bg-forest-950/90 backdrop-blur-md"
      style={{ top: 0 }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <ul className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visible.map((s) => {
            const isActive = active === s.key;
            return (
              <li key={s.key} className="flex-none">
                <a
                  href={`#${s.key}`}
                  onClick={handleClick(s.key)}
                  aria-current={isActive ? "true" : undefined}
                  className={
                    "text-caption inline-flex items-center rounded-full border px-4 py-1.5 font-medium uppercase tracking-wider transition-colors " +
                    (isActive
                      ? "border-gold-500/60 bg-gold-500/10 text-gold-500"
                      : "border-mist-800 text-mist-300 hover:border-mist-400/60 hover:text-mist-50")
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
