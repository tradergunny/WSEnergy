"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { SplitTextReveal } from "@/components/ui/SplitTextReveal";

gsap.registerPlugin(ScrollTrigger);

/**
 * ScadaArchitecture — the SCADA page's signature interactive.
 * The supervisory data path (PCS/ESS -> SACU -> RTU -> EMS -> Firewall ->
 * Utility SCADA, with the operator above) drawn as a one-line diagram that
 * animates "data" along the links. A Monitoring / Control toggle flips the
 * direction: telemetry flows up to the control centre, or operator commands
 * flow down to the field. Pure SVG + GSAP; reduced-motion + a11y safe.
 */

type ArchCopy = {
  eyebrow: string;
  heading: string;
  body: string;
  monitoringLabel: string;
  controlLabel: string;
  monitoringCaption: string;
  controlCaption: string;
  nodes: {
    field: string;
    sacu: string;
    rtu: string;
    ems: string;
    firewall: string;
    scada: string;
    operator: string;
  };
};

const GOLD = "#f4c21b";
const SPARK = "#fef7d9";
const LINE = "#3a4a42"; // mist-800

const NODES = [
  { key: "field", cx: 72, w: 120 },
  { key: "sacu", cx: 232, w: 120 },
  { key: "rtu", cx: 400, w: 120 },
  { key: "ems", cx: 568, w: 120 },
  { key: "firewall", cx: 706, w: 92 },
  { key: "scada", cx: 862, w: 120 },
] as const;

const NY = 230; // main-chain node centre Y
const NH = 56;
const OP_CX = 568;
const OP_CY = 92;
const OP_H = 46;

export function ScadaArchitecture({ copy }: { copy: ArchCopy }) {
  const root = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const flowMain = useRef<gsap.core.Tween | null>(null);
  const flowOp = useRef<gsap.core.Tween | null>(null);
  const reduced = useRef(false);
  const settled = useRef(false);
  const [mode, setMode] = useState<"monitoring" | "control">("monitoring");

  const startMainFlow = (control: boolean) => {
    const svg = svgRef.current;
    if (!svg || reduced.current) return;
    flowMain.current?.kill();
    flowMain.current = gsap.to(gsap.utils.selector(svg)(".flow-main"), {
      strokeDashoffset: control ? "+=0.3" : "-=0.3",
      duration: 1,
      ease: "none",
      repeat: -1,
    });
  };

  useGSAP(
    () => {
      const svg = svgRef.current;
      if (!svg) return;
      reduced.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const q = gsap.utils.selector(svg);
      const conds = q(".arch-cond");

      gsap.set(conds, { stroke: LINE });
      gsap.set(q(".flow"), { stroke: SPARK });
      gsap.set(q(".flow-op"), { autoAlpha: 0 }); // hidden until control

      if (reduced.current) {
        gsap.set(conds, { strokeDashoffset: 0 });
        gsap.set(q(".flow-main"), { autoAlpha: 0 });
        return;
      }

      gsap.set(conds, { strokeDashoffset: 1 });
      gsap.to(conds, {
        strokeDashoffset: 0,
        duration: 1.1,
        ease: "power2.out",
        stagger: 0.05,
        scrollTrigger: { trigger: svg, start: "top 82%", once: true },
        onComplete: () => startMainFlow(false),
      });

      flowOp.current = gsap
        .to(q(".flow-op"), {
          strokeDashoffset: "-=0.3",
          duration: 1,
          ease: "none",
          repeat: -1,
        })
        .pause();
    },
    { scope: root },
  );

  // mode switch
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (!settled.current) {
      settled.current = true;
      return;
    }
    const q = gsap.utils.selector(svg);
    const control = mode === "control";
    const dur = reduced.current ? 0 : 0.4;

    // operator branch + node highlight
    gsap.to(q(".flow-op"), { autoAlpha: control && !reduced.current ? 1 : 0, duration: dur });
    gsap.to(q(".op-node"), { autoAlpha: control ? 1 : 0.4, duration: dur });
    gsap.to(q(".op-ring"), { stroke: control ? GOLD : LINE, duration: dur });

    if (reduced.current) return;
    startMainFlow(control);
    if (control) flowOp.current?.play();
    else flowOp.current?.pause();
  }, [mode]);

  const caption = mode === "control" ? copy.controlCaption : copy.monitoringCaption;

  return (
    <section ref={root} className="border-mist-800 border-y bg-forest-950">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:py-24">
        <MonoLabel tone="gold">{copy.eyebrow}</MonoLabel>
        <SplitTextReveal as="h2" className="text-h2 text-mist-50 mt-4 font-medium">
          {copy.heading}
        </SplitTextReveal>
        <p className="text-body-lg text-mist-400 mt-3 max-w-2xl">{copy.body}</p>

        {/* Mode toggle */}
        <div
          className="border-mist-800 mt-8 inline-flex rounded-full border p-1"
          role="group"
        >
          {(["monitoring", "control"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`text-caption rounded-full px-4 py-1.5 font-medium transition-colors ${
                mode === m
                  ? "bg-gold-500 text-forest-900"
                  : "text-mist-300 hover:text-mist-50"
              }`}
            >
              {m === "monitoring" ? copy.monitoringLabel : copy.controlLabel}
            </button>
          ))}
        </div>

        <div className="mt-8 overflow-x-auto">
          <svg
            ref={svgRef}
            viewBox="0 0 960 300"
            className="w-full min-w-[760px]"
            role="img"
            aria-label="SCADA data path from field devices to the utility control centre"
          >
            {/* Conductors */}
            <path
              className="arch-cond"
              d="M 72 230 H 862"
              fill="none"
              strokeWidth={2}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={0}
            />
            <path
              className="arch-cond op-line"
              d={`M ${OP_CX} ${OP_CY + OP_H / 2} V ${NY - NH / 2}`}
              fill="none"
              strokeWidth={2}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={0}
            />

            {/* Flow overlays */}
            <path
              className="flow flow-main"
              d="M 72 230 H 862"
              fill="none"
              strokeWidth={2}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="0.04 0.07"
            />
            <path
              className="flow flow-op"
              d={`M ${OP_CX} ${OP_CY + OP_H / 2} V ${NY - NH / 2}`}
              fill="none"
              strokeWidth={2}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="0.05 0.08"
            />

            {/* Protocol labels */}
            {[
              { x: 316, t: "IEC104" },
              { x: 484, t: "MODBUS TCP" },
              { x: 784, t: "DNP3" },
            ].map((p) => (
              <text
                key={p.t}
                x={p.x}
                y={212}
                textAnchor="middle"
                fill="#7a8a82"
                fontSize={11}
                fontFamily="monospace"
              >
                {p.t}
              </text>
            ))}

            {/* Operator node */}
            <g className="op-node">
              <rect
                className="op-ring"
                x={OP_CX - 60}
                y={OP_CY - OP_H / 2}
                width={120}
                height={OP_H}
                rx={10}
                fill="#00321d"
                strokeWidth={1.5}
              />
              <text
                x={OP_CX}
                y={OP_CY + 4}
                textAnchor="middle"
                fill="#ffffff"
                fontSize={13}
              >
                {copy.nodes.operator}
              </text>
            </g>

            {/* Chain nodes */}
            {NODES.map((n) => (
              <g key={n.key}>
                <rect
                  x={n.cx - n.w / 2}
                  y={NY - NH / 2}
                  width={n.w}
                  height={NH}
                  rx={10}
                  fill="#00321d"
                  stroke={LINE}
                  strokeWidth={1.5}
                />
                <text
                  x={n.cx}
                  y={NY + 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={13}
                >
                  {copy.nodes[n.key]}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <p
          className="text-body text-mist-400 mt-4 max-w-2xl"
          aria-live="polite"
        >
          {caption}
        </p>
      </div>
    </section>
  );
}
