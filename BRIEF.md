# WS Energy — Project Brief

> **This document is the single source of truth for the new WS Energy website.**
> Every Claude Code session must begin by reading this file in full.
> When anything changes (positioning, wireframes, tokens, schemas), update this file FIRST, then rebuild from it.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Positioning & Strategy](#2-positioning--strategy)
3. [Audience Map](#3-audience-map)
4. [Information Architecture](#4-information-architecture)
5. [URL Structure & Routing](#5-url-structure--routing)
6. [Page Blueprints (Wireframe Specs)](#6-page-blueprints-wireframe-specs)
7. [Design System](#7-design-system)
8. [Component Library](#8-component-library)
9. [Tech Stack](#9-tech-stack)
10. [Sanity CMS Schemas](#10-sanity-cms-schemas)
11. [File Structure & Conventions](#11-file-structure--conventions)
12. [Bilingual (EN/TH) Implementation](#12-bilingual-enth-implementation)
13. [SEO & 301 Redirect Map](#13-seo--301-redirect-map)
14. [Claude Code Prompts](#14-claude-code-prompts)
15. [Build Phases & Sprint Plan](#15-build-phases--sprint-plan)
16. [Content Production Checklist](#16-content-production-checklist)
17. [Launch Checklist](#17-launch-checklist)

---

## 1. Project Overview

### Project name

WS Energy — new B2B website (replaces ws-energy.co.th)

### Owner

WS Energy Co., Ltd. — Samut Prakan, Thailand

### One-line description

A bilingual EN/TH B2B website positioning WS Energy as Thailand's authorized Projoy distributor (exclusive for Rapid Shutdown) and a full-line solar electrical components partner for EPCs.

### Goals

1. Establish WS Energy as Thailand's authoritative partner for solar electrical safety, anchored on the Projoy partnership.
2. Convert visitors into qualified B2B leads via a primary RFQ flow, secondary call/LINE channel, tertiary datasheet downloads.
3. Provide a credible technical resource hub with datasheets, wiring diagrams, compliance notes, and training content.
4. Surface trust systematically: certifications (TIS/IEC), authorization letters, named case studies, real team members.
5. Modernize the brand to match the technical/industrial language of Schneider, ABB, Huawei FusionSolar.

### Non-goals

- E-commerce / online checkout (RFQ only at launch)
- Aggressive installer recruitment (program exists but stays low priority)
- Consumer/residential lead-gen (acknowledged, but not the primary focus)

---

## 2. Positioning & Strategy

### One-liner (homepage hero subhead)

**Thailand's authorized Projoy distributor — and your full-line partner for solar generation, storage, and EV.**

### Full positioning paragraph

WS Energy is the official Projoy distributor in Thailand, with **exclusive distribution rights for Projoy Rapid Shutdown solutions** — the safety layer increasingly required on commercial and industrial rooftops across the region. Beyond Projoy, WS Energy is a full-line solar distributor supplying authorized inverters, storage, EV chargers, and accessories from Huawei, SolaX, KUVO, T-SUN, Sine Xcel, and SCU. We support EPC contractors, engineering consultants, and C&I project owners with technical specification assistance, certified components, training, and on-the-ground service from our base in Samut Prakan.

### Positioning pillars

1. **Exclusive Projoy Rapid Shutdown** — strongest, most defensible claim. Owns the safety category in Thailand.
2. **Authorized, certified components** — Huawei, SolaX, KUVO, T-SUN, Sine Xcel, SCU. TIS / IEC compliant.
3. **Engineering support, not just box-shifting** — sales engineers, training programs, SCADA solutions, install support.
4. **Local, accountable, in-country** — Samut Prakan base, Thai-speaking team, LINE OA, fast quote turnaround.

### Conversion hierarchy

- **Primary CTA**: Request a Quote (RFQ form)
- **Secondary CTA**: Talk to a sales engineer (call / LINE)
- **Tertiary CTA**: Download datasheet

---

## 3. Audience Map

### Primary: EPC companies & large installers

- **Who:** Procurement managers, project engineers, technical directors at EPC firms doing rooftop C&I, solar farms, large residential.
- **Wants:** Verify legitimacy, check authorizations, find right SKU, fast quote, downloadable datasheets for tender packages.
- **Objections:** "Can they deliver volume?" "Are they really authorized?" "Will they support warranty?" "Can I trust the Rapid Shutdown claim?"
- **Proof to surface:** Projoy authorization letter, manufacturer dealer badges, case studies with kW + customer name, TIS/IEC certificates, physical address + warehouse photos, sales engineer team.
- **Conversion path:** Homepage → Product category → Product detail → RFQ form.

### Secondary: Engineers, consultants, specifiers

- **Who:** Independent consulting engineers, specifying engineers at design firms, in-house engineering teams.
- **Wants:** Datasheets, wiring diagrams, compliance information, code references, comparison data.
- **Objections:** "Does this product meet IEC 60947-3 / NEC 690.12?" "What's the Thai PEA story?"
- **Proof to surface:** Technical resources hub, downloadable PDFs, spec comparison tables, compliance/standards page.
- **Conversion path:** Resources → Datasheet download → email follow-up → RFQ.

### Secondary: C&I project owners

- **Who:** Plant managers, facility directors, sustainability officers, COOs at industrial/commercial businesses.
- **Wants:** Risk mitigation, fire/insurance compliance, ROI confidence, vendor credibility.
- **Objections:** "Is this safe for my facility?" "What does the insurance company need?" "Will this disrupt operations?"
- **Proof to surface:** Rapid Shutdown safety narrative, case studies in similar verticals, compliance copy, named industrial customers.
- **Conversion path:** Solutions → Case studies → Talk to sales engineer.

### Tertiary: Residential / small commercial

Acknowledged but not a primary audience. Served via product pages and contact flow; do not let them dominate the homepage.

---

## 4. Information Architecture

### Top-level navigation (8 items)

```
HOME
SAFETY ▾
  ├─ Rapid Shutdown (Projoy) ★ Exclusive
  ├─ Firefighter Safety Switches
  └─ Why Solar Safety Matters

PRODUCTS ▾
  ├─ Inverters (Huawei · SolaX · KUVO)
  ├─ Battery Storage (Huawei · SolaX · KUVO)
  ├─ Optimizers (Huawei · Projoy)
  ├─ Micro Inverters (T-SUN)
  ├─ EV Chargers (SCU · Sine Xcel · SolaX)
  └─ Accessories (Connectors · DTSU666 · Cables)

SOLUTIONS ▾
  ├─ Commercial & Industrial Rooftop
  ├─ Residential
  ├─ Solar Farm / Utility
  └─ SCADA & Monitoring

PROJECTS
RESOURCES ▾
  ├─ Datasheets
  ├─ Wiring Diagrams & Manuals
  ├─ Standards & Compliance
  ├─ Workshop & Training
  └─ Articles

ABOUT ▾
  ├─ Company
  ├─ Projoy Partnership
  ├─ Certifications
  └─ News & Events

CONTACT
```

### Utility navigation (top bar)

- EN ⇄ TH toggle
- Phone (clickable)
- LINE OA
- **Request a Quote** button (primary)

### Footer (always visible)

- Column 1: Safety, Products, Solutions, Projects
- Column 2: Resources, About, Careers, News
- Column 3: Contact block — full address, domain email, phone, LINE QR
- Column 4: Newsletter signup + social (FB, YouTube)
- Bottom strip: Company registration #, Tax ID / VAT #, © year, Privacy Policy, Terms

---

## 5. URL Structure & Routing

### Canonical URL patterns

```
/                                       Homepage
/safety/                                Safety landing
/safety/rapid-shutdown/                 Rapid Shutdown overview
/safety/rapid-shutdown/[sku]/           Product detail (e.g., pefs-pl80p-11)
/safety/firefighter-safety-switches/    FF safety switches
/safety/firefighter-safety-switches/[sku]/
/safety/why-solar-safety-matters/       Educational

/products/                              Products index
/products/inverters/                    Inverters category
/products/inverters/[brand]/            Brand filter (e.g., huawei)
/products/inverters/[brand]/[sku]/      Product detail
/products/battery-storage/[brand]/[sku]/
/products/optimizers/[brand]/[sku]/
/products/micro-inverters/[brand]/[sku]/
/products/ev-chargers/[brand]/[sku]/
/products/accessories/[sku]/

/solutions/                             Solutions index
/solutions/commercial-industrial/
/solutions/residential/
/solutions/solar-farm/
/solutions/scada-monitoring/

/projects/                              Case studies index
/projects/[slug]/                       Case study detail

/resources/                             Resources hub
/resources/datasheets/
/resources/wiring-diagrams/
/resources/standards-compliance/
/resources/workshop-training/
/resources/articles/
/resources/articles/[slug]/

/about/
/about/projoy-partnership/
/about/certifications/
/about/news-events/
/about/installer-program/

/contact/
/quote/                                 Standalone RFQ page
/quote/confirmation/                    Post-submission

/legal/privacy-policy/
/legal/terms/
```

### Internationalization

Both `/` (default Thai) and `/en/` (English) variants for every page. Next.js App Router with `[locale]` segment.

### URL conventions

- All English slugs, kebab-case
- No trailing slashes in canonical URLs (Next.js default)
- No Thai-encoded characters in URLs
- Product slugs use the SKU (e.g., `sun2000-15ktl-m5`), lowercased

---

## 6. Page Blueprints (Wireframe Specs)

> Section-by-section specifications for every key page. Each section lists: purpose, content slots, CTAs.

### 6.1 Homepage

| #   | Section                     | Purpose                      | Content slots                                                                                                                          |
| --- | --------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Sticky utility bar          | Always-on conversion         | EN/TH toggle, phone, LINE, RFQ button                                                                                                  |
| 2   | Main nav                    | Site navigation              | Logo, 8 nav items                                                                                                                      |
| 3   | Hero                        | Position in 5 seconds        | Headline, subhead, primary CTA (Quote), secondary CTA (Explore Rapid Shutdown), bg photo (rooftop install with rapid shutdown visible) |
| 4   | Trust strip                 | Authorize the brand          | "Authorized Projoy Distributor (Exclusive: Rapid Shutdown)" badge + 6 manufacturer logos                                               |
| 5   | Audience tiles 3-up         | Route segmented visitors     | EPC/installer · Engineer · Facility owner — each links to a tailored landing                                                           |
| 6   | Hero category: Solar Safety | Lead with the differentiator | "Exclusive in Thailand" eyebrow, headline, body, 2 product cards (PEFS-PL80P, PEFS-EL), CTA to Safety                                  |
| 7   | Product category grid 6-up  | Catalog overview             | 6 tiles: Inverters · Storage · Optimizers · Micro · EV · Accessories — each with brand chips                                           |
| 8   | Featured projects 3-up      | Proof                        | 3 case study cards: customer name, kW, sector, photo                                                                                   |
| 9   | Solutions strip 4-up        | Industrial credibility       | C&I rooftop · Residential · Solar farm · SCADA                                                                                         |
| 10  | Why WS Energy 4-up          | Differentiation              | Authorized · Engineering support · Local · Training                                                                                    |
| 11  | Resource teasers 3-up       | Technical credibility        | Latest datasheets · Latest article · Upcoming workshop                                                                                 |
| 12  | Trust footer                | Hard proof                   | Certifications row (TIS · IEC · dealer logos) + company registration + map snippet                                                     |
| 13  | Closing CTA band            | Final conversion             | "Have a project? Get a quote in 24 hours." + RFQ + Call + LINE                                                                         |
| 14  | Site footer                 | Legal & nav                  | 4-column footer per IA                                                                                                                 |

**Hierarchy rule:** Section 6 (Safety) gets EDITORIAL treatment (story-driven). Section 7 (full grid) gets CATALOG treatment (flat, equal). The visual difference signals strategic priority.

### 6.2 Safety / Rapid Shutdown landing

| #   | Section                                       | Content                                                                                                                                                                                                                       |
| --- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Hero                                          | "★ Exclusive in Thailand" badge, "Projoy Rapid Shutdown — the safety layer required on every modern rooftop", positioning copy, primary CTA (Quote), secondary CTA (Download datasheets), technical hero photo                |
| 2   | Why it matters                                | "Why rapid shutdown matters" body copy + 3 cards (Fire safety · Code compliance · Insurance)                                                                                                                                  |
| 3   | Product family                                | 4 product cards: PEFS-PL80P-11, PEFS-PL80P-21, Control Box DC 24V, Connectors                                                                                                                                                 |
| 4   | **How it works** (interactive system diagram) | SVG showing PV modules → PEFS units → DC string → Control box → Inverter → Grid. Click "Trigger shutdown" button to animate de-energization. Live circuits = Signal Red, de-energized = Graphite. 4 click states, ~8 seconds. |
| 5   | Compliance                                    | Two columns: Product certifications (TIS, IEC 60947-3, TÜV badges) + Distributor authorization (Projoy authorization letter, View PDF)                                                                                        |
| 6   | Case studies                                  | 3-up cards filtered to Rapid Shutdown deployments                                                                                                                                                                             |
| 7   | Resources                                     | 3 download tiles: PEFS-PL80P datasheet · Wiring diagram · Install manual                                                                                                                                                      |
| 8   | Closing CTA                                   | "Spec'ing rapid shutdown for a project?" + Quote + Talk to engineer                                                                                                                                                           |

### 6.3 Product Category template (used for Inverters, Storage, etc.)

| #   | Section              | Content                                                                                                            |
| --- | -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1   | Breadcrumb           | Home › Products › [Category]                                                                                       |
| 2   | Category hero        | Headline + 1-line value statement + brand chips                                                                    |
| 3   | Filter bar           | Brand · kW range · Phase · Application · search-by-model                                                           |
| 4   | Product card grid    | Cards with brand chip, phase indicator, image, SKU, kW summary, [Specs] + [Quote] buttons. ~12 per page, paginated |
| 5   | Brand band 3-up      | Why we carry [Brand A], [Brand B], [Brand C]                                                                       |
| 6   | Related case studies | 3-up filtered to this category                                                                                     |
| 7   | Category RFQ block   | "Need help choosing the right [category]?" + Quote + Talk to engineer                                              |

### 6.4 Product Detail template

| #   | Section             | Content                                                                                                                                                                                                                                            |
| --- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Breadcrumb          | Home › Products › Category › Brand › SKU                                                                                                                                                                                                           |
| 2   | Product header      | LEFT: gallery (main + 4 thumbnails). RIGHT: brand chip + "Authorized" badge, SKU (mono font), model description, key specs box, primary CTA (Quote for this product), secondary buttons (Call · LINE · PDF). Right column is **sticky on scroll**. |
| 3   | Tabbed content      | Tabs: Overview · Technical specs · Compliance · Documents · FAQs                                                                                                                                                                                   |
| 4   | Documents block     | Always-visible download tiles (datasheet, install manual, wiring diagram)                                                                                                                                                                          |
| 5   | Pairs well with     | 4-up cross-sell (e.g., for inverter: rapid shutdown + battery + smart meter + optimizer)                                                                                                                                                           |
| 6   | Other in this brand | 4-up of related SKUs from same brand                                                                                                                                                                                                               |
| 7   | Project references  | 1–2 cards showing where this model is deployed                                                                                                                                                                                                     |
| 8   | Closing CTA         | "Ready to spec this inverter?" + Quote + Talk to engineer                                                                                                                                                                                          |

### 6.5 RFQ flow (multi-step form)

Standalone page at `/quote/`. Six steps. Steps 1–4 are skippable; only Step 5 is required.

| Step | Field                      | Input                                                                                                                                                        |
| ---- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | Project type               | Tile select: C&I rooftop · Solar farm · Residential · Other                                                                                                  |
| 2    | Project size               | Band select: <10 kW · 10–100 kW · 100 kW–1 MW · 1–5 MW · 5 MW+                                                                                               |
| 3    | Products of interest       | Multi-select chips: Rapid shutdown · Inverters · FF switches · Battery storage · Optimizers · Micro inverters · EV chargers · Accessories · SCADA · Not sure |
| 4    | Timeline                   | This month · 1–3 months · 3–6 months · Just scoping                                                                                                          |
| 5    | Contact details (REQUIRED) | Name _, Company _, Email _, Phone _, Role, Project notes, Optional file upload (BOM/DWG/spec)                                                                |
| 6    | Confirmation               | Reference # (#RFQ-YYYY-XXXXX), 24-hour response promise, fast-track call/LINE, "Browse projects" CTA                                                         |

Submissions: send email to sales@ws-energy.co.th + write to Sanity for record-keeping.

### 6.6 Mobile homepage

Same content sections as desktop, with these adjustments:

- Sticky persistent action bar under logo (Quote · Call · LINE buttons)
- 3-up grids → 2-up
- Solutions strip → single block lower priority
- All long sections → vertical card stacks

### 6.7 Contact page

| #   | Section                  | Content                                                                 |
| --- | ------------------------ | ----------------------------------------------------------------------- |
| 1   | Hero                     | "Get in touch" + RFQ-first / phone-LINE-secondary copy                  |
| 2   | Quick contact strip 3-up | Phone · LINE · Email cards                                              |
| 3   | Embedded RFQ form        | Same component as `/quote/`                                             |
| 4   | Direct lines 4-up        | Sales · Tech · Training · Partner — each with name, photo, email, phone |
| 5   | Office                   | Embedded Google Map + address + business hours + "Get directions"       |
| 6   | Legal footer             | Company registration + Tax ID + VAT                                     |

### 6.8 About / Projoy Partnership

| #   | Section              | Content                                                                             |
| --- | -------------------- | ----------------------------------------------------------------------------------- |
| 1   | Hero                 | "★ Authorized · Exclusive: Rapid Shutdown" badge + headline + positioning paragraph |
| 2   | What it means        | 4 benefit cards: Genuine stock · Full warranty · Technical support · Training       |
| 3   | Authorization letter | Letter preview image + PDF download + "Verify with Projoy" link                     |
| 4   | About Projoy         | Brand context paragraph + 3 facts (Specialization, Certifications, Global presence) |
| 5   | Projoy product range | 3-up cards: Rapid Shutdown ★Exclusive · FF Switches · Optimizers                    |
| 6   | Closing CTA          | "Spec'ing Projoy in your next project?" + Quote + Talk to engineer                  |

---

## 7. Design System

### 7.1 Color tokens (Tailwind config)

```js
// tailwind.config.js — colors
colors: {
  // Brand primary — Projoy Blue
  brand: {
    50:  '#E6F1FB',
    100: '#B5D4F4',
    200: '#85B7EB',
    400: '#378ADD',
    600: '#185FA5', // ★ primary action
    800: '#0C447C',
    900: '#042C53',
  },
  // Neutral spine — Graphite
  graphite: {
    50:  '#F8F8F7', // page surface
    100: '#F1EFE8', // secondary surface
    200: '#D3D1C7', // borders
    400: '#888780',
    600: '#5F5E5A', // secondary text
    800: '#444441',
    900: '#1A1A19', // ★ primary text
  },
  // Safety accent — Signal Red (USE ONLY for Safety category + system warnings)
  safety: {
    50:  '#FCEBEB',
    100: '#F7C1C1',
    200: '#F09595',
    400: '#E24B4A',
    600: '#A32D2D', // ★ safety
    800: '#791F1F',
    900: '#501313',
  },
  // Semantic — feedback only
  success: { bg: '#EAF3DE', border: '#C0DD97', text: '#3B6D11', dark: '#173404' },
  warning: { bg: '#FAEEDA', border: '#FAC775', text: '#854F0B', dark: '#412402' },
  danger:  { bg: '#FCEBEB', border: '#F09595', text: '#A32D2D', dark: '#501313' },
}
```

### 7.2 Color usage rules

- **Brand 600** is the only color used for actions (CTAs, links, focus rings, badges). Never decorative.
- **Graphite ramp** carries 85%+ of pixels.
- **Safety 600** appears ONLY on Rapid Shutdown / Firefighter Safety category pages or in system-state diagrams indicating live circuits / danger states. Never decorative.
- **Semantic colors** are for feedback only (success/warning/error), never for marketing emphasis.
- **No green-as-eco.** Resist the temptation.
- **Dark mode** must ship from day one. Ramp inverts: Graphite 900 → surface, Graphite 50 → text, Brand 200 → action.

### 7.3 Typography tokens

```js
// tailwind.config.js — fonts
fontFamily: {
  sans: ['Inter', 'Noto Sans Thai', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
},
fontWeight: {
  // ONLY two weights system-wide
  normal: 400,
  medium: 500,
},
```

### 7.4 Type scale (desktop)

| Token          | Size | Line height | Weight                  | Use                                 |
| -------------- | ---- | ----------- | ----------------------- | ----------------------------------- |
| `text-display` | 48px | 1.1         | 500                     | Marketing display only              |
| `text-h1`      | 36px | 1.2         | 500                     | Page hero                           |
| `text-h2`      | 24px | 1.3         | 500                     | Section heading                     |
| `text-h3`      | 18px | 1.4         | 500                     | Subsection                          |
| `text-h4`      | 15px | 1.4         | 500                     | Card title                          |
| `text-body-lg` | 16px | 1.65        | 400                     | Lead paragraph                      |
| `text-body`    | 14px | 1.65        | 400                     | Body                                |
| `text-caption` | 12px | 1.5         | 400                     | Caption / meta                      |
| `text-eyebrow` | 11px | 1.4         | 500, +0.04em, uppercase | Category labels, structural markers |

**Mobile scale** = ~80% of desktop (Display 36, H1 28, H2 20, H3 17, body 14–16).

### 7.5 Mono usage

JetBrains Mono is used ONLY for:

- Product SKUs (`PEFS-PL80P-21`, `SUN2000-15KTL-M5`)
- Spec table values (`15 kW`, `98.4%`, `IP66`)
- Standard references (`IEC 60947-3`, `NEC 690.12`)

### 7.6 Spacing & radius

```js
// Tailwind spacing scale uses defaults (0.25rem base)
// Custom tokens:
borderRadius: {
  'sm': '4px',
  'md': '8px',   // ★ default
  'lg': '12px',  // cards
  'xl': '16px',  // featured cards
  'full': '9999px',
},
boxShadow: {
  // NO drop shadows on UI elements.
  // Focus only:
  'focus': '0 0 0 2px #B5D4F4',
},
```

### 7.7 Photography direction

| Use case             | Direction                                                                                                | Avoid                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Hero photography     | Real installations (rooftop arrays, factory roofs, technician on-site), cool/overcast light, wide angles | Sunsets, lens flare, "happy customer" stock, hands-holding-seedlings |
| Product photography  | Studio shots on white or graphite, three-quarter angle, single light source                              | Fake renders, products on gradients                                  |
| Project case studies | Documentary: drone shot + ground equipment + close-up of Projoy unit                                     | Heavily filtered, golden-hour drama                                  |
| Team / office        | Cool, slightly desaturated. Warehouse, office, training room                                             | Posed group shots in matching shirts                                 |

The site should feel photographed by an engineering documentation team, not a brand agency.

### 7.8 Iconography

- **Tabler Icons (outline only)**, stroke 1.5px
- 16–20px inline, 24px decorative, never larger than 32px
- Color: Graphite 600 (neutral), Brand 600 (action), Safety 600 (safety-critical only)

### 7.9 Motion principles

- Hover state: color darken 10%, no transform
- Focus state: 2px Brand 200 ring
- Accordion: 180ms ease-out
- **No scroll animations. No parallax. No fade-in-on-scroll.**
- Page transitions: instant
- The interactive Safety system diagram is the single rich-motion exception. State changes feel like equipment, not animation: discrete on/off transitions.

---

## 8. Component Library

> All components follow the design system above. Build as React components in `/components/`.

### 8.1 Buttons

```tsx
// Variant API
<Button variant="primary">Request a Quote</Button>      // solid Brand 600
<Button variant="secondary">View specs</Button>         // outlined Graphite 600
<Button variant="tertiary">Download PDF →</Button>      // text-only Brand 600
<Button variant="outline-primary">Talk to engineer</Button> // outlined Brand 600

// Sizes
size: 'sm' | 'md' | 'lg'  // padding 8/12/14 vertical, 14/22/26 horizontal

// Rules
- Max one primary per viewport
- 8px border-radius
- No drop shadows
- Hover: darken 10%
- Focus: 2px Brand 200 ring
```

### 8.2 Badges

```tsx
<Badge variant="authorized">★ Authorized</Badge>          // Brand 50 bg, Brand 800 text
<Badge variant="exclusive">★ Exclusive in Thailand</Badge> // Brand 50 bg, Brand 800 text
<Badge variant="brand">Huawei</Badge>                      // Outlined Graphite
<Badge variant="safety-critical">Safety critical</Badge>   // Safety 50 bg, Safety 800 text
<Badge variant="in-stock">In stock</Badge>                 // Success
```

Never combine more than 3 badges on a single component.

### 8.3 Product card

```tsx
<ProductCard
  brand="Huawei"
  authorized={true}
  exclusive={false}              // true → 2px Brand 600 border
  safetyCritical={false}
  image={...}
  sku="SUN2000-15KTL-M5"         // mono font
  description="15 kW · 3-phase · on-grid"
  href="/products/inverters/huawei/sun2000-15ktl-m5"
/>
```

- Standard card: 0.5px Graphite 200 border, 12px radius, white bg
- Featured card: 2px Brand 600 border (the only place we go thicker)
- Two CTAs at bottom: [Specs] outlined + [Quote] primary

### 8.4 Form fields

```tsx
<Input
  label="Email"
  required
  state="default" | "focused" | "filled" | "error"
  error="Please enter a valid email."
/>
```

- Default: 0.5px Graphite 600 border
- Focused: Brand 600 border + 2px Brand 200 focus ring
- Error: Danger 600 border + error message below

### 8.5 Spec table

```tsx
<SpecTable
  rows={[
    { label: "Rated power", value: "15 kW" },
    { label: "Phase", value: "3-phase" },
    // ...
  ]}
/>
```

- Header row: Graphite 100 bg, eyebrow style
- Values: mono font, right-aligned
- Row dividers: 0.5px Graphite 200
- Dense 8px row padding (engineers want density)

### 8.6 Document tile

```tsx
<DocumentTile
  type="datasheet" | "manual" | "diagram"
  title="Datasheet · PEFS-PL80P-21"
  meta="PDF · 1.2 MB · v2.4"
  href="/path/to/file.pdf"
/>
```

Compact, file icon left, title + meta center, download icon right (Brand 600).

### 8.7 Audience tile

```tsx
<AudienceTile
  icon="tools"
  primary={true} // EPC = primary, gets darker bg
  title="I'm an EPC / installer"
  description="Authorized stock, fast quotes, technical support."
  ctaText="Browse products →"
  href="/products"
/>
```

### 8.8 Case study card

```tsx
<CaseStudyCard
  customer="[Customer name]"
  sector="Factory"
  kw="1.2 MW"
  year={2025}
  image={...}
  href="/projects/[slug]"
/>
```

### 8.9 Interactive system diagram (Safety page)

```tsx
<SystemDiagram
  initialState="live"
  states={["live", "shutdown-initiated", "pefs-tripped", "array-deenergized"]}
  onTrigger={() => animateStateChange()}
/>
```

SVG-based, 5 nodes (Modules · PEFS · DC string · Control box · Inverter), Signal Red for live circuits, Graphite for de-energized. 4 click states, ~8 seconds total.

---

## 9. Tech Stack

### 9.1 Core

| Layer     | Tool                                 | Why                                                                                                                                                                                                                                                                                                                                                                 |
| --------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework | **Next.js 16 App Router**            | Server-rendered for SEO, image optimization, native i18n. Scaffolded version is **16.2.x** (originally drafted as 14). Has breaking changes from training data: async params (`await params`), `proxy.ts` replaces middleware, `next lint` removed (use ESLint CLI), Turbopack default. See `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`. |
| Language  | TypeScript                           | Type safety, fewer runtime bugs                                                                                                                                                                                                                                                                                                                                     |
| Styling   | **Tailwind CSS v4**                  | CSS-first config via `@theme` blocks in `app/globals.css` — there is **no** `tailwind.config.js`. Tokens are CSS custom properties (`--color-brand-600` etc.) and Tailwind generates `bg-brand-600`, `text-brand-600`, etc. automatically.                                                                                                                          |
| CMS       | Sanity v3                            | Best-in-class for catalogs, structured content, image pipeline                                                                                                                                                                                                                                                                                                      |
| Hosting   | Vercel                               | Built for Next.js, free tier sufficient at launch                                                                                                                                                                                                                                                                                                                   |
| Forms     | Formspree (simple) OR Sanity + email | RFQ submissions storage                                                                                                                                                                                                                                                                                                                                             |
| Email     | Resend OR Postmark                   | Transactional emails for RFQ submissions                                                                                                                                                                                                                                                                                                                            |
| Analytics | Plausible (preferred) OR GA4         | Privacy-friendly default                                                                                                                                                                                                                                                                                                                                            |

### 9.2 Key dependencies

Actual installed versions (Week 1 scaffold):

```json
{
  "next": "16.2.6",
  "react": "19.2.4",
  "react-dom": "19.2.4",
  "typescript": "^5",
  "tailwindcss": "^4",
  "@tailwindcss/postcss": "^4",
  "@sanity/client": "^7",
  "@sanity/image-url": "^1",
  "@tabler/icons-react": "^3",
  "zod": "^4",
  "prettier": "^3"
}
```

`resend` and `next-sanity` will be added when their respective features are wired (Week 8 and Week 3).

**i18n approach:** uses Next.js's built-in dictionary pattern (per `node_modules/next/dist/docs/01-app/02-guides/internationalization.md`), not `next-intl`. The default-locale URL strategy is `/th/...` and `/en/...` (sub-path for both), with a `proxy.ts` redirecting `/` → `/th`. This is a deliberate deviation from BRIEF Section 5's "default Thai at `/`" — the sub-path approach is simpler and aligns with the framework's first-class pattern.

### 9.3 File structure

```
/app
  /[locale]                       # 'en' | 'th'
    /(marketing)
      /page.tsx                   # Homepage
      /safety
        /page.tsx
        /rapid-shutdown
          /page.tsx
          /[sku]/page.tsx
        /firefighter-safety-switches
          /page.tsx
          /[sku]/page.tsx
      /products
        /page.tsx
        /[category]
          /page.tsx
          /[brand]
            /[sku]/page.tsx
      /solutions/[slug]/page.tsx
      /projects
        /page.tsx
        /[slug]/page.tsx
      /resources
        /page.tsx
        /datasheets/page.tsx
        /articles/[slug]/page.tsx
      /about
        /page.tsx
        /projoy-partnership/page.tsx
        /certifications/page.tsx
      /contact/page.tsx
      /quote
        /page.tsx
        /confirmation/page.tsx
    /layout.tsx
  /api
    /rfq/route.ts                 # RFQ submission handler
/components
  /ui                             # Button, Badge, Input, Card primitives
  /layout                         # Header, Footer, Container
  /product                        # ProductCard, SpecTable, DocumentTile
  /project                        # CaseStudyCard
  /forms                          # RfqForm, RfqSteps
  /diagrams                       # SystemDiagram (interactive Safety)
/lib
  /sanity                         # Client, queries, image URL builder
  /i18n                           # Translation helpers
  /utils
/sanity                           # Sanity studio config (sub-project)
  /schemas
/public                           # Static assets, OG images, favicon
/messages                         # i18n JSON files (en.json, th.json)
```

---

## 10. Sanity CMS Schemas

> Define these schemas in the Sanity Studio. Each is a content type with fields mapped to website needs.

### 10.1 Product

```ts
{
  name: 'product',
  fields: [
    { name: 'title', type: 'string' },                      // e.g., 'SUN2000-15KTL-M5'
    { name: 'slug', type: 'slug' },
    { name: 'sku', type: 'string' },                        // monospace display
    { name: 'category', type: 'reference', to: ['category'] },
    { name: 'brand', type: 'reference', to: ['brand'] },
    { name: 'authorized', type: 'boolean' },
    { name: 'exclusive', type: 'boolean' },
    { name: 'safetyCritical', type: 'boolean' },
    { name: 'shortDescription_en', type: 'string' },
    { name: 'shortDescription_th', type: 'string' },
    { name: 'overview_en', type: 'array', of: [{type: 'block'}] },  // rich text
    { name: 'overview_th', type: 'array', of: [{type: 'block'}] },
    { name: 'gallery', type: 'array', of: [{type: 'image'}] },
    { name: 'specs', type: 'array', of: [{
      type: 'object',
      fields: [
        { name: 'label_en', type: 'string' },
        { name: 'label_th', type: 'string' },
        { name: 'value', type: 'string' },                  // mono-displayed
      ]
    }]},
    { name: 'compliance', type: 'array', of: [{type: 'string'}] },  // e.g., ['IEC 60947-3', 'TIS']
    { name: 'datasheet', type: 'reference', to: ['document'] },
    { name: 'wiringDiagram', type: 'reference', to: ['document'] },
    { name: 'installManual', type: 'reference', to: ['document'] },
    { name: 'pairsWellWith', type: 'array', of: [{type: 'reference', to: ['product']}] },
    { name: 'orderRank', type: 'number' },
  ]
}
```

### 10.2 Category

```ts
{
  name: 'category',
  fields: [
    { name: 'title_en', type: 'string' },
    { name: 'title_th', type: 'string' },
    { name: 'slug', type: 'slug' },
    { name: 'parent', type: 'reference', to: ['category'] },         // 'safety' | 'products'
    { name: 'description_en', type: 'text' },
    { name: 'description_th', type: 'text' },
    { name: 'heroImage', type: 'image' },
    { name: 'orderRank', type: 'number' },
  ]
}
```

### 10.3 Brand

```ts
{
  name: 'brand',
  fields: [
    { name: 'name', type: 'string' },                       // 'Huawei', 'SolaX', 'Projoy'...
    { name: 'slug', type: 'slug' },
    { name: 'logo', type: 'image' },
    { name: 'authorizedDistributor', type: 'boolean' },
    { name: 'whyWeCarryIt_en', type: 'text' },
    { name: 'whyWeCarryIt_th', type: 'text' },
    { name: 'authorizationDocument', type: 'reference', to: ['document'] },
  ]
}
```

### 10.4 Project (case study)

```ts
{
  name: 'project',
  fields: [
    { name: 'title_en', type: 'string' },
    { name: 'title_th', type: 'string' },
    { name: 'slug', type: 'slug' },
    { name: 'customer', type: 'string' },
    { name: 'sector', type: 'string' },                     // 'Factory' | 'Warehouse' | 'School' | 'Government' | 'Solar Farm' | 'Residential'
    { name: 'capacity', type: 'string' },                   // '1.2 MW'
    { name: 'capacityKw', type: 'number' },                 // for filter sorting
    { name: 'location', type: 'string' },
    { name: 'year', type: 'number' },
    { name: 'productsUsed', type: 'array', of: [{type: 'reference', to: ['product']}] },
    { name: 'heroImage', type: 'image' },
    { name: 'gallery', type: 'array', of: [{type: 'image'}] },
    { name: 'challenge_en', type: 'array', of: [{type: 'block'}] },
    { name: 'challenge_th', type: 'array', of: [{type: 'block'}] },
    { name: 'solution_en', type: 'array', of: [{type: 'block'}] },
    { name: 'solution_th', type: 'array', of: [{type: 'block'}] },
    { name: 'results_en', type: 'array', of: [{type: 'block'}] },
    { name: 'results_th', type: 'array', of: [{type: 'block'}] },
    { name: 'testimonial_en', type: 'text' },
    { name: 'testimonial_th', type: 'text' },
    { name: 'featured', type: 'boolean' },                  // appears on homepage
  ]
}
```

### 10.5 Document (PDF)

```ts
{
  name: 'document',
  fields: [
    { name: 'title_en', type: 'string' },
    { name: 'title_th', type: 'string' },
    { name: 'documentType', type: 'string' },               // 'datasheet' | 'manual' | 'diagram' | 'authorization' | 'certification'
    { name: 'file', type: 'file' },
    { name: 'version', type: 'string' },
    { name: 'fileSize', type: 'string' },                   // 'PDF · 1.2 MB · v2.4'
    { name: 'relatedProducts', type: 'array', of: [{type: 'reference', to: ['product']}] },
  ]
}
```

### 10.6 Article

```ts
{
  name: 'article',
  fields: [
    { name: 'title_en', type: 'string' },
    { name: 'title_th', type: 'string' },
    { name: 'slug', type: 'slug' },
    { name: 'excerpt_en', type: 'text' },
    { name: 'excerpt_th', type: 'text' },
    { name: 'body_en', type: 'array', of: [{type: 'block'}, {type: 'image'}] },
    { name: 'body_th', type: 'array', of: [{type: 'block'}, {type: 'image'}] },
    { name: 'heroImage', type: 'image' },
    { name: 'category', type: 'string' },                   // 'safety' | 'compliance' | 'install' | 'product-news'
    { name: 'publishedAt', type: 'datetime' },
    { name: 'author', type: 'reference', to: ['teamMember'] },
  ]
}
```

### 10.7 TeamMember

```ts
{
  name: 'teamMember',
  fields: [
    { name: 'name', type: 'string' },
    { name: 'role_en', type: 'string' },
    { name: 'role_th', type: 'string' },
    { name: 'department', type: 'string' },                 // 'sales' | 'technical' | 'training' | 'partner'
    { name: 'photo', type: 'image' },
    { name: 'email', type: 'string' },
    { name: 'phone', type: 'string' },
    { name: 'lineId', type: 'string' },
    { name: 'showOnContactPage', type: 'boolean' },
  ]
}
```

### 10.8 Certification

```ts
{
  name: 'certification',
  fields: [
    { name: 'name', type: 'string' },                       // 'TIS', 'IEC 60947-3', 'TÜV'
    { name: 'logo', type: 'image' },
    { name: 'description_en', type: 'text' },
    { name: 'description_th', type: 'text' },
    { name: 'document', type: 'reference', to: ['document'] },
    { name: 'showOnHomepage', type: 'boolean' },
  ]
}
```

### 10.9 Event

```ts
{
  name: 'event',
  fields: [
    { name: 'title_en', type: 'string' },
    { name: 'title_th', type: 'string' },
    { name: 'slug', type: 'slug' },
    { name: 'eventDate', type: 'datetime' },
    { name: 'location', type: 'string' },
    { name: 'description_en', type: 'array', of: [{type: 'block'}] },
    { name: 'description_th', type: 'array', of: [{type: 'block'}] },
    { name: 'gallery', type: 'array', of: [{type: 'image'}] },
    { name: 'isUpcoming', type: 'boolean' },
  ]
}
```

### 10.10 RFQ Submission

```ts
{
  name: 'rfqSubmission',
  fields: [
    { name: 'reference', type: 'string' },                  // RFQ-YYYY-XXXXX
    { name: 'submittedAt', type: 'datetime' },
    { name: 'projectType', type: 'string' },
    { name: 'projectSize', type: 'string' },
    { name: 'productsOfInterest', type: 'array', of: [{type: 'string'}] },
    { name: 'timeline', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'company', type: 'string' },
    { name: 'email', type: 'string' },
    { name: 'phone', type: 'string' },
    { name: 'role', type: 'string' },
    { name: 'notes', type: 'text' },
    { name: 'attachment', type: 'file' },
    { name: 'status', type: 'string' },                     // 'new' | 'contacted' | 'qualified' | 'won' | 'lost'
  ]
}
```

---

## 11. File Structure & Conventions

### Naming

- Components: PascalCase (`ProductCard.tsx`)
- Files (non-component): kebab-case (`get-products.ts`)
- Hooks: `use*` prefix (`useProductFilters.ts`)
- Sanity queries: `*Query` suffix (`featuredProductsQuery`)

### Imports

- Absolute imports via `@/` alias to `./app/`, `./components/`, `./lib/`

### Internationalization

- Translation strings in `/messages/en.json` and `/messages/th.json`
- Sanity content uses `_en` / `_th` field suffixes
- Always render the right field based on `[locale]` route segment

### Image handling

- Use `next/image` everywhere
- Sanity images via `@sanity/image-url` builder
- Default placeholder: `placeholder="blur"` with LQIP from Sanity

---

## 12. Bilingual (EN/TH) Implementation

### Routing

- Default locale: `th` (served at `/`)
- English locale: `en` (served at `/en/`)
- Use Next.js i18n routing via `[locale]` segment

### Content split

- **UI strings** (button labels, nav items, form labels): in `/messages/{locale}.json`
- **Editorial content** (product descriptions, articles, case studies): Sanity field pairs (`title_en`, `title_th`)

### Toggle behavior

- Persist locale choice in cookie (`NEXT_LOCALE`)
- Toggle preserves current pathname but swaps locale segment
- All canonical and hreflang tags rendered correctly per page

### Translation quality

- Homepage, About, Safety landing, RFQ flow: human-translated by professional Thai translator
- Product specs, case study captions, article body: AI translation acceptable with human review

---

## 13. SEO & 301 Redirect Map

### Meta tag conventions

- Title: `[Page name] · [Brand pillar] · WS Energy` (max 60 chars)
- Description: 1-sentence value statement (max 160 chars)
- OpenGraph image: 1200×630, includes WS Energy logo + page topic + Projoy authorization mark
- Schema.org: Product, Organization, BreadcrumbList, FAQPage where relevant
- Canonical URL on every page
- hreflang tags for EN/TH alternatives

### Critical 301 redirects (set in `next.config.js`)

```js
async redirects() {
  return [
    { source: '/9-2/product', destination: '/products', permanent: true },
    { source: '/9-2/product/rapid-shutdown-2', destination: '/safety/rapid-shutdown', permanent: true },
    { source: '/9-2/product/rapid-shutdown-2/pefs-pl80p-11', destination: '/safety/rapid-shutdown/pefs-pl80p-11', permanent: true },
    { source: '/9-2/product/rapid-shutdown-2/pefs-pl80p-21', destination: '/safety/rapid-shutdown/pefs-pl80p-21', permanent: true },
    { source: '/9-2/product/rapid-shutdown-2/control-box-dc-24v', destination: '/safety/rapid-shutdown/control-box-dc-24v', permanent: true },
    { source: '/9-2/product/firefighter-safety-switches', destination: '/safety/firefighter-safety-switches', permanent: true },
    { source: '/9-2/product/firefighter-safety-switches/pefs-el-series-1-2-strings', destination: '/safety/firefighter-safety-switches/pefs-el-1-2-strings', permanent: true },
    { source: '/9-2/product/firefighter-safety-switches/pefs-el-series-3-5-strings', destination: '/safety/firefighter-safety-switches/pefs-el-3-5-strings', permanent: true },
    { source: '/9-2/product/firefighter-safety-switches/pefs-el-series-6-10-strings', destination: '/safety/firefighter-safety-switches/pefs-el-6-10-strings', permanent: true },
    { source: '/9-2/product/optimizer-2', destination: '/products/optimizers', permanent: true },
    { source: '/9-2/product/optimizer-2/optimizer-huawei', destination: '/products/optimizers/huawei', permanent: true },
    { source: '/9-2/product/optimizer-2/optimizer-projoy', destination: '/products/optimizers/projoy', permanent: true },
    { source: '/9-2/product/micro-inverter-2', destination: '/products/micro-inverters', permanent: true },
    { source: '/9-2/product/micro-inverter-2/micro-inverter-tsun', destination: '/products/micro-inverters/tsun', permanent: true },
    { source: '/9-2/product/inverter-2', destination: '/products/inverters', permanent: true },
    { source: '/9-2/product/inverter-2/inverter-huawei', destination: '/products/inverters/huawei', permanent: true },
    { source: '/9-2/product/inverter-2/inverter-solax', destination: '/products/inverters/solax', permanent: true },
    { source: '/9-2/product/inverter-2/inverter-kuvo', destination: '/products/inverters/kuvo', permanent: true },
    { source: '/9-2/product/ev-charger', destination: '/products/ev-chargers', permanent: true },
    { source: '/9-2/product/ev-charger/sec80-integrated-charger', destination: '/products/ev-chargers/scu', permanent: true },
    { source: '/9-2/product/ev-charger/ev-charger-sine-xcel', destination: '/products/ev-chargers/sine-xcel', permanent: true },
    { source: '/9-2/product/ev-charger/ev-charger-solax', destination: '/products/ev-chargers/solax', permanent: true },
    { source: '/9-2/product/accessories-2', destination: '/products/accessories', permanent: true },
    { source: '/9-2/product/accessories-2/connector', destination: '/products/accessories/connectors', permanent: true },
    { source: '/9-2/product/accessories-2/dtsu666', destination: '/products/accessories/dtsu666', permanent: true },
    { source: '/9-2/product/battery-storag', destination: '/products/battery-storage', permanent: true },
    { source: '/9-2/product/battery-storag/battery-storag-huawei', destination: '/products/battery-storage/huawei', permanent: true },
    { source: '/9-2/product/battery-storag/battery-storag-solax', destination: '/products/battery-storage/solax', permanent: true },
    { source: '/9-2/product/battery-storag/battery-storage-kuvo', destination: '/products/battery-storage/kuvo', permanent: true },
    { source: '/9-2/solutions', destination: '/solutions', permanent: true },
    { source: '/9-2/scada-2', destination: '/solutions/scada-monitoring', permanent: true },
    { source: '/9-2/blog', destination: '/resources/articles', permanent: true },
    { source: '/9-2/news-events', destination: '/about/news-events', permanent: true },
    { source: '/9-2/about', destination: '/about', permanent: true },
    { source: '/9-2/contact', destination: '/contact', permanent: true },
    { source: '/9-2/workshop-training', destination: '/resources/workshop-training', permanent: true },
    { source: '/installer', destination: '/about/installer-program', permanent: true },
  ]
}
```

For Thai-encoded blog URLs (`/%e0%b8%...`), generate the full mapping by scraping the live site sitemap during Week 10.

### Sitemap

- Generate dynamically via `app/sitemap.ts`
- Include all locale variants
- Submit to Google Search Console immediately on launch

---

## 14. Claude Code Prompts

> Tested prompts to use in Claude Code sessions. Always start a session with: _"Read BRIEF.md before doing anything else. We are working on the WS Energy website."_

### 14.1 Initial scaffold (Week 1)

```
Read BRIEF.md.

Then scaffold a new Next.js 14 project with:
- App Router
- TypeScript
- Tailwind CSS configured with the color tokens, font tokens, and spacing tokens defined in Section 7 of BRIEF.md
- next-intl for EN/TH internationalization with [locale] segment, defaulting to 'th'
- ESLint and Prettier
- Sanity client setup (placeholder, we'll wire in Week 3)
- A working homepage that just says "WS Energy" and toggles between English and Thai
- Initialize a git repo and prepare for first commit

Use the file structure defined in Section 11 of BRIEF.md.
```

### 14.2 Design system in code (Week 2)

```
Read BRIEF.md, especially Sections 7 and 8.

Create the following components in /components/ui/:
- Button.tsx with variants: primary, secondary, tertiary, outline-primary, and sizes: sm, md, lg. Use color tokens, never hardcode hex. Include proper hover/focus/disabled states per Section 7.9.
- Badge.tsx with variants per Section 8.2
- Input.tsx with states per Section 8.4
- Container.tsx for consistent max-width and padding

Each component must:
- Be a server component unless interactivity requires "use client"
- Use Tailwind utility classes only
- Include TypeScript prop types
- Have a Storybook-style example at the bottom of the file (commented out) for testing
```

### 14.3 Header & Footer (Week 2)

```
Read BRIEF.md Section 4 (IA) and Section 6.1 (Homepage section 1, 2, 14).

Build /components/layout/Header.tsx with:
- Sticky utility bar (EN/TH toggle, phone, LINE, Request a Quote button) at the very top
- Main nav below with logo + 8 nav items (Home, Safety, Products, Solutions, Projects, Resources, About, Contact)
- Dropdown mega-menu on hover for items with children (Safety, Products, Solutions, Resources, About)
- Mobile menu via slide-out drawer with hamburger button on small screens
- All colors from design system tokens

Build /components/layout/Footer.tsx with the 4-column structure from Section 4 plus the bottom legal strip.

Both components support the EN/TH locale.
```

### 14.4 Sanity setup (Week 3)

```
Read BRIEF.md Sections 9.1 and 10.

Set up a Sanity Studio in the /sanity/ directory. Define each schema from Section 10 with the exact field names shown. Configure the Sanity client in /lib/sanity/client.ts with environment variables.

Then create three sample products in Sanity:
1. PEFS-PL80P-21 (Projoy, exclusive=true, safetyCritical=true, category=rapid-shutdown)
2. SUN2000-15KTL-M5 (Huawei, authorized=true, category=inverters)
3. LUNA2000-7-S1 (Huawei, authorized=true, category=battery-storage)

And create two sample case studies, two brands (Projoy, Huawei), one team member, and one certification (TIS).

Verify by creating a /test page that fetches and displays all products.
```

### 14.5 Homepage (Week 4)

```
Read BRIEF.md Section 6.1 in full.

Build the homepage at /app/[locale]/(marketing)/page.tsx implementing all 14 sections from Section 6.1.

Pull from Sanity:
- Featured products (where featured=true) for Section 6 (Safety) and Section 8 (Projects)
- All categories for Section 7
- Latest 3 articles for Section 11
- All certifications where showOnHomepage=true for Section 12

Use only components from /components/. If a needed component does not exist, build it first as a reusable piece.

Match the design system rules: max one primary button per viewport, badges only where defined, no drop shadows, two type weights only.
```

### 14.6 Interactive system diagram (Week 7) — the hard one

```
Read BRIEF.md Section 6.2 (Section 4 of the Safety page) and Section 8.9.

Build /components/diagrams/SystemDiagram.tsx as a client component implementing an SVG-based interactive diagram:

Visual:
- 5 horizontal nodes left-to-right: PV Modules → PEFS Units → DC String → Control Box → Inverter → Grid
- Connecting lines between each node
- "Trigger Shutdown" button below the diagram

States (4 total, ~8 seconds end-to-end):
1. INITIAL: All connecting lines pulse Signal Red 600 (#A32D2D), labeled "Live"
2. SHUTDOWN INITIATED: Control Box icon turns yellow, line from Control Box to PEFS turns Brand 600. Other lines stay Signal Red.
3. PEFS TRIPPED: Lines from Modules through PEFS turn Graphite 600 (de-energized). DC String onwards still Signal Red.
4. ARRAY DE-ENERGIZED: All lines Graphite 600. Status text reads "Array De-energized · Safe"

Transitions: discrete state changes, no easing. ~2s between states.

Reset button to return to INITIAL state.

Use no animation library — just React state + CSS transitions on stroke color (180ms ease-out).
```

### 14.7 RFQ form (Week 8)

```
Read BRIEF.md Section 6.5.

Build the multi-step RFQ form at /app/[locale]/(marketing)/quote/page.tsx with components in /components/forms/:

- RfqStep1ProjectType.tsx — tile select (skippable)
- RfqStep2Size.tsx — band select (skippable)
- RfqStep3Products.tsx — multi-select chips (skippable)
- RfqStep4Timeline.tsx — pill select (skippable)
- RfqStep5Contact.tsx — required form (Name, Company, Email, Phone, Role, Notes, optional file upload)

State managed via useReducer in a parent /components/forms/RfqForm.tsx.

On submit, POST to /api/rfq which:
1. Generates reference: RFQ-YYYY-XXXXX (last 5 digits incrementing)
2. Writes record to Sanity (rfqSubmission schema)
3. Sends email via Resend to sales@ws-energy.co.th with all submitted details
4. Sends confirmation email to the user
5. Returns the reference number to the client

Then redirect to /quote/confirmation?ref=RFQ-YYYY-XXXXX which displays the confirmation per Section 6.5 step 6.

Validate with Zod. Show inline errors per design system Section 8.4.
```

### 14.8 SEO migration (Week 10)

```
Read BRIEF.md Section 13.

Implement all 301 redirects in next.config.js as listed in Section 13.

Then:
1. Generate /app/sitemap.ts that produces a valid XML sitemap including all locale variants and all dynamic routes (products, projects, articles).
2. Generate /app/robots.ts.
3. Add per-page metadata using Next.js Metadata API: title, description, OpenGraph, Twitter card, canonical, hreflang.
4. Add Schema.org JSON-LD: Organization on homepage, Product on product detail, BreadcrumbList everywhere with breadcrumbs.
5. Scrape the existing live ws-energy.co.th sitemap for any Thai-encoded blog URLs and append matching redirects.

Verify all redirects with a script that hits each old URL and confirms a 301 to the new URL.
```

### 14.9 Polish prompts (Week 11)

```
Run a Lighthouse audit on the deployed Vercel preview. Report scores for Performance, Accessibility, Best Practices, SEO on:
- Homepage
- /safety/rapid-shutdown
- /products/inverters/huawei/sun2000-15ktl-m5
- /quote

For any score below 90, identify specific issues and fix them. Common fixes:
- Image optimization (use next/image with proper width/height)
- Font display: swap
- Lazy-load below-fold content
- Add alt text to every image
- Ensure 4.5:1 color contrast minimum on text
- Ensure all interactive elements are keyboard accessible
```

---

## 15. Build Phases & Sprint Plan

| Week | Phase                                        | Deliverable                                              |
| ---- | -------------------------------------------- | -------------------------------------------------------- |
| 1    | Setup & learning                             | Next.js project deployed to Vercel showing "Hello World" |
| 2    | Design system + layout                       | Header, footer, design tokens, primitive components      |
| 3    | Sanity setup                                 | All schemas defined, sample content, Studio working      |
| 4    | Homepage + Product Category template         | Homepage and /products/inverters/ live with real data    |
| 5    | Product Detail + Safety landing              | 4 of 8 templates done                                    |
| 6    | Projects (index + detail) + Resources hub    | 6 of 8 templates done                                    |
| 7    | Interactive system diagram + Solutions pages | Signature feature live; Solutions templated              |
| 8    | Contact + RFQ flow + About / Projoy          | All 8 templates done; site functionally complete         |
| 9    | Content production sprint                    | Real content replaces placeholders                       |
| 10   | SEO + 301 redirects + analytics              | Migration-safe; analytics tracking                       |
| 11   | Polish, accessibility, performance           | Lighthouse 90+; tested on real devices                   |
| 12   | Launch                                       | DNS switched; site live at ws-energy.co.th               |

---

## 16. Content Production Checklist

Gather these in parallel with the build (start Week 1):

### Trust & legal

- [ ] Projoy authorization letter (PDF scan)
- [ ] TIS certification PDFs
- [ ] IEC certification PDFs
- [ ] Manufacturer dealer letters (Huawei, SolaX, KUVO, T-SUN, Sine Xcel, SCU)
- [ ] Company registration number
- [ ] Tax ID / VAT number
- [ ] Privacy policy text
- [ ] Terms of service text

### Brand assets

- [ ] WS Energy logo (vector .svg or .ai)
- [ ] WS Energy logo for dark backgrounds
- [ ] Manufacturer logos (vector preferred)
- [ ] Favicon (32x32 + 192x192)

### Team

- [ ] Sales lead — name, title, photo, email, phone
- [ ] Technical lead — name, title, photo, email, phone
- [ ] Training coordinator — name, title, photo, email
- [ ] Partner channel manager — name, title, photo, email
- [ ] Office contact — phone, LINE OA QR code, business hours

### Products (minimum for launch)

- [ ] PEFS-PL80P-11 datasheet + photo + spec table
- [ ] PEFS-PL80P-21 datasheet + photo + spec table
- [ ] Control Box DC 24V datasheet + photo + spec table
- [ ] PEFS-EL series (3 SKUs) datasheets + photos
- [ ] Top 10 Huawei inverter SKUs (datasheets, photos, specs)
- [ ] 4 SolaX inverter SKUs
- [ ] 4 KUVO inverter SKUs
- [ ] Top 5 battery storage SKUs

### Case studies (5–10)

For each: customer name, sector, capacity, location, year, products used, 3–5 photos (drone + ground + close-up), challenge/solution/results write-ups, optional testimonial.

### Photography

- [ ] 3–5 hero installation photos (rooftop arrays, factory roofs, technician on-site)
- [ ] Office / warehouse photos
- [ ] Workshop / training session photos
- [ ] Product photos on neutral backgrounds

### Translation

- [ ] Homepage copy translated to Thai (professional)
- [ ] About + Projoy partnership translated to Thai (professional)
- [ ] Safety landing translated to Thai (professional)
- [ ] RFQ form labels translated to Thai (professional)
- [ ] Product specs translated to Thai (AI + review)
- [ ] Case studies translated to Thai (AI + review)

---

## 17. Launch Checklist

### Pre-launch (final 48 hours)

- [ ] All 301 redirects tested in staging
- [ ] Lighthouse score ≥90 on Home, Safety, sample product detail, RFQ
- [ ] RFQ form sends test submission successfully (email received, Sanity record created)
- [ ] Mobile tested on real iPhone + Android
- [ ] Bilingual EN/TH toggle works on every page
- [ ] All footer legal info present
- [ ] Domain emails (info@, sales@, etc.) active
- [ ] LINE OA QR code working
- [ ] Sanity CMS user accounts set up for team

### DNS switch (launch day)

- [ ] Final WordPress export backed up
- [ ] DNS A/AAAA/CNAME records pointed to Vercel
- [ ] Wait 5–60 minutes for propagation
- [ ] Spot-check live URLs
- [ ] Submit sitemap to Google Search Console
- [ ] Old WordPress site moved to old.ws-energy.co.th as 30-day fallback

### First week post-launch

- [ ] Monitor Vercel analytics for 404s
- [ ] Monitor Search Console for crawl errors
- [ ] Reply to every RFQ submission within 24 hrs
- [ ] Have an EPC friend navigate the site cold and report issues

### First month post-launch

- [ ] Add 1–2 case studies per week
- [ ] Add product entries until full Huawei catalog (~25 SKUs) is live
- [ ] Publish 1 article per week
- [ ] Decommission old WordPress after 30 days of redirect health

---

## End of Brief

When in doubt, default to: simpler, more technical, more specific, less decorative. WS Energy's competitive edge is being the partner-grade Projoy distributor in Thailand — every design decision should reinforce that.
