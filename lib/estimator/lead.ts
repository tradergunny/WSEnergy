/**
 * Estimator → RFQ handoff (ROADMAP feature 3, Step 5).
 *
 * Single source of truth for the data that rides from the Solar Estimator into
 * the quote form: the `EstimatePayload` shape, its zod schema (used to validate
 * the URL param on the server AND the POST body on the API route), the
 * URL-param encode/parse helpers, and the maps from estimator inputs to the
 * RFQ form's own projectType/projectSize vocabularies.
 *
 * Isomorphic: only imports are `zod` (isomorphic) and engine *types* (erased at
 * runtime), so it's safe in the client island, the server quote page, and the
 * API route alike.
 */

import { z } from "zod";
import type { EstimatorInput, EstimatorResult } from "./engine.ts";

// ──────────────────────────── Payload schema ───────────────────────────

/**
 * The structured estimate stored on the lead and shown back in the quote form.
 * Nullable fields cover the "no viable system" (Not yet) case, where there's no
 * package, price, or finite payback — we still carry the inputs + verdict so
 * sales has full context on why the tool said "not yet".
 */
export const estimatePayloadSchema = z.object({
  phase: z.enum(["single", "three"]),
  monthlyBillThb: z.number(),
  dayUsageFraction: z.number(),
  roofAreaSqm: z.number().nullable(),
  recommendedKwp: z.number(),
  packageId: z.string().nullable(),
  priceThb: z.number().nullable(),
  monthlySavingsThb: z.number(),
  annualSavingsThb: z.number(),
  paybackYears: z.number().nullable(),
  lifetimeSavingsThb: z.number(),
  annualCo2SavedKg: z.number(),
  verdict: z.enum(["recommended", "worth_considering", "not_yet"]),
});

export type EstimatePayload = z.infer<typeof estimatePayloadSchema>;

/** Marks a lead as originating from the estimator (vs. the plain quote form). */
export const ESTIMATOR_SOURCE = "estimator" as const;

/** What the quote page hands the RFQ form when the visit came from the estimator. */
export type RfqSeed = {
  source: typeof ESTIMATOR_SOURCE;
  estimate: EstimatePayload;
};

// ──────────────────────────────── Builders ─────────────────────────────

const r0 = (n: number) => Math.round(n);
const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => Math.round(n * 100) / 100;

/** Build the payload from the estimator's own input + result (rounded, JSON-safe). */
export function buildEstimatePayload(
  input: EstimatorInput,
  result: EstimatorResult,
): EstimatePayload {
  return {
    phase: input.phase,
    monthlyBillThb: r0(Math.max(0, input.monthlyBillThb)),
    dayUsageFraction: r2(input.dayUsageFraction),
    roofAreaSqm: input.roofAreaSqm != null ? r0(input.roofAreaSqm) : null,
    recommendedKwp: r1(result.recommendedKwp),
    packageId: result.package?._id ?? null,
    priceThb: result.priceThb,
    monthlySavingsThb: r0(result.monthlySavingsThb),
    annualSavingsThb: r0(result.annualSavingsThb),
    paybackYears: Number.isFinite(result.paybackYears) ? r1(result.paybackYears) : null,
    lifetimeSavingsThb: r0(result.lifetimeSavingsThb),
    annualCo2SavedKg: r0(result.annualCo2SavedKg),
    verdict: result.verdict,
  };
}

// ───────────────────────────── URL encode/parse ────────────────────────

/** Encode a payload for the `?estimate=` query param. */
export function encodeEstimateParam(payload: EstimatePayload): string {
  return encodeURIComponent(JSON.stringify(payload));
}

function safeDecode(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/**
 * Parse + validate the `?estimate=` param. Robust to whether the framework has
 * already URL-decoded it (tries raw then decoded). Returns null on anything
 * malformed — the quote page then just behaves like a normal visit.
 */
export function parseEstimateParam(raw: string | string[] | undefined): EstimatePayload | null {
  if (typeof raw !== "string" || raw === "") return null;
  for (const candidate of [raw, safeDecode(raw)]) {
    try {
      const parsed = estimatePayloadSchema.safeParse(JSON.parse(candidate));
      if (parsed.success) return parsed.data;
    } catch {
      // try next candidate
    }
  }
  return null;
}

// ──────────────────────── Estimator → RFQ vocab maps ────────────────────

/**
 * Recommended kWp → RFQ step-1 projectType value. With the segment toggle gone
 * (PEA-style, phase-only), we infer the install type from system size: small
 * systems read as residential rooftops, larger ones as C&I rooftops.
 */
export function projectTypeFromKwp(kwp: number): string {
  return kwp <= 10 ? "residential" : "ci-rooftop";
}

/** Recommended kWp → RFQ step-2 projectSize bucket. */
export function projectSizeFromKwp(kwp: number): string {
  if (kwp <= 10) return "<10kw";
  if (kwp <= 100) return "10-100kw";
  if (kwp <= 1000) return "100kw-1mw";
  if (kwp <= 5000) return "1-5mw";
  return "5mw+";
}

/**
 * Whether the company field should stay required for this lead. Relaxed for all
 * estimator leads — the calculator is a consumer-facing tool (PEA-style, no
 * segment), so homeowners arriving from it shouldn't be forced to enter one.
 * The plain quote form still requires a company.
 */
export function isCompanyRequired(source: string | undefined): boolean {
  return source !== ESTIMATOR_SOURCE;
}
