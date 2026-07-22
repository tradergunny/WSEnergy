"use client";

import { useRef } from "react";
import { IconArrowRight, IconArrowUpRight } from "@tabler/icons-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { PinnedScene, usePinnedScene } from "@/components/ui/PinnedScene";
import { ScrollVideo } from "@/components/ui/ScrollVideo";
import { SplitTextReveal } from "@/components/ui/SplitTextReveal";

gsap.registerPlugin(ScrollTrigger);

/**
 * HeroAct — homepage Act 1, the three-scene scale transition.
 * Pinned ~2.4 extra viewports over a scroll-scrubbed aerial sequence:
 * house roof → factory roof → panel close-up → utility farm, with 0.25s
 * dissolves baked into the clip at each scene seam. Phase 1 (headline +
 * CTAs) hands off to three scale beats timed to the footage, closing on
 * the thesis: one partner, every scale.
 *
 * Footage (/public/hero-scrub.mp4, all-intra, 7.29s) content map as a
 * fraction of duration — keep the beat timings below in sync if the clip
 * is regenerated:
 *   house 0–0.31 · factory 0.34–0.61 · panel macro 0.64–0.75 · farm 0.75–1
 */
export function HeroAct({
  locale,
  quoteHref,
  solutionsHref,
  requestQuoteLabel,
}: {
  locale: "en" | "th";
  quoteHref: string;
  solutionsHref: string;
  requestQuoteLabel: string;
}) {
  return (
    <PinnedScene length={3.4} className="bg-forest-950" stageClassName="bg-forest-950">
      <HeroStage
        locale={locale}
        quoteHref={quoteHref}
        solutionsHref={solutionsHref}
        requestQuoteLabel={requestQuoteLabel}
      />
    </PinnedScene>
  );
}

function HeroStage({
  locale,
  quoteHref,
  solutionsHref,
  requestQuoteLabel,
}: {
  locale: "en" | "th";
  quoteHref: string;
  solutionsHref: string;
  requestQuoteLabel: string;
}) {
  const ctx = usePinnedScene();
  const reduced = ctx?.reduced ?? false;
  const stage = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Parent refs aren't attached yet at child layout-effect time — resolve
      // the runway through the DOM instead (see PinnedScene context note).
      const runway = stage.current?.closest("[data-pinned-runway]");
      if (reduced || !runway) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: runway,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
        defaults: { ease: "none" },
      });

      const beatIn = { yPercent: 24, autoAlpha: 0 };
      const beatShow = { yPercent: 0, autoAlpha: 1, duration: 0.05, ease: "power1.out" };
      const beatOut = { yPercent: -24, autoAlpha: 0, duration: 0.05, ease: "power1.in" };

      tl.to('[data-hero="hint"]', { autoAlpha: 0, duration: 0.08 }, 0.02)
        .to(
          '[data-hero="p1"]',
          { yPercent: -18, autoAlpha: 0, duration: 0.18, ease: "power1.in" },
          0.1,
        )
        // Three scale beats, timed to the footage content map in the header
        // comment: each caption lives inside its scene and clears before the
        // baked dissolve. The panel macro (0.64–0.75) runs caption-free.
        .fromTo('[data-hero-beat="0"]', beatIn, beatShow, 0.06)
        .to('[data-hero-beat="0"]', beatOut, 0.26)
        .fromTo('[data-hero-beat="1"]', beatIn, beatShow, 0.37)
        .to('[data-hero-beat="1"]', beatOut, 0.57)
        .fromTo('[data-hero-beat="2"]', beatIn, beatShow, 0.77)
        .to('[data-hero-beat="2"]', beatOut, 0.86)
        // Thesis lands as the sequence settles on the farm
        .fromTo(
          '[data-hero="p2"]',
          { yPercent: 14, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.1, ease: "power1.out" },
          0.87,
        )
        .fromTo(
          '[data-hero="chip"]',
          { yPercent: 40, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.05, stagger: 0.02 },
          0.91,
        )
        // settle beat — hold the finished state for the last stretch of scroll
        .to({}, { duration: 0.03 }, 0.97);
    },
    { scope: stage, dependencies: [reduced] },
  );

  const beats =
    locale === "th"
      ? [
          ["01", "หลังคาที่อยู่อาศัย"],
          ["02", "พาณิชย์และอุตสาหกรรม"],
          ["03", "โซลาร์ฟาร์มระดับยูทิลิตี้"],
        ]
      : [
          ["01", "RESIDENTIAL ROOFTOPS"],
          ["02", "COMMERCIAL & INDUSTRIAL"],
          ["03", "UTILITY-SCALE SOLAR"],
        ];

  const chips =
    locale === "th"
      ? ["ผลิต", "กักเก็บ", "ปกป้อง"]
      : ["GENERATE", "STORE", "PROTECT"];

  return (
    <div ref={stage} className="relative flex h-full w-full items-center justify-center">
      <ScrollVideo src="/hero-scrub.mp4" poster="/hero-scrub-poster.jpg" />

      {/* Scrims — keep text legible over arbitrary footage, tokens only */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--color-forest-950) 62%, transparent) 0%, color-mix(in srgb, var(--color-forest-950) 16%, transparent) 35%, color-mix(in srgb, var(--color-forest-950) 28%, transparent) 70%, color-mix(in srgb, var(--color-forest-950) 80%, transparent) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 72% 60% at 50% 46%, color-mix(in srgb, var(--color-forest-950) 52%, transparent), transparent 78%)",
        }}
      />

      {/* Phase 1 — arrival */}
      <div
        data-hero="p1"
        className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-mist-400/25 bg-mist-50/5 px-4 py-1.5 text-caption font-mono uppercase tracking-[0.18em] text-mist-200 backdrop-blur-sm">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-500" />
          {locale === "th" ? "โซลาร์ · พลังงานสำรอง · อีวี" : "Solar · Storage · EV"}
        </span>

        {/* Named thesis, the WHA move: the company stakes its name (gold, the
            one earned use of accent-on-name) on a specific claim about the
            country. The generic "powering the transition" line said nothing a
            competitor couldn't; this one is ours. */}
        <SplitTextReveal
          as="h1"
          delay={0.15}
          className="mt-6 font-medium text-mist-50 md:mt-8"
        >
          <span
            className="block"
            style={{
              fontSize: "clamp(38px, 6.6vw, 76px)",
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
            }}
          >
            {/* Thai: the gold name gets its own line deterministically. The
                Latin "WS Energy:" set beside Thai glyphs reflows the moment
                Anuphan loads — as a block it can't share a line with the
                clause, so there's no font-swap "pop". English reads as one
                sentence, so it stays inline. */}
            {locale === "th" ? (
              <>
                <span className="text-gold-500 block">WS Energy:</span>
                โซลาร์ปลอดภัย เพื่อไทยทั้งประเทศ
              </>
            ) : (
              <>
                <span className="text-gold-500">WS Energy:</span>{" "}
                safe solar for all of Thailand.
              </>
            )}
          </span>
        </SplitTextReveal>

        {/* Name lives in the H1 now, so the subhead leads with the credential
            instead of repeating "WS Energy is…". */}
        <p className="text-body-lg mt-5 max-w-2xl text-mist-200 md:mt-7">
          {locale === "th"
            ? "ผู้แทนจำหน่าย Projoy อย่างเป็นทางการในประเทศไทย พร้อมเป็นพันธมิตรครบวงจรสำหรับโซลาร์ ระบบกักเก็บพลังงาน และอีวี"
            : "Thailand's authorized Projoy distributor. Your full-line partner for solar generation, storage, and EV."}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:mt-10">
          <Magnetic>
            <Button variant="primary" size="lg" href={quoteHref}>
              {requestQuoteLabel}
              <IconArrowRight
                size={16}
                stroke={2}
                className="transition-transform duration-200 group-hover/btn:translate-x-0.5"
              />
            </Button>
          </Magnetic>
          <Magnetic strength={0.22}>
            <Button variant="secondary" size="lg" href={solutionsHref}>
              {locale === "th" ? "ดูโซลูชัน" : "Explore solutions"}
              <IconArrowUpRight
                size={16}
                stroke={2}
                className="transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
              />
            </Button>
          </Magnetic>
        </div>
      </div>

      {/* Scale beats — bottom-left captions timed to the flyover */}
      {!reduced ? (
        <div className="absolute bottom-16 left-6 z-10 md:bottom-20 md:left-12">
          {beats.map(([index, label], i) => (
            <div
              key={index}
              data-hero-beat={i}
              className="absolute bottom-0 left-0 flex w-max items-baseline gap-3 opacity-0"
            >
              <span className="font-mono text-h3 font-medium text-gold-500">
                {index}
              </span>
              <span className="text-eyebrow whitespace-nowrap text-mist-200">
                {label}
              </span>
              <span aria-hidden="true" className="ml-2 inline-block h-px w-16 self-center bg-gold-500/60" />
            </div>
          ))}
        </div>
      ) : null}

      {/* Phase 2 — the thesis settles on the farm */}
      {!reduced ? (
        <div
          data-hero="p2"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center opacity-0"
        >
          <span className="text-eyebrow inline-flex items-center gap-2 text-gold-500">
            <span aria-hidden="true">_</span>
            {locale === "th" ? "ทุกขนาดโครงการ" : "EVERY SCALE"}
          </span>
          <h2
            className="mt-6 max-w-3xl font-medium text-mist-50"
            style={{
              fontSize: "clamp(30px, 4.6vw, 56px)",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
            }}
          >
            {locale === "th"
              ? "หนึ่งพันธมิตร ทุกขนาดโครงการ"
              : "One partner. Every scale."}
          </h2>
          <p className="text-body-lg mt-5 max-w-xl text-mist-200">
            {locale === "th"
              ? "ออกแบบ จัดหา และปกป้องโดยทีมวิศวกรในประเทศ"
              : "Engineered, supplied, and protected by an in-country team."}
          </p>
          <div className="mt-9 flex items-center gap-3">
            {chips.map((c) => (
              <span
                key={c}
                data-hero="chip"
                className="rounded-full border border-mist-400/30 px-4 py-1.5 text-caption font-mono uppercase tracking-[0.18em] text-mist-200"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Scroll hint */}
      {!reduced ? (
        <div
          data-hero="hint"
          className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
        >
          <span className="text-eyebrow text-mist-400">
            <span aria-hidden="true">_</span>
            {locale === "th" ? "เลื่อนลง" : "SCROLL"}
          </span>
          <span className="relative block h-10 w-px overflow-hidden bg-mist-800">
            <span className="animate-scroll-hint absolute inset-x-0 top-0 h-1/2 bg-gold-500" />
          </span>
        </div>
      ) : null}

      {/* Bottom hairline, mirroring the production hero */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-mist-400/30 to-transparent" />
    </div>
  );
}
