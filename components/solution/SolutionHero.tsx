"use client";

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { IconArrowRight, IconChevronDown } from "@tabler/icons-react";
import { Container } from "@/components/ui/Container";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { SplitTextReveal } from "@/components/ui/SplitTextReveal";

gsap.registerPlugin(ScrollTrigger);

/**
 * SolutionHero — shared cinematic hero for the bespoke solution pages.
 * A graded backdrop (photo when supplied, an art-directed CSS canvas until
 * then) drifts on scroll for parallax depth; the headline reveals kinetic via
 * SplitTextReveal; a single gold light-sweep crosses once on load; the primary
 * CTA is magnetic. `chips` render as a credential strip (standards on C&I,
 * authorized brands on Residential, etc.).
 *
 * Drop a photo in /public/solutions and pass it as `imageSrc`; the CSS backdrop
 * stays underneath as a graceful fallback.
 */
export function SolutionHero({
  eyebrow,
  headline,
  subhead,
  chips,
  chipsNote,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  imageSrc = null,
  imageAlt = "",
  imagePosition = "center",
  breadcrumb = null,
}: {
  eyebrow: string;
  headline: string;
  subhead: string;
  chips: string[];
  chipsNote: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  imageSrc?: string | null;
  imageAlt?: string;
  /** object-position for the backdrop crop, e.g. "center 22%" to keep a tall subject. */
  imagePosition?: string;
  breadcrumb?: ReactNode;
}) {
  const root = useRef<HTMLElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const sweep = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      if (bg.current) {
        gsap.fromTo(
          bg.current,
          { yPercent: 0, scale: 1.05 },
          {
            yPercent: 12,
            scale: 1.12,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }

      if (sweep.current) {
        gsap.fromTo(
          sweep.current,
          { xPercent: -130, opacity: 0 },
          {
            xPercent: 230,
            opacity: 1,
            duration: 1.7,
            ease: "power2.inOut",
            delay: 0.35,
          },
        );
      }
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="bg-forest-950 relative isolate flex min-h-[88svh] items-end overflow-hidden"
    >
      {/* Backdrop (parallax layer) */}
      <div ref={bg} className="absolute inset-0 -z-10">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: imagePosition }}
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, transparent 0 26px, rgba(0,0,0,0.22) 26px 28px)",
          }}
          aria-hidden
        />
        <div
          className="bg-grid-forest absolute inset-0 opacity-40"
          aria-hidden
        />
      </div>

      {/* Grade overlays */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,26,15,0.55) 0%, rgba(0,26,15,0.25) 40%, rgba(0,26,15,0.85) 100%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 90% at 88% 6%, rgba(244,194,27,0.22) 0%, transparent 45%)",
        }}
        aria-hidden
      />
      {/* Left scrim — keeps the headline legible over a bright sky */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,26,15,0.82) 0%, rgba(0,26,15,0.45) 34%, transparent 62%)",
        }}
        aria-hidden
      />
      <div
        ref={sweep}
        className="pointer-events-none absolute inset-y-0 -z-10 w-1/3 opacity-0"
        style={{
          background:
            "linear-gradient(105deg, transparent, rgba(249,225,137,0.16), transparent)",
          mixBlendMode: "screen",
        }}
        aria-hidden
      />

      {breadcrumb ? (
        <Container className="absolute inset-x-0 top-0 z-10 pt-6">
          {breadcrumb}
        </Container>
      ) : null}

      <Container className="relative w-full pt-28 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-3xl">
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

          <div className="border-mist-800 mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 border-t pt-6">
            {chips.map((c) => (
              <span
                key={c}
                className="border-mist-700 text-caption text-mist-300 rounded-full border px-3 py-1"
              >
                {c}
              </span>
            ))}
            <span className="text-caption text-mist-400 ml-1">{chipsNote}</span>
          </div>
        </div>
      </Container>

      <div
        className="text-mist-600 pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2"
        aria-hidden
      >
        <IconChevronDown size={22} stroke={1.5} className="animate-bounce" />
      </div>
    </section>
  );
}
