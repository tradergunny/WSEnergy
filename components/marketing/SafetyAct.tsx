"use client";

import { useRef } from "react";
import { IconArrowRight, IconArrowUpRight } from "@tabler/icons-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { PinnedScene, usePinnedScene } from "@/components/ui/PinnedScene";
import { ProductBounceCard } from "@/components/ui/ProductBounceCard";

gsap.registerPlugin(ScrollTrigger);

/**
 * SafetyAct — homepage Act 2, the Projoy rapid-shutdown story.
 * Pinned ~1.2 extra viewports: the field's gold current drains to cool mist
 * while the string-voltage readout scrubs 600 V → 24 V and the status pill
 * flips from ARRAY LIVE to DE-ENERGIZED. The product's value proposition,
 * told by the scene instead of copy.
 */
export function SafetyAct({
  locale,
  rapidShutdownHref,
  partnershipHref,
}: {
  locale: "en" | "th";
  rapidShutdownHref: string;
  partnershipHref: string;
}) {
  return (
    <PinnedScene length={2.2} className="bg-forest-950" stageClassName="bg-forest-950">
      <SafetyStage
        locale={locale}
        rapidShutdownHref={rapidShutdownHref}
        partnershipHref={partnershipHref}
      />
    </PinnedScene>
  );
}

function SafetyStage({
  locale,
  rapidShutdownHref,
  partnershipHref,
}: {
  locale: "en" | "th";
  rapidShutdownHref: string;
  partnershipHref: string;
}) {
  const ctx = usePinnedScene();
  const reduced = ctx?.reduced ?? false;
  const stage = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!stage.current) return;
      const voltEl = stage.current.querySelector('[data-safety="volt"]');
      // Parent refs aren't attached yet at child layout-effect time — resolve
      // the runway through the DOM instead (see PinnedScene context note).
      const runway = stage.current.closest("[data-pinned-runway]");

      if (reduced || !runway) {
        // Final, safe state for reduced motion
        if (voltEl) voltEl.textContent = "24";
        gsap.set('[data-safety="live"]', { display: "none" });
        gsap.set('[data-safety="safe"]', { autoAlpha: 1 });
        gsap.set('[data-safety="t-live"]', { display: "none" });
        gsap.set('[data-safety="t-safe"]', { autoAlpha: 1 });
        gsap.set('[data-safety="glow"]', { autoAlpha: 0.12 });
        gsap.set('[data-safety="volt-wrap"]', { color: "var(--color-mist-400)" });
        return;
      }

      const volt = { v: 600 };
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: runway,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
        defaults: { ease: "none" },
      });

      tl.to(
        volt,
        {
          v: 24,
          duration: 0.5,
          onUpdate: () => {
            if (voltEl) voltEl.textContent = String(Math.round(volt.v));
          },
        },
        0.25,
      )
        .to('[data-safety="live"]', { autoAlpha: 0, duration: 0.1 }, 0.45)
        .fromTo(
          '[data-safety="safe"]',
          { autoAlpha: 0, yPercent: 30 },
          { autoAlpha: 1, yPercent: 0, duration: 0.12 },
          0.52,
        )
        .to('[data-safety="t-live"]', { autoAlpha: 0, duration: 0.1 }, 0.45)
        .fromTo(
          '[data-safety="t-safe"]',
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.12 },
          0.52,
        )
        // voltage digits cool from gold to mist as the array dies
        .to('[data-safety="volt-wrap"]', { color: "var(--color-mist-400)", duration: 0.3 }, 0.4)
        // the live-array glow drains with the voltage
        .to('[data-safety="glow"]', { autoAlpha: 0.12, duration: 0.35 }, 0.35)
        // settle beat — hold the de-energized state for the last quarter
        .to({}, { duration: 0.25 }, 0.75);
    },
    { scope: stage, dependencies: [reduced] },
  );

  return (
    <div ref={stage} className="relative flex h-full w-full items-center">
      {/* Live-array glow — drains away as the act scrubs to de-energized */}
      <div
        data-safety="glow"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 70% 50%, color-mix(in srgb, var(--color-gold-500) 14%, transparent), transparent 72%)",
        }}
      />
      <div className="bg-grid-mist pointer-events-none absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,black,transparent)]" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-12">
          {/* Copy column */}
          <div className="md:col-span-6">
            {/* Timeline caption — flips with the scene */}
            <div className="relative h-5">
              <span
                data-safety="t-live"
                className="absolute left-0 top-0 text-caption font-mono uppercase tracking-[0.18em] text-gold-500"
              >
                {locale === "th"
                  ? "T+0 วินาที — ระบบทำงานปกติ"
                  : "T+0s — NORMAL OPERATION"}
              </span>
              <span
                data-safety="t-safe"
                className="absolute left-0 top-0 text-caption font-mono uppercase tracking-[0.18em] text-mist-400 opacity-0"
              >
                {locale === "th"
                  ? "T+28 วินาที — RAPID SHUTDOWN สมบูรณ์"
                  : "T+28s — RAPID SHUTDOWN COMPLETE"}
              </span>
            </div>

            <div className="mt-6">
              <MonoLabel tone="gold">
                {locale === "th" ? "PROJOY RAPID SHUTDOWN" : "PROJOY RAPID SHUTDOWN"}
              </MonoLabel>
            </div>
            <h2
              className="mt-4 font-medium tracking-tight text-mist-50"
              style={{
                fontSize: "clamp(30px, 4.4vw, 52px)",
                lineHeight: 1.08,
                letterSpacing: "-0.018em",
              }}
            >
              {locale === "th"
                ? "หนึ่งสวิตช์ ศูนย์ตัวนำไฟฟ้าที่มีไฟ"
                : "One switch. Zero live conductors."}
            </h2>
            <p className="text-body-lg mt-4 max-w-xl text-mist-400 md:mt-5">
              {locale === "th"
                ? "ระบบ Rapid Shutdown ของ Projoy ตัดแรงดันสตริงทั้งหมดให้ต่ำกว่าระดับที่ปลอดภัยภายในไม่กี่วินาที — ปกป้องนักดับเพลิง ช่างเทคนิค และทรัพย์สินของคุณ จัดจำหน่ายในไทยโดย WS Energy แต่เพียงผู้เดียว"
                : "Projoy Rapid Shutdown collapses every string to touch-safe voltage in seconds — protecting firefighters, technicians, and your asset. Exclusively distributed in Thailand by WS Energy."}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 md:mt-8">
              <Magnetic>
                <Button variant="primary" size="md" href={rapidShutdownHref}>
                  {locale === "th" ? "สำรวจ Rapid Shutdown" : "Explore Rapid Shutdown"}
                  <IconArrowRight size={14} stroke={2} />
                </Button>
              </Magnetic>
              <Button variant="secondary" size="md" href={partnershipHref}>
                {locale === "th"
                  ? "เกี่ยวกับพันธมิตร Projoy"
                  : "About the Projoy partnership"}
                <IconArrowUpRight size={14} stroke={2} />
              </Button>
            </div>
          </div>

          {/* Instrument column */}
          <div className="flex flex-col items-center md:col-span-6">
            {/* The floating product needs vertical room — desktop only; the
                voltage instrument carries the story on small screens. */}
            <div className="hidden md:block">
              <ProductBounceCard
                imageUrl="/products/projoy-rapid-shutdown.png"
                alt={
                  locale === "th"
                    ? "Projoy PEFS-PL Rapid Shutdown"
                    : "Projoy PEFS-PL Rapid Shutdown module"
                }
              />
            </div>

            {/* Voltage readout */}
            <div
              data-safety="volt-wrap"
              className="mt-2 flex items-baseline gap-2 font-mono text-gold-500 md:mt-8"
            >
              <span
                data-safety="volt"
                className="font-medium tabular-nums"
                style={{ fontSize: "clamp(44px, 5vw, 64px)", lineHeight: 1 }}
              >
                600
              </span>
              <span className="text-h3">V DC</span>
            </div>

            {/* Status pill — flips as the field drains */}
            <div className="relative mt-5 h-9">
              <span
                data-safety="live"
                className="absolute left-1/2 inline-flex w-max -translate-x-1/2 items-center gap-2 rounded-full border border-gold-500/60 px-4 py-1.5 text-caption font-mono uppercase tracking-wider text-gold-500"
              >
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-gold-500" />
                {locale === "th" ? "อาร์เรย์มีไฟ · แรงดันสตริง" : "ARRAY LIVE · STRING VOLTAGE"}
              </span>
              <span
                data-safety="safe"
                className="absolute left-1/2 inline-flex w-max -translate-x-1/2 items-center gap-2 rounded-full border border-mist-400/40 px-4 py-1.5 text-caption font-mono uppercase tracking-wider text-mist-300 opacity-0"
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-mist-400" />
                {locale === "th"
                  ? "ตัดพลังงานแล้ว · NEC 690.12"
                  : "DE-ENERGIZED · NEC 690.12"}
              </span>
            </div>

            <div className="mt-6 inline-flex items-center rounded-full border border-mist-400/25 px-4 py-1.5">
              <span className="text-caption font-mono uppercase tracking-wider text-mist-400">
                PEFS-PL · IEC 60947-3 · IP66
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-mist-400/30 to-transparent" />
    </div>
  );
}
