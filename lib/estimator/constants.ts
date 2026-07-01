/**
 * Methodology constants for the Solar Rooftop Estimator (ROADMAP feature 3).
 *
 * These live in CODE, not Sanity, on purpose (ADR 0002): they are the
 * "scientific" inputs that decide customer-facing financial and install
 * claims, so they must be version-controlled, reviewed, and sourced — not
 * silently editable from a marketing login. Business numbers (package prices,
 * tariffs the team wants to override) live in Sanity.
 *
 * ── PEA PARITY (2026-06-26) ──────────────────────────────────────────────
 * This estimator is a faithful re-implementation of PEA's public Solar
 * Calculator (peasolar.pea.co.th). We reverse-engineered its model from four
 * benchmark runs the team captured (see ADR 0002 + engine.test.ts). PEA's
 * outputs are perfectly LINEAR in system size — every per-kWp coefficient
 * below is calibrated to reproduce those benchmarks exactly:
 *
 *     savings   = ฿480 / kWp / month        (= ฿5,760/yr, ฿144,000 over 25 yr)
 *     CO₂       = 498.8 kg / kWp / yr
 *     fuel oil  = ~219.95 L / kWp / yr
 *     trees     = ~8.05 / kWp   (10-year-equivalent)
 *
 * Where a value previously diverged from PEA on principle (CO₂ factor, the
 * water metric), replication now takes priority — noted inline.
 *
 * Units are explicit in each name/comment. Currency is THB throughout.
 */

// ───────────────────────────── Solar yield ─────────────────────────────

/**
 * Delivered annual energy per kWp installed (kWh/kWp/yr) — the REPORTING yield.
 * Drives production → savings, CO₂, fuel oil, trees. CALIBRATED to PEA: at the
 * ฿4.2/kWh tariff below it yields PEA's headline ฿480/kWp·month of savings
 * (1,371.43 × 4.2 = ฿5,760/yr). Sits at the conservative end of Thailand's real
 * PVOUT band (1,314–1,534 kWh/kWp, Global Solar Atlas).
 */
export const PV_SPECIFIC_YIELD_KWH_PER_KWP_YEAR = 1371.43;

/**
 * Production assumed when SIZING the system (kWh/kWp/yr) — the DESIGN yield.
 * PEA sizes more optimistically than it reports, and it picks the package whose
 * size is NEAREST to daytimeKwh / this yield (round-to-nearest tier, NOT snap-
 * down — see `pickPackage`). Calibrated against every confirmed three-phase
 * benchmark: ฿6,000/฿8,000 → 5 kW, ฿9,000/฿12,000 → 10, ฿14,500/฿15,000/฿16,000
 * → 15, ฿19,232 → 15. Those bracket the yield to (1,570, 1,657); 1,600 sits at
 * the centre and reproduces all of them. Kept separate from the reporting yield
 * on purpose ("size generously, promise conservatively"): the chosen tier can
 * out-produce the daytime load, and savings then cap at the load. If a future
 * tier-boundary case diverges from PEA, nudge THIS value within that window.
 */
export const PV_SIZING_YIELD_KWH_PER_KWP_YEAR = 1600;

/**
 * Peak sun hours (= daily GHI, kWh/m²/day), Thailand average.
 * Informational only — the yield figure above already encodes irradiance and
 * losses; kept for display/explanation. DEDE: ~50% of the country at 5.0–5.3.
 */
export const PEAK_SUN_HOURS_PER_DAY = 5;

// ──────────────────────────── Grid emissions ───────────────────────────

/**
 * Grid CO₂ displaced per kWh of solar (kg/kWh).
 * CALIBRATED to PEA: 0.3637 × 1,371.43 kWh/kWp = 498.8 kg/kWp·yr, matching
 * every benchmark (5 kW→2,494 · 15 kW→7,482 · 20 kW→9,976). This OVERRIDES the
 * official TGO Scope-2 factor (0.475) we used before — replicating PEA's
 * calculator takes priority over our own sourcing here. (For reference, TGO's
 * current grid factor is higher, ~0.475; PEA's calculator runs lower.)
 */
export const GRID_CO2_KG_PER_KWH = 0.3637;

// ───────────────────────────── Electricity tariff ──────────────────────

/**
 * Effective all-in retail tariff (THB/kWh, incl. Ft + 7% VAT). One blended
 * rate, used both for bill→kWh (sizing) and savings (PEA-style — PEA's public
 * calculator has no residential/business split). 4.2 is the ERC/MEA/PEA 2026
 * VAT-inclusive average; paired with the yield above it reproduces PEA's
 * ฿480/kWp·month exactly.
 * Source: ERC / MEA / PEA 2026 tariff schedules.
 */
export const TARIFF_THB_PER_KWH = 4.2;

// ──────────────────────────── Roof → capacity ──────────────────────────

/**
 * Gross module footprint per kWp (m²/kWp) for current ~450–600W mono-Si.
 * Verdict: confirmed (high). Pure geometry: 1/(efficiency·1kW/m²); 4.5 ≈ 22.2%
 * efficient modules that dominate sales. Range 4.0 (best-in-class) → 5.5.
 * Module-only — roof spacing is handled via the usable fraction below.
 */
export const AREA_PER_KWP_SQM = 4.5;

/**
 * Fraction of a measured roof footprint actually mountable after setbacks,
 * obstructions, access paths, inter-row spacing, and bad orientations.
 * Apply as: maxPanelKwp = roofArea_m² · USABLE_ROOF_FRACTION / AREA_PER_KWP_SQM
 *
 * PEA-CALIBRATED to an EFFECTIVE ~7.5 m²/kWp gross (0.6 · area / 4.5 = area/7.5),
 * tighter than the industry "75% rule" (6 m²/kWp). Pinned by a roof-area sweep at
 * a fixed ฿40,000 3-phase bill (so the roof, not load, binds): 60 m² → 5 kW,
 * 75 m² → 10, 120 m² → 15, 180 m² → 20 — all reproduced exactly at 0.6. The sweep
 * bounds the effective figure to (6, 7.5]; 0.6 sits at the top, where 75 m² is
 * exactly the 10 kWp threshold PEA returns. Roof cap = largest tier ≤ this (a
 * hard physical limit — never rounded up past the roof).
 */
export const USABLE_ROOF_FRACTION = 0.6;

// ─────────────────────── Environmental conversions ─────────────────────

/**
 * Fuel-oil-equivalent generation avoided per kWh of solar (litres/kWh).
 * CALIBRATED to PEA: 0.16039 × 1,371.43 = ~219.96 L/kWp·yr, matching every
 * benchmark size (5 kW→1,100 · 10 kW→2,200 · 15 kW→3,299 · 20 kW→4,399). The
 * 10 kW point pins the per-kWp factor to [219.95, 219.975]. 0.16 L/kWh is also
 * the standard thermal-generation figure, so this is physically sound.
 * NOTE: PEA's calculator reports FUEL OIL avoided — this REPLACES the "water
 * saved" metric the engine shipped with (which PEA does not display).
 */
export const FUEL_OIL_LITRES_PER_KWH = 0.16039;

/**
 * CO₂ absorbed by one tree over a 10-YEAR window (kg/tree), for PEA's
 * "trees (10-year equivalent)" metric.
 * CALIBRATED to PEA: annualCO₂ × 10 ÷ 618.5 reproduces the tree count of EVERY
 * benchmark to PEA's displayed integer (3 kW→24 · 5 kW→40 · 10 kW→76/81 ·
 * 15 kW→121 · 20 kW→161). Trees is PEA's noisiest output (small integers, heavy
 * rounding); the window that rounds all benchmarks correctly is [617.7, 619.4]
 * and 618.5 sits at its centre. (Implies ~62 kg/tree·yr — a large mature tree;
 * PEA's basis, not ours.)
 */
export const CO2_KG_PER_TREE_10YR = 618.5;

// ─────────────────────── Electrical connection limits ──────────────────

/**
 * Max system size by connection phase (kWp). PEA's public calculator is
 * driven purely by phase (no customer-segment input): single-phase tops out
 * at 5 kWp, three-phase at 20 kWp — confirmed by the benchmarks, where a
 * ฿52,000/mo three-phase bill (ideal ~68 kWp) still caps at 20 kWp.
 */
export const PHASE_MAX_KWP: Record<"single" | "three", number> = {
  single: 5,
  three: 20,
};

// ───────────────────────── System & financial model ────────────────────

/**
 * Economic lifetime used for lifetime-savings (years). 25 matches PEA's
 * "25-year savings" headline and panel performance warranties.
 */
export const SYSTEM_LIFETIME_YEARS = 25;

/**
 * Annual output degradation applied over the lifetime (fraction/yr).
 * Kept at 0 for PEA parity (PEA shows lifetime = annual × 25, flat).
 */
export const ANNUAL_DEGRADATION_FRACTION = 0;

// ───────────────────────── Verdict thresholds (policy) ──────────────────
// Not from PEA (PEA gives no verdict) — WS Energy's recommendation policy,
// decided in the grilling session (3-tier, payback-driven). Tunable.

/** Payback at or below this (years) → "Recommended" (great fit). */
export const VERDICT_PAYBACK_GREAT_YEARS = 7;

/** Payback above GREAT but at/below this (years) → "Worth considering". */
export const VERDICT_PAYBACK_OK_YEARS = 12;

/** Smallest system worth installing (kWp). Below this → "Not yet". */
export const MIN_VIABLE_KWP = 3;

// ──────────────────────────────── UI default ───────────────────────────

/** Default day/night usage split (fraction used during daylight). PEA defaults 50/50. */
export const DEFAULT_DAY_USAGE_FRACTION = 0.5;
