"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconArrowRight,
  IconCircleCheck,
  IconClockHour4,
  IconCoin,
  IconDroplet,
  IconInfoCircle,
  IconLeaf,
  IconRulerMeasure,
  IconSun,
  IconTrees,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { CountUp } from "@/components/ui/CountUp";
import { Input } from "@/components/ui/Input";
import { Magnetic } from "@/components/ui/Magnetic";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Slider } from "@/components/ui/Slider";
import { StatBlock } from "@/components/ui/StatBlock";
import {
  billToAnnualKwh,
  estimate,
  type EstimatorInput,
  type Phase,
} from "@/lib/estimator/engine";
import { SYSTEM_LIFETIME_YEARS } from "@/lib/estimator/constants.ts";
import {
  buildEstimatePayload,
  encodeEstimateParam,
  ESTIMATOR_SOURCE,
} from "@/lib/estimator/lead";
import type { SolarPackageRow } from "@/lib/sanity/packages";
import { track } from "@/lib/analytics";

type Locale = "en" | "th";

const BILL_PRESETS = [3000, 6000, 12000, 25000, 50000];
const TICKER_STAGE_MS = 200;

/**
 * SolarEstimator — the interactive client island for /solar-calculator
 * (ROADMAP feature 3). A guided journey, PEA-shaped: inputs → an explicit
 * "Calculate" moment → the results narrative reveals below and the page
 * scrolls to the verdict. Results FREEZE to the submitted inputs; edits mark
 * them stale until the user recalculates (honest page-flip, no half-live UI).
 *
 * The island owns its <section> bands (inputs / verdict+system / environment /
 * payback) so the forest-900/950 rhythm can alternate below the server hero.
 *
 * Roof area is TYPED here (the map is Step 8 — it will swap this one input).
 * Copy is inline th/en, matching the pre-redesign pattern.
 */
export function SolarEstimator({
  packages,
  locale,
}: {
  packages: SolarPackageRow[];
  locale: Locale;
}) {
  const [phase, setPhase] = useState<Phase>("single");
  const [billInput, setBillInput] = useState("5000");
  const [dayUsageFraction, setDayUsageFraction] = useState(0.5);
  const [roofInput, setRoofInput] = useState("");

  // Freeze + recalculate: results always derive from `submitted`, never from
  // the live fields. `runId` keys the results tree so CountUps re-run per calc.
  const [submitted, setSubmitted] = useState<EstimatorInput | null>(null);
  const [revealState, setRevealState] = useState<"idle" | "calculating" | "revealed">("idle");
  const [runId, setRunId] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const revealTimer = useRef<number | null>(null);

  const monthlyBillThb = Number(billInput) || 0;
  const roofAreaSqm = roofInput.trim() === "" ? null : Math.max(0, Number(roofInput) || 0);
  const dayPct = Math.round(dayUsageFraction * 100);

  const result = useMemo(
    () => (submitted ? estimate(submitted, packages) : null),
    [submitted, packages],
  );

  const stale =
    submitted != null &&
    (submitted.monthlyBillThb !== monthlyBillThb ||
      submitted.phase !== phase ||
      submitted.dayUsageFraction !== dayUsageFraction ||
      (submitted.roofAreaSqm ?? null) !== roofAreaSqm);

  // Quote handoff carries the FROZEN estimate the user is looking at.
  const quoteHref =
    submitted && result
      ? `/${locale}/quote?source=${ESTIMATOR_SOURCE}&estimate=${encodeEstimateParam(
          buildEstimatePayload(submitted, result),
        )}`
      : `/${locale}/quote?source=${ESTIMATOR_SOURCE}`;

  const t = strings[locale];

  useEffect(
    () => () => {
      if (revealTimer.current != null) window.clearTimeout(revealTimer.current);
    },
    [],
  );

  // Scroll to the verdict once the results exist in the DOM.
  useEffect(() => {
    if (revealState !== "revealed" || runId === 0) return;
    const el = resultsRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = (window as unknown as { lenis?: { scrollTo: (t: Element, o?: object) => void } })
      .lenis;
    if (!reduced && lenis) lenis.scrollTo(el, { offset: -16 });
    else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }, [revealState, runId]);

  const handleCalculate = () => {
    if (revealState === "calculating") return;
    const input: EstimatorInput = { monthlyBillThb, phase, dayUsageFraction, roofAreaSqm };
    const r = estimate(input, packages);
    setSubmitted(input);
    setRunId((n) => n + 1);
    track("estimator_result_viewed", {
      verdict: r.verdict,
      verdictReason: r.verdictReason,
      recommendedKwp: r.recommendedKwp,
      phase,
    });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setRevealState("revealed");
      return;
    }
    setRevealState("calculating");
    const stages = tickerStages(t, locale, input, r);
    revealTimer.current = window.setTimeout(
      () => setRevealState("revealed"),
      stages.length * TICKER_STAGE_MS + 300,
    );
  };

  const scrollToForm = () => {
    const el = formRef.current;
    if (!el) return;
    const lenis = (window as unknown as { lenis?: { scrollTo: (t: Element, o?: object) => void } })
      .lenis;
    if (lenis) lenis.scrollTo(el, { offset: -24 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Defensive: the tool can't size anything without packages (e.g. Sanity
  // misconfigured / empty). Show a clear "unavailable" state, not a misleading
  // "your roof is too small".
  if (packages.length === 0) {
    return (
      <section className="bg-forest-900">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="rounded-2xl border border-mist-800 bg-forest-950/40 p-8 text-mist-300">
            {t.unavailable}
          </div>
        </div>
      </section>
    );
  }

  const showResults = revealState === "revealed" && submitted != null && result != null;

  return (
    <>
      {/* ── Act 1 — inputs ─────────────────────────────────────── */}
      <section className="bg-forest-900">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div ref={formRef} className="mx-auto max-w-xl scroll-mt-24">
            <ScrollReveal>
              <MonoLabel tone="mist">{t.formEyebrow}</MonoLabel>
              <h2 className="text-h2 mt-3 font-medium text-mist-50">{t.formTitle}</h2>
            </ScrollReveal>

            <ScrollReveal delay={0.08}>
              <div className="mt-8 flex flex-col gap-7 rounded-2xl border border-mist-800 bg-forest-950/60 p-6 md:p-8">
                <div className="flex flex-col gap-3">
                  <Input
                    label={t.billLabel}
                    hint={t.billHint}
                    prefix="฿"
                    suffix={t.perMonth}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={billInput}
                    onChange={(e) => setBillInput(e.target.value)}
                    placeholder="5000"
                  />
                  <div className="flex flex-wrap gap-2">
                    {BILL_PRESETS.map((amount) => {
                      const active = monthlyBillThb === amount;
                      return (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setBillInput(String(amount))}
                          aria-pressed={active}
                          className={`rounded-full border px-3 py-1.5 text-caption tabular-nums transition-colors duration-200 ${
                            active
                              ? "border-gold-500 bg-gold-500 font-medium text-forest-900"
                              : "border-mist-400/30 text-mist-200 hover:border-mist-400/60 hover:bg-mist-50/5"
                          }`}
                        >
                          {fmtThb(locale, amount)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <FieldGroup
                  label={t.phase}
                  hint={phase === "single" ? t.phaseHintSingle : t.phaseHintThree}
                >
                  <PillToggle
                    value={phase}
                    onChange={setPhase}
                    options={[
                      { value: "single", label: t.single },
                      { value: "three", label: t.three },
                    ]}
                  />
                </FieldGroup>

                <FieldGroup label={t.dayUsage} hint={t.dayUsageHint}>
                  {/* Sun-arc: gold = daytime share, dark rail = night; the sun
                      thumb sits on the horizon between them. */}
                  <Slider
                    value={dayPct}
                    min={0}
                    max={100}
                    step={5}
                    onChange={(v) => setDayUsageFraction(v / 100)}
                    ariaLabel={t.dayUsage}
                    fillClassName="bg-gradient-to-r from-gold-500 to-gold-400"
                    railClassName="bg-forest-950 ring-1 ring-inset ring-mist-800"
                    thumbIcon={<IconSun size={14} stroke={2} />}
                  />
                  <div className="mt-2 flex items-center justify-between font-mono text-caption uppercase tracking-wider">
                    <span className="text-gold-500">
                      {dayPct}% {t.day}
                    </span>
                    <span className="text-mist-400">
                      {100 - dayPct}% {t.night}
                    </span>
                  </div>
                </FieldGroup>

                <Input
                  label={t.roofLabel}
                  hint={t.roofHint}
                  prefix={<IconRulerMeasure size={16} stroke={1.75} />}
                  suffix="m²"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={roofInput}
                  onChange={(e) => setRoofInput(e.target.value)}
                  placeholder={t.roofPlaceholder}
                />

                <div className="flex flex-col gap-3 pt-1">
                  <Magnetic className="block" strength={0.25}>
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      onClick={handleCalculate}
                      disabled={revealState === "calculating"}
                    >
                      {submitted ? t.recalculate : t.calculate}
                      <IconArrowRight
                        size={18}
                        stroke={2}
                        className="transition-transform duration-200 group-hover/btn:translate-x-px"
                      />
                    </Button>
                  </Magnetic>
                  {revealState === "calculating" && submitted && result ? (
                    <CalcTicker stages={tickerStages(t, locale, submitted, result)} />
                  ) : null}
                  {stale && revealState === "revealed" ? (
                    <p className="text-caption text-gold-500/90" role="status">
                      {t.staleNote}
                    </p>
                  ) : null}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── The results narrative ──────────────────────────────── */}
      {showResults ? (
        <div
          key={runId}
          ref={resultsRef}
          className={`scroll-mt-16 transition-opacity duration-300 ${stale ? "opacity-50" : ""}`}
        >
          {/* Act 2 — verdict + your system */}
          <section className="bg-forest-950">
            <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
              <div className="mx-auto flex max-w-2xl flex-col gap-10">
                <ScrollReveal>
                  <VerdictBanner result={result} locale={locale} />
                </ScrollReveal>

                {result.verdict !== "not_yet" ? (
                  <div className="flex flex-col gap-5">
                    <ScrollReveal>
                      <MonoLabel tone="mist">{t.yourSystem}</MonoLabel>
                      <h2 className="text-h2 mt-3 font-medium text-mist-50">{t.systemTitle}</h2>
                    </ScrollReveal>
                    <ScrollReveal delay={0.05}>
                      <HeadlineCard result={result} locale={locale} />
                    </ScrollReveal>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <ScrollReveal delay={0.1}>
                        <StatBlock
                          value={
                            <CountUp to={Math.round(result.monthlySavingsThb)} prefix="฿" />
                          }
                          label={t.monthlySavings}
                          icon={<IconCoin size={22} stroke={1.5} />}
                          className="h-full"
                        />
                      </ScrollReveal>
                      <ScrollReveal delay={0.15}>
                        <StatBlock
                          value={
                            <CountUp to={Math.round(result.billOffsetPercent)} prefix="≈" suffix="%" />
                          }
                          label={t.offsetLabel}
                          icon={<IconSun size={22} stroke={1.5} />}
                          className="h-full"
                        />
                      </ScrollReveal>
                    </div>
                  </div>
                ) : (
                  <EmptyState locale={locale} href={quoteHref} />
                )}
              </div>
            </div>
          </section>

          {result.verdict !== "not_yet" ? (
            <>
              {/* Act 3 — environment */}
              <section className="bg-forest-900">
                <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
                  <div className="mx-auto flex max-w-2xl flex-col gap-5">
                    <ScrollReveal>
                      <MonoLabel tone="mist">{t.environmentalImpact}</MonoLabel>
                      <h2 className="text-h2 mt-3 font-medium text-mist-50">{t.envTitle}</h2>
                    </ScrollReveal>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <ScrollReveal delay={0.05}>
                        <EnvTile
                          icon={<IconLeaf size={18} stroke={1.5} />}
                          value={<CountUp to={Math.round(result.annualCo2SavedKg)} suffix=" kg" />}
                          label={t.co2}
                        />
                      </ScrollReveal>
                      <ScrollReveal delay={0.1}>
                        <EnvTile
                          icon={<IconDroplet size={18} stroke={1.5} />}
                          value={
                            <CountUp to={Math.round(result.annualFuelOilSavedLitres)} suffix=" L" />
                          }
                          label={t.fuelOil}
                        />
                      </ScrollReveal>
                      <ScrollReveal delay={0.15}>
                        <EnvTile
                          icon={<IconTrees size={18} stroke={1.5} />}
                          value={<CountUp to={Math.round(result.treesEquivalent)} />}
                          label={t.trees}
                        />
                      </ScrollReveal>
                    </div>
                    {result.lifetimeCo2SavedKg > 0 ? (
                      <ScrollReveal delay={0.2}>
                        <p className="text-caption text-mist-500">
                          ≈ {fmt0(locale, result.lifetimeCo2SavedKg / 1000)} {t.lifetimeCo2Post}
                        </p>
                      </ScrollReveal>
                    ) : null}
                  </div>
                </div>
              </section>

              {/* Act 4 — payback */}
              <section className="bg-forest-950">
                <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
                  <div className="mx-auto flex max-w-2xl flex-col gap-8">
                    <ScrollReveal>
                      <MonoLabel tone="gold">{t.paybackEyebrow}</MonoLabel>
                      <h2 className="text-h2 mt-3 font-medium text-mist-50">{t.paybackTitle}</h2>
                    </ScrollReveal>
                    <ScrollReveal delay={0.05}>
                      <PaybackCard result={result} locale={locale} />
                    </ScrollReveal>
                    <ScrollReveal delay={0.1}>
                      <div>
                        <p className="text-caption font-medium text-mist-300">{t.notesTitle}</p>
                        <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-4 text-caption text-mist-500">
                          {t.notes.map((note) => (
                            <li key={note}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    </ScrollReveal>
                    <ScrollReveal delay={0.15}>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          href={quoteHref}
                          variant="primary"
                          size="md"
                          onClick={() =>
                            track("estimator_quote_click", {
                              verdict: result.verdict,
                              recommendedKwp: result.recommendedKwp,
                            })
                          }
                        >
                          {t.ctaQuote}
                          <IconArrowRight
                            size={16}
                            stroke={2}
                            className="transition-transform duration-200 group-hover/btn:translate-x-px"
                          />
                        </Button>
                        <Button variant="secondary" size="md" onClick={scrollToForm}>
                          {t.ctaAdjust}
                        </Button>
                      </div>
                    </ScrollReveal>
                  </div>
                </div>
              </section>
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

/* ─────────────────────────── Result pieces ─────────────────────────── */

function VerdictBanner({
  result,
  locale,
}: {
  result: ReturnType<typeof estimate>;
  locale: Locale;
}) {
  const t = strings[locale];
  const theme = verdictTheme(result.verdict);
  const Icon = theme.icon;
  const reasonCopy = t.reasons[result.verdictReason];

  return (
    <div className={`relative flex items-start gap-4 overflow-hidden rounded-2xl border p-5 pl-6 ${theme.container}`}>
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${theme.bar}`} />
      <div className={`mt-0.5 shrink-0 ${theme.iconColor}`}>
        <Icon size={30} stroke={1.5} />
      </div>
      <div>
        <p className={`text-caption font-mono uppercase tracking-wider ${theme.eyebrow}`}>
          {t.verdictEyebrow}
        </p>
        <h3 className="mt-1 font-medium tracking-tight text-mist-50" style={{ fontSize: 24, lineHeight: 1.15 }}>
          {t.verdictTitle[result.verdict]}
        </h3>
        <p className="text-body mt-2 text-mist-300">{reasonCopy}</p>
      </div>
    </div>
  );
}

function HeadlineCard({
  result,
  locale,
}: {
  result: ReturnType<typeof estimate>;
  locale: Locale;
}) {
  const t = strings[locale];
  const components = result.package?.includedComponents ?? [];

  return (
    <div className="rounded-2xl bg-card-50 p-6 text-card-ink md:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <MonoLabel tone="forest">{t.recommendedSystem}</MonoLabel>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-medium tracking-tight" style={{ fontSize: 44, lineHeight: 1 }}>
              <CountUp to={result.recommendedKwp} decimals={1} />
            </span>
            <span className="text-body-lg text-card-ink/70">kW</span>
          </div>
          {result.panelCount ? (
            <p className="mt-1.5 text-caption text-card-ink/60">
              {result.panelCount} {t.panels}
              {result.roofLimited ? ` · ${t.roofLimited}` : ""}
            </p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-caption font-mono uppercase tracking-wider text-card-ink/55">
            {t.fromPrice}
          </p>
          <div className="mt-1 font-medium tracking-tight" style={{ fontSize: 28, lineHeight: 1 }}>
            {result.priceThb != null ? <CountUp to={result.priceThb} prefix="฿" /> : "—"}
          </div>
        </div>
      </div>
      {components.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-forest-900/10 pt-4">
          {components.map((c) => (
            <span
              key={c}
              className="rounded-full bg-forest-900/5 px-2.5 py-1 text-caption text-card-ink/70"
            >
              {c}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * The payback act's centerpiece — PEA's strongest section rebuilt in brand
 * language: headline years, a 25-year timeline (gold until breakeven, quiet
 * after), itemized savings lines, and the package recap in mono.
 */
function PaybackCard({
  result,
  locale,
}: {
  result: ReturnType<typeof estimate>;
  locale: Locale;
}) {
  const t = strings[locale];
  const payback = result.paybackYears;
  const pct = Number.isFinite(payback)
    ? Math.min(96, Math.max(4, (payback / SYSTEM_LIFETIME_YEARS) * 100))
    : 100;
  const phaseLabel = result.package?.phase === "single" ? t.single : t.three;

  return (
    <div className="rounded-2xl bg-card-50 p-6 text-card-ink md:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
      <MonoLabel tone="forest">{t.paybackLabel}</MonoLabel>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-medium tracking-tight" style={{ fontSize: 44, lineHeight: 1 }}>
          {Number.isFinite(payback) ? <CountUp to={payback} decimals={1} /> : "—"}
        </span>
        <span className="text-body-lg text-card-ink/70">{t.yearsLong}</span>
      </div>
      <p className="mt-2 font-mono text-caption uppercase tracking-wider text-card-ink/55">
        {phaseLabel} · {fmt1(result.recommendedKwp)} kW · {t.fromPrice}{" "}
        {result.priceThb != null ? fmtThb(locale, result.priceThb) : "—"}
      </p>

      {/* 25-year timeline: gold = paying itself off, quiet = pure savings */}
      <div className="mt-6" aria-hidden="true">
        <div className="relative">
          <div className="flex h-2.5 overflow-hidden rounded-full">
            <div className="rounded-l-full bg-gold-500" style={{ width: `${pct}%` }} />
            <div className="flex-1 bg-forest-900/10" />
          </div>
          <div
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card-50 bg-forest-900"
            style={{ left: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-4 text-caption">
          <span className="font-medium text-card-ink/80">{t.tlPayoff}</span>
          <span className="text-right text-card-ink/60">{t.tlProfit}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col divide-y divide-forest-900/10 border-t border-forest-900/10">
        <PaybackRow label={t.savedPerYear} value={fmtThb(locale, result.annualSavingsThb)} />
        <PaybackRow label={t.savedLifetime} value={fmtThb(locale, result.lifetimeSavingsThb)} />
      </div>
    </div>
  );
}

function PaybackRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="flex items-center gap-2 text-body text-card-ink/80">
        <IconCircleCheck size={18} stroke={1.5} className="shrink-0 text-gold-600" />
        {label}
      </span>
      <span className="font-mono text-body font-medium tabular-nums text-card-ink">{value}</span>
    </div>
  );
}

function EmptyState({ locale, href }: { locale: Locale; href: string }) {
  const t = strings[locale];
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-mist-800 bg-forest-950/40 p-6">
      <span className="text-mist-400" aria-hidden="true">
        <IconInfoCircle size={24} stroke={1.5} />
      </span>
      <p className="text-body max-w-md text-mist-200">{t.emptyStateBody}</p>
      <Button
        href={href}
        variant="primary"
        size="md"
        onClick={() => track("estimator_quote_click", { verdict: "not_yet" })}
      >
        {t.ctaTalk}
      </Button>
      <p className="text-caption text-mist-500">{t.disclaimer}</p>
    </div>
  );
}

function EnvTile({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex h-full flex-col gap-1 rounded-xl border border-mist-800 bg-forest-800/40 p-4">
      <span className="text-gold-500/80" aria-hidden="true">
        {icon}
      </span>
      <span className="mt-1 text-body font-medium text-mist-50">{value}</span>
      <span className="text-caption text-mist-400">{label}</span>
    </div>
  );
}

/* ─────────────────────────── Input pieces ──────────────────────────── */

function FieldGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-caption font-medium text-mist-200">{label}</span>
      {children}
      {hint ? <p className="text-caption text-mist-400">{hint}</p> : null}
    </div>
  );
}

function PillToggle<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-body font-medium transition-colors duration-200 ${
              active
                ? "bg-gold-500 text-forest-900"
                : "border border-mist-400/30 text-mist-50 hover:border-mist-400/60 hover:bg-mist-50/5"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * The calculation ticker — the honest pipeline (bill → kWh → daytime share →
 * size → payback) with REAL intermediate numbers, typed out mono while the
 * reveal is pending. Skipped entirely under reduced motion (the reveal is
 * instant there, so this never renders).
 */
function CalcTicker({ stages }: { stages: string[] }) {
  const [visible, setVisible] = useState(1);
  useEffect(() => {
    const id = window.setInterval(
      () => setVisible((n) => Math.min(n + 1, stages.length)),
      TICKER_STAGE_MS,
    );
    return () => window.clearInterval(id);
  }, [stages.length]);

  return (
    <p className="font-mono text-caption text-mist-400" role="status" aria-live="polite">
      {stages.slice(0, visible).join(" → ")}
      <span aria-hidden="true" className="ml-0.5 animate-pulse text-gold-500">
        ▍
      </span>
    </p>
  );
}

function tickerStages(
  t: (typeof strings)[Locale],
  locale: Locale,
  input: EstimatorInput,
  result: ReturnType<typeof estimate>,
): string[] {
  const annualKwh = billToAnnualKwh(input.monthlyBillThb);
  const dayPct = Math.round(input.dayUsageFraction * 100);
  const stages = [
    `฿${fmt0(locale, input.monthlyBillThb)}/${t.monthShort}`,
    `${fmt0(locale, annualKwh)} kWh/${t.yearShort}`,
    `${dayPct}% ${t.day}`,
    result.recommendedKwp > 0 ? `${fmt1(result.recommendedKwp)} kW` : t.tickerNoFit,
  ];
  if (result.recommendedKwp > 0 && Number.isFinite(result.paybackYears)) {
    stages.push(`${fmt1(result.paybackYears)} ${t.years}`);
  }
  return stages;
}

/* ─────────────────────────── Theme + format ────────────────────────── */

function verdictTheme(verdict: ReturnType<typeof estimate>["verdict"]) {
  switch (verdict) {
    case "recommended":
      return {
        container: "border-gold-500/40 bg-gold-500/10",
        bar: "bg-gold-500",
        iconColor: "text-gold-500",
        eyebrow: "text-gold-500",
        icon: IconCircleCheck,
      };
    case "worth_considering":
      return {
        container: "border-mist-400/30 bg-mist-50/5",
        bar: "bg-mist-300",
        iconColor: "text-mist-200",
        eyebrow: "text-mist-300",
        icon: IconInfoCircle,
      };
    default:
      return {
        container: "border-mist-800 bg-forest-950/60",
        bar: "bg-mist-600",
        iconColor: "text-mist-400",
        eyebrow: "text-mist-400",
        icon: IconClockHour4,
      };
  }
}

const fmtThb = (locale: Locale, n: number) =>
  "฿" + new Intl.NumberFormat(locale === "th" ? "th-TH" : "en-US", { maximumFractionDigits: 0 }).format(Math.round(n));

const fmt0 = (locale: Locale, n: number) =>
  new Intl.NumberFormat(locale === "th" ? "th-TH" : "en-US", { maximumFractionDigits: 0 }).format(Math.round(n));

const fmt1 = (n: number) => (Math.round(n * 10) / 10).toString();

/* ─────────────────────────── Strings (th/en) ───────────────────────── */

const strings = {
  en: {
    formEyebrow: "The inputs",
    formTitle: "Three questions, thirty seconds",
    billLabel: "Average monthly electricity bill",
    billHint: "Your typical bill across the year.",
    perMonth: "/ month",
    phase: "Electrical connection",
    single: "Single-phase",
    three: "Three-phase",
    phaseHintSingle: "Most homes. Caps the system at about 5 kW.",
    phaseHintThree: "Larger homes & businesses. Up to about 20 kW.",
    dayUsage: "When do you use power?",
    dayUsageHint: "Without a battery, solar only offsets daytime use.",
    day: "day",
    night: "night",
    roofLabel: "Usable roof area (optional)",
    roofHint: "Leave blank and we'll size to your usage. Add it to cap by what your roof can hold. (Roof drawing on a map is coming soon.)",
    roofPlaceholder: "e.g. 40",
    calculate: "Calculate my system",
    recalculate: "Recalculate",
    staleNote: "Inputs changed — recalculate to refresh the results below.",
    monthShort: "mo",
    yearShort: "yr",
    tickerNoFit: "no standard fit",
    verdictEyebrow: "Our recommendation",
    yourSystem: "Your system",
    systemTitle: "Sized to your daytime usage",
    recommendedSystem: "Recommended system",
    panels: "panels",
    roofLimited: "limited by your roof",
    fromPrice: "From",
    monthlySavings: "Saved per month",
    offsetLabel: "of your monthly bill covered",
    environmentalImpact: "Environmental impact",
    envTitle: "What your roof gives back",
    co2: "CO₂ avoided / yr",
    fuelOil: "Fuel oil avoided / yr",
    trees: "Trees (10-yr equiv.)",
    lifetimeCo2Post: "tonnes of CO₂ avoided over 25 years",
    paybackEyebrow: "Payback",
    paybackTitle: "When it pays for itself",
    paybackLabel: "Payback period",
    years: "yr",
    yearsLong: "years",
    tlPayoff: "paying itself off",
    tlProfit: "pure savings to year 25",
    savedPerYear: "Electricity saved per year",
    savedLifetime: "Saved over 25 years",
    notesTitle: "Notes",
    notes: [
      "This is an estimate based on typical conditions, not a binding quote — a site survey gives the exact figures.",
      "Package prices are indicative and confirmed after a site visit.",
      "Payback varies with weather, roof orientation and shading, usage pattern, and maintenance.",
    ],
    disclaimer: "This is an estimate based on typical conditions, not a binding quote. A site survey gives the exact figures.",
    emptyStateBody: "We couldn't size a worthwhile standard system from these inputs — but a site survey often surfaces options. Tell us about your site and our team will explore what's possible.",
    unavailable:
      "The calculator is being set up — please check back shortly, or contact our team for a manual estimate.",
    ctaQuote: "Get a detailed quote",
    ctaAdjust: "Adjust inputs",
    ctaTalk: "Talk to our team",
    verdictTitle: {
      recommended: "Recommended — install solar",
      worth_considering: "Worth considering",
      not_yet: "Not yet",
    } as Record<string, string>,
    reasons: {
      great_payback: "Strong payback. Solar makes clear financial sense for this roof.",
      ok_payback: "Solid long-term savings — a comfortable payback for a 25-year system.",
      slow_payback: "Solar still pays for itself over its lifetime — ask us about financing to shorten the payback.",
      roof_too_small: "Your roof is too small for a worthwhile system right now.",
      low_daytime_offset: "Add your monthly bill (and some daytime usage) and we'll size a system for you.",
      no_package: "No standard package fits these inputs — our team can design a custom system.",
    } as Record<string, string>,
  },
  th: {
    formEyebrow: "ข้อมูลของคุณ",
    formTitle: "3 คำถาม ใน 30 วินาที",
    billLabel: "ค่าไฟเฉลี่ยต่อเดือน",
    billHint: "ค่าไฟโดยทั่วไปตลอดทั้งปี",
    perMonth: "/ เดือน",
    phase: "ระบบไฟฟ้า",
    single: "1 เฟส",
    three: "3 เฟส",
    phaseHintSingle: "บ้านทั่วไป จำกัดระบบที่ประมาณ 5 kW",
    phaseHintThree: "บ้านหลังใหญ่และธุรกิจ รองรับสูงสุดประมาณ 20 kW",
    dayUsage: "ใช้ไฟช่วงไหนมากที่สุด?",
    dayUsageHint: "หากไม่มีแบตเตอรี่ โซลาร์ช่วยลดค่าไฟเฉพาะช่วงกลางวัน",
    day: "กลางวัน",
    night: "กลางคืน",
    roofLabel: "พื้นที่หลังคาที่ใช้ได้ (ไม่บังคับ)",
    roofHint: "เว้นว่างไว้เพื่อให้เราคำนวณตามการใช้ไฟ หรือกรอกเพื่อจำกัดตามขนาดหลังคา (การวาดหลังคาบนแผนที่กำลังจะมา)",
    roofPlaceholder: "เช่น 40",
    calculate: "คำนวณขนาดติดตั้ง",
    recalculate: "คำนวณอีกครั้ง",
    staleNote: "ข้อมูลเปลี่ยนแล้ว — กดคำนวณอีกครั้งเพื่ออัปเดตผลด้านล่าง",
    monthShort: "เดือน",
    yearShort: "ปี",
    tickerNoFit: "ไม่มีขนาดมาตรฐานที่พอดี",
    verdictEyebrow: "คำแนะนำของเรา",
    yourSystem: "ระบบของคุณ",
    systemTitle: "ขนาดที่พอดีกับการใช้ไฟกลางวันของคุณ",
    recommendedSystem: "ระบบที่แนะนำ",
    panels: "แผง",
    roofLimited: "จำกัดด้วยขนาดหลังคา",
    fromPrice: "เริ่มต้น",
    monthlySavings: "ประหยัดต่อเดือน",
    offsetLabel: "ของค่าไฟต่อเดือนที่ครอบคลุม",
    environmentalImpact: "ผลต่อสิ่งแวดล้อม",
    envTitle: "สิ่งที่หลังคาของคุณตอบแทน",
    co2: "ลด CO₂ / ปี",
    fuelOil: "ลดน้ำมันเตา / ปี",
    trees: "เทียบเท่าต้นไม้ (10 ปี)",
    lifetimeCo2Post: "ตัน CO₂ ใน 25 ปี",
    paybackEyebrow: "ความคุ้มทุน",
    paybackTitle: "จุดที่ระบบคืนทุน",
    paybackLabel: "ระยะเวลาคืนทุน",
    years: "ปี",
    yearsLong: "ปี",
    tlPayoff: "ช่วงคืนทุน",
    tlProfit: "ประหยัดล้วน ๆ ถึงปีที่ 25",
    savedPerYear: "ค่าไฟที่ประหยัดได้ต่อปี",
    savedLifetime: "ค่าไฟที่ประหยัดไปได้ใน 25 ปี",
    notesTitle: "หมายเหตุ",
    notes: [
      "เป็นการประเมินเบื้องต้นจากสภาพทั่วไป ไม่ใช่ใบเสนอราคา การสำรวจหน้างานจะให้ตัวเลขที่แม่นยำ",
      "ราคาแพ็กเกจเป็นราคาประเมินเบื้องต้น ยืนยันหลังสำรวจหน้างาน",
      "ความคุ้มทุนขึ้นอยู่กับสภาพอากาศ ทิศทางและเงาบนหลังคา พฤติกรรมการใช้ไฟ และการบำรุงรักษา",
    ],
    disclaimer: "เป็นการประเมินเบื้องต้นจากสภาพทั่วไป ไม่ใช่ใบเสนอราคา การสำรวจหน้างานจะให้ตัวเลขที่แม่นยำ",
    emptyStateBody: "เรายังไม่สามารถจัดระบบมาตรฐานที่คุ้มค่าจากข้อมูลนี้ได้ แต่การสำรวจหน้างานมักพบทางเลือกเพิ่มเติม แจ้งรายละเอียดหน้างานของคุณ แล้วทีมงานจะช่วยหาแนวทางที่เป็นไปได้",
    unavailable:
      "เครื่องคำนวณกำลังตั้งค่า โปรดกลับมาใหม่อีกครั้ง หรือติดต่อทีมงานเพื่อขอประเมินด้วยตนเอง",
    ctaQuote: "ขอใบเสนอราคาแบบละเอียด",
    ctaAdjust: "ปรับข้อมูลใหม่",
    ctaTalk: "ปรึกษาทีมงาน",
    verdictTitle: {
      recommended: "แนะนำให้ติดตั้งโซลาร์",
      worth_considering: "น่าพิจารณา",
      not_yet: "ยังไม่แนะนำในตอนนี้",
    } as Record<string, string>,
    reasons: {
      great_payback: "คืนทุนเร็ว โซลาร์คุ้มค่าอย่างชัดเจนสำหรับหลังคานี้",
      ok_payback: "ประหยัดระยะยาวคุ้มค่า คืนทุนในระดับที่สบายสำหรับระบบอายุ 25 ปี",
      slow_payback: "โซลาร์ยังคืนทุนได้ภายในอายุการใช้งาน ปรึกษาเราเรื่องแผนผ่อนเพื่อให้คืนทุนเร็วขึ้น",
      roof_too_small: "หลังคาของคุณเล็กเกินไปสำหรับระบบที่คุ้มค่าในตอนนี้",
      low_daytime_offset: "กรอกค่าไฟต่อเดือน (และสัดส่วนการใช้ไฟกลางวัน) แล้วเราจะคำนวณระบบให้",
      no_package: "ไม่มีแพ็กเกจมาตรฐานที่เหมาะกับข้อมูลนี้ ทีมงานออกแบบระบบเฉพาะให้ได้",
    } as Record<string, string>,
  },
} as const;
