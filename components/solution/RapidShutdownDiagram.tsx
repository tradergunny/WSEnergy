"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { SplitTextReveal } from "@/components/ui/SplitTextReveal";
import { Button } from "@/components/ui/Button";

gsap.registerPlugin(ScrollTrigger);

/**
 * RapidShutdownDiagram — the C&I flagship's signature interactive.
 * An SVG one-line schematic (PV strings → Projoy RSD devices → array boundary
 * → inverter → grid) that draws itself on scroll, runs gold "current" along the
 * live conductors, and lets the visitor ARM rapid shutdown: current stops, the
 * feeder voltage counts down past the touch-safe limit, and every conductor
 * turns from energized-gold to safe-green. Tells the firefighter-safety story
 * that sells module-level rapid shutdown, with no photo needed.
 *
 * Reduced motion: renders the energized state statically; the toggle still
 * works but switches instantly (no draw, no flow, no count).
 */

type DiagramCopy = {
  eyebrow: string;
  heading: string;
  body: string;
  liveState: string;
  liveCaption: string;
  safeState: string;
  safeCaption: string;
  armCta: string;
  resetCta: string;
  note: string;
  labels: {
    string: string;
    device: string;
    inverter: string;
    grid: string;
    boundary: string;
    touchSafe: string;
    live: string;
  };
};

// Brand-token hexes (Tailwind v4 @theme) — SVG strokes need literal colors for
// GSAP to interpolate between states.
const GOLD = "#f4c21b"; // gold-500 — energized / current
const SPARK = "#fef7d9"; // gold-50 — the moving current dashes
const SAFE = "#c0dd97"; // success-border — de-energized / touch-safe
const LIVE_V = 612; // illustrative full feeder voltage
const SAFE_V = 24; // illustrative touch-safe voltage (< 30 V, NEC 690.12)

const ROWS = [78, 120, 162];
const CENTER = ROWS.map((y) => y + 15);
const PANELS = [0, 1, 2, 3, 4];

export function RapidShutdownDiagram({ copy }: { copy: DiagramCopy }) {
  const root = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const voltRef = useRef<HTMLSpanElement>(null);
  const flowTl = useRef<gsap.core.Timeline | null>(null);
  const reduced = useRef(false);
  const settled = useRef(false);
  const [armed, setArmed] = useState(false);

  const writeVolts = (n: number) => {
    const el = voltRef.current;
    if (!el) return;
    const r = String(Math.round(n));
    el.textContent = r;
    el.dataset.v = r;
  };

  // Setup: base colors, scroll-triggered draw-on, looping current flow.
  useGSAP(
    () => {
      const svg = svgRef.current;
      if (!svg) return;
      reduced.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const q = gsap.utils.selector(svg);
      const conds = q(".rsd-cond");
      const flows = q(".rsd-flow");
      const live = [...q(".rsd-ring"), ...q(".rsd-glyph")];

      gsap.set(conds, { stroke: GOLD });
      gsap.set(q(".rsd-ring"), { stroke: GOLD });
      gsap.set(q(".rsd-glyph"), { fill: GOLD });
      gsap.set(flows, { stroke: SPARK });
      void live;

      if (reduced.current) {
        gsap.set(conds, { strokeDashoffset: 0 });
        gsap.set(flows, { autoAlpha: 0 });
        return;
      }

      gsap.set(conds, { strokeDashoffset: 1 });
      gsap.set(flows, { autoAlpha: 0 });

      flowTl.current = gsap
        .timeline({ repeat: -1, paused: true })
        .to(flows, { strokeDashoffset: "-=0.36", duration: 0.9, ease: "none" });

      gsap.to(conds, {
        strokeDashoffset: 0,
        duration: 1.1,
        ease: "power2.out",
        stagger: 0.07,
        scrollTrigger: { trigger: svg, start: "top 82%", once: true },
        onComplete: () => {
          gsap.to(flows, { autoAlpha: 1, duration: 0.4 });
          flowTl.current?.play();
        },
      });
    },
    { scope: root },
  );

  // Toggle between energized and rapid-shutdown states.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // First pass: markup already renders the energized state — don't animate.
    if (!settled.current) {
      settled.current = true;
      writeVolts(LIVE_V);
      return;
    }

    const q = gsap.utils.selector(svg);
    const conds = q(".rsd-cond");
    const rings = q(".rsd-ring");
    const glyphs = q(".rsd-glyph");
    const flows = q(".rsd-flow");
    const dur = reduced.current ? 0 : 0.55;
    const color = armed ? SAFE : GOLD;

    gsap.to([...conds, ...rings], { stroke: color, duration: dur });
    gsap.to(glyphs, { fill: color, duration: dur });

    if (armed) {
      flowTl.current?.pause();
      gsap.to(flows, { autoAlpha: 0, duration: dur * 0.45 });
    } else if (!reduced.current) {
      gsap.to(flows, {
        autoAlpha: 1,
        duration: dur,
        onComplete: () => flowTl.current?.play(),
      });
    }

    const from = Number(voltRef.current?.dataset.v ?? LIVE_V);
    const target = armed ? SAFE_V : LIVE_V;
    if (dur === 0) {
      writeVolts(target);
    } else {
      const s = { v: from };
      gsap.to(s, {
        v: target,
        duration: 0.85,
        ease: "power2.out",
        onUpdate: () => writeVolts(s.v),
      });
    }
  }, [armed]);

  const stateName = armed ? copy.safeState : copy.liveState;
  const stateCaption = armed ? copy.safeCaption : copy.liveCaption;
  const stateColor = armed ? SAFE : "#e24b4a"; // safety-400 red for live

  return (
    <section ref={root} className="border-mist-800 border-y bg-forest-950">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-24">
        {/* Control column */}
        <div>
          <MonoLabel tone="gold">{copy.eyebrow}</MonoLabel>
          <SplitTextReveal
            as="h2"
            className="text-h2 text-mist-50 mt-4 font-medium"
          >
            {copy.heading}
          </SplitTextReveal>
          <p className="text-body-lg text-mist-400 mt-4 max-w-lg">{copy.body}</p>

          <div className="mt-7">
            <Button
              type="button"
              size="lg"
              variant={armed ? "outline-primary" : "primary"}
              aria-pressed={armed}
              onClick={() => setArmed((a) => !a)}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: armed ? SAFE : "#e24b4a" }}
                aria-hidden
              />
              {armed ? copy.resetCta : copy.armCta}
            </Button>
          </div>

          <div
            aria-live="polite"
            className="border-mist-800 mt-7 max-w-md border-l-2 pl-4"
            style={{ borderColor: stateColor }}
          >
            <p
              className="text-caption font-medium tracking-wide uppercase"
              style={{ color: stateColor }}
            >
              {stateName}
            </p>
            <p className="text-body text-mist-400 mt-1">{stateCaption}</p>
          </div>

          <p className="text-caption text-mist-600 mt-6 max-w-md">{copy.note}</p>
        </div>

        {/* Schematic stage */}
        <div className="relative">
          <div className="border-mist-800 bg-forest-900 relative overflow-hidden rounded-2xl border p-4 sm:p-6">
            <div
              className="bg-grid-forest pointer-events-none absolute inset-0 opacity-50"
              aria-hidden
            />

            {/* Feeder-voltage readout */}
            <div className="border-mist-800 bg-forest-950/80 absolute top-4 right-4 z-10 rounded-xl border px-4 py-3 backdrop-blur-sm">
              <p className="text-caption text-mist-600 tracking-wide uppercase">
                {copy.labels.inverter} feeder
              </p>
              <div className="mt-0.5 flex items-baseline gap-1">
                {!armed && (
                  <span className="text-body text-mist-400" aria-hidden>
                    ≈
                  </span>
                )}
                <span
                  ref={voltRef}
                  data-v={LIVE_V}
                  className="text-h2 font-medium tabular-nums"
                  style={{ color: stateColor }}
                >
                  {LIVE_V}
                </span>
                <span className="text-body text-mist-400">V</span>
              </div>
              <span
                className="text-caption mt-1 inline-block rounded-full px-2 py-0.5 font-medium"
                style={{
                  color: armed ? "#173404" : "#fcebeb",
                  backgroundColor: armed ? SAFE : "#e24b4a",
                }}
              >
                {armed ? copy.labels.touchSafe : copy.labels.live}
              </span>
            </div>

            <svg
              ref={svgRef}
              viewBox="0 0 760 240"
              className="relative w-full"
              role="img"
              aria-label={`${copy.labels.string} to ${copy.labels.grid} one-line diagram`}
            >
              {/* Array boundary */}
              <line
                x1={410}
                y1={56}
                x2={410}
                y2={200}
                stroke="#3a4a42"
                strokeWidth={1.5}
                strokeDasharray="4 5"
              />
              <text
                x={410}
                y={48}
                textAnchor="middle"
                fill="#7a8a82"
                fontSize={11}
              >
                {copy.labels.boundary}
              </text>

              {/* Conductors (drawn on scroll, recolored on state change) */}
              {CENTER.map((cy, i) => (
                <path
                  key={`s${i}`}
                  className="rsd-cond"
                  d={`M 308 ${cy} L 470 ${cy}`}
                  fill="none"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={0}
                />
              ))}
              <path
                className="rsd-cond"
                d={`M 470 ${CENTER[0]} L 470 ${CENTER[2]}`}
                fill="none"
                strokeWidth={2.5}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={0}
              />
              <path
                className="rsd-cond"
                d={`M 470 ${CENTER[1]} L 556 ${CENTER[1]}`}
                fill="none"
                strokeWidth={2.5}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={0}
              />
              <path
                className="rsd-cond"
                d={`M 634 ${CENTER[1]} L 694 ${CENTER[1]}`}
                fill="none"
                strokeWidth={2.5}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={0}
              />

              {/* Current flow overlay (marching dashes) */}
              {CENTER.map((cy, i) => (
                <path
                  key={`f${i}`}
                  className="rsd-flow"
                  d={`M 308 ${cy} L 470 ${cy}`}
                  fill="none"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray="0.06 0.12"
                />
              ))}
              <path
                className="rsd-flow"
                d={`M 470 ${CENTER[1]} L 556 ${CENTER[1]}`}
                fill="none"
                strokeWidth={2.5}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="0.06 0.12"
              />

              {/* PV panels */}
              {ROWS.map((ry, r) =>
                PANELS.map((p) => (
                  <rect
                    key={`p${r}-${p}`}
                    x={64 + p * 50}
                    y={ry}
                    width={44}
                    height={30}
                    rx={3}
                    fill="#0e5436"
                    stroke="#064329"
                    strokeWidth={1}
                  />
                )),
              )}
              <text x={64} y={68} fill="#7a8a82" fontSize={11}>
                {copy.labels.string}
              </text>

              {/* Projoy RSD device nodes */}
              {CENTER.map((cy, i) => (
                <g key={`n${i}`}>
                  <rect
                    className="rsd-ring"
                    x={319}
                    y={cy - 13}
                    width={26}
                    height={26}
                    rx={6}
                    fill="#00321d"
                    strokeWidth={2}
                  />
                  <path
                    className="rsd-glyph"
                    d={`M ${334} ${cy - 7} L ${328} ${cy + 1} L ${332} ${cy + 1} L ${330} ${cy + 7} L ${337} ${cy - 2} L ${333} ${cy - 2} Z`}
                  />
                </g>
              ))}
              <text
                x={332}
                y={CENTER[2] + 30}
                textAnchor="middle"
                fill="#7a8a82"
                fontSize={11}
              >
                {copy.labels.device}
              </text>

              {/* Inverter */}
              <rect
                x={556}
                y={108}
                width={78}
                height={54}
                rx={8}
                fill="#00321d"
                stroke="#3a4a42"
                strokeWidth={1.5}
              />
              <text
                x={595}
                y={139}
                textAnchor="middle"
                fill="#b8c4bd"
                fontSize={12}
              >
                {copy.labels.inverter}
              </text>

              {/* Grid */}
              <circle
                cx={702}
                cy={CENTER[1]}
                r={8}
                fill="none"
                stroke="#7a8a82"
                strokeWidth={1.5}
              />
              <text
                x={702}
                y={CENTER[1] + 30}
                textAnchor="middle"
                fill="#7a8a82"
                fontSize={11}
              >
                {copy.labels.grid}
              </text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
