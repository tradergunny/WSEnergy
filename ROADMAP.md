# WS Energy — feature roadmap

Planned features that go beyond the brand refresh. Each feature has a v1 scope, step-by-step build plan, and a verification gate per step. Update this file as scope shifts.

---

## 1. Training Calendar (shipped — PR #8 merged)

**Goal**: a filterable list of WS Energy training sessions — installer certifications, customer workshops, technical webinars — managed by employees in Sanity Studio, with a homepage teaser surfacing the next 3 sessions.

**Inspiration**: [DSD training list](https://www.dsd.go.th/th/Intro/ListTraining), rebuilt in the forest/gold brand system.

### v1 scope

- Table-only entries (no description body / cover image yet)
- Filters: format + province (client-side)
- Bilingual (`en` / `th`) via `[locale]` segment
- Empty state, past-session hiding, "full" status badge

### Data model — `trainingSession`

| Field | Type | Notes |
|---|---|---|
| `title` | localized string | EN + TH |
| `startDate` | date | required |
| `endDate` | date | required |
| `format` | string (enum) | `in-person` \| `online` \| `hybrid` |
| `province` | string | required for in-person/hybrid |
| `host` | string | hosting body / WS team |
| `capacity` | number | optional |
| `seatsRemaining` | number | optional; drives "full" badge |
| `registrationUrl` | url | optional |
| `language` | string (enum) | `th` \| `en` \| `both` |

### Routes & files

- Schema: `sanity/schemas/trainingSession.ts` + register in `sanity/schemas/index.ts`
- Listing page: `app/[locale]/(marketing)/training/page.tsx`
- Query: extend `lib/sanity/queries.ts`
- Dictionary keys: `app/[locale]/dictionaries/{en,th}.json` (`training.*` namespace)
- Homepage block: section in `app/[locale]/(marketing)/page.tsx`
- Nav entry: wherever the main nav lives (resolve at Step 6)

### Step plan (each step requires verification before next)

| Step | What | Verification |
|---|---|---|
| 0 | This roadmap + link from AGENTS.md | User reads, confirms |
| 1 | `trainingSession` Sanity schema | Open `/studio`, confirm form fields + validation |
| 2 | Seed 3–5 dummy entries in Studio | Entries visible in Studio + Vision query |
| 3 | GROQ query + typed fetcher in `lib/sanity/queries.ts` | Vision returns expected shape; `tsc` passes |
| 4 | `/training` page rendering all sessions (no filters) | Preview screenshot; matches forest/gold system |
| 5 | Format + province filters (client-side) | Preview, click filters, snapshot results |
| 6 | Homepage "Upcoming Training" 3-up section + nav link | Preview homepage, screenshot |
| 7 | Polish: empty state, past-hiding, "full" badge | Toggle data in Studio, confirm states |

---

## 2. Certified Installer Directory (shipped)

**Goal**: searchable directory of WS Energy certified partner installers — province + service-type filters — with a prominent homepage entry point that deeplinks into province-filtered results.

**Inspiration**: [PSI installer search](https://armservice.psisat.com/), rebuilt in the forest/gold brand system.

### v1 scope

- Two-pane: sidebar filters (province dropdown + service-type checkboxes) + result cards
- Service types: rooftop solar, commercial, battery storage, EV charging, O&M
- No map view in v1 (skip until ≥50 installers); store lat/lng for v2
- Tier badges (Gold / Silver / Authorized)
- Homepage band: "Find a Certified Installer" with single province dropdown → deeplink

### Data model — `installer` (sketch — refine at build time)

- `companyName`, `contactName`, `installerCode`
- `address`, `province`, `district`, `lat`, `lng`
- `phone`, `email`
- `services[]` (refs to a `serviceType` taxonomy)
- `certifications[]`, `tier` (enum)
- `photo` (optional)

### Step plan (shipped)

| Step | What | Status |
|---|---|---|
| 1 | `installer` + `serviceType` Sanity schemas | ✓ |
| 2 | Seed 4 service types + 4 installers (via `scripts/seed-installers.mjs`) | ✓ |
| 3 | GROQ queries + typed fetcher (`lib/sanity/installers.ts`) | ✓ |
| 4 | `/installers` page — hero + card grid | ✓ |
| 5 | Client component `InstallersDirectory.tsx` — sidebar filters with URL state (`?province=…&service=…`) | ✓ |
| 6 | Homepage section 6.7 — "Find a certified installer" band with form → `/installers?province=…` deeplink | ✓ |
| 7 | Polish: metadata, `<Suspense>` boundary for prerendering, partner-network CTA at page bottom | ✓ |

### Decisions taken at build time

- **URL path**: `/installers` (top-level, parallel to `/training`)
- **Service taxonomy v1**: rooftop-solar, commercial-industrial, battery-storage, ev-charging
- **Homepage CTA**: native HTML form (no JS) → submits province as query param
- **Filter state**: lives in URL params via `useSearchParams` (client component must be `<Suspense>`-wrapped for SSG)
- **Drafts excluded** in all queries via `!(_id in path("drafts.**"))`

---

## 3. Solar Rooftop Estimator (planned)

**Goal**: a self-serve tool where anyone traces their roof on a Google Map (or types its area), enters their bill + usage profile, and instantly gets a recommended system size, savings, payback, environmental impact, and a 3-tier install verdict — then hands off into the RFQ pre-filled. An anonymous _Estimate_, deliberately distinct from a _Quote_ (see `CONTEXT.md`).

**Inspiration**: [PEA Solar rooftop calculator](https://peasolar.pea.co.th/calculation/), rebuilt in the forest/gold system — adding a map-draw roof input PEA lacks, and an explicit install/skip verdict PEA doesn't show.

### v1 scope

- Inputs: Residential/Business toggle, monthly bill (฿), phase (1/3, defaulted + editable), day/night usage slider, roof area via **map-draw (primary) or typed m² (fallback)**, location captured invisibly from the map (tariff region + local yield)
- Engine runs **client-side** for instant slider/redraw feedback
- **Verdict-first** results: 3-tier (Recommended / Worth considering / Not yet), payback-driven, with roof-fit + daytime-offset as overrides; "Not yet" still links to sales (never a dead-end)
- Outputs: recommended size + discrete package price, monthly/annual savings, payback, 25-yr savings, CO₂ + water + trees, "this is an estimate, not a quote" disclaimer
- Pre-filled RFQ handoff; estimate stored on the lead with `source: "estimator"`; `company` optional (segment-branched contact step)
- Bilingual th/en; surfaced via homepage band + nav + solution-page cross-links + a `/quote` link

### Data model

- **Sanity** — `solarPackage` doc: `sizeKw`, `phase` (`1`|`3`|`both`), `segment` (`residential`|`business`|`both`), `price` (฿), optional included-components, `active`, `order`. Tariff (฿/kWh) lives here too (or a small settings doc).
- **Code** — `lib/estimator/constants.ts`: kWh/kWp yield, grid CO₂/water/tree factors, usable-area factor, m²/kW, system lifetime, and the **verdict thresholds** (good ≤ ~7 yr / marginal ≤ ~12 yr / min viable ~3 kW). Each commented with its source. See ADR 0002.
- **RFQ extension** — add `source` + a structured `estimate` to `rfqSchema` (`app/api/rfq/route.ts`) and the `rfqSubmission` schema; relax `company` `min(1)` for residential origin.

### Routes & files

- Page: `app/[locale]/(marketing)/solar-calculator/page.tsx` → `/{locale}/solar-calculator` (slug SEO-targeted; UI name stays "Solar Rooftop Estimator")
- Client island: `components/estimator/SolarEstimator.tsx` (`use client`) + map / inputs / results sub-components
- Engine: `lib/estimator/engine.ts` (pure functions) + `lib/estimator/constants.ts`
- Sanity: `sanity/schemas/solarPackage.ts` (register in `index.ts`); query in `lib/sanity/packages.ts`
- Dictionary: `app/[locale]/dictionaries/{en,th}.json` (`estimator.*` namespace)
- Env: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (HTTP-referrer-restricted) added to `.env.example`
- Nav: `lib/navigation.ts`; homepage band in `app/[locale]/(marketing)/page.tsx`
- ADRs: `docs/adr/0001-roof-area-via-manual-polygon.md`, `docs/adr/0002-estimator-computation-and-constants.md`

### Step plan (each step requires verification before next)

Map integration is deliberately the **last** step — the typed-m² fallback makes the whole tool shippable without it (see Decisions). Steps 1–7 use the typed roof-area input only.

| Step | What | Verification |
|---|---|---|
| 0 | This roadmap entry + ADRs 0001/0002 + `CONTEXT.md`; map loader foundation (`lib/maps/loader.ts` + `@googlemaps/js-api-loader`) parked, unused until Step 8 | Done (grilling session) |
| 1 | `solarPackage` schema + seed tiers; `lib/estimator/constants.ts` (sourced) | Vision returns packages; `tsc` passes |
| 2 | Pure engine module (roof area + bill → size/savings/payback/verdict + env) | **Unit test reproduces PEA's screenshot numbers** within tolerance |
| 3 | Inputs form with **typed roof area** (no map yet) → live result | Preview; forest/gold; all 3 verdict states reachable |
| 4 | Verdict-first results screen (StatBlocks + env + disclaimer) | Preview screenshots of each verdict tier |
| 5 | RFQ handoff: extend `rfqSchema` + `rfqSubmission` (`source`+`estimate`), URL-param seeding, company-optional/segment branch | Test lead from estimator lands in Sanity with `source`+estimate |
| 6 | Surface it: `/solar-calculator` metadata + nav + homepage band + solution cross-links + `/quote` link | Preview every entry point |
| 7 | Polish: th/en strings, mobile UX, empty/error states, analytics ping | Locale toggle + mobile preview |
| 8 | **Map integration (LAST)**: GCP project + billing + referrer-restricted key, then address search + polygon draw + `computeArea` + usable-area factor + adjustable — *swaps/augments* the typed-area input | Draw a roof; area flows to engine; typed fallback intact; map renders |

### Decisions taken at design time

- **Slug `/solar-calculator`** for SEO, though the UI/glossary term is **Solar Rooftop Estimator** (`CONTEXT.md`) — the inconsistency is deliberate (search term ≠ brand name).
- **Estimate ≠ Quote** (`CONTEXT.md`). Tool is **ungated** (no contact wall) — lead-gen via a pre-filled RFQ handoff tagged `source: "estimator"`.
- **Map-primary + typed fallback; no Google Solar API** (Thailand uncovered as of 2026-06) — ADR 0001.
- **Client-side calc; packages in Sanity, methodology + verdict thresholds in code** — ADR 0002.
- **Discrete package tiers** (not continuous price) so payback stays honest; **all three** environmental metrics kept.
- **3-tier graded verdict, payback-driven**; roof-fit + daytime-offset as overrides.
- **Map built last (Step 8).** The typed-m² input makes the whole estimator shippable without the map, so the map — and its GCP/billing dependency — is a contained final enhancement that swaps the roof-area input, never a blocker. Step-1 map scaffolding (loader + dep) is parked, inert, until then.

---

## Decisions log

- **2026-06-26** — Solar Rooftop Estimator Steps 1–7 built & verified (engine reproduces PEA within 5%, 14 passing tests; typed-area inputs + verdict-first results; RFQ handoff with `source`+`estimate`; surfaced via homepage band/nav/cross-links/SEO; mobile + analytics). **Step 8 (map) deferred again** — to be done only after (a) fixing calculation problems and (b) UI/UX "easier reach" adjustments; these two are the next priorities. Estimator strings kept inline (real th/en) rather than in the dictionary, because `th.json` is `[TH]`-stubbed site-wide (259 placeholders) — migrating would regress; site-wide Thai translation flagged as a separate follow-up.
- **2026-06-25** — Solar Rooftop Estimator scoped (grilling session). Dedicated `/solar-calculator` tool, distinct from the RFQ _Quote_; ungated lead-gen that hands off pre-filled. Roof measured by manual map polygon (no Solar API — Thailand uncovered, ADR 0001); client-side engine with packages in Sanity + methodology in code (ADR 0002). 3-tier payback-driven verdict. Map deferred to the final build step — the typed-m² fallback makes the tool shippable without it, and the map swaps the roof-area input as a contained last step (GCP key provisioning folded in there). Step-1 map scaffolding (`lib/maps/loader.ts` + dep) kept parked; throwaway smoke-test page + proxy exclusion reverted.
- **2026-05-15** — Training Calendar first, then Installer Directory. Both sourced from Sanity (employees self-serve). Table-only v1 for training. Bilingual via existing `[locale]` routing.
- **2026-05-21** — Installer Directory shipped. Card grid (not two-pane with map yet — wait until ≥50 installers). Filter state in URL so homepage can deeplink.
