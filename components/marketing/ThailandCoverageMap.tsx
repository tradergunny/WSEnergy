"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  GEO_BOUNDS,
  OUTLINE_BOX,
  THAILAND_OUTLINE_PATH,
} from "./thailand-outline";

/**
 * ThailandCoverageMap — the homepage "national footprint" beat.
 *
 * WS Energy is an enterprise/B2B distributor based in Samut Prakan whose
 * projects and installer network reach across the country. This band answers
 * WHA Group's world-map moment with an honest, engineering-drawn map of
 * Thailand: a real high-definition border (framer-motion pathLength draw-on;
 * see thailand-outline.ts for the geometry + attribution) with the REAL
 * regional hubs plotted from Sanity data — HQ, project sites, and the
 * provinces where certified installers operate. No fabricated site density;
 * the story is reach, not a heatmap.
 *
 * Hubs are geographic (lat/lng) and projected into the outline's own drawing
 * space by `project()`, calibrated against the path's bounding box and the
 * geographic extremes it spans — so a dot always lands on the correct point
 * of the border.
 */

// The outline's drawing space, framed with side room for hub labels.
// (Path bbox is x 252.7–747.3, y 45.5–954.5 in the source 1000×1000 canvas.)
const VIEW = { x: 175, y: 15, w: 650, h: 970 };

// Linear calibration bbox ↔ geographic extremes. The source drawing is a
// cos-corrected equirectangular projection (bbox aspect matches to 0.04%),
// so lat and lng both map linearly onto the drawing axes.
function project(lat: number, lng: number): { x: number; y: number } {
  const { latN, latS, lngW, lngE } = GEO_BOUNDS;
  const x =
    OUTLINE_BOX.x1 +
    ((lng - lngW) / (lngE - lngW)) * (OUTLINE_BOX.x2 - OUTLINE_BOX.x1);
  const y =
    OUTLINE_BOX.y1 +
    ((latN - lat) / (latN - latS)) * (OUTLINE_BOX.y2 - OUTLINE_BOX.y1);
  return { x, y };
}

type HubKind = "hq" | "project" | "installer";

type Hub = {
  id: string;
  labelEn: string;
  labelTh: string;
  lat: number;
  lng: number;
  kind: HubKind;
  // Label offset so text clears the silhouette / neighbours.
  side: "left" | "right";
  // Vertical nudge (px) for the label, to separate near-coincident hubs.
  labelDy?: number;
};

// Real geography, sourced from Sanity (installer provinces, project sites, HQ).
// Only places WS Energy genuinely reaches are plotted.
const HUBS: Hub[] = [
  {
    id: "chiang-mai",
    labelEn: "Chiang Mai",
    labelTh: "เชียงใหม่",
    lat: 18.79,
    lng: 98.98,
    kind: "installer",
    side: "left",
  },
  {
    id: "rayong",
    labelEn: "Rayong",
    labelTh: "ระยอง",
    lat: 12.68,
    lng: 101.28,
    kind: "installer",
    side: "right",
  },
  {
    id: "bangkok",
    labelEn: "Bangkok",
    labelTh: "กรุงเทพฯ",
    lat: 13.76,
    lng: 100.5,
    kind: "project",
    side: "left",
    labelDy: -13, // lift clear of the near-coincident HQ node just below
  },
  {
    id: "samut-prakan",
    labelEn: "Samut Prakan — HQ",
    labelTh: "สมุทรปราการ — สำนักงานใหญ่",
    lat: 13.55,
    lng: 100.63,
    kind: "hq",
    side: "right",
  },
  {
    id: "phuket",
    labelEn: "Phuket",
    labelTh: "ภูเก็ต",
    lat: 7.88,
    lng: 98.39,
    kind: "installer",
    side: "left",
  },
];

const DRAW = {
  duration: 2.2,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function ThailandCoverageMap({ locale }: { locale: string }) {
  const reduced = useReducedMotion();

  // HQ anchors the network — draw a hairline connector from every other hub
  // back to it, so the drawing reads as one system radiating from Samut Prakan.
  const hqHub = HUBS.find((h) => h.kind === "hq")!;
  const hq = project(hqHub.lat, hqHub.lng);

  // whileInView (like ScrollReveal) is the ONLY reveal mechanism that fires
  // reliably for real users; a manual useInView + animate prop can leave the
  // group stuck at its initial opacity when the trigger is missed. Nodes and
  // labels therefore rest at opacity 1 and merely fade UP on entry — an empty
  // silhouette is never a valid steady state.
  const viewport = { once: true, amount: 0.35 as const };

  return (
    <svg
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
      className="h-auto w-full max-w-[440px]"
      role="img"
      aria-label={
        locale === "th"
          ? "แผนที่ประเทศไทยแสดงฐานปฏิบัติการที่สมุทรปราการและเครือข่ายทั่วประเทศ"
          : "Map of Thailand showing WS Energy's Samut Prakan base and its nationwide network"
      }
    >
      <defs>
        <radialGradient id="wsCoverageGlow" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="var(--color-gold-500)" stopOpacity="0.10" />
          <stop offset="100%" stopColor="var(--color-gold-500)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient warmth behind the landmass */}
      <ellipse
        cx={500}
        cy={470}
        rx={330}
        ry={480}
        fill="url(#wsCoverageGlow)"
      />

      {/* Silhouette fill — a whisper, so dots and lines dominate */}
      <path d={THAILAND_OUTLINE_PATH} className="fill-mist-50/[0.03]" />

      {/* Drawn outline */}
      <motion.path
        d={THAILAND_OUTLINE_PATH}
        fill="none"
        className="stroke-mist-400/40"
        strokeWidth={1.85}
        strokeLinejoin="round"
        initial={reduced ? false : { pathLength: 0 }}
        whileInView={reduced ? undefined : { pathLength: 1 }}
        viewport={viewport}
        transition={DRAW}
      />

      {/* Connectors from each hub back to HQ */}
      {HUBS.filter((h) => h.kind !== "hq").map((h, i) => {
        const p = project(h.lat, h.lng);
        return (
          <motion.line
            key={`link-${h.id}`}
            x1={hq.x}
            y1={hq.y}
            x2={p.x}
            y2={p.y}
            className="stroke-gold-500/25"
            strokeWidth={1.1}
            strokeDasharray="3 6"
            initial={reduced ? false : { pathLength: 0, opacity: 0 }}
            whileInView={reduced ? undefined : { pathLength: 1, opacity: 1 }}
            viewport={viewport}
            transition={{
              duration: 0.9,
              delay: 1.4 + i * 0.12,
              ease: "easeOut",
            }}
          />
        );
      })}

      {/* Hubs — rest visible; fade UP on entry so a missed trigger still shows them */}
      {HUBS.map((h, i) => {
        const p = project(h.lat, h.lng);
        const isHq = h.kind === "hq";
        const r = isHq ? 7.4 : 5.2;
        const label = locale === "th" ? h.labelTh : h.labelEn;
        const labelX = h.side === "left" ? p.x - 15 : p.x + 15;
        const anchor = h.side === "left" ? "end" : "start";
        const delay = 1.5 + i * 0.14;
        return (
          <motion.g
            key={h.id}
            initial={reduced ? false : { opacity: 0 }}
            whileInView={reduced ? undefined : { opacity: 1 }}
            viewport={viewport}
            transition={{ duration: 0.4, delay }}
          >
            {/* Pulse ring — a gentle repeating ping on the live page. */}
            {!reduced && (
              <motion.circle
                cx={p.x}
                cy={p.y}
                className="fill-none stroke-gold-500/50"
                strokeWidth={1.5}
                initial={{ r, opacity: 0 }}
                whileInView={{ r: r + 16, opacity: [0, 0.5, 0] }}
                viewport={viewport}
                transition={{
                  duration: 2.4,
                  delay: delay + 0.2,
                  repeat: Infinity,
                  repeatDelay: isHq ? 0.6 : 1.4,
                  ease: "easeOut",
                }}
              />
            )}
            {isHq ? (
              <>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={r + 3.7}
                  className="fill-none stroke-gold-500"
                  strokeWidth={1.85}
                />
                <circle cx={p.x} cy={p.y} r={r} className="fill-gold-500" />
              </>
            ) : (
              <circle
                cx={p.x}
                cy={p.y}
                r={r}
                className={
                  h.kind === "project"
                    ? "fill-gold-500/90"
                    : "fill-mist-50 stroke-gold-500/60"
                }
                strokeWidth={h.kind === "installer" ? 1.5 : 0}
              />
            )}
            <text
              x={labelX}
              y={p.y + 5 + (h.labelDy ?? 0)}
              textAnchor={anchor}
              className={
                isHq
                  ? "fill-mist-50 text-[15.5px]"
                  : "fill-mist-300 text-[15px]"
              }
              style={{
                fontFamily: "var(--font-mono, monospace)",
                letterSpacing: "0.02em",
              }}
            >
              {label}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}
