#!/usr/bin/env node
/**
 * One-off seed script for Certified Installer Directory.
 * Creates 4 serviceType taxonomy docs + 4 installer docs.
 *
 * Idempotent: uses createOrReplace with predictable _id values, so re-running
 * just overwrites the same docs without duplicating them.
 *
 * Run with: node scripts/seed-installers.mjs
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

const serviceTypes = [
  {
    _id: "seed-service-rooftop-solar",
    _type: "serviceType",
    title_en: "Rooftop Solar",
    title_th: "โซลาร์รูฟท็อป",
    slug: { _type: "slug", current: "rooftop-solar" },
    icon: "sun",
    orderRank: 10,
  },
  {
    _id: "seed-service-commercial-industrial",
    _type: "serviceType",
    title_en: "Commercial & Industrial Solar",
    title_th: "โซลาร์เชิงพาณิชย์และอุตสาหกรรม",
    slug: { _type: "slug", current: "commercial-industrial" },
    icon: "factory",
    orderRank: 20,
  },
  {
    _id: "seed-service-battery-storage",
    _type: "serviceType",
    title_en: "Battery Storage",
    title_th: "ระบบกักเก็บพลังงาน",
    slug: { _type: "slug", current: "battery-storage" },
    icon: "battery-charging",
    orderRank: 30,
  },
  {
    _id: "seed-service-ev-charging",
    _type: "serviceType",
    title_en: "EV Charging",
    title_th: "สถานีชาร์จรถยนต์ไฟฟ้า",
    slug: { _type: "slug", current: "ev-charging" },
    icon: "plug-zap",
    orderRank: 40,
  },
];

const ref = (id) => ({ _type: "reference", _ref: id, _key: id.slice(-12) });

const installers = [
  {
    _id: "seed-installer-siam-solar",
    _type: "installer",
    companyName: "Siam Solar Solutions",
    slug: { _type: "slug", current: "siam-solar-solutions" },
    installerCode: "WSE-IN-001",
    tier: "gold",
    contactName: "Somchai Wong",
    phone: "+66 2 555 0101",
    email: "contact@siamsolar.example",
    address_en: "123 Sukhumvit Road, Watthana, Bangkok 10110",
    address_th: "123 ถนนสุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพฯ 10110",
    province: "Bangkok",
    district: "Watthana",
    services: [
      ref("seed-service-rooftop-solar"),
      ref("seed-service-commercial-industrial"),
      ref("seed-service-battery-storage"),
    ],
    certifications: ["TIS-certified", "Projoy trained"],
    yearsActive: 8,
    orderRank: 10,
  },
  {
    _id: "seed-installer-northern-power",
    _type: "installer",
    companyName: "Northern Power Co.",
    slug: { _type: "slug", current: "northern-power-co" },
    installerCode: "WSE-IN-002",
    tier: "gold",
    contactName: "Pim Saetang",
    phone: "+66 53 555 0202",
    email: "info@northernpower.example",
    address_en: "456 Huay Kaew Road, Mueang, Chiang Mai 50200",
    address_th: "456 ถนนห้วยแก้ว อำเภอเมือง เชียงใหม่ 50200",
    province: "Chiang Mai",
    district: "Mueang",
    services: [
      ref("seed-service-rooftop-solar"),
      ref("seed-service-battery-storage"),
      ref("seed-service-ev-charging"),
    ],
    certifications: ["TIS-certified"],
    yearsActive: 6,
    orderRank: 20,
  },
  {
    _id: "seed-installer-eastcoast",
    _type: "installer",
    companyName: "EastCoast Energy",
    slug: { _type: "slug", current: "eastcoast-energy" },
    installerCode: "WSE-IN-003",
    tier: "silver",
    contactName: "Kittisak P.",
    phone: "+66 38 555 0303",
    email: "sales@eastcoast.example",
    address_en: "789 Sukhumvit Road, Mueang, Rayong 21000",
    address_th: "789 ถนนสุขุมวิท อำเภอเมือง ระยอง 21000",
    province: "Rayong",
    district: "Mueang",
    services: [
      ref("seed-service-commercial-industrial"),
      ref("seed-service-rooftop-solar"),
    ],
    certifications: ["TIS-certified"],
    yearsActive: 4,
    orderRank: 30,
  },
  {
    _id: "seed-installer-phuket-green",
    _type: "installer",
    companyName: "Phuket Green Tech",
    slug: { _type: "slug", current: "phuket-green-tech" },
    installerCode: "WSE-IN-004",
    tier: "authorized",
    contactName: "Apinya R.",
    phone: "+66 76 555 0404",
    email: "hello@phuketgreen.example",
    address_en: "12 Patak Road, Kathu, Phuket 83120",
    address_th: "12 ถนนปฏัก อำเภอกะทู้ ภูเก็ต 83120",
    province: "Phuket",
    district: "Kathu",
    services: [
      ref("seed-service-rooftop-solar"),
      ref("seed-service-ev-charging"),
    ],
    certifications: [],
    yearsActive: 2,
    orderRank: 40,
  },
];

async function seed() {
  console.log(`\n→ Project: ${projectId} / Dataset: ${dataset}\n`);

  // Service types first so references resolve.
  console.log("Creating 4 service types...");
  const tx1 = client.transaction();
  for (const doc of serviceTypes) tx1.createOrReplace(doc);
  await tx1.commit();
  console.log("✓ Service types created\n");

  console.log("Creating 4 installers...");
  const tx2 = client.transaction();
  for (const doc of installers) tx2.createOrReplace(doc);
  await tx2.commit();
  console.log("✓ Installers created\n");

  console.log("Done. Open /studio to verify.");
}

seed().catch((err) => {
  console.error("Seed failed:", err.message ?? err);
  process.exit(1);
});
