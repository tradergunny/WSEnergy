"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * ThailandCoverageMap — the homepage "national footprint" beat.
 *
 * WS Energy is an enterprise/B2B distributor based in Samut Prakan whose
 * projects and installer network reach across the country. This band answers
 * WHA Group's world-map moment with an honest, engineering-drawn map of
 * Thailand: a blueprint silhouette (framer-motion pathLength draw-on) with the
 * REAL regional hubs plotted from Sanity data — HQ, project sites, and the
 * provinces where certified installers operate. No fabricated site density;
 * the story is reach, not a heatmap.
 *
 * Coordinates below are geographic (lat/lng) and projected into the drawing's
 * viewBox by `project()`, so a hub always lands on the correct point of the
 * silhouette regardless of how the outline is drawn.
 */

// Drawing canvas. Chosen so the Thailand silhouette sits comfortably with room
// for the southern peninsula. The lat/lng bounds frame mainland Thailand.
const VIEW_W = 440;
const VIEW_H = 620;
const PAD = 34;

// Geographic bounds of mainland Thailand (with a little headroom).
const LAT_TOP = 20.6; // Mae Sai, north
const LAT_BOT = 5.6; // Malaysian border, south
const LNG_LEFT = 97.3; // Myanmar frontier, west
const LNG_RIGHT = 105.7; // Laos border, east

// Equirectangular projection with cosine(latitude) correction so 1° of
// longitude and 1° of latitude map to the same on-screen distance at
// Thailand's mid-latitude. Without this the country stretches sideways and
// plotted cities drift off the coastline. A single uniform scale is fitted to
// whichever axis is the binding constraint, then the result is centered.
const MID_LAT = (LAT_TOP + LAT_BOT) / 2;
const LNG_SCALE = Math.cos((MID_LAT * Math.PI) / 180); // ° lng → ° lat-equivalent
const SPAN_LAT = LAT_TOP - LAT_BOT;
const SPAN_LNG = (LNG_RIGHT - LNG_LEFT) * LNG_SCALE;
const SCALE = Math.min(
  (VIEW_W - PAD * 2) / SPAN_LNG,
  (VIEW_H - PAD * 2) / SPAN_LAT,
);
const OFF_X = (VIEW_W - SPAN_LNG * SCALE) / 2;
const OFF_Y = (VIEW_H - SPAN_LAT * SCALE) / 2;

function project(lat: number, lng: number): { x: number; y: number } {
  const x = OFF_X + (lng - LNG_LEFT) * LNG_SCALE * SCALE;
  const y = OFF_Y + (LAT_TOP - lat) * SCALE;
  return { x, y };
}

/**
 * Thailand outline as REAL geographic coordinates [lng, lat], traced at low
 * resolution around the actual border, then projected through project() so the
 * silhouette and the city dots share one coordinate system (dots always land
 * on the right point). Ordered clockwise from the northern tip (Mae Sai),
 * east across the Isan plateau to Ubon, south down the Cambodian border and
 * Gulf coast, down the peninsula to the Malaysian border, and back up the
 * Andaman coast and the Myanmar frontier. Simplified — reads unmistakably as
 * Thailand without being survey-accurate.
 */
const OUTLINE: [number, number][] = [
  [100.12, 20.32], // Mae Sai (north tip)
  [100.55, 20.16], // Chiang Rai / Mekong
  [101.2, 19.55], // Nan border
  [101.15, 18.4], // toward Loei
  [101.85, 18.05], // Nong Khai bend
  [103.0, 18.24], // Nakhon Phanom (Mekong NE)
  [104.35, 17.4], // Mukdahan
  [104.82, 16.55], // Amnat
  [105.63, 15.35], // Ubon (eastern bulge tip)
  [105.2, 14.35], // Cambodian border NE corner
  [103.9, 14.35], // Buriram / Surin south edge
  [102.6, 13.95], // Sa Kaeo
  [102.35, 13.55], // Chanthaburi coast
  [101.65, 12.62], // Rayong / Trat coast
  [100.98, 12.6], // eastern Gulf
  [100.88, 13.5], // Chonburi / inner Gulf
  [100.58, 13.45], // Samut Prakan / Bangkok bight
  [100.0, 13.35], // Phetchaburi coast
  [99.9, 12.4], // Prachuap (neck narrows)
  [99.65, 11.4], // Chumphon
  [99.2, 10.0], // Surat Thani
  [99.95, 9.15], // Nakhon Si Thammarat (Gulf side bulge)
  [100.35, 7.9], // Songkhla
  [100.75, 6.55], // Pattani / Narathiwat (south tip)
  [100.1, 6.45], // Malaysian border west
  [99.65, 6.9], // Satun (Andaman side)
  [98.2, 7.6], // Trang / Phuket coast (Andaman bulges west here)
  [98.1, 8.6], // Phang Nga / Ranong coast
  [98.4, 9.9], // Andaman up
  [98.55, 11.35], // back toward isthmus (west)
  [98.9, 12.6], // Kanchanaburi corridor
  [98.3, 14.35], // Three Pagodas / Kanchanaburi (Myanmar)
  [97.95, 15.6], // Tak / Mae Sot
  [97.55, 16.9], // Mae Sariang
  [97.6, 18.35], // Mae Hong Son
  [98.1, 19.55], // Chiang Mai NW (west of Chiang Mai city 98.98)
  [98.9, 20.15], // Fang / Chiang Dao
  [99.6, 20.45], // toward Mae Sai
  [100.12, 20.32], // close
];

const THAILAND_PATH =
  OUTLINE.map(([lng, lat], i) => {
    const { x, y } = project(lat, lng);
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ") + " Z";

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
    labelDy: -9, // lift clear of the near-coincident HQ node just below
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
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
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
        cx={VIEW_W * 0.46}
        cy={VIEW_H * 0.42}
        rx={VIEW_W * 0.5}
        ry={VIEW_H * 0.42}
        fill="url(#wsCoverageGlow)"
      />

      {/* Silhouette fill — a whisper, so dots and lines dominate */}
      <path d={THAILAND_PATH} className="fill-mist-50/[0.03]" />

      {/* Drawn outline */}
      <motion.path
        d={THAILAND_PATH}
        fill="none"
        className="stroke-mist-400/40"
        strokeWidth={1.25}
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
            strokeWidth={0.75}
            strokeDasharray="2 4"
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
        const r = isHq ? 5 : 3.5;
        const label = locale === "th" ? h.labelTh : h.labelEn;
        const labelX = h.side === "left" ? p.x - 10 : p.x + 10;
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
                strokeWidth={1}
                initial={{ r, opacity: 0 }}
                whileInView={{ r: r + 11, opacity: [0, 0.5, 0] }}
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
                  r={r + 2.5}
                  className="fill-none stroke-gold-500"
                  strokeWidth={1.25}
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
                strokeWidth={h.kind === "installer" ? 1 : 0}
              />
            )}
            <text
              x={labelX}
              y={p.y + 3.5 + (h.labelDy ?? 0)}
              textAnchor={anchor}
              className={
                isHq
                  ? "fill-mist-50 text-[10.5px]"
                  : "fill-mist-300 text-[10px]"
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
