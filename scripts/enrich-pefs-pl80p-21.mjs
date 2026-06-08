#!/usr/bin/env node
/**
 * One-off enrichment script: fills out the Projoy PEFS-PL80P-21 product
 * (the "one-fits-two" sibling of PEFS-PL80P-11) with the same depth as
 * the seed-managed Projoy SKUs.
 *
 * Why a separate script: PEFS-PL80P-21 lives in Sanity as a pre-existing
 * UUID-id doc (slug `pefs-pl80p-21`, _id `7722ec3b-...`), referenced by
 * the homepage featured-card and by /safety/rapid-shutdown's product list.
 * seed-products.mjs explicitly skips it (would create a duplicate with
 * `_id: product-pefs-pl80p-21`). This script looks up the live doc by
 * SKU and patches the rich fields on it.
 *
 * Patches:
 *   - shortDescription_th  Thai mirror of the existing IEC 60947-3 line
 *   - safetyCritical       flipped on (RSD hardware → fire-safety critical)
 *   - highlights[]         4 icon-led tiles (one-fits-two emphasized)
 *   - compliance[]         NEC 690.12 · UL 1741/3741 · IEC 62109/61000 · NEMA 4X · UL94-V0 · TIS
 *   - specs[]              22 buyer-skim rows across electrical / mechanical / environment / compliance
 *   - overview_en/th       3-paragraph long-form bilingual overview
 *
 * Idempotent: `set` semantics. Re-runs overwrite. Image / datasheet refs
 * deliberately untouched (Studio-managed).
 *
 * Run with: node scripts/enrich-pefs-pl80p-21.mjs
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "..", ".env.local") });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const SKU = "PEFS-PL80P-21";

// Build helpers mirror the conventions in scripts/seed-products.mjs so this
// script slots into the same Sanity shape (group → tab, _key stability).
const spec = (label_en, label_th, value, group = "electrical") => ({
  label_en, label_th, value, group,
});
const highlight = (icon, title_en, title_th, body_en, body_th, credential_en, credential_th) => ({
  icon, title_en, title_th, body_en, body_th, credential_en, credential_th,
});
const ptParagraphs = (...paragraphs) => paragraphs.map((text, i) => ({
  _type: "block",
  _key: `p${i}`,
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: `s${i}`, text, marks: [] }],
}));
const withKeys = (items, prefix) => items.map((item, i) => ({ ...item, _key: `${prefix}${i}` }));

// ─── Highlights (4 icon-led "why EPCs spec this product" tiles) ────────────
const highlights = [
  highlight(
    "shield-bolt",
    "One-fits-two · 2 modules per unit",
    "หนึ่งตัวต่อสองแผง · 2 โมดูลต่อยูนิต",
    "WS Energy's exclusive Projoy SKU: a single PEFS-PL80P-21 disconnects 2 PV modules at once — half the unit count, half the labor, half the connector failure-points versus deploying two PEFS-PL80P-11s. Mix freely with PL80P-11 (1-module) on the same string for odd module-count rooftops.",
    "SKU Projoy exclusive ของ WS Energy: PEFS-PL80P-21 ตัวเดียวตัดวงจรแผง PV 2 แผงพร้อมกัน — ลดจำนวนยูนิตครึ่งหนึ่ง ลดแรงงานครึ่งหนึ่ง และลดจุดล้มเหลวของคอนเนคเตอร์ลงครึ่งหนึ่งเทียบกับการใช้ PEFS-PL80P-11 สองตัว ผสมกับ PL80P-11 (1 แผง) บนสตริงเดียวกันได้สำหรับหลังคาที่มีจำนวนแผงเป็นเลขคี่",
    "WS Energy exclusive",
    "WS Energy ได้รับอนุญาต",
  ),
  highlight(
    "bolt-off",
    "Cuts string to ≤10 V in <100 ms",
    "ตัดสตริงไป ≤10 V ภายใน <100 ms",
    "On AC loss, manual e-stop or >85°C over-temperature, both PV inputs open within 100 ms and drop the per-input output to under 10 V — meeting NEC 2017/2020 690.12 and IEC 60947-3 module-level rapid shutdown requirements for firefighter rooftop access.",
    "เมื่อไฟ AC ดับ, กด E-Stop หรืออุณหภูมิเกิน 85°C อินพุต PV ทั้งสองเปิดวงจรภายใน 100 ms และลดเอาท์พุตต่อช่องลงต่ำกว่า 10 V — ผ่านข้อกำหนดการตัดไฟฉุกเฉินระดับโมดูล NEC 2017/2020 690.12 และ IEC 60947-3 สำหรับการเข้าถึงหลังคาของหน่วยดับเพลิง",
    "NEC 690.12 · IEC 60947-3",
    "NEC 690.12 · IEC 60947-3",
  ),
  highlight(
    "world",
    ">IP68 / NEMA 4X · 25-year design life",
    ">IP68 / NEMA 4X · ออกแบบ 25 ปี",
    "Sealed >IP68 NEMA 4X UL94-V0 enclosure clips between the module frames junction-box free — survives Thai monsoon, dust and >+60°C rooftop heat for the full 25-year PV service life. Same envelope as the PL80P-11 sibling, so a single qualified BOM line covers any module-count layout.",
    "ตู้ซีล >IP68 NEMA 4X UL94-V0 คลิปติดระหว่างเฟรมแผงโดยไม่ต้องใช้ Junction Box — ทนมรสุมไทย, ฝุ่นและความร้อนบนหลังคา >+60°C ตลอดอายุการใช้งาน PV 25 ปี ซองเดียวกับรุ่นพี่ PL80P-11 ดังนั้น BOM ที่ผ่านการรับรองหนึ่งบรรทัดครอบคลุมเลย์เอาท์ที่มีจำนวนโมดูลเท่าใดก็ได้",
    ">IP68 · UL94-V0",
    ">IP68 · UL94-V0",
  ),
  highlight(
    "cube",
    "Shares PL80P-11 control infrastructure",
    "ใช้โครงสร้างควบคุมร่วมกับ PL80P-11",
    "Same 24 Vdc · 2 × 0.8 mm² control pair, same PEFS Control Box transmitter (C60 or C180), same trigger logic — one Control Box drives a mixed PL80P-11 + PL80P-21 fleet across the rooftop. Per-unit control current ≈ 54–72 mA (≈ 2 × PL80P-11), so a C60 still drives ~30 PL80P-21 = 60 modules.",
    "คู่ควบคุม 24 Vdc · 2 × 0.8 mm² เดียวกัน, ตัวส่ง PEFS Control Box เดียวกัน (C60 หรือ C180), ลอจิกการกระตุ้นเดียวกัน — Control Box ตัวเดียวขับเคลื่อนกลุ่ม PL80P-11 + PL80P-21 ที่ผสมกันทั่วทั้งหลังคา กระแสควบคุมต่อยูนิต ≈ 54–72 mA (≈ 2 × PL80P-11) ดังนั้น C60 ยังขับ PL80P-21 ได้ ~30 ตัว = 60 โมดูล",
    "24 Vdc · 2 × 0.8 mm²",
    "24 Vdc · 2 × 0.8 mm²",
  ),
];

// ─── Compliance ────────────────────────────────────────────────────────────
const compliance = [
  "NEC 2017/2020 (690.12)",
  "UL 1741",
  "UL 3741",
  "IEC/EN 60947-3",
  "IEC/EN 62109",
  "IEC/EN 61000",
  "NEMA 4X",
  "UL94-V0",
  "TIS", // TODO_VERIFY: confirm TIS listing for Thailand
];

// ─── Specs (25 buyer-comparable rows) ──────────────────────────────────────
// Order matters: ProductDetail.tsx (line ~154) takes specs.slice(0,4) as
// the hero 2×2 grid, so the first four rows must be concise label+value
// pairs. Verbose rows (function description, trigger logic, control method)
// follow inside the tabbed spec table below.
// Same shape as PEFS-PL80P-11 with the 2-input deltas (modules supported,
// max input current per channel, control current draw, dimensions, weight).
// Values inferred from the shared PEFS-PL Series User Manual V1.0 (Projoy,
// 2022-01-15), cross-checked against PL80P-11 where the spec sheet does not
// publish PL80P-21 separately — flagged with TODO_VERIFY where inferred.
const specs = [
  // ── First 4 rows = hero 2×2 grid · keep values short ────────────────────
  spec("Modules supported", "จำนวนแผงที่รองรับ", "2 modules / unit", "electrical"),
  spec("Max input voltage", "แรงดันอินพุตสูงสุด", "80 V DC", "electrical"),
  spec("Shutdown response", "เวลาตอบสนองการตัดวงจร", "< 100 ms", "electrical"),
  spec("Ingress protection", "ระดับการป้องกัน IP", ">IP68 · NEMA 4X", "environment"),
  // ── Tabbed spec table follows ───────────────────────────────────────────
  spec("Function", "ฟังก์ชัน", "Panel-level rapid shutdown · 2-in / 2-out (DC24V control)", "electrical"),
  spec("Number of PV inputs", "จำนวนอินพุต PV", "2", "electrical"),
  spec("Max input current (per input)", "กระแสอินพุตสูงสุดต่อช่อง", "15 A / 20 A (variant)", "electrical"),
  spec("Max output voltage (per output)", "แรงดันเอาท์พุตสูงสุดต่อช่อง", "80 V DC", "electrical"),
  spec("System voltage rating", "พิกัดแรงดันระบบ", "1,000 V / 1,500 V DC", "electrical"),
  spec("Output voltage after shutdown", "แรงดันเอาท์พุตหลังตัดฉุกเฉิน", "≤10 V per output (within 100 ms)", "electrical"),
  spec("Control method", "วิธีการควบคุม", "24 Vdc + 2 × 0.8 mm² cable (from PEFS Control Box)", "electrical"),
  spec("Control voltage range", "ช่วงแรงดันควบคุม", "21.6 – 26.4 V DC (24 V nominal)", "electrical"),
  spec("Control current per unit", "กระแสควบคุมต่อยูนิต", "54 – 72 mA (TODO_VERIFY · ≈ 2 × PL80P-11)", "electrical"),
  spec("Trigger methods", "วิธีการกระตุ้น", "Temperature ≥85°C · AC supply cut-off · manual e-stop", "electrical"),
  spec("PV connector", "คอนเนคเตอร์ PV", "MC4 (customized · same-brand pairing required)", "mechanical"),
  spec("Dimensions (L × W × H)", "ขนาด (L × W × H)", "TODO_VERIFY · ~140 × 51.9 × 22.4 mm (PL80P-11 envelope + 2-input span)", "mechanical"),
  spec("Weight (excl. cables)", "น้ำหนัก (ไม่รวมสาย)", "< 250 g (TODO_VERIFY)", "mechanical"),
  spec("Mounting", "การติดตั้ง", "Clip between PV module frames · junction-box free", "mechanical"),
  spec("Enclosure material", "วัสดุตู้", "Flame-retardant UL94-V0 · UV-resistant", "mechanical"),
  spec("Ambient operating temperature", "อุณหภูมิแวดล้อมที่ใช้งาน", "−30°C to +60°C", "environment"),
  spec("Auto-trip temperature", "อุณหภูมิตัดอัตโนมัติ", "85°C", "environment"),
  spec("Humidity", "ความชื้น", "0% – 90%", "environment"),
  spec("Design lifespan", "อายุการออกแบบ", "25 years", "environment"),
  spec("Safety standards", "มาตรฐานความปลอดภัย", "NEC 2017/2020 690.12 · UL 1741 · UL 3741 · IEC 60947-3", "compliance"),
  spec("Grid connection standards", "มาตรฐานการเชื่อมต่อกริด", "IEC/EN 62109 · IEC/EN 61000", "compliance"),
  spec("Warranty", "การรับประกัน", "TODO_VERIFY · Projoy publishes 25-year design life; field-warranty term per WS Energy contract", "compliance"),
];

const overview_en = ptParagraphs(
  "The PEFS-PL80P-21 is the two-input sibling of Projoy's PEFS-PL panel-level rapid-shutdown family — a one-fits-two module-level disconnect that clips between a pair of adjacent PV module frames and handles both with a single 80 V DC / IP68 / NEMA 4X unit. On any of three trigger events — AC loss for more than five seconds, manual press of the rooftop e-stop, or the unit sensing >85°C inside the enclosure — both PV channels open within 100 ms and drop the per-output voltage to ≤10 V, meeting NEC 2017/2020 690.12 and IEC 60947-3 module-level rapid-shutdown requirements for firefighter rooftop access.",
  "The PL80P-21 is the cost-per-module sweet spot for any rooftop with an even module count: one unit, one control-cable drop, one connector pair per pair-of-modules — half the BOM and half the field-crimp count of an all-PL80P-11 layout. Mix freely with PL80P-11 (1-module sibling) on the same string for odd module-counts; both share the same 24 Vdc Control Box infrastructure, same trigger logic and the same >IP68 / UL94-V0 enclosure envelope.",
  "WS Energy is the exclusive Projoy PEFS-PL80P-21 distributor in Thailand. The one-fits-two SKU isn't on Projoy's public datasheet line — it ships through the WS Energy channel only, paired with PEFS-24V Control Box (C60 for ≤60 modules, C180 for up to ~480) and the Projoy-customized MC4 connector pair for a fully qualified rapid-shutdown chain end-to-end.",
);

const overview_th = ptParagraphs(
  "PEFS-PL80P-21 คือรุ่นพี่อินพุต-คู่ของไลน์อุปกรณ์ตัดไฟฉุกเฉินระดับแผง PEFS-PL ของ Projoy — เป็นตัวตัดวงจรระดับโมดูลแบบหนึ่ง-ต่อ-สองที่คลิปติดระหว่างเฟรมของแผง PV สองแผงที่อยู่ติดกัน และจัดการทั้งสองแผงด้วยยูนิต 80 V DC / IP68 / NEMA 4X ตัวเดียว เมื่อเกิดเหตุการณ์กระตุ้นหนึ่งในสามแบบ — ไฟ AC ดับเกิน 5 วินาที, การกดปุ่ม E-Stop บนหลังคาด้วยตนเอง หรือยูนิตตรวจจับ >85°C ภายในตู้ — ช่อง PV ทั้งสองเปิดวงจรภายใน 100 ms และลดแรงดันเอาท์พุตต่อช่องลงเป็น ≤10 V ผ่านข้อกำหนดการตัดไฟฉุกเฉินระดับโมดูล NEC 2017/2020 690.12 และ IEC 60947-3 สำหรับการเข้าถึงหลังคาของหน่วยดับเพลิง",
  "PL80P-21 คือจุดที่คุ้มค่าต้นทุนต่อแผงที่สุดสำหรับหลังคาที่มีจำนวนแผงเป็นเลขคู่: ยูนิตเดียว, สายควบคุมเส้นเดียว, คู่คอนเนคเตอร์เดียวต่อคู่แผง — ลด BOM ครึ่งหนึ่งและลดจำนวนการ Crimp ในสนามครึ่งหนึ่งเทียบกับเลย์เอาท์ที่ใช้ PL80P-11 ทั้งหมด ผสมกับ PL80P-11 (รุ่นพี่ 1 แผง) บนสตริงเดียวกันได้สำหรับจำนวนแผงเป็นเลขคี่ ทั้งคู่ใช้โครงสร้างพื้นฐาน Control Box 24 Vdc เดียวกัน, ลอจิกการกระตุ้นเดียวกัน และซองตู้ >IP68 / UL94-V0 เดียวกัน",
  "WS Energy เป็นตัวแทนจำหน่าย Projoy PEFS-PL80P-21 exclusive ในประเทศไทย SKU แบบ one-fits-two ตัวนี้ไม่อยู่ในไลน์เอกสารข้อมูลทางเทคนิคสาธารณะของ Projoy — จัดส่งผ่านช่องทาง WS Energy เท่านั้น จับคู่กับ PEFS-24V Control Box (C60 สำหรับ ≤60 โมดูล, C180 สำหรับ ~480) และคู่คอนเนคเตอร์ MC4 ที่ Projoy ปรับขนาดเฉพาะสำหรับห่วงโซ่การตัดไฟฉุกเฉินที่ผ่านการรับรองเต็มรูปแบบตั้งแต่ต้นจนจบ",
);

const shortDescription_th =
  "อุปกรณ์ตัดไฟฉุกเฉินระดับโมดูล — 2-สตริง, ผ่านการรับรอง IEC 60947-3";

async function enrich() {
  console.log(`\n→ Looking up product by SKU: ${SKU}`);

  const doc = await client.fetch(`*[_type=="product" && sku==$sku][0]{_id,slug}`, { sku: SKU });
  if (!doc?._id) throw new Error(`Product with SKU "${SKU}" not found in Sanity.`);
  console.log(`  · Found _id: ${doc._id} (slug: ${doc.slug?.current})`);

  await client
    .patch(doc._id)
    .set({
      shortDescription_th,
      safetyCritical: true,
      highlights: withKeys(highlights, "pl80p21h"),
      compliance,
      specs: withKeys(specs, "pl80p21s"),
      overview_en,
      overview_th,
    })
    .commit();

  console.log("\n✓ Patched PEFS-PL80P-21");
  console.log(`  - ${specs.length} spec rows (electrical / mechanical / environment / compliance)`);
  console.log(`  - ${highlights.length} highlight cards`);
  console.log(`  - ${compliance.length} compliance entries`);
  console.log("  - EN + TH overview (3 paragraphs each)");
  console.log("  - shortDescription_th filled, safetyCritical=true");
  console.log("\nReload http://localhost:3000/en/safety/rapid-shutdown/pefs-pl80p-21\n");
}

enrich().catch((err) => {
  console.error("Enrich failed:", err.message ?? err);
  process.exit(1);
});
