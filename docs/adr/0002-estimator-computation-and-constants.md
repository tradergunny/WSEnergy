# Estimator computation: client-side, packages in Sanity, methodology in code

Status: accepted

## Decision

The Solar Rooftop Estimator runs its math **client-side** in a `'use client'` component. It is fed two sources of numbers, deliberately kept separate:

- **Business numbers in Sanity** — a `solarPackage` document type (`sizeKw`, `phase`, `segment`, `price`, `active`, `order`) plus the electricity tariff. Employees maintain these in Studio with no deploy, exactly like `trainingSession` and `installer`.
- **Methodology numbers in code** — `lib/estimator/constants.ts` holds kWh-per-kWp yield, grid CO₂ / water / tree factors, usable-area factor, m²-per-kW, system lifetime, and the **verdict thresholds** (good/marginal payback years, minimum viable kW). Each is commented with its source and changed only via reviewed PR.

The page (a server component) fetches packages from Sanity and imports the code constants, then hands both to the client estimator as props. All recomputation (slider, roof redraw) happens locally with no network round-trip.

## Why

- **Instant interactivity.** The day/night slider and roof-redraw must recompute with zero latency; a server route per keystroke would be sluggish and pointless for simple arithmetic.
- **The split protects the claim.** The verdict ("don't install") is a statement WS Energy makes to a customer. Prices and tariffs genuinely change and are business-owned, so they belong in Sanity. But the emission factor and the payback thresholds that decide the verdict should be version-controlled, reviewed, and auditable — not silently editable by a marketing login. This is why some constants are intentionally *not* in Sanity, against the otherwise-uniform "everything in Sanity" pattern.

## Consequences

- A future engineer will find methodology constants in code while everything else is in Sanity. That asymmetry is deliberate (see above), not an oversight.
- AGENTS.md's "don't change Sanity schemas" rule is scoped to the brand redesign; adding `solarPackage` is a new-feature schema addition, consistent with the Training/Installer precedent.
