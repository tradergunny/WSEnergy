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

## Decisions log

- **2026-05-15** — Training Calendar first, then Installer Directory. Both sourced from Sanity (employees self-serve). Table-only v1 for training. Bilingual via existing `[locale]` routing.
- **2026-05-21** — Installer Directory shipped. Card grid (not two-pane with map yet — wait until ≥50 installers). Filter state in URL so homepage can deeplink.
