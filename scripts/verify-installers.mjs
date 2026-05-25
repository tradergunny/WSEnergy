import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "..", ".env.local") });

const c = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
});

const allInstallersQuery = `
  *[_type == "installer" && !(_id in path("drafts.**"))]
    | order(orderRank asc, companyName asc) {
    _id, companyName, "slug": slug.current, tier, province, district,
    contactName, phone, email,
    "services": services[]->{ _id, title_en, "slug": slug.current, icon }
  }
`;

const provincesQuery = `
  array::unique(*[_type == "installer" && !(_id in path("drafts.**")) && defined(province)].province)
`;

const installers = await c.fetch(allInstallersQuery);
const provinces = await c.fetch(provincesQuery);

console.log(`Installers (${installers.length}):`);
for (const i of installers) {
  console.log(
    `  • ${i.companyName.padEnd(28)} [${i.tier.padEnd(10)}] ${i.province.padEnd(12)} services: ${(i.services ?? []).map((s) => s.slug).join(", ")}`,
  );
}
console.log(`\nDistinct provinces: ${JSON.stringify(provinces)}`);
