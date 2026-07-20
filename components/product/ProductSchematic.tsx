"use client";

/**
 * ProductSchematic — generative technical line drawing for the product
 * detail image well.
 *
 * ~95% of the catalog has no product photography, so the "placeholder" IS
 * the hero visual for most SKUs. Instead of a wireframe box, each category
 * gets an abstract blueprint-register drawing (stroke-only, no fills) whose
 * strokes draw on via Framer Motion pathLength when the section enters the
 * viewport. Up to three real spec values annotate the drawing with leader
 * lines, so the figure is generated from the product's own data.
 *
 * When a real photo exists the drawing dims to a backdrop (annotations off)
 * and the photo renders on top — see ProductDetailHeader.
 */

import { motion, useReducedMotion, type MotionProps } from "framer-motion";
import type { SchematicVariant } from "./schematic-variant";

export { schematicVariantForCategory } from "./schematic-variant";
export type { SchematicVariant } from "./schematic-variant";

export type SchematicAnnotation = { label: string; value: string };

type DrawFn = (i: number) => MotionProps;

/** Leader-line target rows in viewBox space (top → bottom). */
const ANNOT_Y = [84, 158, 232];

/** Per-variant anchor points the leader lines start from (top → bottom). */
const ANCHORS: Record<SchematicVariant, { x: number; y: number }[]> = {
  inverter: [
    { x: 205, y: 110 },
    { x: 205, y: 195 },
    { x: 149, y: 238 },
  ],
  battery: [
    { x: 200, y: 74 },
    { x: 200, y: 178 },
    { x: 213, y: 270 },
  ],
  switch: [
    { x: 145, y: 44 },
    { x: 208, y: 150 },
    { x: 154, y: 262 },
  ],
  optimizer: [
    { x: 212, y: 130 },
    { x: 212, y: 160 },
    { x: 218, y: 237 },
  ],
  charger: [
    { x: 183, y: 93 },
    { x: 198, y: 178 },
    { x: 230, y: 240 },
  ],
  generic: [
    { x: 218, y: 84 },
    { x: 228, y: 148 },
    { x: 218, y: 198 },
  ],
};

/* ─── Variant artwork ────────────────────────────────────────── */
/* Stroke-only shapes. Each element gets D(i) so strokes draw on in
   sequence. Coordinates live in the 440×340 viewBox, drawing at left. */

function InverterArt({ D }: { D: DrawFn }) {
  return (
    <>
      <motion.rect x={70} y={60} width={150} height={170} rx={10} {...D(0)} />
      <motion.rect x={85} y={75} width={120} height={88} rx={4} {...D(1)} />
      <motion.rect x={95} y={85} width={44} height={16} rx={2} {...D(2)} />
      <motion.circle cx={193} cy={91} r={3} className="text-gold-500" {...D(3)} />
      <motion.line x1={85} y1={180} x2={205} y2={180} {...D(4)} />
      <motion.line x1={85} y1={190} x2={205} y2={190} {...D(5)} />
      <motion.line x1={85} y1={200} x2={205} y2={200} {...D(6)} />
      <motion.line x1={85} y1={210} x2={205} y2={210} {...D(7)} />
      <motion.rect x={105} y={230} width={14} height={16} rx={2} {...D(8)} />
      <motion.rect x={135} y={230} width={14} height={16} rx={2} {...D(9)} />
      <motion.path d="M112 246 C112 262 108 268 100 276" {...D(10)} />
      <motion.path d="M142 246 C142 262 146 268 154 276" {...D(11)} />
      <Dims D={D} i={12} hx1={70} hx2={220} hy={300} vx={52} vy1={60} vy2={230} />
    </>
  );
}

function BatteryArt({ D }: { D: DrawFn }) {
  return (
    <>
      <motion.rect x={95} y={48} width={105} height={214} rx={8} {...D(0)} />
      <motion.line x1={95} y1={100} x2={200} y2={100} {...D(1)} />
      <motion.line x1={95} y1={152} x2={200} y2={152} {...D(2)} />
      <motion.line x1={95} y1={204} x2={200} y2={204} {...D(3)} />
      <motion.circle cx={186} cy={74} r={2.5} className="text-gold-500" {...D(4)} />
      <motion.circle cx={186} cy={126} r={2.5} {...D(5)} />
      <motion.circle cx={186} cy={178} r={2.5} {...D(6)} />
      <motion.circle cx={186} cy={230} r={2.5} {...D(7)} />
      <motion.rect x={82} y={262} width={131} height={16} rx={4} {...D(8)} />
      <Dims D={D} i={9} hx1={82} hx2={213} hy={302} vx={60} vy1={48} vy2={278} />
    </>
  );
}

function SwitchArt({ D }: { D: DrawFn }) {
  return (
    <>
      <motion.rect x={82} y={74} width={126} height={152} rx={12} {...D(0)} />
      <motion.circle cx={145} cy={150} r={30} {...D(1)} />
      <motion.line
        x1={145}
        y1={150}
        x2={167}
        y2={122}
        className="text-gold-500"
        {...D(2)}
      />
      <motion.circle cx={167} cy={122} r={4} className="text-gold-500" {...D(3)} />
      <motion.line x1={145} y1={74} x2={145} y2={44} {...D(4)} />
      <motion.rect x={136} y={34} width={18} height={10} rx={2} {...D(5)} />
      <motion.line x1={145} y1={226} x2={145} y2={258} {...D(6)} />
      <motion.rect x={136} y={258} width={18} height={10} rx={2} {...D(7)} />
      <Dims D={D} i={8} hx1={82} hx2={208} hy={300} vx={64} vy1={74} vy2={226} />
    </>
  );
}

function OptimizerArt({ D }: { D: DrawFn }) {
  return (
    <>
      <motion.rect x={78} y={118} width={134} height={76} rx={12} {...D(0)} />
      <motion.line x1={112} y1={130} x2={112} y2={182} {...D(1)} />
      <motion.line x1={145} y1={130} x2={145} y2={182} {...D(2)} />
      <motion.line x1={178} y1={130} x2={178} y2={182} {...D(3)} />
      <motion.path d="M105 194 C105 214 96 222 84 230" {...D(4)} />
      <motion.rect x={72} y={230} width={22} height={14} rx={3} {...D(5)} />
      <motion.path d="M185 194 C185 214 194 222 206 230" {...D(6)} />
      <motion.rect x={196} y={230} width={22} height={14} rx={3} {...D(7)} />
      <Dims D={D} i={8} hx1={78} hx2={212} hy={288} vx={58} vy1={118} vy2={194} />
    </>
  );
}

function ChargerArt({ D }: { D: DrawFn }) {
  return (
    <>
      <motion.rect x={92} y={56} width={106} height={174} rx={18} {...D(0)} />
      <motion.rect x={107} y={76} width={76} height={34} rx={6} {...D(1)} />
      <motion.circle cx={145} cy={178} r={20} {...D(2)} />
      <motion.circle cx={145} cy={178} r={11} className="text-gold-500" {...D(3)} />
      <motion.path
        d="M198 200 C230 210 236 236 222 258 C210 276 184 278 172 268"
        {...D(4)}
      />
      <motion.rect x={156} y={262} width={26} height={13} rx={6} {...D(5)} />
      <Dims D={D} i={6} hx1={92} hx2={198} hy={302} vx={68} vy1={56} vy2={230} />
    </>
  );
}

function GenericArt({ D }: { D: DrawFn }) {
  return (
    <>
      <motion.rect x={72} y={72} width={156} height={136} rx={12} {...D(0)} />
      <motion.rect x={86} y={86} width={128} height={108} rx={8} {...D(1)} />
      <motion.circle cx={150} cy={140} r={24} {...D(2)} />
      <motion.line x1={150} y1={108} x2={150} y2={172} {...D(3)} />
      <motion.line x1={118} y1={140} x2={182} y2={140} {...D(4)} />
      <motion.circle cx={82} cy={82} r={3} {...D(5)} />
      <motion.circle cx={218} cy={82} r={3} {...D(6)} />
      <motion.circle cx={82} cy={198} r={3} {...D(7)} />
      <motion.circle cx={218} cy={198} r={3} {...D(8)} />
      <Dims D={D} i={9} hx1={72} hx2={228} hy={286} vx={54} vy1={72} vy2={208} />
    </>
  );
}

/** Blueprint dimension marks: one horizontal run below, one vertical at left. */
function Dims({
  D,
  i,
  hx1,
  hx2,
  hy,
  vx,
  vy1,
  vy2,
}: {
  D: DrawFn;
  i: number;
  hx1: number;
  hx2: number;
  hy: number;
  vx: number;
  vy1: number;
  vy2: number;
}) {
  return (
    <g strokeWidth={0.75} className="text-mist-600">
      <motion.path
        d={`M ${hx1} ${hy - 5} L ${hx1} ${hy + 5} M ${hx1} ${hy} L ${hx2} ${hy} M ${hx2} ${hy - 5} L ${hx2} ${hy + 5}`}
        {...D(i)}
      />
      <motion.path
        d={`M ${vx - 5} ${vy1} L ${vx + 5} ${vy1} M ${vx} ${vy1} L ${vx} ${vy2} M ${vx - 5} ${vy2} L ${vx + 5} ${vy2}`}
        {...D(i + 1)}
      />
    </g>
  );
}

const ART: Record<SchematicVariant, ({ D }: { D: DrawFn }) => React.ReactNode> =
  {
    inverter: InverterArt,
    battery: BatteryArt,
    switch: SwitchArt,
    optimizer: OptimizerArt,
    charger: ChargerArt,
    generic: GenericArt,
  };

/* ─── Component ──────────────────────────────────────────────── */

export function ProductSchematic({
  variant,
  caption,
  annotations = [],
  dim = false,
}: {
  variant: SchematicVariant;
  caption?: string;
  /** Up to 3 real spec values, annotated onto the drawing. */
  annotations?: SchematicAnnotation[];
  /** Backdrop mode (photo on top): fainter strokes, no annotations. */
  dim?: boolean;
}) {
  const reduced = useReducedMotion();

  // Draw-on: strokes trace themselves in sequence on first viewport entry.
  const D: DrawFn = (i) =>
    reduced
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          whileInView: { pathLength: 1, opacity: 1 },
          viewport: { once: true },
          transition: {
            pathLength: {
              duration: 0.6,
              delay: 0.1 + i * 0.07,
              ease: "easeInOut",
            },
            opacity: { duration: 0.12, delay: 0.1 + i * 0.07 },
          },
        };

  // Fade-in for annotation groups after the strokes land.
  const F = (i: number): MotionProps =>
    reduced
      ? {}
      : {
          initial: { opacity: 0 },
          whileInView: { opacity: 1 },
          viewport: { once: true },
          transition: { duration: 0.4, delay: 1.0 + i * 0.15 },
        };

  const Art = ART[variant];
  const notes = dim ? [] : annotations.slice(0, 3);
  const anchors = ANCHORS[variant];

  return (
    <div className="relative z-10 flex w-full flex-col items-center gap-4">
      <svg
        viewBox={notes.length > 0 ? "0 0 440 340" : "24 16 252 312"}
        className={
          "h-auto w-full max-w-[440px] " + (dim ? "opacity-20" : "")
        }
        fill="none"
        aria-hidden
      >
        <g
          stroke="currentColor"
          strokeWidth={1.25}
          strokeLinecap="round"
          className="text-mist-200/85"
        >
          <Art D={D} />
        </g>

        {notes.map((n, i) => {
          const a = anchors[i];
          const ly = ANNOT_Y[i];
          return (
            <motion.g key={n.label + i} {...F(i)}>
              <circle cx={a.x} cy={a.y} r={2.5} className="fill-gold-500" />
              <path
                d={`M ${a.x} ${a.y} L 258 ${ly} L 268 ${ly}`}
                stroke="currentColor"
                strokeWidth={0.75}
                fill="none"
                className="text-mist-600"
              />
              <text
                x={274}
                y={ly - 3}
                fill="currentColor"
                fontSize={8}
                letterSpacing={1.2}
                className="font-mono text-mist-400"
              >
                {n.label.toUpperCase()}
              </text>
              <text
                x={274}
                y={ly + 12}
                fill="currentColor"
                fontSize={11.5}
                className="font-mono text-mist-50"
              >
                {n.value}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {caption && !dim ? (
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist-400">
          {caption}
        </div>
      ) : null}
    </div>
  );
}
