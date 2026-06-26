#!/usr/bin/env node
/**
 * Seed script for the Solar Rooftop Estimator package tiers (ROADMAP feature 3).
 * Creates a starter ladder of solarPackage docs spanning residential + business.
 *
 * PRICES ARE PLACEHOLDERS — indicative ballparks anchored on PEA's published
 * 5 kW figure (163,900 THB). The business edits real prices in Studio; nothing
 * here is a quote.
 *
 * Idempotent: createOrReplace with predictable dashed _id values (dashed, not
 * dotted — the public CDN hides dotted ids), so re-running overwrites in place.
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

const packages = [
  // ---- Residential ----
  {
    _id: "seed-package-res-3kw-1ph",
    sizeKw: 3,
    phase: "single",
    segment: "residential",
    price: 117_000,
    orderRank: 10,
  },
  {
    _id: "seed-package-res-5kw-1ph",
    sizeKw: 5,
    phase: "single",
    segment: "residential",
    price: 163_900, // PEA reference anchor
    orderRank: 20,
  },
  {
    _id: "seed-package-res-5kw-3ph",
    sizeKw: 5,
    phase: "three",
    segment: "residential",
    price: 169_000,
    orderRank: 30,
  },
  {
    _id: "seed-package-res-10kw-3ph",
    sizeKw: 10,
    phase: "three",
    segment: "residential",
    price: 305_000,
    orderRank: 40,
  },
  // ---- Business ----
  {
    _id: "seed-package-biz-10kw-3ph",
    sizeKw: 10,
    phase: "three",
    segment: "business",
    price: 295_000,
    orderRank: 50,
  },
  {
    _id: "seed-package-biz-20kw-3ph",
    sizeKw: 20,
    phase: "three",
    segment: "business",
    price: 560_000,
    orderRank: 60,
  },
  {
    _id: "seed-package-biz-30kw-3ph",
    sizeKw: 30,
    phase: "three",
    segment: "business",
    price: 810_000,
    orderRank: 70,
  },
  {
    _id: "seed-package-biz-50kw-3ph",
    sizeKw: 50,
    phase: "three",
    segment: "business",
    price: 1_300_000,
    orderRank: 80,
  },
].map((p) => ({
  ...p,
  _type: "solarPackage",
  panelCount: panels(p.sizeKw),
  includedComponents: kit(p.sizeKw, p.phase),
  active: true,
}));

async function seed() {
  console.log(`\n→ Project: ${projectId} / Dataset: ${dataset}\n`);
  console.log(`Creating ${packages.length} solar packages (placeholder prices)...`);
  const tx = client.transaction();
  for (const doc of packages) tx.createOrReplace(doc);
  await tx.commit();
  console.log("✓ Solar packages created\n");
  console.log("Done. Edit real prices in /studio. These are indicative only.");
}

seed().catch((err) => {
  console.error("Seed failed:", err.message ?? err);
  process.exit(1);
});
