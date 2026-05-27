# Product Detail Page — UX upgrade (Huawei FusionSolar parity)

**Status:** spec'd, not yet implemented. Ready to pick up in a fresh chat.

**Owner:** TBD. **Last updated:** 2026-05-27.

---

## Why we're doing this

Compare:

- Current WS Energy product page → `/[locale]/products/[category]/[brand]/[sku]` rendered by `components/marketing/ProductDetail.tsx`. The Specs section sits at scroll-Y ≈ 6,900 on a 13,000px page — buyers have to scroll past hero, marketing copy, full overview, and compliance just to find the numbers.
- Reference: [Huawei FusionSolar SUN2000-600W-PA0](https://solar.huawei.com/en/products/merc-600w-pa0/). Sticky sub-nav (Overview · Specs · Download & Support), key model number always pinned top-left, image-led hero, and big stat tiles instead of a label/value list. Buyer gets to the spec they want in one click.

The Huawei layout is light/white; we keep our **forest-evergreen + gold + warm-bone** system from `BRIEF.md §7`. The borrow is structural, not visual.

---

## Goal

Reduce time-to-spec on every product detail page from "scroll forever" to "one click." Make the page sell the product first (above-the-fold value props + key numbers), then deliver the technical depth.

---

## Scope

**In v1 (this spec):**

- **A. Sticky section sub-nav** — pinned anchor bar with `Overview · Specs · Compliance · Documents · Pairs with` once the user scrolls past the hero. Active section highlighted in gold.
- **B. Key specs in hero** — pull 3–4 highest-value specs into the hero band as big mono numerals (e.g. `15 kW · 98.4% · IP66 · 3Φ`), beside the title.
- **C. Specs as bone-card grid** — replace the current label/value list with a 3-column grid of warm-bone cards (big mono value on top, EN/TH label below). Same data, much more scannable.
- **E. Feature highlight cards (with placeholder visuals)** — two or three image-led cards in the upper section, each surfacing a benefit ("Bankable yield", "Module-level safety", "Built for Thai grids"). Mirrors Huawei's "Higher Yields" / "Active Safety" pattern. Until real product photos exist, the card visual is a **forest-800 panel with a centered large gold Tabler icon + subtle linear-gradient overlay**. When `product.gallery[0]` is later populated, the icon background swaps for the image automatically.

**Deferred (separate spec when ready):**

- **D. Specs grouped into tabs** (Input / Output / Mechanical / Communication) — needs a categorisation field on each spec row in the schema. Adds an editorial burden — defer.
- **F. Variant comparison table** — for products sharing a base SKU (e.g. the four `SUN2000-15KTL-M5` bundles), a side-by-side comparison of what each bundle adds. Useful but needs a GROQ query for "siblings by SKU" + a new component. Defer to its own task.

**Not changing:**

- Sanity schemas (`sanity/schemas/product.ts`) — no field additions in v1.
- Sanity queries (`lib/sanity/queries.ts`) — no shape changes; `productBySkuQuery` already returns everything needed.
- The category landing pages (`/products/[category]`) — those are a separate UX track.

---

## Design constraints (read first)

Before touching any UI, read:

1. **`BRIEF.md §7` (Design System)** — tokens (forest-900/950, gold-500, mist-50, bone), pill-shaped buttons, mono editorial eyebrow, 24px scroll reveal.
2. **`BRIEF.md §8.1` (Buttons)** — `<Button variant="primary|secondary|tertiary|outline-primary|on-card">`.
3. **`AGENTS.md`** — section rhythm (`bg-forest-900` ↔ `bg-forest-950` alternation), warm-bone cards on top of either, do not reach back to `bg-graphite-*` / `text-brand-*` legacy tokens.

Reuse the existing primitives in `components/ui/`:

- `<Button>` — for all CTAs.
- `<MonoLabel tone="mist|forest|gold">` — for the editorial `_OVERVIEW` style eyebrow used in the sticky nav and section heads.
- `<ScrollReveal delay={n}>` — wrap each new section.
- `<StatBlock>` — pattern reference for hero key-spec tiles (used on homepage). Mirror the big-mono-numeral + small label structure.
- `<Card surface="bone|forest|forest-deep">` — for the new bone-card spec grid. `surface="bone"` is what the homepage uses for the warm cards on forest.

Visual references — pages already in the system that the new layout should rhyme with:

- `app/[locale]/(marketing)/page.tsx` — section rhythm + stat block.
- `components/marketing/Hero.tsx` — hero band patterns.
- `components/marketing/SolutionsTabs.tsx` — sticky/segmented nav pattern (close to what A needs).

---

## File map

What you'll touch:

| File | Why |
|---|---|
| `components/marketing/ProductDetail.tsx` | Main component. Hero markup gets the key-spec tiles (B). Spec section gets the bone-card grid (C). |
| `components/marketing/ProductSectionNav.tsx` | **New.** The sticky sub-nav (A). Self-contained client component with IntersectionObserver scroll-spy. |
| `app/[locale]/(marketing)/products/[category]/[brand]/[sku]/page.tsx` | Wire `<ProductSectionNav>` above `<ProductDetail>`. |
| `app/[locale]/dictionaries/{en,th}.json` | Add `productDetail.nav.{overview,specs,compliance,documents,pairs}` strings. |

What you'll **not** touch:

- `sanity/schemas/product.ts` — schema unchanged.
- `lib/sanity/queries.ts` — query already returns `specs`, `compliance`, `gallery`, etc.

---

## Existing landmarks in `ProductDetail.tsx`

For orientation when editing:

- Section IDs already in place: `#overview` (L391), `#specs` (L420), `#compliance` (L463), `#documents` (L517). **A "Pairs well with" section exists but has no `id` — add `id="pairs"` when wiring A.**
- `buildFeatureHighlights(...)` at L873 — the function that synthesises the "Project-grade engineering" callout strip below the hero. The key-spec tile work for **B** can live next to this, sourcing from the first 4 entries in `product.specs` (or all entries flagged with a `featured` boolean if we add one later).
- Existing spec table renders around L420–460. The replacement bone-card grid (C) drops in here.

---

## Step plan (each step requires verification before the next)

| Step | What | Verification |
|---|---|---|
| 0 | Read this spec + `BRIEF.md §7/§8.1` + `AGENTS.md`. Confirm the `SUN2000-15KTL-M5` template product is still enriched (run `node scripts/enrich-sun2000-15ktl-m5.mjs` if not — it's idempotent). | Reader can list the design tokens and the three primitives they'll reuse. |
| 1 | **B — Key specs in hero.** Add a strip of 3–4 stat tiles beside the title using the same shape as `<StatBlock>`. Source: first 4 entries of `product.specs`. Pull value into a big mono numeral (`text-h2 font-mono`), label into a small mist label below. Hide entirely if `specs.length === 0`. | Reload `/en/products/inverters/huawei/huawei-sun2000-15ktl-m5` — see 4 tiles (22,500 W · 1,080 V · 200 – 1,000 V · 2) at the top right of the hero. Check an unenriched product (e.g. `/en/products/inverters/huawei/huawei-sun2000-3ktl-l1`) — tiles should be absent, hero looks correct. Screenshot. |
| 2 | **C — Specs as bone-card grid.** Replace the `#specs` section's table layout with a CSS grid of `<Card surface="bone">`. Big mono value, small bilingual label. Maintain the section eyebrow + heading. Keep all 17 rows. | Reload the SUN2000-15KTL-M5 page; the Specs section is now a 3-col tile grid, scrollable on mobile (1-col), tablet (2-col), desktop (3-col). Compliance section unchanged. Screenshot at all three breakpoints. |
| 3 | **A — Sticky section sub-nav.** Build `components/marketing/ProductSectionNav.tsx` as a client component. Renders a horizontal pill bar with anchor links to `#overview`, `#specs`, `#compliance`, `#documents`, `#pairs`. Uses `IntersectionObserver` to highlight the active section in gold. Mount it inside `ProductDetailPage` between `<Breadcrumbs>` and `<ProductDetail>`. Position: `sticky top-0 z-30 bg-forest-950/90 backdrop-blur` (resolve correct top offset against global header height). On scroll up past the hero it sticks; on initial load it sits inline. Also add `id="pairs"` to the "Pairs well with" section in `ProductDetail.tsx`. | Reload the SUN2000-15KTL-M5 page. Sub-nav appears below breadcrumb. Click each link → smooth scroll to corresponding section. Scroll down → active link gold-highlights as each section enters viewport. Test on a product with no compliance + no specs (`/en/products/ev-chargers/scu/scu-ev-charger`) — links to empty sections should be hidden, not greyed-disabled. |
| 4 | **E — Feature highlight cards (placeholder visuals).** Add a new section just below the hero, above the existing `#overview`. Renders 2 or 3 image-led cards in a CSS grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`). Each card has: tall aspect-ratio (`aspect-[4/5]` or similar), `bg-forest-800` panel with a centered large gold Tabler icon (`text-gold-500`, size 64), subtle linear-gradient overlay from `forest-950/0` at top to `forest-950/80` at bottom, title in `text-h3 text-mist-50` at the bottom-left, optional 1-line subtitle in `text-mist-400`. When `product.gallery[0]` is set, the icon background is replaced with `<Image src={urlFor(product.gallery[0]).url()} fill />` and the gradient stays. The 2–3 card content (icon + title + subtitle) comes from a new optional field set OR is derived statically per-category for v1 — defaults that work for any product: "Bankable yield" (IconChartLine), "Module-level safety" (IconShieldCheckered), "Built for Thai grids" (IconBolt). The brand-ui skill MUST be invoked here — this is the most visually impactful change and the closest visual borrow from Huawei. | Reload SUN2000-15KTL-M5 → 3 image-led cards visible directly under the hero, aligned with section rhythm. Verify the cards look intentional with the placeholder icons (not "broken image" energy). Test a product with a real gallery image once available (or seed one manually for verification) — confirms the icon→image swap works. |
| 5 | **Polish + i18n.** Add the 5 nav-label strings + the feature-card default copy to both dictionary files. Wire localised labels in sub-nav + cards. Verify Thai page (`/th/products/...`) renders Thai labels and the spec card values still use mono. Verify no `bg-graphite-*` / `text-brand-*` tokens leaked into the changes. | `rg "bg-graphite|text-brand-" components/marketing/ProductDetail.tsx components/marketing/ProductSectionNav.tsx` returns nothing. Both `/en` and `/th` product pages render with the new layout, screenshots taken. |
| 6 | **Regression sweep.** Visit one product per category to confirm no layout breakage: an inverter (the enriched template), a battery (`/en/products/battery-storage/huawei/huawei-luna2000-7-s1`), an accessory (`/en/products/accessories/huawei/huawei-dtsu666`), a safety product (`/en/safety/rapid-shutdown/projoy-pefs-pl80p-21`), and one with zero enrichment (`/en/products/inverters/kuvo/kuvo-inv-1200-12`). | Visual diff against the before-screenshots. All five render without console errors. The zero-enrichment product still shows the sticky nav (with only Overview + Pairs visible) — empty sections gracefully hidden. Feature cards render correctly on every product (placeholder icons until imagery arrives). |

---

## Design notes for the implementer

**Sticky nav top offset.** The global header in `app/[locale]/(marketing)/layout.tsx` has its own height — measure it (or use a CSS variable if one is exposed) so the sticky nav doesn't slide under it.

**Key-spec tiles selection.** First 4 specs is the simplest rule and works for the SUN2000-15KTL-M5 (Max DC input power, Max DC input voltage, MPP voltage range, Number of MPP trackers). If editors complain later, add an optional `featured: boolean` to the spec object in the schema and prefer flagged rows. Don't do this in v1.

**Bone-card grid layout.** Use the existing `<Card surface="bone">`. Big value on top: `text-h2 font-mono text-forest-900`. Small label below: `text-eyebrow text-forest-700` for EN, then `text-sm text-forest-600` for TH on a second line.

**Empty-state behaviour.** Products with zero specs (most of the 70 right now) should still render correctly — the spec section auto-hides today via `product.specs?.length` guards. Preserve that.

**Feature-card placeholders.** The card visuals are intentional placeholders, not a "TODO" state. They should look polished and finished — gold Tabler icon centred against forest-800, gradient bottom-fade for the title overlay. The user explicitly chose this path over deferring the feature cards. When real product gallery images get uploaded in Studio, the card auto-swaps the icon for the image (via the `product.gallery[0]` check). Don't draft these as "obvious placeholders waiting for real images" — draft them as a legitimate final design that *also* accepts an optional product photograph.

**Feature-card content source.** For v1, the three card titles + subtitles come from static defaults in the component (or the dictionary file, for i18n). No new Sanity schema fields. If editors later want per-product custom highlight cards, that's a v2 schema addition — out of scope here.

**Active-section detection.** Use `IntersectionObserver` with `rootMargin: "-30% 0px -60% 0px"` so the link goes gold when the section is roughly mid-viewport, not as soon as its top edge enters. This is more pleasant than a binary top/bottom check.

**Mobile sub-nav.** On `< md`, the pill bar becomes horizontally scrollable (`overflow-x-auto`). Don't try to collapse to a hamburger — five short labels fit fine in a swipeable strip.

---

## Out of scope (for cross-reference)

These are valuable but live in separate work:

- **Real product photography** — every product currently lacks gallery images. Once available, the hero gets visually transformed and feature-highlight cards (E) become viable.
- **Variant comparison table (F)** — the 4 `SUN2000-15KTL-M5` bundles share a SKU. Worth surfacing the differences inline. Needs a "siblings by SKU" GROQ query + a new comparison component.
- **Spec categorisation / tabs (D)** — needs a schema field per spec row.
- **Enrichment of the other 70 products** — the script `scripts/enrich-sun2000-15ktl-m5.mjs` is the working reference. A scripted enrichment is doable for the high-traffic models; the long tail likely happens in Studio.
- **Sanity Studio CMS preview** — the changes here are read-only on the live site. No Studio impact.

---

## Verifying you have the right starting state

Before Step 1, run:

```bash
node -e "
import('dotenv').then(d => d.config({ path: '.env.local' }));
import('@sanity/client').then(async ({createClient}) => {
  await new Promise(r => setTimeout(r, 100));
  const c = createClient({projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, dataset: process.env.NEXT_PUBLIC_SANITY_DATASET, apiVersion: '2024-10-01', token: process.env.SANITY_API_WRITE_TOKEN, useCdn: false});
  const p = await c.fetch(\`*[slug.current=='huawei-sun2000-15ktl-m5'][0]{'specs':count(specs),'overview':count(overview_en),'compliance':compliance,'pairs':count(pairsWellWith)}\`);
  console.log(p);
});
"
```

Expected output: `{ specs: 17, overview: 6, compliance: [7 strings], pairs: 4 }`. If anything's missing, re-run `node scripts/enrich-sun2000-15ktl-m5.mjs` to restore the template.
