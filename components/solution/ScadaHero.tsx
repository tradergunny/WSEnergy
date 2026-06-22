"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { IconArrowRight } from "@tabler/icons-react";
import { Container } from "@/components/ui/Container";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { SplitTextReveal } from "@/components/ui/SplitTextReveal";

gsap.registerPlugin(ScrollTrigger);

/**
 * ScadaHero — a built "operator screen" hero for the SCADA page (no photo).
 * Left: the usual eyebrow / headline / CTAs. Right: a faux HMI panel — a status
 * bar with a live dot, an events ticker, and metric tiles whose numbers count
 * up on scroll-in. The point is that the hero looks like the product.
 *
 * Reduced motion: numbers render final, the live dot stops pinging.
 */

type Tile = { label: string; value: string; unit: string };

export function ScadaHero({
  eyebrow,
  headline,
  subhead,
  statusLabel,
  caption,
  tiles,
  events,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  breadcrumb = null,
}: {
  eyebrow: string;
  headline: string;
  subhead: string;
  statusLabel: string;
  caption: string;
  tiles: Tile[];
  events: string[];
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  breadcrumb?: ReactNode;
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = gsap.utils.selector(root.current);
      q("[data-count]").forEach((el) => {
        const raw = el.getAttribute("data-count") || "0";
        const target = parseFloat(raw);
        const decimals = (raw.split(".")[1] || "").length;
        const s = { v: 0 };
        el.textContent = (0).toFixed(decimals);
        gsap.to(s, {
          v: target,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
          onUpdate: () => {
            el.textContent = s.v.toFixed(decimals);
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="bg-forest-950 relative isolate flex min-h-[88svh] items-center overflow-hidden"
    >
      <div className="bg-grid-forest absolute inset-0 -z-10 opacity-30" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(90% 70% at 82% 8%, rgba(244,194,27,0.10) 0%, transparent 52%)",
        }}
        aria-hidden
      />

      {breadcrumb ? (
        <Container className="absolute inset-x-0 top-0 z-10 pt-6">
          {breadcrumb}
        </Container>
      ) : null}

      <Container className="relative w-full pt-28 pb-16 lg:pt-24 lg:pb-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Copy */}
          <div>
            <MonoLabel tone="gold">{eyebrow}</MonoLabel>
            <SplitTextReveal
              as="h1"
              className="text-display text-mist-50 mt-5 font-medium text-balance"
            >
              {headline}
            </SplitTextReveal>
            <p className="text-body-lg text-mist-300 mt-6 max-w-xl">{subhead}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Magnetic>
                <Button variant="primary" size="lg" href={primaryHref}>
                  {primaryLabel}
                  <IconArrowRight size={18} stroke={1.5} aria-hidden />
                </Button>
              </Magnetic>
              <Button variant="secondary" size="lg" href={secondaryHref}>
                {secondaryLabel}
              </Button>
            </div>
          </div>

          {/* Faux HMI panel */}
          <div
            className="border-mist-800 bg-forest-950/80 rounded-2xl border backdrop-blur-sm"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="border-mist-800 flex items-center justify-between border-b px-4 py-2.5">
              <span className="text-caption text-mist-400 font-mono tracking-wider">
                WS ENERGY · OPERATIONS
              </span>
              <span className="text-caption text-mist-300 inline-flex items-center gap-2 font-mono">
                <span className="relative flex h-2 w-2">
                  <span className="bg-gold-500 absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
                  <span className="bg-gold-500 relative inline-flex h-2 w-2 rounded-full" />
                </span>
                {statusLabel}
              </span>
            </div>

            <div className="border-mist-800 border-b px-4 py-3">
              <ul className="space-y-1.5 overflow-x-auto">
                {events.map((e, i) => (
                  <li
                    key={i}
                    className="text-caption text-mist-400 flex items-center gap-2 font-mono whitespace-pre"
                  >
                    <span
                      className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: /warning/i.test(e) ? "#f4c21b" : "#c0dd97",
                      }}
                      aria-hidden
                    />
                    {e}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4">
              {tiles.map((t) => {
                const numeric = /^[0-9]+(\.[0-9]+)?$/.test(t.value);
                return (
                  <div
                    key={t.label}
                    className="border-mist-800 bg-forest-900/40 rounded-lg border p-3"
                  >
                    <p className="text-caption text-mist-400 font-mono tracking-wide uppercase">
                      {t.label}
                    </p>
                    <p className="text-h3 text-mist-50 mt-1 font-mono font-medium tabular-nums">
                      <span data-count={numeric ? t.value : undefined}>
                        {t.value}
                      </span>
                      {t.unit ? (
                        <span className="text-h4 text-gold-500"> {t.unit}</span>
                      ) : null}
                    </p>
                  </div>
                );
              })}
            </div>

            <p className="text-caption text-mist-600 px-4 pb-3 font-mono">
              {caption}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
