#!/usr/bin/env node
/**
 * One-off cleanup after seed-products.mjs ran against a dataset that
 * already contained UUID-id categories. Re-points all products to the
 * pre-existing canonical category IDs, deletes my duplicate categories,
 * fixes the `optimizers` parent (was incorrectly under `safety`),
 * removes the orphan draft connector, and replaces the pre-existing
 * SUN2000-15KTL-M5 with the new variant-aware version.
 *
 * Idempotent: re-runs are safe — patches and deletes either no-op or
 * land on already-resolved state.
 *
 * Run with: node scripts/fix-product-categories.mjs
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

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

// Map: my deterministic category _id  →  pre-existing canonical UUID
const categoryRemap = {
  "category.safety": "da3b2719-4a46-4006-ac0c-398c87068768",
  "category.products": "0b3b086b-f782-4001-a18a-24b9f9af7ab5",
  "category.inverter": "fb15709b-e956-4b09-a5f6-edd1adad126f",        // → inverters (plural)
  "category.battery-storage": "082c4742-7728-4175-bf27-850df3a49f7b",
  "category.optimizer": "74d08e07-26f9-47b2-835c-4dff2301f04b",        // → optimizers (plural)
  "category.rapid-shutdown": "3d82d870-b2e4-4ff8-ba87-ec51e76f2954",
  "category.firefighter-safety-switches": "79d991da-6795-4bee-8545-a3e4930b1ccf",
};

// Pre-existing top-level IDs (so we can fix sub-cat parents).
const PRODUCTS_TOP = categoryRemap["category.products"];

// Products that need their category._ref repointed to a canonical UUID.
async function repointProducts() {
  console.log("→ Re-pointing products to canonical categories...");
  const products = await client.fetch(
    `*[_type=='product' && _id match 'product.*']{_id,'catRef':category._ref}`,
  );
  let patched = 0;
  for (const p of products) {
    const target = categoryRemap[p.catRef];
    if (!target) continue; // already on a canonical UUID or has no category
    await client.patch(p._id).set({ "category._ref": target }).commit({ visibility: "async" });
    patched++;
  }
  console.log(`  ✓ Re-pointed ${patched} products\n`);
}

// My duplicate categories — kept only if their slug matches a pre-existing one.
async function patchKeptCategoryParents() {
  console.log("→ Re-pointing kept categories (micro-inverters, ev-chargers, accessories) to canonical parent + plural slug...");
  // These three I KEEP (no pre-existing equivalent). Update parent ref + slug to plural where needed.
  const updates = [
    { _id: "category.micro-inverter", slug: "micro-inverters" },
    { _id: "category.ev-charger", slug: "ev-chargers" },
    { _id: "category.accessories", slug: "accessories" },
  ];
  for (const u of updates) {
    await client
      .patch(u._id)
      .set({
        "slug.current": u.slug,
        "parent._ref": PRODUCTS_TOP,
      })
      .commit({ visibility: "async" });
    console.log(`  ✓ ${u._id}  parent→products, slug→${u.slug}`);
  }
  console.log();
}

// Fix the wrongly-parented `optimizers` category.
async function fixOptimizersParent() {
  console.log("→ Fixing optimizers parent (safety → products)...");
  await client
    .patch(categoryRemap["category.optimizer"])
    .set({ "parent._ref": PRODUCTS_TOP })
    .commit({ visibility: "async" });
  console.log("  ✓ optimizers now under products\n");
}

// Replace the pre-existing SUN2000-15KTL-M5 with the new one. Since the new
// one already exists, we just delete the pre-existing UUID doc. Other
// products may reference the pre-existing one via `pairsWellWith` —
// re-point those to the new doc before deleting.
async function replaceSun2000() {
  const oldId = "c5f636cf-5d5a-4776-82c2-e542669e2de7";
  const newId = "product.huawei-sun2000-15ktl-m5";

  console.log("→ Re-pointing pairsWellWith references away from pre-existing SUN2000-15KTL-M5...");
  const referrers = await client.fetch(
    `*[references($id)]{_id,pairsWellWith}`,
    { id: oldId },
  );
  for (const r of referrers) {
    if (!Array.isArray(r.pairsWellWith)) continue;
    const next = r.pairsWellWith.map((item) =>
      item?._ref === oldId ? { ...item, _ref: newId } : item,
    );
    await client.patch(r._id).set({ pairsWellWith: next }).commit({ visibility: "async" });
    console.log(`  ✓ Patched ${r._id}`);
  }

  console.log("→ Deleting pre-existing SUN2000-15KTL-M5...");
  try {
    await client.delete(oldId);
    console.log("  ✓ Deleted\n");
  } catch (err) {
    console.log(`  · ${err.message}\n`);
  }
}

// PEFS-PL80P-21 — pre-existing has the rich IEC description used on the
// homepage's featured card. Keep pre-existing, delete my duplicate.
async function dedupePefsPl80p21() {
  console.log("→ Removing duplicate PEFS-PL80P-21 (keeping the curated pre-existing one)...");
  try {
    await client.delete("product.projoy-pefs-pl80p-21");
    console.log("  ✓ Deleted product.projoy-pefs-pl80p-21\n");
  } catch (err) {
    console.log(`  · already gone (${err.message})\n`);
  }
}

// Delete the orphan draft of the connector.
async function deleteOrphanDraft() {
  console.log("→ Deleting orphan draft drafts.product.connector-mc4...");
  try {
    await client.delete("drafts.product.connector-mc4");
    console.log("  ✓ Deleted\n");
  } catch (err) {
    console.log(`  · already gone (${err.message})\n`);
  }
}

// Finally, delete my duplicate category docs now that nothing references them.
// Order: subcategories first, then top-level (parent refs must dissolve first).
async function deleteDuplicateCategories() {
  console.log("→ Deleting duplicate category docs (subcategories first)...");
  const idsToDelete = [
    "category.rapid-shutdown",
    "category.firefighter-safety-switches",
    "category.inverter",
    "category.battery-storage",
    "category.optimizer",
    "category.safety",
    "category.products",
  ];
  for (const id of idsToDelete) {
    try {
      await client.delete(id);
      console.log(`  ✓ Deleted ${id}`);
    } catch (err) {
      console.log(`  · ${id}: ${err.message}`);
    }
  }
  console.log();
}

async function run() {
  console.log(`\n→ Project: ${projectId} / Dataset: ${dataset}\n`);

  // Order matters: re-point products first, then fix kept categories
  // (so their parent ref is the canonical UUID before we delete mine),
  // then fix optimizers parent, then product dedupes, then finally
  // delete the now-orphan duplicate categories.
  await repointProducts();
  await patchKeptCategoryParents();
  await fixOptimizersParent();
  await replaceSun2000();
  await dedupePefsPl80p21();
  await deleteOrphanDraft();
  await deleteDuplicateCategories();

  console.log("Done. Open /studio to verify or reload /en/products.");
}

run().catch((err) => {
  console.error("Fix failed:", err.message ?? err);
  process.exit(1);
});
