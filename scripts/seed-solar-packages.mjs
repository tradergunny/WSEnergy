#!/usr/bin/env node
/**
 * Seed script for the Solar Rooftop Estimator package tiers (ROADMAP feature 3).
 *
 * Ladder mirrors PEA's public Solar Calculator, which is phase-driven (no
 * customer-segment split). Single-phase tops out at 5 kW; three-phase spans
 * 5–20 kW. Every tier is PEA-CONFIRMED from the team's benchmark runs:
 *
 *   1-phase   3 kW = ฿118,500   ← PEA benchmark
 *   1-phase   5 kW = ฿139,000   ← PEA benchmark
 *   3-phase   5 kW = ฿163,900   ← PEA benchmark (฿40,000 / 60 m² roof-capped case)
 *   3-phase  10 kW = ฿214,400   ← PEA benchmark
 *   3-phase  15 kW = ฿316,500   ← PEA benchmark
 *   3-phase  20 kW = ฿388,200   ← PEA benchmark
 *
 * NOTE: sizing rounds a bill to the NEAREST tier, so the 3-phase 5 kW tier is a
 * normal bill-reachable option (small three-phase bills land on it: ฿6,000 →
 * 5 kW, ฿9,000 → 10) as well as the roof-capped fallback. See the engine +
 * ADR 0002 for the round-to-nearest sizing rule and the ~7.5 m²/kWp roof model.
 *
 * ⚠️ PRICES ARE PEA-BENCHMARK FIGURES — NOT official WS Energy pricing. The team
 * overrides real turn-key prices in Studio later. The UI shows "from ฿X" with an
 * "estimate, not a binding quote" disclaimer.
 *
 * Idempotent: deletes every existing solarPackage, then recreates the ladder
 * with predictable dashed _id values (the public CDN hides dotted ids).
 *
 * Run with: node scripts/seed-solar-packages.mjs
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "..", ".env.local") });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env vars. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

// ~590W mono panels → panels ≈ round(kW * 1000 / 590)
const panels = (kw) => Math.round((kw * 1000) / 590);
const kit = (kw, phase) => [
  `${panels(kw)}× 590W mono panels`,
  `${kw}kW ${phase === "single" ? "string" : "hybrid"} inverter`,
  "Mounting + Rapid Shutdown",
  "Wi-Fi monitoring",
];

// segment is "both" — the estimator is phase-driven and ignores segment now,
// but the Sanity field is still required, so every tier serves either customer.
const packages = [
  // ---- Single-phase (caps at 5 kW) ----
  {
    _id: "seed-package-1ph-3kw",
    sizeKw: 3,
    phase: "single",
    price: 118_500, // PEA benchmark
    orderRank: 10,
  },
  {
    _id: "seed-package-1ph-5kw",
    sizeKw: 5,
    phase: "single",
    price: 139_000, // PEA benchmark
    orderRank: 20,
  },
  // ---- Three-phase (5 kW is roof-only; bill-sizing floors at 10, caps at 20) ----
  {
    _id: "seed-package-3ph-5kw",
    sizeKw: 5,
    phase: "three",
    price: 163_900, // PEA benchmark (roof-constrained 3-phase 5 kW)
    orderRank: 25,
  },
  {
    _id: "seed-package-3ph-10kw",
    sizeKw: 10,
    phase: "three",
    price: 214_400, // PEA benchmark
    orderRank: 40,
  },
  {
    _id: "seed-package-3ph-15kw",
    sizeKw: 15,
    phase: "three",
    price: 316_500, // PEA benchmark
    orderRank: 50,
  },
  {
    _id: "seed-package-3ph-20kw",
    sizeKw: 20,
    phase: "three",
    price: 388_200, // PEA benchmark
    orderRank: 60,
  },
].map((p) => ({
  ...p,
  _type: "solarPackage",
  segment: "both",
  panelCount: panels(p.sizeKw),
  includedComponents: kit(p.sizeKw, p.phase),
  active: true,
}));

async function seed() {
  console.log(`\n→ Project: ${projectId} / Dataset: ${dataset}\n`);
  console.log("Removing existing solar packages...");
  await client.delete({ query: '*[_type == "solarPackage"]' });
  console.log(`Creating ${packages.length} solar packages (PEA ladder, benchmark prices)...`);
  const tx = client.transaction();
  for (const doc of packages) tx.createOrReplace(doc);
  await tx.commit();
  console.log("✓ Solar packages created\n");
  console.log("Done. Prices are PEA-benchmark/estimated — edit real prices in /studio.");
}

seed().catch((err) => {
  console.error("Seed failed:", err.message ?? err);
  process.exit(1);
});
