"use client";

import { useEffect, useMemo, useState } from "react";
import {
  IconBolt,
  IconCalendarStats,
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
import { MonoLabel } from "@/components/ui/MonoLabel";
import { estimate, type Phase } from "@/lib/estimator/engine";
import {
  buildEstimatePayload,
  encodeEstimateParam,
  ESTIMATOR_SOURCE,
} from "@/lib/estimator/lead";
import type { SolarPackageRow } from "@/lib/sanity/packages";
import { track } from "@/lib/analytics";

type Locale = "en" | "th";

/**
 * SolarEstimator — the interactive client island for /solar-calculator
 * (ROADMAP feature 3, Step 3). Holds the input state, runs the pure engine on
 * every change for instant feedback, and renders the verdict-first result.
 *
 * Roof area is TYPED here (the map is Step 8 — it will swap this one input).
 * Copy is inline th/en for now; the dictionary namespace lands in Step 7.
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

  const monthlyBillThb = Number(billInput) || 0;
  const roofAreaSqm = roofInput.trim() === "" ? null : Math.max(0, Number(roofInput) || 0);

  const result = useMemo(
    () => estimate({ monthlyBillThb, phase, dayUsageFraction, roofAreaSqm }, packages),
    [monthlyBillThb, phase, dayUsageFraction, roofAreaSqm, packages],
  );

  // Carry the current estimate into the quote form (Step 5 handoff).
  const quoteHref = `/${locale}/quote?source=${ESTIMATOR_SOURCE}&estimate=${encodeEstimateParam(
    buildEstimatePayload({ monthlyBillThb, phase, dayUsageFraction, roofAreaSqm }, result),
  )}`;

  const t = strings[locale];

  // Analytics: ping once per verdict transition, not on every keystroke.
  useEffect(() => {
    track("estimator_result_viewed", {
      verdict: result.verdict,
      verdictReason: result.verdictReason,
      recommendedKwp: result.recommendedKwp,
      phase,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.verdict, result.verdictReason]);

  // Defensive: the tool can't size anything without packages (e.g. Sanity
  // misconfigured / empty). Show a clear "unavailable" state, not a misleading
  // "your roof is too small".
  if (packages.length === 0) {
    return (
      <div className="rounded-2xl border border-mist-800 bg-forest-950/40 p-8 text-mist-300">
        {t.unavailable}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      {/* ── Inputs ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-7 rounded-2xl border border-mist-800 bg-forest-950/60 p-6 md:p-8">
        <FieldGroup label={t.billLabel} hint={t.billHint}>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body text-mist-400">
              ฿
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={billInput}
              onChange={(e) => setBillInput(e.target.value)}
              className="block w-full rounded-md border border-mist-800 bg-forest-800 py-2 pl-8 pr-3 text-body text-mist-50 transition-colors duration-150 placeholder:text-mist-400 focus:border-gold-500 focus:outline-none"
              placeholder="5000"
              aria-label={t.billLabel}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-caption text-mist-400">
              {t.perMonth}
            </span>
          </div>
        </FieldGroup>

        <FieldGroup label={t.phase} hint={phase === "single" ? t.phaseHintSingle : t.phaseHintThree}>
          <PillToggle
            value={phase}
            onChange={setPhase}
            options={[
              { value: "single", label: t.single, icon: <IconBolt size={16} stroke={1.75} /> },
              { value: "three", label: t.three, icon: <IconBolt size={16} stroke={1.75} /> },
            ]}
          />
        </FieldGroup>

        <FieldGroup label={t.dayUsage} hint={t.dayUsageHint}>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={Math.round(dayUsageFraction * 100)}
            onChange={(e) => setDayUsageFraction(Number(e.target.value) / 100)}
            className="w-full accent-gold-500"
            aria-label={t.dayUsage}
          />
          <div className="mt-2 flex items-center justify-between text-caption text-mist-400">
            <span>
              <IconSun size={13} stroke={1.75} className="mr-1 inline align-[-2px] text-gold-500" />
              {Math.round(dayUsageFraction * 100)}% {t.day}
            </span>
            <span>
              {100 - Math.round(dayUsageFraction * 100)}% {t.night}
            </span>
          </div>
        </FieldGroup>

        <FieldGroup label={t.roofLabel} hint={t.roofHint}>
          <div className="relative">
            <IconRulerMeasure
              size={16}
              stroke={1.75}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist-400"
            />
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={roofInput}
              onChange={(e) => setRoofInput(e.target.value)}
              className="block w-full rounded-md border border-mist-800 bg-forest-800 py-2 pl-9 pr-12 text-body text-mist-50 transition-colors duration-150 placeholder:text-mist-400 focus:border-gold-500 focus:outline-none"
              placeholder={t.roofPlaceholder}
              aria-label={t.roofLabel}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-caption text-mist-400">
              m²
            </span>
          </div>
        </FieldGroup>
      </div>

      {/* ── Results ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6">
        <VerdictBanner result={result} locale={locale} />

        {result.verdict !== "not_yet" ? (
          <>
            <section className="flex flex-col gap-4">
              <MonoLabel tone="mist">{t.yourSystem}</MonoLabel>
              <HeadlineCard result={result} locale={locale} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatTile
                  icon={<IconCoin size={20} stroke={1.5} />}
                  value={fmtThb(locale, result.monthlySavingsThb)}
                  label={t.monthlySavings}
                />
                <StatTile
                  icon={<IconClockHour4 size={20} stroke={1.5} />}
                  value={`${fmt1(result.paybackYears)} ${t.years}`}
                  label={t.payback}
                />
                <StatTile
                  icon={<IconCalendarStats size={20} stroke={1.5} />}
                  value={fmtThb(locale, result.lifetimeSavingsThb)}
                  label={t.lifetimeSavings}
                />
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <MonoLabel tone="mist">{t.environmentalImpact}</MonoLabel>
              <div className="grid grid-cols-3 gap-3">
                <EnvTile
                  icon={<IconLeaf size={18} stroke={1.5} />}
                  value={`${fmt0(locale, result.annualCo2SavedKg)} kg`}
                  label={t.co2}
                />
                <EnvTile
                  icon={<IconDroplet size={18} stroke={1.5} />}
                  value={`${fmt0(locale, result.annualFuelOilSavedLitres)} L`}
                  label={t.fuelOil}
                />
                <EnvTile
                  icon={<IconTrees size={18} stroke={1.5} />}
                  value={fmt0(locale, result.treesEquivalent)}
                  label={t.trees}
                />
              </div>
              {result.lifetimeCo2SavedKg > 0 ? (
                <p className="text-caption text-mist-500">
                  {t.lifetimeCo2Pre} {fmt0(locale, result.lifetimeCo2SavedKg / 1000)} {t.lifetimeCo2Post}
                </p>
              ) : null}
            </section>

            <div className="flex flex-col gap-3 rounded-xl border border-mist-800 bg-forest-950/40 p-4">
              <p className="text-caption text-mist-400">{t.disclaimer}</p>
              <Button
                href={quoteHref}
                variant="primary"
                size="md"
                className="self-start"
                onClick={() =>
                  track("estimator_quote_click", {
                    verdict: result.verdict,
                    recommendedKwp: result.recommendedKwp,
                  })
                }
              >
                {t.ctaQuote}
              </Button>
            </div>
          </>
        ) : (
          <EmptyState locale={locale} href={quoteHref} />
        )}
      </div>
    </div>
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
    <div className="rounded-2xl bg-card-50 p-6 text-card-ink" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-caption font-mono uppercase tracking-wider text-card-ink/55">
            {t.recommendedSystem}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-medium tracking-tight" style={{ fontSize: 44, lineHeight: 1 }}>
              {fmt1(result.recommendedKwp)}
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
            {result.priceThb != null ? fmtThb(locale, result.priceThb) : "—"}
          </div>
        </div>
      </div>
      {result.billOffsetPercent > 0 ? (
        <p className="mt-4 text-caption text-card-ink/65">
          {t.offsetPre}{" "}
          <span className="font-medium text-card-ink/90">
            ≈{Math.round(result.billOffsetPercent)}%
          </span>{" "}
          {t.offsetPost}
        </p>
      ) : null}
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

function StatTile({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div
      className="relative flex flex-col justify-between rounded-xl bg-card-50 p-5 text-card-ink"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="font-medium tracking-tight" style={{ fontSize: 26, lineHeight: 1.1 }}>
        {value}
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <span className="text-caption text-card-ink/65">{label}</span>
        <span className="text-gold-600/70" aria-hidden="true">
          {icon}
        </span>
      </div>
    </div>
  );
}

function EnvTile({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-mist-800 bg-forest-800/40 p-4">
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
      <span className="text-caption font-mono uppercase tracking-wider text-mist-400">{label}</span>
      {children}
      {hint ? <p className="text-caption text-mist-400/80">{hint}</p> : null}
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
  options: { value: T; label: string; icon?: React.ReactNode }[];
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
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-body font-medium transition-colors ${
              active
                ? "bg-gold-500 text-forest-900"
                : "border border-mist-400/30 text-mist-50 hover:border-mist-400/60 hover:bg-mist-50/5"
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
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
    day: "daytime",
    night: "night",
    roofLabel: "Usable roof area (optional)",
    roofHint: "Leave blank and we'll size to your usage. Add it to cap by what your roof can hold. (Roof drawing on a map is coming soon.)",
    roofPlaceholder: "e.g. 40",
    verdictEyebrow: "Our recommendation",
    recommendedSystem: "Recommended system",
    panels: "panels",
    roofLimited: "limited by your roof",
    noSystem: "No standard system fits these inputs yet.",
    fromPrice: "From",
    monthlySavings: "Saved / month",
    payback: "Payback",
    years: "yr",
    lifetimeSavings: "Saved over 25 yr",
    yourSystem: "Your system",
    offsetPre: "Covers",
    offsetPost: "of your monthly bill",
    environmentalImpact: "Environmental impact",
    co2: "CO₂ avoided / yr",
    fuelOil: "Fuel oil avoided / yr",
    trees: "Trees (10-yr equiv.)",
    lifetimeCo2Pre: "≈",
    lifetimeCo2Post: "tonnes of CO₂ avoided over 25 years",
    disclaimer: "This is an estimate based on typical conditions, not a binding quote. A site survey gives the exact figures.",
    emptyStateBody: "We couldn't size a worthwhile standard system from these inputs — but a site survey often surfaces options. Tell us about your site and our team will explore what's possible.",
    unavailable:
      "The calculator is being set up — please check back shortly, or contact our team for a manual estimate.",
    ctaQuote: "Get a detailed quote",
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
    verdictEyebrow: "คำแนะนำของเรา",
    recommendedSystem: "ระบบที่แนะนำ",
    panels: "แผง",
    roofLimited: "จำกัดด้วยขนาดหลังคา",
    noSystem: "ยังไม่มีระบบมาตรฐานที่เหมาะกับข้อมูลนี้",
    fromPrice: "เริ่มต้น",
    monthlySavings: "ประหยัด / เดือน",
    payback: "ระยะคืนทุน",
    years: "ปี",
    lifetimeSavings: "ประหยัดใน 25 ปี",
    yourSystem: "ระบบของคุณ",
    offsetPre: "ครอบคลุมประมาณ",
    offsetPost: "ของค่าไฟต่อเดือน",
    environmentalImpact: "ผลต่อสิ่งแวดล้อม",
    co2: "ลด CO₂ / ปี",
    fuelOil: "ลดน้ำมันเตา / ปี",
    trees: "เทียบเท่าต้นไม้ (10 ปี)",
    lifetimeCo2Pre: "≈",
    lifetimeCo2Post: "ตัน CO₂ ใน 25 ปี",
    disclaimer: "เป็นการประเมินเบื้องต้นจากสภาพทั่วไป ไม่ใช่ใบเสนอราคา การสำรวจหน้างานจะให้ตัวเลขที่แม่นยำ",
    emptyStateBody: "เรายังไม่สามารถจัดระบบมาตรฐานที่คุ้มค่าจากข้อมูลนี้ได้ แต่การสำรวจหน้างานมักพบทางเลือกเพิ่มเติม แจ้งรายละเอียดหน้างานของคุณ แล้วทีมงานจะช่วยหาแนวทางที่เป็นไปได้",
    unavailable:
      "เครื่องคำนวณกำลังตั้งค่า โปรดกลับมาใหม่อีกครั้ง หรือติดต่อทีมงานเพื่อขอประเมินด้วยตนเอง",
    ctaQuote: "ขอใบเสนอราคาแบบละเอียด",
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
