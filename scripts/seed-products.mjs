#!/usr/bin/env node
/**
 * One-off seed script for the WS Energy product catalog.
 *
 * Resolves categories by slug at runtime so it plays nicely with any
 * pre-existing UUID-id category docs (does NOT create duplicates).
 * Creates ~70 products linked to the canonical categories, plus 7
 * brand docs. Products are published directly (no draft prefix).
 *
 * Idempotent: products use deterministic _ids with `createOrReplace`,
 * so re-running overwrites rather than duplicating. Fields not present
 * in the source list (images, specs, datasheets, overviews) are left
 * blank for later editing in Studio.
 *
 * Run with: node scripts/seed-products.mjs
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

const ref = (id) => ({ _type: "reference", _ref: id, _key: id.slice(-12) });

// Category slugs are resolved to IDs at runtime via `categoryIdBySlug` so the
// script doesn't create duplicates when canonical (UUID-id) category docs
// already exist. The map is populated in seed() before products are written.
const categoryIdBySlug = new Map();

// ─── Brands ──────────────────────────────────────────────────────────────────
const brands = [
  { slug: "projoy", name: "Projoy", authorized: true },
  { slug: "huawei", name: "Huawei", authorized: true },
  { slug: "tsun", name: "TSUN", authorized: false },
  { slug: "solax", name: "SolaX", authorized: false },
  { slug: "kuvo", name: "KUVO", authorized: false },
  { slug: "scu", name: "SCU", authorized: false },
  { slug: "sine-xcel", name: "Sine Xcel", authorized: false },
].map((b) => ({
  _id: `brand-${b.slug}`,
  _type: "brand",
  name: b.name,
  slug: { _type: "slug", current: b.slug },
  authorizedDistributor: b.authorized,
}));

// ─── Products ────────────────────────────────────────────────────────────────
// Helper: build a product doc with sane defaults. `category` is the slug;
// it's looked up in `categoryIdBySlug` (populated in seed()).
const p = ({ slug, title, sku, brand, category, en, th, exclusive = false, safety = false, rank = 0 }) => {
  const catId = category ? categoryIdBySlug.get(category) : undefined;
  if (category && !catId) {
    throw new Error(`Unknown category slug "${category}" for product "${slug}". Available: ${[...categoryIdBySlug.keys()].join(", ")}`);
  }
  return {
    _id: `product-${slug}`,
    _type: "product",
    title,
    slug: { _type: "slug", current: slug },
    sku: sku ?? title,
    brand: brand ? ref(`brand-${brand}`) : undefined,
    category: catId ? ref(catId) : undefined,
    authorized: brand === "projoy" || brand === "huawei",
    exclusive,
    safetyCritical: safety,
    shortDescription_en: en,
    shortDescription_th: th,
    orderRank: rank,
  };
};

const buildProducts = () => [
  // ─── Rapid Shutdown (safety) ───
  p({ slug: "projoy-pefs-pl80p-11", title: "PEFS-PL80P-11", brand: "projoy", category: "rapid-shutdown", en: "Module-level rapid shutdown device", safety: true, rank: 10 }),
  // PEFS-PL80P-21 lives as a pre-existing UUID-id doc with a curated IEC 60947-3 description
  // surfaced on the homepage featured card. Do not re-seed it here.
  p({ slug: "projoy-control-box-dc-24v", title: "Control Box (DC 24V)", brand: "projoy", category: "rapid-shutdown", en: "Rapid shutdown control box, DC 24V", safety: true, rank: 30 }),
  p({ slug: "projoy-rapid-shutdown-connector", title: "Connector", sku: "PROJOY-RSD-CONN", brand: "projoy", category: "rapid-shutdown", en: "Rapid shutdown connector", safety: true, rank: 40 }),

  // ─── Firefighter Safety Switches (safety) ───
  p({ slug: "projoy-pefs-el-1-2-strings", title: "PEFS-EL Series (1–2 strings)", brand: "projoy", category: "firefighter-safety-switches", en: "Firefighter safety switch, 1–2 string configuration", safety: true, rank: 10 }),
  p({ slug: "projoy-pefs-el-3-5-strings", title: "PEFS-EL Series (3–5 strings)", brand: "projoy", category: "firefighter-safety-switches", en: "Firefighter safety switch, 3–5 string configuration", safety: true, rank: 20 }),
  p({ slug: "projoy-pefs-el-6-10-strings", title: "PEFS-EL Series (6–10 strings)", brand: "projoy", category: "firefighter-safety-switches", en: "Firefighter safety switch, 6–10 string configuration", safety: true, rank: 30 }),

  // ─── Optimizer (products) ───
  p({ slug: "huawei-optimizer", title: "Huawei Optimizer", sku: "HUAWEI-OPT", brand: "huawei", category: "optimizers", en: "Module-level DC optimizer", rank: 10 }),
  p({ slug: "projoy-optimizer", title: "Projoy Optimizer", sku: "PROJOY-OPT", brand: "projoy", category: "optimizers", en: "Module-level DC optimizer", rank: 20 }),

  // ─── Micro Inverter (products) ───
  p({ slug: "tsun-tsol-mx800", title: "TSOL-MX800", brand: "tsun", category: "micro-inverters", en: "TSUN microinverter, 800W", rank: 10 }),
  p({ slug: "tsun-tsol-mx3300d", title: "TSOL-MX3300D", brand: "tsun", category: "micro-inverters", en: "TSUN microinverter, 3300W (dual)", rank: 20 }),

  // ─── Inverter (products) — Huawei ───
  p({ slug: "huawei-sun2000-3ktl-l1", title: "SUN2000-3KTL-L1", brand: "huawei", category: "inverters", en: "On-grid 3kW 1-phase inverter with WiFi antenna", th: "On-grid 3kW 1 Phase รุ่น SUN2000-3KTL-L1 พร้อมอุปกรณ์เสริม Wifi Antenna", rank: 10 }),
  p({ slug: "huawei-sun2000-5ktl-l1", title: "SUN2000-5KTL-L1", brand: "huawei", category: "inverters", en: "On-grid 5kW 1-phase inverter with WiFi antenna", th: "On-grid 5kW 1 Phase รุ่น SUN2000-5KTL-L1 พร้อมอุปกรณ์เสริม Wifi Antenna", rank: 20 }),
  p({ slug: "huawei-sun2000-5ktl-l1-smart-meter", title: "SUN2000-5KTL-L1 + Smart Meter (1Φ)", sku: "SUN2000-5KTL-L1", brand: "huawei", category: "inverters", en: "On-grid 5kW 1-phase inverter with WiFi antenna and 1-phase anti-reverse smart meter", th: "On-grid 5kW 1 Phase รุ่น SUN2000-5KTL-L1 พร้อมอุปกรณ์เสริม Wifi Antenna พร้อมกันย้อน smart meter 1 Phase", rank: 30 }),
  p({ slug: "huawei-sun2000-5ktl-m1", title: "SUN2000-5KTL-M1", brand: "huawei", category: "inverters", en: "On-grid 5kW 3-phase inverter with Smart Dongle WLAN-FE", th: "On-grid 5kW 3 Phase รุ่น SUN2000-5KTL-M1 พร้อมอุปกรณ์เสริม Smart Dongle-WLAN-FE", rank: 40 }),
  p({ slug: "huawei-sun2000-5k-map0", title: "SUN2000-5K-MAP0", brand: "huawei", category: "inverters", en: "On-grid 5kW 3-phase inverter", th: "On-grid 5kW 3 Phase รุ่น SUN2000-5K-MAP0 พร้อมอุปกรณ์เสริม", rank: 50 }),
  p({ slug: "huawei-sun2000-10ktl-lc0", title: "SUN2000-10KTL-LC0", brand: "huawei", category: "inverters", en: "On-grid 10kW 1-phase inverter", th: "On-grid 10kW 1 Phase รุ่น SUN2000-10KTL-LC0", rank: 60 }),
  p({ slug: "huawei-sun2000-10k-map0", title: "SUN2000-10K-MAP0", brand: "huawei", category: "inverters", en: "On-grid 10kW 3-phase inverter", th: "On-grid 10kW 3 Phase รุ่น SUN2000-10K-MAP0", rank: 70 }),
  p({ slug: "huawei-sun2000-12ktl-m2", title: "SUN2000-12KTL-M2", brand: "huawei", category: "inverters", en: "On-grid 12kW 3-phase inverter", th: "On-grid 12kW 3 Phase รุ่น SUN2000-12KTL-M2", rank: 80 }),
  p({ slug: "huawei-sun2000-15ktl-m5", title: "SUN2000-15KTL-M5", brand: "huawei", category: "inverters", en: "On-grid 15kW 3-phase inverter", th: "On-grid 15kW 3 Phase รุ่น SUN2000-15KTL-M5", rank: 90 }),
  p({ slug: "huawei-sun2000-15ktl-m5-wifi", title: "SUN2000-15KTL-M5 + WiFi-WLAN-FE", sku: "SUN2000-15KTL-M5", brand: "huawei", category: "inverters", en: "On-grid 15kW 3-phase inverter with WiFi-WLAN-FE", th: "On-grid 15kW 3 Phase รุ่น SUN2000-15KTL-M5 พร้อม Wifi-WLAN-FE", rank: 100 }),
  p({ slug: "huawei-sun2000-15ktl-m5-smart-meter", title: "SUN2000-15KTL-M5 + Smart Meter (3Φ)", sku: "SUN2000-15KTL-M5", brand: "huawei", category: "inverters", en: "On-grid 15kW 3-phase inverter with 3-phase anti-reverse smart meter", th: "On-grid 15kW 3 Phase รุ่น SUN2000-15KTL-M5 พร้อมกันย้อน smart meter 3 Phase", rank: 110 }),
  p({ slug: "huawei-sun2000-15ktl-m5-wifi-dtsu666", title: "SUN2000-15KTL-M5 + WiFi + DTSU666-H (250A)", sku: "SUN2000-15KTL-M5", brand: "huawei", category: "inverters", en: "On-grid 15kW 3-phase inverter with WiFi-WLAN-FE and DTSU666-H (250A) smart meter", th: "On-grid 15kW 3 Phase รุ่น SUN2000-15KTL-M5 พร้อม Wifi-WLAN-FE + DTSU666-H(250A)", rank: 120 }),
  p({ slug: "huawei-sun2000-15ktl-mb0", title: "SUN2000-15KTL-MB0", brand: "huawei", category: "inverters", en: "On-grid 15kW 3-phase inverter", th: "On-grid 15kW 3 Phase รุ่น SUN2000-15KTL-MB0", rank: 130 }),
  p({ slug: "huawei-sun2000-20kmb0", title: "SUN2000-20KMB0", brand: "huawei", category: "inverters", en: "On-grid 20kW 3-phase inverter", th: "On-grid 20kW 3 Phase รุ่น SUN2000-20KMB0", rank: 140 }),
  p({ slug: "huawei-sun2000-30ktl-m3", title: "SUN2000-30KTL-M3", brand: "huawei", category: "inverters", en: "On-grid 30kW 3-phase inverter", th: "On-grid 30kW 3 Phase รุ่น SUN2000-30KTL-M3", rank: 150 }),
  p({ slug: "huawei-sun2000-40ktl-m3", title: "SUN2000-40KTL-M3", brand: "huawei", category: "inverters", en: "On-grid 40kW 3-phase inverter", th: "On-grid 40kW 3 Phase รุ่น SUN2000-40KTL-M3", rank: 160 }),
  p({ slug: "huawei-sun2000-50ktl-m3", title: "SUN2000-50KTL-M3", brand: "huawei", category: "inverters", en: "On-grid 50kW 3-phase inverter", th: "On-grid 50kW 3 Phase รุ่น SUN2000-50KTL-M3", rank: 170 }),
  p({ slug: "huawei-sun2000-100ktl-m2", title: "SUN2000-100KTL-M2", brand: "huawei", category: "inverters", en: "On-grid 100kW 3-phase inverter", th: "On-grid 100kW 3 Phase รุ่น SUN2000-100KTL-M2", rank: 180 }),
  p({ slug: "huawei-sun5000-150ktl-mg0", title: "SUN5000-150KTL-MG0", brand: "huawei", category: "inverters", en: "On-grid 150kW 3-phase inverter", th: "On-grid 150kW 3 Phase รุ่น SUN5000-150KTL-MG0", rank: 190 }),
  p({ slug: "huawei-sun2000-150ktl-mg0", title: "SUN2000-150KTL-MG0", brand: "huawei", category: "inverters", en: "On-grid 150kW 3-phase inverter", rank: 200 }),
  p({ slug: "huawei-smart-logger-3000a", title: "Smart Logger 3000A", brand: "huawei", category: "inverters", en: "Site-level data logger and monitoring gateway", rank: 210 }),
  p({ slug: "huawei-inv-accessory-30-50ktl-m3", title: "Inverter Accessory (30/36/40/50KTL-M3)", sku: "HUAWEI-ACC-M3", brand: "huawei", category: "inverters", en: "Inverter accessory pack for SUN2000-30/36/40/50KTL-M3", rank: 220 }),
  p({ slug: "huawei-inv-accessory-3-5ktl-l1", title: "Inverter Accessory (3/5KTL-L1)", sku: "HUAWEI-ACC-L1", brand: "huawei", category: "inverters", en: "Inverter accessory pack for SUN2000-3/5KTL-L1", rank: 230 }),
  p({ slug: "huawei-inv-accessory-5-10ktl-m0-m1", title: "Inverter Accessory (5/10KTL-M0/M1)", sku: "HUAWEI-ACC-M0M1", brand: "huawei", category: "inverters", en: "Inverter accessory pack for SUN2000-5/10KTL-M0 and M1", rank: 240 }),
  p({ slug: "huawei-inv-accessory-12-20ktl-m0-m2", title: "Inverter Accessory (12/20KTL-M0/M2)", sku: "HUAWEI-ACC-M0M2", brand: "huawei", category: "inverters", en: "Inverter accessory pack for SUN2000-12/20KTL-M0 and M2", rank: 250 }),

  // ─── Inverter — SolaX ───
  p({ slug: "solax-x3-forth-plus", title: "X3-Forth Plus", brand: "solax", category: "inverters", en: "SolaX X3-Forth Plus three-phase inverter", rank: 260 }),
  p({ slug: "solax-x3-mega-g2", title: "X3-Mega G2", brand: "solax", category: "inverters", en: "SolaX X3-Mega G2 utility-scale inverter", rank: 270 }),
  p({ slug: "solax-x3-forth", title: "X3-Forth", brand: "solax", category: "inverters", en: "SolaX X3-Forth three-phase inverter", rank: 280 }),
  p({ slug: "solax-x3-pro-g2", title: "X3-Pro G2", brand: "solax", category: "inverters", en: "SolaX X3-Pro G2 three-phase inverter", rank: 290 }),

  // ─── Inverter — KUVO ───
  p({ slug: "kuvo-single-phase-hybrid-4-5-9kw", title: "Single Phase Hybrid Inverter 4.5–9kW", sku: "KUVO-HYBRID-1P", brand: "kuvo", category: "inverters", en: "KUVO single-phase hybrid inverter, 4.5–9kW", rank: 300 }),
  p({ slug: "kuvo-inv-1200-12", title: "INV 1200-12", brand: "kuvo", category: "inverters", en: "KUVO single-phase on/off-grid inverter, 1200W / 12V", rank: 310 }),
  p({ slug: "kuvo-inv-3600-24", title: "INV 3600-24", brand: "kuvo", category: "inverters", en: "KUVO single-phase on/off-grid inverter, 3600W / 24V", rank: 320 }),
  p({ slug: "kuvo-inv-5000-48", title: "INV 5000-48", brand: "kuvo", category: "inverters", en: "KUVO single-phase on/off-grid inverter, 5000W / 48V", rank: 330 }),
  p({ slug: "kuvo-inv-5500-48", title: "INV 5500-48", brand: "kuvo", category: "inverters", en: "KUVO single-phase on/off-grid inverter, 5500W / 48V", rank: 340 }),
  p({ slug: "kuvo-inv-6500-48", title: "INV 6500-48", brand: "kuvo", category: "inverters", en: "KUVO single-phase on/off-grid inverter, 6500W / 48V", rank: 350 }),
  p({ slug: "kuvo-inv-8200-48", title: "INV 8200-48", brand: "kuvo", category: "inverters", en: "KUVO single-phase on/off-grid inverter, 8200W / 48V", rank: 360 }),
  p({ slug: "kuvo-inv-10200-48", title: "INV 10200-48", brand: "kuvo", category: "inverters", en: "KUVO single-phase on/off-grid inverter, 10200W / 48V", rank: 370 }),

  // ─── EV Charger (products) ───
  p({ slug: "scu-ev-charger", title: "SCU EV Charger", sku: "SCU-EV", brand: "scu", category: "ev-chargers", en: "SCU electric vehicle charger", rank: 10 }),
  p({ slug: "solax-ev-charger", title: "SolaX EV Charger", sku: "SOLAX-EV", brand: "solax", category: "ev-chargers", en: "SolaX electric vehicle charger", rank: 20 }),

  // ─── Accessories (products) ───
  p({ slug: "sine-xcel-sec80", title: "SEC80", brand: "sine-xcel", category: "accessories", en: "Sine Xcel SEC80", rank: 10 }),
  p({ slug: "sine-xcel-sec240", title: "SEC240", brand: "sine-xcel", category: "accessories", en: "Sine Xcel SEC240", rank: 20 }),
  p({ slug: "connector-mc4", title: "Connector", sku: "CONN-GENERIC", category: "accessories", en: "PV string connector", rank: 30 }),
  p({ slug: "huawei-dtsu666", title: "DTSU666", brand: "huawei", category: "accessories", en: "Huawei DTSU666 three-phase smart meter", rank: 40 }),

  // ─── Battery Storage (products) — Huawei ───
  p({ slug: "huawei-smartguard-63a-s0", title: "SmartGuard-63A-S0", brand: "huawei", category: "battery-storage", en: "Huawei SmartGuard 63A backup gateway", rank: 10 }),
  p({ slug: "huawei-luna2000-7-s1", title: "LUNA2000-7-S1", brand: "huawei", category: "battery-storage", en: "Huawei LUNA2000 7kWh battery module", rank: 20 }),
  p({ slug: "huawei-luna2000-14-s1", title: "LUNA2000-14-S1", brand: "huawei", category: "battery-storage", en: "Huawei LUNA2000 14kWh battery module", rank: 30 }),
  p({ slug: "huawei-luna2000-21-s1", title: "LUNA2000-21-S1", brand: "huawei", category: "battery-storage", en: "Huawei LUNA2000 21kWh battery module", rank: 40 }),
  p({ slug: "huawei-luna2000-7-e1", title: "LUNA2000-7-E1", brand: "huawei", category: "battery-storage", en: "Huawei LUNA2000 7kWh expansion module", rank: 50 }),
  p({ slug: "huawei-luna2000-10kw-c1", title: "LUNA2000-10KW-C1", brand: "huawei", category: "battery-storage", en: "Huawei LUNA2000 10kW commercial battery", rank: 60 }),

  // ─── Battery Storage — SolaX ───
  p({ slug: "solax-battery-storage", title: "SolaX Battery Storage", sku: "SOLAX-BAT", brand: "solax", category: "battery-storage", en: "SolaX battery storage system", rank: 70 }),

  // ─── Battery Storage — KUVO ───
  p({ slug: "kuvo-portable-ess-300-500w", title: "Portable ESS 300W / 500W", sku: "KUVO-PORT-300-500", brand: "kuvo", category: "battery-storage", en: "Portable all-in-one ESS, 300W / 500W", rank: 80 }),
  p({ slug: "kuvo-portable-ess-1000-2009wh", title: "Portable ESS 1000W / 2009Wh", sku: "KUVO-PORT-1000", brand: "kuvo", category: "battery-storage", en: "Portable all-in-one ESS, 1000W / 2009Wh", rank: 90 }),
  p({ slug: "kuvo-ess-3-6kw-8kwh", title: "All-in-One ESS 3.6kW + 8kWh", sku: "KUVO-ESS-3.6-8", brand: "kuvo", category: "battery-storage", en: "All-in-one inverter and battery system, 3.6kW + 8kWh", rank: 100 }),
  p({ slug: "kuvo-ess-6kw-16kwh", title: "All-in-One ESS 6kW + 16kWh", sku: "KUVO-ESS-6-16", brand: "kuvo", category: "battery-storage", en: "All-in-one inverter and battery system, 6kW + 16kWh", rank: 110 }),
  p({ slug: "kuvo-ess-6kw-15kwh", title: "All-in-One ESS 6kW + 15kWh", sku: "KUVO-ESS-6-15", brand: "kuvo", category: "battery-storage", en: "All-in-one energy storage system, 6kW inverter + 15kWh lithium battery", rank: 120 }),
  p({ slug: "kuvo-ess-12kw-30kwh", title: "All-in-One ESS 12kW + 30kWh", sku: "KUVO-ESS-12-30", brand: "kuvo", category: "battery-storage", en: "All-in-one energy storage system, KUVO 12kW hybrid inverter + 30kWh lithium battery", rank: 130 }),
  p({ slug: "kuvo-ess-stackable-10-30kw", title: "Stackable ESS 10–30kW + LiFePO₄", sku: "KUVO-ESS-STACK-10-30", brand: "kuvo", category: "battery-storage", en: "Stackable all-in-one ESS, 10–30kW hybrid inverter + LiFePO₄ battery (10kW–30kWh / 12kW–60kWh)", rank: 140 }),
  p({ slug: "kuvo-ess-3ph-15kw-64kwh", title: "3-Phase LV ESS 15kW + 64kWh", sku: "KUVO-ESS-3P-15-64", brand: "kuvo", category: "battery-storage", en: "3-phase low-voltage all-in-one ESS, 15kW hybrid inverter + 64kWh LiFePO₄ battery", rank: 150 }),
  p({ slug: "kuvo-ess-ci-hv-30kw-66kwh", title: "C&I High-Voltage ESS 30kW + 66kWh", sku: "KUVO-ESS-HV-30-66", brand: "kuvo", category: "battery-storage", en: "Industrial and commercial high-voltage ESS, 30kW hybrid inverter + 66kWh LiFePO₄ battery", rank: 160 }),
  p({ slug: "kuvo-ess-stackable-50kw-100kwh", title: "Stackable ESS 50kW + 100kWh", sku: "KUVO-ESS-STACK-50-100", brand: "kuvo", category: "battery-storage", en: "Stackable all-in-one ESS, KUVO ESS 50kW hybrid inverter + 100kWh LiFePO₄ battery", rank: 170 }),
];

// Required categories under the canonical `products` top-level. Sanity's public
// CDN filters out any document _id containing a dot, so if a slug doesn't yet
// have a canonical UUID-id doc, we create one with a dash-id form (and create
// it with the document-action publish flow rather than a raw mutation).
const requiredProductSubCategories = {
  optimizers: { title_en: "Optimizers", title_th: "ออปติไมเซอร์", rank: 10 },
  "micro-inverters": { title_en: "Micro Inverters", title_th: "ไมโครอินเวอร์เตอร์", rank: 20 },
  inverters: { title_en: "Inverters", title_th: "อินเวอร์เตอร์", rank: 30 },
  "ev-chargers": { title_en: "EV Chargers", title_th: "เครื่องชาร์จรถยนต์ไฟฟ้า", rank: 40 },
  accessories: { title_en: "Accessories", title_th: "อุปกรณ์เสริม", rank: 50 },
  "battery-storage": { title_en: "Battery Storage", title_th: "ระบบกักเก็บพลังงาน", rank: 60 },
};

const requiredSafetySubCategories = {
  "rapid-shutdown": { title_en: "Rapid Shutdown", title_th: "ระบบตัดไฟฉุกเฉิน", rank: 10 },
  "firefighter-safety-switches": { title_en: "Firefighter Safety Switches", title_th: "สวิตช์ความปลอดภัยสำหรับนักผจญเพลิง", rank: 20 },
};

async function wipeStaleDottedDocs() {
  console.log("→ Wiping any pre-existing dotted-ID docs (invisible to public CDN)...");
  // Order matters — products first (so brand/category refs dissolve), then brands, then categories.
  const queries = [
    { label: "products", q: `*[_type=='product' && _id match 'product.*' && !(_id match 'product-*')]._id` },
    { label: "brands", q: `*[_type=='brand' && _id match 'brand.*' && !(_id match 'brand-*')]._id` },
    { label: "categories", q: `*[_type=='category' && _id match 'category.*' && !(_id match 'category-*')]._id` },
  ];
  for (const { label, q } of queries) {
    const ids = await client.fetch(q);
    if (!ids.length) {
      console.log(`  · no stale ${label}`);
      continue;
    }
    for (const id of ids) {
      try { await client.delete(id); }
      catch (err) { console.log(`    · ${id}: ${err.message}`); }
    }
    console.log(`  ✓ Wiped ${ids.length} stale ${label}`);
  }
  console.log();
}

async function ensureSubCategories() {
  console.log("→ Ensuring all required sub-categories exist (creating any missing)...");
  const cats = await client.fetch(`*[_type=='category']{_id,'slug':slug.current,'parentSlug':parent->slug.current}`);
  for (const c of cats) if (c.slug) categoryIdBySlug.set(c.slug, c._id);
  // Need the canonical top-level safety + products IDs for new sub-category parents.
  const safetyId = categoryIdBySlug.get("safety");
  const productsId = categoryIdBySlug.get("products");
  if (!safetyId || !productsId) {
    throw new Error("Canonical top-level 'safety' and 'products' categories must already exist in Sanity.");
  }
  const ensure = async (parentId, slug, meta) => {
    if (categoryIdBySlug.has(slug)) return;
    const id = `category-${slug}`;
    const doc = {
      _id: id,
      _type: "category",
      title_en: meta.title_en,
      title_th: meta.title_th,
      slug: { _type: "slug", current: slug },
      parent: ref(parentId),
      orderRank: meta.rank,
    };
    await client.createOrReplace(doc);
    categoryIdBySlug.set(slug, id);
    console.log(`  + Created ${id} (slug=${slug})`);
  };
  for (const [slug, meta] of Object.entries(requiredProductSubCategories)) {
    await ensure(productsId, slug, meta);
  }
  for (const [slug, meta] of Object.entries(requiredSafetySubCategories)) {
    await ensure(safetyId, slug, meta);
  }
  console.log(`  ✓ ${categoryIdBySlug.size} categories resolved\n`);
}

async function seed() {
  console.log(`\n→ Project: ${projectId} / Dataset: ${dataset}\n`);

  await wipeStaleDottedDocs();
  await ensureSubCategories();

  console.log(`Creating ${brands.length} brands...`);
  const tx3 = client.transaction();
  for (const doc of brands) tx3.createOrReplace(doc);
  await tx3.commit();
  console.log("✓ Brands created\n");

  const products = buildProducts();
  console.log(`Creating ${products.length} products...`);
  // Chunk products into batches of 25 to stay well under transaction limits.
  const chunkSize = 25;
  for (let i = 0; i < products.length; i += chunkSize) {
    const chunk = products.slice(i, i + chunkSize);
    const tx = client.transaction();
    for (const doc of chunk) tx.createOrReplace(doc);
    await tx.commit();
    console.log(`  ✓ Batch ${i / chunkSize + 1} (${chunk.length} products)`);
  }
  console.log("✓ Products created\n");

  console.log("Done. Open /studio to verify.");
}

seed().catch((err) => {
  console.error("Seed failed:", err.message ?? err);
  process.exit(1);
});
