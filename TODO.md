# WS Energy — Build Punch List

State-tracking checklist. Spec lives in [BRIEF.md](BRIEF.md); brand rules in [AGENTS.md](AGENTS.md). This file tracks **what's done / what's next**, nothing else.

## P0 — Blockers

- [x] **Generate Next 16 route types** — `npm install` + `npx next dev` once emits `.next/dev/types/routes.d.ts`. `npx tsc --noEmit` clean.
- [x] **Migrate legacy design tokens** — all marketing pages + components migrated from `bg-graphite-*` / `text-brand-*` / `bg-brand-*` to forest/gold/mist/card per [AGENTS.md](AGENTS.md). Zero legacy tokens remaining (verified by grep).
  - [x] [SolutionPage.tsx](components/solution/SolutionPage.tsx) (covers 4 `/solutions/*` routes)
  - [x] RFQ forms ([RfqForm.tsx](components/forms/RfqForm.tsx) + 5 steps)
  - [x] Shared components: [Badge](components/ui/Badge.tsx), [Input](components/ui/Input.tsx), [LocaleToggle](components/layout/LocaleToggle.tsx), [ProductCard](components/product/ProductCard.tsx), [CaseStudyCard](components/product/CaseStudyCard.tsx), [DocumentTile](components/product/DocumentTile.tsx), [AudienceTile](components/product/AudienceTile.tsx), [SystemDiagram](components/diagrams/SystemDiagram.tsx)
  - [x] [contact](app/[locale]/(marketing)/contact/page.tsx), [projoy-partnership](app/[locale]/(marketing)/about/projoy-partnership/page.tsx), [products/[category]](app/[locale]/(marketing)/products/[category]/page.tsx)
  - [x] [products](app/[locale]/(marketing)/products/page.tsx), [quote](app/[locale]/(marketing)/quote/page.tsx), [quote/confirmation](app/[locale]/(marketing)/quote/confirmation/page.tsx), [test](app/[locale]/test/page.tsx), [design-swatch](app/[locale]/(marketing)/design-swatch/page.tsx)
  - [x] All `/safety/*` pages including inline SVG hex colors in [firefighter-safety-switches](app/[locale]/(marketing)/safety/firefighter-safety-switches/page.tsx)

## ⚠ Verification gap — not yet checked visually

Migration was pure CSS class swaps + Sanity client untouched, so `tsc` + `lint` pass. **Live browser verification still pending** because `next dev` 500s without `NEXT_PUBLIC_SANITY_PROJECT_ID` / `SANITY_API_READ_TOKEN` in `.env.local`. Before merging:
- [ ] Populate `.env.local` from `.env.example` (Sanity project id, dataset, read token, Resend key)
- [ ] Walk each migrated route in browser and screenshot key pages
- [ ] Verify the firefighter SVG diagram still reads correctly on dark canvas (hex colors were re-picked — may need tuning)
- [ ] Sanity-check Badge brand variant rendering on bone vs forest surfaces (kept forest-only in this pass)

## P1 — Feature-complete scope

- [x] **Build `/resources` route group** (BRIEF §6.6) — hub page + 5 sub-pages (datasheets, wiring-diagrams, standards-compliance, workshop-training, articles) + `/resources/articles/[slug]` detail. Queries, dictionary keys (EN+TH), and all 7 routes created.
- [x] **Build `/projects` route group** (BRIEF §6.4) — index + `/projects/[slug]` case-study detail with challenge/solution/results/testimonial/products-used sections. Queries + dictionary keys + 2 routes.
- [x] **Build `/about/team` page** — grouped by department, photo cards, email/phone links. Query + dictionary keys + route.
- [x] **SEO fundamentals**:
  - [x] `app/sitemap.ts` — locales × all static routes + dynamic product/project/article/category slugs from Sanity
  - [x] `app/robots.ts` — allow all, sitemap reference
  - [x] `generateMetadata()` on 16 pages (title, description, OG, hreflang EN/TH via `alternates`)
  - [x] JSON-LD Organization schema on homepage
  - [x] Title template `%s | WS Energy` via layout metadata
  - [x] `metadataBase` set to `https://ws-energy.co.th`
- [x] **301 redirect map** in [next.config.ts](next.config.ts) — 26 redirects from old `/9-2/*` URLs per BRIEF §13, with wildcard `:slug` patterns for deep links.
- [ ] **Replace LINE OA placeholder href** in [contact/page.tsx:21](app/[locale]/(marketing)/contact/page.tsx) + [quote/confirmation/page.tsx](app/[locale]/(marketing)/quote/confirmation/page.tsx).

## P2 — Polish

- [x] Unused `IconArrowRight` in [safety/rapid-shutdown/page.tsx](app/[locale]/(marketing)/safety/rapid-shutdown/page.tsx)
- [x] Unused `localized` in [ProductDetail.tsx:824](components/marketing/ProductDetail.tsx)
- [ ] `<img>` → `<Image>` in [about/projoy-partnership/page.tsx:151](app/[locale]/(marketing)/about/projoy-partnership/page.tsx) (Sanity thumbnail — needs explicit width/height or fill mode)
- [ ] Verify interactive [SystemDiagram.tsx](components/diagrams/SystemDiagram.tsx) is wired to a page (it is — used in [safety/rapid-shutdown](app/[locale]/(marketing)/safety/rapid-shutdown/page.tsx))
- [ ] Newsletter signup — confirm in-scope or cut.

## Content (Sanity) — recommended order, runs in parallel with P1

- [ ] Seed **one of each** content type first (1 product, 1 project, 1 article, 1 team member, 1 datasheet) to expose schema gaps before bulk entry.
- [ ] Upload **authorization letters + TIS/IEC certifications** early — they're trust-critical per BRIEF §3 and unblock homepage proof points.
- [ ] Bulk-enter **products** next (largest set, drives RFQ flow which is primary conversion).
- [ ] Replace stock photos with **real warehouse / team / install** photography per BRIEF §16.
