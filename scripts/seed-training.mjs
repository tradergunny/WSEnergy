#!/usr/bin/env node
/**
 * Seed script for the Training Calendar — real WS Energy events calendar
 * transcribed from ws-energy.co.th (BE 2569 → CE 2026).
 *
 * Idempotent: createOrReplace with predictable dash-IDs (dotted IDs are hidden
 * by the public CDN). Also deletes the three expired dummy docs left over from
 * the original build (roadmap Step 2).
 *
 * Mapping notes (source columns → trainingSession schema):
 *   - รายละเอียด (Details)  → title_th (verbatim) + title_en (translated)
 *   - สถานที่ (Venue)        → host (kept in Thai; venues are proper nouns)
 *   - จังหวัด (Province)     → province (English names, per schema guidance)
 *   - วัน-เวลา (Date)        → startDate / endDate (ISO)
 *   - รูปแบบ (Activity type) → DROPPED: the v1 enum is delivery-mode
 *                              (in-person/online/hybrid), not อบรม/ออกบูธ/บรรยาย.
 *                              All events are physical → format: "in-person".
 *   - ภาค (Region)          → DROPPED: derivable from province, no schema field.
 *
 * Only the 14 entries with firm dates are seeded. The 7 rows the source marks
 * "ยังไม่ระบุ" (month known, day TBD) are intentionally omitted — the schema
 * requires concrete startDate/endDate and fabricating dates on a live customer
 * calendar is unsafe. Add them once dates firm up (or extend the schema to
 * support a TBD/month-only date).
 *
 * Run with: node scripts/seed-training.mjs
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

/** Expired dummy docs from the original build — remove so only real data remains. */
const DUMMY_IDS = [
  "57f55424-7752-4e3b-b514-836748379f5a", // Solar Safety & Protection Workshop
  "821ef8b3-fc42-46d3-a00c-30bd40087c5f", // Installed Partnership
  "9f9238ef-509d-4b0e-8bef-106551d9dcea", // Partner Installer Certification: Rooftop Solar
];

const base = { _type: "trainingSession", format: "in-person" };

const sessions = [
  {
    _id: "seed-training-001",
    title_th: "เถ้าแก่แสงอาทิตย์ รุ่นศูนย์วิทยาศาสตร์เพื่อการศึกษาอุบลราชธานี",
    title_en: "Solar Entrepreneur — Ubon Ratchathani Science Centre cohort",
    startDate: "2026-03-21",
    endDate: "2026-03-21",
    province: "Ubon Ratchathani",
    host: "ศูนย์วิทยาศาสตร์เพื่อการศึกษาอุบลราชธานี",
    language: "th",
  },
  {
    _id: "seed-training-002",
    title_th: "พื้นฐานโซลาร์เซลล์ ติดตั้ง และ ช่างติดตั้งโซลาร์เซลล์ ระดับ1",
    title_en: "Solar PV Fundamentals, Installation & Level 1 Installer Course",
    startDate: "2026-03-26",
    endDate: "2026-03-27",
    province: "Bangkok",
    host: "ศูนย์ฝึกอบรม BPS Training Center",
    language: "th",
  },
  {
    _id: "seed-training-003",
    title_th: "งาน ASEAN Smart Energy & Energy Storage Expo",
    title_en: "ASEAN Smart Energy & Energy Storage Expo",
    startDate: "2026-03-25",
    endDate: "2026-03-27",
    province: "Bangkok",
    host: "ศูนย์แสดงสินค้าและการประชุม อิมแพ็ค เมืองทองธานี",
    language: "both",
  },
  {
    _id: "seed-training-004",
    title_th: "ตลาดนัด PEA",
    title_en: "PEA Market Fair",
    startDate: "2026-04-02",
    endDate: "2026-04-02",
    province: "Bangkok",
    host: "การไฟฟ้าส่วนภูมิภาค (กฟภ.)",
    language: "th",
  },
  {
    _id: "seed-training-005",
    title_th: "การฝึกยกระดับฝีมือ หลักสูตรการติดตั้งระบบจ่ายไฟยานยนต์ไฟฟ้าอัจฉริยะ",
    title_en:
      "Skills Upgrade — Smart EV Charging Power-Supply Installation Course",
    startDate: "2026-04-30",
    endDate: "2026-04-30",
    province: "Kanchanaburi",
    host: "สถาบันพัฒนาฝีมือแรงงาน 34 กาญจนบุรี",
    language: "th",
  },
  {
    _id: "seed-training-006",
    title_th: "การฝึกยกระดับฝีมือ หลักสูตรการติดตั้งระบบจ่ายไฟยานยนต์ไฟฟ้าอัจฉริยะ",
    title_en:
      "Skills Upgrade — Smart EV Charging Power-Supply Installation Course",
    startDate: "2026-05-14",
    endDate: "2026-05-15",
    province: "Phra Nakhon Si Ayutthaya",
    host: "สถาบันพัฒนาฝีมือแรงงาน 15",
    language: "th",
  },
  {
    _id: "seed-training-007",
    title_th: "พื้นฐานโซลาร์เซลล์ ติดตั้ง และ ช่างติดตั้งโซลาร์เซลล์ ระดับ1",
    title_en: "Solar PV Fundamentals, Installation & Level 1 Installer Course",
    startDate: "2026-05-20",
    endDate: "2026-05-21",
    province: "Bangkok",
    host: "ศูนย์ฝึกอบรม BPS Training Center",
    language: "th",
  },
  {
    _id: "seed-training-008",
    title_th:
      "ระบบการผลิตไฟฟ้าจากพลังงานแสงอาทิตย์และระบบกักเก็บพลังงานแบตเตอรี่ ปี 2569 และการประยุกต์ใช้งาน",
    title_en:
      "Solar Power Generation & Battery Energy Storage Systems 2026, and Applications",
    startDate: "2026-06-12",
    endDate: "2026-06-14",
    province: "Bangkok",
    host: "โรงแรมมิราเคิล แกรนด์ คอนเวนชั่น (จัดโดย วสท.)",
    language: "th",
  },
  {
    _id: "seed-training-009",
    title_th: "การฝึกยกระดับฝีมือ หลักสูตรการติดตั้งระบบจ่ายไฟยานยนต์ไฟฟ้าอัจฉริยะ",
    title_en:
      "Skills Upgrade — Smart EV Charging Power-Supply Installation Course",
    startDate: "2026-06-27",
    endDate: "2026-06-27",
    province: "Pathum Thani",
    host: "มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี",
    language: "th",
  },
  {
    _id: "seed-training-010",
    title_th: "เถ้าแก่แสงอาทิตย์ รุ่น โซลาร์ปลอดภัยด้วย Rapid Shutdown และ Micro Inverter 1",
    title_en:
      "Solar Entrepreneur — Safer Solar with Rapid Shutdown & Micro Inverter (1)",
    startDate: "2026-06-25",
    endDate: "2026-06-25",
    province: "Samut Prakan",
    host: "WS Energy Co., Ltd",
    language: "th",
  },
  {
    _id: "seed-training-011",
    title_th: "งาน ASIA Sustainable Energy Week 2026 – ASEW",
    title_en: "ASIA Sustainable Energy Week 2026 – ASEW",
    startDate: "2026-07-01",
    endDate: "2026-07-03",
    province: "Bangkok",
    host: "ศูนย์การประชุมแห่งชาติสิริกิติ์",
    language: "both",
  },
  {
    _id: "seed-training-012",
    title_th: "ประชุมประจำปี โครงการมัณฑนา บางนา กม. 7",
    title_en: "Annual Meeting — Manthana Bangna KM.7 Project",
    startDate: "2026-07-12",
    endDate: "2026-07-12",
    province: "Samut Prakan",
    host: "โครงการมัณฑนา บางนา กม. 7",
    language: "th",
  },
  {
    _id: "seed-training-013",
    title_th: "เถ้าแก่แสงอาทิตย์ รุ่น โซลาร์ปลอดภัยด้วย Rapid Shutdown และ Micro Inverter 2",
    title_en:
      "Solar Entrepreneur — Safer Solar with Rapid Shutdown & Micro Inverter (2)",
    startDate: "2026-07-30",
    endDate: "2026-07-30",
    province: "Samut Prakan",
    host: "WS Energy Co., Ltd",
    language: "th",
  },
  {
    _id: "seed-training-014",
    title_th:
      "เถ้าแก่แสงอาทิตย์ รุ่น ระบบโซลาร์ยุคใหม่ ปลอดภัยกว่า ด้วย Rapid Shutdown และ Micro Inverter",
    title_en:
      "Solar Entrepreneur — Next-Gen Solar, Safer with Rapid Shutdown & Micro Inverter",
    startDate: "2026-08-27",
    endDate: "2026-08-27",
    province: "Samut Prakan",
    host: "WS Energy Co., Ltd",
    language: "th",
  },
].map((s) => ({ ...base, ...s }));

async function seed() {
  console.log(`\n→ Project: ${projectId} / Dataset: ${dataset}\n`);

  console.log(`Deleting ${DUMMY_IDS.length} expired dummy sessions...`);
  const tx0 = client.transaction();
  for (const id of DUMMY_IDS) tx0.delete(id);
  await tx0.commit();
  console.log("✓ Dummy sessions removed\n");

  console.log(`Creating ${sessions.length} real training sessions...`);
  const tx1 = client.transaction();
  for (const doc of sessions) tx1.createOrReplace(doc);
  await tx1.commit();
  console.log("✓ Training sessions created\n");

  console.log("Done. Open /studio or /training to verify.");
}

seed().catch((err) => {
  console.error("Seed failed:", err.message ?? err);
  process.exit(1);
});
