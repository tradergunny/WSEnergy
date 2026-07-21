"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * SafetyCircuit — animated single-line wiring schematic for the SafetyAct.
 * Three PV modules feed the Projoy PEFS-PL disconnect; one feed exits to the
 * inverter (IEC DC/AC symbol, no words). The switch housing is the hero of
 * the composition — filled, plated, glowing — because it is the product.
 *
 * Wordless by design: every element is a glyph an installer recognizes, and
 * the copy column already carries the language.
 *
 * While the array is live, gold current pulses travel every wire: a dim mist
 * base stroke, a solid faint-gold "hot" overlay, and a dashed bright pulse
 * doubled by a gaussian-blurred twin so the stroke reads as emitted light.
 *
 * The shutdown is choreographed by the parent SafetyAct scrub timeline via
 * the data-safety hooks here:
 *   blade       — disconnect blade (rotates open around svgOrigin 280 260)
 *   pulses      — traveling-pulse group (cut instantly at the throw)
 *   hot-core    — housing stroke, LED, node glow (dies first at the throw)
 *   hot-wires   — gold wire overlays (drain next)
 *   hot-panels  — panel sheens (drain last)
 * The staggered order makes the collapse ripple outward from the switch —
 * the throw *causes* the drain. The sun deliberately survives shutdown:
 * the hazard source still blazes while every conductor is dead.
 * This component only owns the perpetual pulse loop.
 */

/* Wire geometry — rounded elbows, drawn source → load so the dash pulses
   travel with the current. */
const WIRE_A = "M140,92 V250 Q140,260 150,260 H230"; // left string → left port
const WIRE_B = "M320,92 V220"; // center string → top port
const WIRE_C = "M500,92 V250 Q500,260 490,260 H410"; // right string → right port
const WIRE_OUT = "M320,300 V352"; // switch → inverter
const WIRES = [WIRE_A, WIRE_B, WIRE_C, WIRE_OUT];

/* Dash pattern period — offsets must loop in multiples of this. */
const PERIOD = 120;
const PULSE_DASH = "16 104";
/* Per-wire phase so the pulses don't march in lockstep. */
const PHASE = [0, 44, 86, 22];

/* PV module: filled glass panel with cell divisions. The gold sheen overlay
   lives in the hot-panels group so it drains last, after the wires. */
function PanelGlyph({ x }: { x: number }) {
  return (
    <g transform={`translate(${x - 48}, 28)`}>
      <rect width="96" height="60" rx="5" fill="url(#safety-panel-glass)" />
      <rect
        width="96"
        height="60"
        rx="5"
        stroke="var(--color-mist-400)"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <path
        d="M32,0 V60 M64,0 V60 M0,30 H96"
        stroke="var(--color-mist-400)"
        strokeOpacity="0.22"
        strokeWidth="1"
      />
    </g>
  );
}

function PanelSheen({ x }: { x: number }) {
  return (
    <rect
      x={x - 48}
      y="28"
      width="96"
      height="60"
      rx="5"
      fill="url(#safety-panel-sheen)"
    />
  );
}

export function SafetyCircuit({ reduced }: { reduced: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduced) return;
      // Perpetual current flow. Relative -= keeps each wire's phase; the
      // travel per loop equals the dash period, so the wrap is seamless.
      gsap.to(".safety-pulse", {
        strokeDashoffset: `-=${PERIOD}`,
        duration: 2,
        ease: "none",
        repeat: -1,
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <div ref={root} className="w-full">
      <svg
        viewBox="0 0 640 420"
        fill="none"
        aria-hidden="true"
        className="mx-auto w-full max-w-[600px]"
      >
        <defs>
          <filter id="safety-pulse-blur" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>
          {/* PV module glass — deep, slightly lifted off the canvas */}
          <linearGradient id="safety-panel-glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--color-forest-900)" />
            <stop offset="1" stopColor="var(--color-forest-950)" />
          </linearGradient>
          {/* Live sheen — sunlight on glass, drains on shutdown */}
          <linearGradient id="safety-panel-sheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--color-gold-500)" stopOpacity="0.28" />
            <stop offset="0.55" stopColor="var(--color-gold-500)" stopOpacity="0.07" />
            <stop offset="1" stopColor="var(--color-gold-500)" stopOpacity="0" />
          </linearGradient>
          {/* Switch housing — raised plate */}
          <linearGradient id="safety-housing" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--color-mist-400)" stopOpacity="0.10" />
            <stop offset="1" stopColor="var(--color-mist-400)" stopOpacity="0.02" />
          </linearGradient>
          {/* Node glow behind the housing while live */}
          <radialGradient id="safety-node-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="var(--color-gold-500)" stopOpacity="0.35" />
            <stop offset="1" stopColor="var(--color-gold-500)" stopOpacity="0" />
          </radialGradient>
          {/* Sun halo — never drains */}
          <radialGradient id="safety-sun-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="var(--color-gold-500)" stopOpacity="0.3" />
            <stop offset="1" stopColor="var(--color-gold-500)" stopOpacity="0" />
          </radialGradient>
          {/* Grounding shadow under the housing */}
          <radialGradient id="safety-ground-shadow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#000000" stopOpacity="0.4" />
            <stop offset="1" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          {/* Product backlight — neutral studio halo, deliberately NOT gold:
              gold means energy here, and only the sun keeps it after shutdown */}
          <radialGradient id="safety-product-halo" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="var(--color-mist-200)" stopOpacity="0.3" />
            <stop offset="0.6" stopColor="var(--color-mist-200)" stopOpacity="0.09" />
            <stop offset="1" stopColor="var(--color-mist-200)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── The sun — the one gold element that survives shutdown.
            Sun still up, conductors dead: the entire value proposition. ── */}
        <g>
          <circle cx="46" cy="52" r="30" fill="url(#safety-sun-glow)" />
          <circle
            cx="46"
            cy="52"
            r="11"
            stroke="var(--color-gold-500)"
            strokeWidth="1.5"
          />
          <g stroke="var(--color-gold-500)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M46,34 V30" />
            <path d="M46,70 V74" />
            <path d="M28,52 H24" />
            <path d="M64,52 H68" />
            <path d="M33.3,39.3 L30.4,36.4" />
            <path d="M58.7,64.7 L61.6,67.6" />
            <path d="M33.3,64.7 L30.4,67.6" />
            <path d="M58.7,39.3 L61.6,36.4" />
          </g>
        </g>

        {/* ── Cold layer: wires + glyph fills, always visible ── */}
        <g stroke="var(--color-mist-400)" strokeOpacity="0.3" strokeWidth="1.5">
          {WIRES.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <PanelGlyph x={140} />
        <PanelGlyph x={320} />
        <PanelGlyph x={500} />

        {/* Inverter — IEC symbol: DC over AC, split diagonally. No words. */}
        <g stroke="var(--color-mist-400)" strokeOpacity="0.35" strokeWidth="1.5">
          <rect x="270" y="352" width="100" height="56" rx="6" fill="url(#safety-housing)" />
          <path d="M272,406 L368,354" strokeOpacity="0.22" />
          {/* DC marks (top-left) */}
          <path d="M284,370 H310" />
          <path d="M284,376 H310" strokeDasharray="4 3" />
          {/* AC sine (bottom-right) */}
          <path d="M328,392 q6,-13 12,0 q6,13 12,0" />
        </g>

        {/* ── Grounding shadow — the housing sits on the canvas ── */}
        <ellipse cx="320" cy="306" rx="105" ry="9" fill="url(#safety-ground-shadow)" />

        {/* ── Hot layers: gold that drains outward from the switch ── */}
        <g data-safety="hot-panels">
          <PanelSheen x={140} />
          <PanelSheen x={320} />
          <PanelSheen x={500} />
        </g>
        <g data-safety="hot-wires">
          <g stroke="var(--color-gold-500)" strokeOpacity="0.4" strokeWidth="1.5">
            {WIRES.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        </g>
        <g data-safety="hot-core">
          <ellipse cx="320" cy="260" rx="190" ry="110" fill="url(#safety-node-glow)" />
          <rect
            x="230"
            y="220"
            width="180"
            height="80"
            rx="10"
            stroke="var(--color-gold-500)"
            strokeOpacity="0.5"
            strokeWidth="1.5"
          />
          {/* Status LED on the housing plate */}
          <circle cx="392" cy="238" r="3" fill="var(--color-gold-500)" />
        </g>

        {/* ── The product: PEFS-PL disconnect housing ── */}
        <rect
          x="230"
          y="220"
          width="180"
          height="80"
          rx="10"
          fill="url(#safety-housing)"
          stroke="var(--color-mist-400)"
          strokeOpacity="0.4"
          strokeWidth="1.5"
        />
        {/* Inner plate */}
        <rect
          x="242"
          y="232"
          width="156"
          height="56"
          rx="6"
          stroke="var(--color-mist-400)"
          strokeOpacity="0.16"
          strokeWidth="1"
        />
        {/* Terminal stubs where the wires land */}
        <g fill="var(--color-mist-400)" fillOpacity="0.5">
          <rect x="226" y="255" width="8" height="10" rx="2" />
          <rect x="315" y="216" width="10" height="8" rx="2" />
          <rect x="406" y="255" width="8" height="10" rx="2" />
          <rect x="315" y="296" width="10" height="8" rx="2" />
        </g>

        {/* ── Pulse layer: traveling current + blurred glow twin ── */}
        <g data-safety="pulses">
          <g
            filter="url(#safety-pulse-blur)"
            stroke="var(--color-gold-500)"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.55"
          >
            {WIRES.map((d, i) => (
              <path
                key={d}
                d={d}
                className="safety-pulse"
                strokeDasharray={PULSE_DASH}
                strokeDashoffset={PHASE[i]}
              />
            ))}
          </g>
          <g stroke="var(--color-gold-400)" strokeWidth="2.5" strokeLinecap="round">
            {WIRES.map((d, i) => (
              <path
                key={d}
                d={d}
                className="safety-pulse"
                strokeDasharray={PULSE_DASH}
                strokeDashoffset={PHASE[i]}
              />
            ))}
          </g>
        </g>

        {/* ── Blade mechanism — contacts + blade, pivots at (280,260) ── */}
        <circle cx="280" cy="260" r="4.5" fill="var(--color-mist-200)" />
        <circle cx="360" cy="260" r="4.5" fill="var(--color-mist-200)" />
        <line
          data-safety="blade"
          x1="280"
          y1="260"
          x2="356"
          y2="260"
          stroke="var(--color-gold-500)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* ── Product callout — this node is this device. Backlit silhouette:
            the transparent cutout floats in the scene's own darkness, lifted
            by a neutral studio halo instead of sitting on a pasted card. ── */}
        <g>
          <circle cx="412" cy="288" r="2.5" fill="var(--color-mist-200)" />
          <line
            x1="414"
            y1="290"
            x2="470"
            y2="330"
            stroke="var(--color-mist-400)"
            strokeOpacity="0.4"
            strokeWidth="1"
          />
          <ellipse cx="522" cy="349" rx="132" ry="68" fill="url(#safety-product-halo)" />
          <image
            href="/products/projoy-pefs-pl-detail.png"
            x="414"
            y="292"
            width="215"
            height="110"
            preserveAspectRatio="xMidYMid meet"
            style={{
              filter:
                "brightness(1.35) contrast(1.05) drop-shadow(0 0 4px rgba(224,230,226,0.3))",
            }}
          />
          <text
            x="527"
            y="411"
            textAnchor="middle"
            className="font-mono"
            fontSize="9.5"
            letterSpacing="0.14em"
            fill="var(--color-mist-400)"
            fillOpacity="0.8"
          >
            PEFS-PL80P
          </text>
        </g>
      </svg>
    </div>
  );
}
