# Roof area via manual polygon, not Google's Solar API

Status: accepted

## Decision

The Solar Rooftop Estimator measures roof size by having the user **trace their roof as a polygon** on a Google Maps Drawing layer, then computing the footprint with `geometry.spherical.computeArea()`. We deliberately do **not** use Google's Solar API (which would auto-detect the roof and its solar potential), and we keep PEA's original typed "roof area in m²" field as an always-available fallback.

## Why

- **Google's Solar API does not reliably cover Thailand.** Coverage is concentrated in North America, Europe, and Oceania; the most recent Asia expansions Google names are Japan and the Philippines, and the coverage map warns of 404s outside covered areas. WS Energy's market is Thai roofs, so the Solar API would 404 across most of our user base. (Checked June 2026.)
- **The Maps JavaScript API + Drawing library covers everywhere and is cheap.** Polygon drawing, address search, and area math are all part of Maps JS — no Solar API SKU. Dynamic Maps gives 10,000 free map loads/month before ~$7/1,000, so a marketing tool sits inside the free tier.

## Consequences

- A top-down polygon yields the roof's **flat footprint**, not the usable panel area or the true sloped area. We apply a **usable-area factor** before sizing, let the user adjust the result, and disclaim the figure as an estimate.
- **Map-primary, not map-only.** Satellite imagery quality is uneven across Thailand and tracing is fiddly on mobile, so the typed m² input stays as a one-tap fallback.
- Requires a GCP project with billing enabled and a **referrer-restricted** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. The cost is operational setup, not money.
- We own all solar-yield math ourselves (see the recommendation-engine decision), since Google gives us no solar data for these roofs.
