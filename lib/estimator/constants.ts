/**
 * Methodology constants for the Solar Rooftop Estimator (ROADMAP feature 3).
 *
 * These live in CODE, not Sanity, on purpose (ADR 0002): they are the
 * "scientific" inputs that decide customer-facing financial and install
 * claims, so they must be version-controlled, reviewed, and sourced — not
 * silently editable from a marketing login. Business numbers (package prices,
 * tariffs the team wants to override) live in Sanity.
 *
 * Every value below was sourced and adversarially verified by the
 * `estimator-constants-research` workflow (2026-06-25): one research agent per
 * cluster + an independent skeptic that re-checked each value against
 * different sources. Verdicts are noted inline. The one ADJUSTED value is the
 * water factor (researcher 2.0 → verifier 1.3 L/kWh; see below).
 *
 * Units are explicit in each name/comment. Currency is THB throughout.
 */

// ───────────────────────────── Solar yield ─────────────────────────────

/**
 * Delivered annual energy per kWp installed, Thailand national average.
 * Verdict: confirmed (high). Global Solar Atlas / Solargis optimum-tilt PVOUT
 * spans 1,314 (south/east) → 1,534 (NE/central) kWh/kWp; 1,400 sits mid-band
 * and conservatively accounts for real rooftop losses (heat derating, soiling,
 * non-ideal tilt/azimuth). Measured Thai rooftops bracket it (~1,387–1,589).
 * Source: World Bank/ESMAP Global Solar Atlas; MDPI Sustainability 2025.
 */
export const PV_SPECIFIC_YIELD_KWH_PER_KWP_YEAR = 1400;

/**
 * Peak sun hours (= daily GHI, kWh/m²/day), Thailand average.
 * Verdict: confirmed (high). DEDE: ~50% of the country at 5.00–5.28; range
 * 4.5 (rainier/lower-potential) → 6.0 (sunniest NE/central). Informational —
 * the yield figure above already encodes this; kept for display/explanation.
 */
export const PEAK_SUN_HOURS_PER_DAY = 5;

// ──────────────────────────── Grid emissions ───────────────────────────

/**
 * Grid CO₂e displaced per kWh of solar (kg/kWh).
 * Verdict: confirmed (high). Official TGO Scope-2 grid emission factor (fuel
 * combustion + T&D losses), effective 1 Jan 2026. Independently corroborated
 * (lowcarbonpower/Ember: 472 g/kWh for 2025). Range 0.399 (generation-only) →
 * 0.4999 (prior TGO LCI). Note: this is higher than the older factor PEA's
 * page appears to use, so our CO₂ figures run above PEA's — but they reflect
 * the current official value.
 * Source: TGO (with Ministry of Energy, EGAT, MEA, PEA), 2025.
 */
export const GRID_CO2_KG_PER_KWH = 0.475;

// ───────────────────────────── Electricity tariff ──────────────────────

/**
 * Effective all-in retail tariff (THB/kWh, incl. Ft + 7% VAT), by segment.
 * Verdict: confirmed (high). ERC-set, identical for MEA/PEA: May–Aug 2026
 * average 3.95 before VAT → ~4.23 with VAT. Range residential 3.88–4.5,
 * business 3.95–4.5. We use one blended rate per segment for both bill→kWh
 * and savings (PEA-style). NOTE: solar offsets a household's *marginal*
 * (top-tier) consumption, which runs higher (~4.7–4.9), so 4.2 is conservative
 * — it slightly understates savings rather than overstating them.
 * Source: ERC / MEA / PEA 2026 tariff schedules; BOI Schedule 2 (business).
 */
export const TARIFF_THB_PER_KWH: Record<"residential" | "business", number> = {
  residential: 4.2,
  business: 4.2,
};

// ──────────────────────────── Roof → capacity ──────────────────────────

/**
 * Gross module footprint per kWp (m²/kWp) for current ~450–600W mono-Si.
 * Verdict: confirmed (high). Pure geometry: 1/(efficiency·1kW/m²); 4.5 ≈ 22.2%
 * efficient modules that dominate sales. Range 4.0 (best-in-class) → 5.5
 * (budget ~20% PERC). Module-only — roof spacing is handled via the usable
 * fraction below, not baked in here.
 * Source: Jinko/Trina/Canadian Solar datasheets; industry rule-of-thumb.
 */
export const AREA_PER_KWP_SQM = 4.5;

/**
 * Fraction of a measured roof footprint actually mountable after setbacks,
 * obstructions, access paths, and bad orientations.
 * Verdict: confirmed (medium). Industry "75% rule"; range 0.70 (complex/hip
 * roofs) → 0.80. Verifier note: clean flat C&I roofs can reach ~0.85 and Thai
 * roofs aren't bound by US fire-setback codes, so 0.75 is a safe, slightly
 * conservative default. Apply as:
 *   maxPanelKwp = measuredRoofArea_m² · USABLE_ROOF_FRACTION / AREA_PER_KWP_SQM
 * Source: NY Solar Map / PVWatts roof models; SolarMathLab.
 */
export const USABLE_ROOF_FRACTION = 0.75;

// ─────────────────────── Environmental conversions ─────────────────────

/**
 * Cooling water consumption avoided per kWh of solar (litres/kWh).
 * Verdict: ADJUSTED by the skeptic — researcher proposed 2.0, verifier
 * recomputed against Thailand's gas-DOMINATED grid (~68% gas @ ~0.8 L/kWh,
 * ~16% coal @ ~3.0 L/kWh) to ~1.0–1.3 L/kWh and flagged 2.0 as 55–95% too
 * high. We use the verifier's 1.3 (conservative within its own derivation).
 * Range 1.2–2.0. This makes our water figure much lower than PEA's display,
 * but it is the defensible number for a gas-heavy grid.
 * Source: UCS / Macknick 2012 (NREL) water-intensity factors; Thai fuel mix.
 */
export const WATER_SAVED_LITRES_PER_KWH = 1.3;

/**
 * CO₂ absorbed by one mature tree per year (kg/tree/yr) — for the
 * "equivalent to planting N trees" metric.
 * Verdict: confirmed (medium). 21.77 kg/yr (48 lb) is the standard USDA Forest
 * Service / Arbor Day "mature tree" figure. Range 6 (EPA seedling-over-10yr
 * basis) → 27 (large deciduous). Copy should say "mature trees". If EPA
 * equivalency rigor is ever required, switch to ~6.
 * Source: USDA "The Power of One Tree"; Arbor Day Foundation; EPA equivalencies.
 */
export const TREE_CO2_SEQUESTRATION_KG_PER_TREE_YEAR = 21.77;

// ─────────────────────── Electrical connection limits ──────────────────

/**
 * Max system size by connection phase (kWp). These are the Thai
 * Solar ภาคประชาชน / net-billing program caps (PEA/MEA), which double as the
 * common installer rule-of-thumb. Verdict: confirmed (high). Applied to size
 * residential systems; business C&I sizing is bounded by roof + available
 * packages, not these caps. (Single-phase can physically exceed 5 kWp on a
 * 30(100)A meter, but 5 is the practical/program ceiling.)
 * Source: MEA โครงการ Solar ประชาชน; SolarHub; Excellent Solar.
 */
export const PHASE_MAX_KWP: Record<"single" | "three", number> = {
  single: 5,
  three: 10,
};

// ───────────────────────── System & financial model ────────────────────

/**
 * Economic lifetime used for lifetime-savings (years). 25 matches PEA's
 * "25-year savings" headline and panel performance warranties.
 */
export const SYSTEM_LIFETIME_YEARS = 25;

/**
 * Annual output degradation applied over the lifetime (fraction/yr).
 * Kept at 0 for PEA parity (PEA shows lifetime = annual × 25, flat). Real
 * mono-Si degrades ~0.4–0.5%/yr; revisit if we want a more conservative model.
 */
export const ANNUAL_DEGRADATION_FRACTION = 0;

// ───────────────────────── Verdict thresholds (policy) ──────────────────
// Not researched — these are WS Energy's recommendation policy, decided in the
// grilling session (3-tier, payback-driven). Tunable.

/** Payback at or below this (years) → "Recommended" (great fit). */
export const VERDICT_PAYBACK_GREAT_YEARS = 7;

/** Payback above GREAT but at/below this (years) → "Worth considering". */
export const VERDICT_PAYBACK_OK_YEARS = 12;

/** Smallest system worth installing (kWp). Below this → "Not yet" (roof too small). */
export const MIN_VIABLE_KWP = 3;

// ──────────────────────────────── UI default ───────────────────────────

/** Default day/night usage split (fraction used during daylight). PEA defaults 50/50. */
export const DEFAULT_DAY_USAGE_FRACTION = 0.5;
