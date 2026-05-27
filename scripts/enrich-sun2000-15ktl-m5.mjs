#!/usr/bin/env node
/**
 * One-off enrichment script: fully fleshes out the Huawei SUN2000-15KTL-M5
 * as a worked-example product so the team has a visual template before
 * enriching the other ~70 products in Studio.
 *
 * Patches:
 *   - specs[]            real public Huawei spec sheet values
 *   - compliance[]       certifications
 *   - overview_en        ~3 paragraphs Portable Text
 *   - overview_th        Thai mirror
 *   - pairsWellWith[]    smart meter + rapid shutdown + LUNA2000 battery
 *   - exclusive          (left untouched — this isn't the Projoy exclusive)
 *
 * Gallery + datasheet reference are deliberately left blank — those need
 * binary uploads, which you do in Studio.
 *
 * Idempotent: uses `set` semantics, so re-running just re-writes the same
 * fields. Run with: node scripts/enrich-sun2000-15ktl-m5.mjs
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "..", ".env.local") });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const PRODUCT_ID = "product-huawei-sun2000-15ktl-m5";

// ─── Specs ──────────────────────────────────────────────────────────────────
// Real-world public spec-sheet values for SUN2000-15KTL-M5.
const specs = [
  { label_en: "Max DC input power",      label_th: "กำลังไฟฟ้าขาเข้าสูงสุด",   value: "22,500 W" },
  { label_en: "Max DC input voltage",    label_th: "แรงดันไฟฟ้าขาเข้าสูงสุด", value: "1,080 V" },
  { label_en: "MPP voltage range",       label_th: "ช่วงแรงดัน MPP",          value: "200 – 1,000 V" },
  { label_en: "Number of MPP trackers",  label_th: "จำนวน MPPT",              value: "2" },
  { label_en: "Max input current / MPPT",label_th: "กระแสไฟฟ้าสูงสุด / MPPT",  value: "26 A" },
  { label_en: "Rated AC output power",   label_th: "กำลังไฟฟ้าขาออก",         value: "15,000 W" },
  { label_en: "Max apparent power",      label_th: "กำลังไฟฟ้าปรากฏสูงสุด",   value: "16,500 VA" },
  { label_en: "Rated AC voltage",        label_th: "แรงดันไฟฟ้า AC",          value: "400 V, 3-phase" },
  { label_en: "AC grid frequency",       label_th: "ความถี่กริด",             value: "50 / 60 Hz" },
  { label_en: "Max efficiency",          label_th: "ประสิทธิภาพสูงสุด",       value: "98.4 %" },
  { label_en: "European efficiency",     label_th: "ประสิทธิภาพ Euro",        value: "98.2 %" },
  { label_en: "Ingress protection",      label_th: "ระดับการป้องกัน",         value: "IP66" },
  { label_en: "Operating temperature",   label_th: "อุณหภูมิใช้งาน",          value: "-25 °C – +60 °C" },
  { label_en: "Cooling",                 label_th: "ระบบระบายความร้อน",       value: "Natural convection" },
  { label_en: "Communication",           label_th: "การสื่อสาร",              value: "RS485, WLAN-FE, 4G (optional)" },
  { label_en: "Dimensions (W×H×D)",      label_th: "ขนาด (กว้าง×สูง×ลึก)",   value: "525 × 470 × 166 mm" },
  { label_en: "Weight",                  label_th: "น้ำหนัก",                 value: "17 kg" },
];

// Add _key for array items (Sanity requires unique _key on every array entry).
const specsWithKeys = specs.map((s) => ({ _key: randomUUID().slice(0, 12), ...s }));

// ─── Compliance ─────────────────────────────────────────────────────────────
const compliance = [
  "IEC 62109-1",
  "IEC 62109-2",
  "IEC 61727",
  "EN 50549-1",
  "VDE-AR-N 4105",
  "TIS 2606-2557",
  "G99 (UK)",
];

// ─── Portable Text helper ───────────────────────────────────────────────────
const block = (text, style = "normal") => ({
  _type: "block",
  _key: randomUUID().slice(0, 12),
  style,
  markDefs: [],
  children: [
    { _type: "span", _key: randomUUID().slice(0, 12), text, marks: [] },
  ],
});

const overview_en = [
  block("Built for residential and small-commercial three-phase systems", "h3"),
  block(
    "The SUN2000-15KTL-M5 is Huawei's flagship 15 kW three-phase string inverter for residential and small C&I rooftops. Two independent MPP trackers handle asymmetric or partially shaded arrays, and the 98.4% peak efficiency keeps generation losses minimal across the full operating envelope.",
  ),
  block("Why we recommend it", "h3"),
  block(
    "Pairs seamlessly with the Huawei LUNA2000 battery line for hybrid storage upgrades down the line, and integrates with the DTSU666-H smart meter for anti-reverse-flow compliance on grids that prohibit export. IP66-rated outdoor enclosure means no weather-proofing retrofit on the installer side.",
  ),
  block("What's in the box", "h3"),
  block(
    "Inverter unit, wall-mount bracket, AC and DC connectors, WiFi-WLAN-FE Smart Dongle (when ordered with the accessory pack). Installation manual and rapid-start guide included.",
  ),
];

const overview_th = [
  block("ออกแบบสำหรับระบบ 3 เฟส บ้านพักอาศัยและพาณิชย์ขนาดเล็ก", "h3"),
  block(
    "SUN2000-15KTL-M5 คืออินเวอร์เตอร์ระดับเรือธงขนาด 15 กิโลวัตต์ 3 เฟสจาก Huawei สำหรับติดตั้งบนหลังคาบ้านและอาคารพาณิชย์ขนาดเล็ก รองรับ MPPT อิสระ 2 ชุดที่จัดการแผงโซลาร์ที่ติดตั้งไม่สมมาตรหรือมีเงาบังบางส่วนได้ดี ประสิทธิภาพสูงสุด 98.4% ทำให้สูญเสียพลังงานน้อยที่สุดในทุกช่วงการทำงาน",
  ),
  block("เหตุผลที่เราแนะนำ", "h3"),
  block(
    "เชื่อมต่อกับชุดแบตเตอรี่ Huawei LUNA2000 สำหรับการอัปเกรดเป็นระบบไฮบริดได้อย่างราบรื่น และทำงานร่วมกับ smart meter DTSU666-H สำหรับระบบกันไฟย้อนตามข้อกำหนดของการไฟฟ้า ตัวเครื่องระดับ IP66 ติดตั้งภายนอกอาคารได้โดยไม่ต้องทำหลังคากันฝนเพิ่ม",
  ),
  block("สิ่งที่ได้รับในกล่อง", "h3"),
  block(
    "ตัวเครื่องอินเวอร์เตอร์, ขายึดผนัง, คอนเนคเตอร์ AC และ DC, WiFi-WLAN-FE Smart Dongle (เมื่อสั่งซื้อพร้อมชุดอุปกรณ์เสริม) พร้อมคู่มือการติดตั้งและเริ่มต้นใช้งาน",
  ),
];

const overview_en_with_keys = overview_en;
const overview_th_with_keys = overview_th;

// ─── Pairs well with ────────────────────────────────────────────────────────
const pairsWellWith = [
  { _key: "pair-dtsu666", _type: "reference", _ref: "product-huawei-dtsu666" },
  { _key: "pair-luna7", _type: "reference", _ref: "product-huawei-luna2000-7-s1" },
  { _key: "pair-luna14", _type: "reference", _ref: "product-huawei-luna2000-14-s1" },
  { _key: "pair-smartlogger", _type: "reference", _ref: "product-huawei-smart-logger-3000a" },
];

async function enrich() {
  console.log(`\n→ Enriching ${PRODUCT_ID}\n`);

  // Validate the product exists first.
  const doc = await client.getDocument(PRODUCT_ID);
  if (!doc) throw new Error(`Product ${PRODUCT_ID} not found — run seed-products.mjs first.`);

  await client
    .patch(PRODUCT_ID)
    .set({
      specs: specsWithKeys,
      compliance,
      overview_en: overview_en_with_keys,
      overview_th: overview_th_with_keys,
      pairsWellWith,
    })
    .commit();

  console.log("✓ Patched");
  console.log("  - 17 spec rows");
  console.log("  - 7 compliance entries");
  console.log("  - EN + TH overview (3 sections each)");
  console.log("  - 4 pairsWellWith references\n");
  console.log("Reload http://localhost:3000/en/products/inverters/huawei/huawei-sun2000-15ktl-m5");
}

enrich().catch((err) => {
  console.error("Enrich failed:", err.message ?? err);
  process.exit(1);
});
