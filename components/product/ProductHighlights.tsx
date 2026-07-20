"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import {
  IconBattery,
  IconBolt,
  IconBoltOff,
  IconCertificate,
  IconClockHour3,
  IconCpu,
  IconCube,
  IconGauge,
  IconPlugConnected,
  IconShieldBolt,
  IconShieldCheck,
  IconSun,
  IconThermometer,
  IconTools,
  IconWifi,
  IconWorld,
} from "@tabler/icons-react";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const HIGHLIGHT_ICONS: Record<string, typeof IconShieldCheck> = {
  "shield-check": IconShieldCheck,
  "bolt-off": IconBoltOff,
  "plug-connected": IconPlugConnected,
  certificate: IconCertificate,
  gauge: IconGauge,
  bolt: IconBolt,
  sun: IconSun,
  battery: IconBattery,
  tools: IconTools,
  "shield-bolt": IconShieldBolt,
  thermometer: IconThermometer,
  world: IconWorld,
  clock: IconClockHour3,
  cube: IconCube,
  cpu: IconCpu,
  wifi: IconWifi,
};

export type HighlightItem = {
  icon?: string;
  title: string;
  credential?: string;
  body?: string;
};

/**
 * Pull a headline-worthy number out of a highlight title ("98.3% peak
 * efficiency" → 98.3 / "%" / "Peak efficiency"). Only a title that OPENS
 * with a unit-bearing number qualifies — mid-string digits ("Cuts string to
 * ≤10 V in <100 ms") would leave a garbled label after removal, and the
 * credential line carries standards codes ("IEC 62109 · AS 4777.2") whose
 * digits must never become a hero stat. An "Up to" qualifier is kept and
 * rendered small so the promoted number stays honest.
 */
const LEAD_RE =
  /^(up to\s+)?(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)\s*(%|kWh|kW|Wh|W|kVA|V|A|Hz|ms|yrs?|years?)(?![A-Za-z])\s*/i;

type Lead = {
  n: number;
  decimals: number;
  unit: string;
  label: string;
  approx: boolean;
};

function parseLead(item: HighlightItem): Lead | null {
  const m = item.title.match(LEAD_RE);
  if (!m) return null;
  const n = Number(m[2].replace(/,/g, ""));
  if (!Number.isFinite(n) || n > 100000) return null;
  const decimals = (m[2].split(".")[1] ?? "").length;
  const remainder = item.title
    .slice(m[0].length)
    .replace(/^[\s\-–·+:,]+/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  const label = remainder
    ? remainder.charAt(0).toUpperCase() + remainder.slice(1)
    : item.title;
  return { n, decimals, unit: m[3], label, approx: Boolean(m[1]) };
}

export function ProductHighlights({
  eyebrow,
  heading,
  items,
}: {
  eyebrow: string;
  heading: string;
  items: HighlightItem[];
}) {
  const leadIdx = items.findIndex((it) => parseLead(it) !== null);
  const lead = leadIdx >= 0 ? items[leadIdx] : null;
  const leadParsed = lead ? parseLead(lead) : null;
  const rows = items.filter((_, i) => i !== leadIdx);

  return (
    <section className="bg-forest-950">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <ScrollReveal className="mb-12 max-w-3xl md:mb-14">
          <MonoLabel tone="gold">{eyebrow}</MonoLabel>
          <h2
            className="mt-3 font-medium tracking-tight text-mist-50"
            style={{
              fontSize: "clamp(24px, 3.4vw, 36px)",
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
            }}
          >
            {heading}
          </h2>
        </ScrollReveal>

        {lead && leadParsed ? (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-0">
            <div className="lg:col-span-5 lg:border-r lg:border-mist-800 lg:pr-14">
              <ScrollReveal>
                <div className="text-gold-500 flex items-baseline gap-2 font-mono">
                  {leadParsed.approx ? (
                    <span className="text-gold-500/60 mr-1 text-base tracking-wider uppercase">
                      up to
                    </span>
                  ) : null}
                  <span
                    style={{
                      fontSize: "clamp(64px, 7vw, 92px)",
                      lineHeight: 1,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    <StatCount
                      n={leadParsed.n}
                      decimals={leadParsed.decimals}
                    />
                  </span>
                  <span className="text-gold-500/60 text-2xl md:text-3xl">
                    {leadParsed.unit}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-medium tracking-tight text-mist-50">
                  {leadParsed.label}
                </h3>
                {lead.credential ? (
                  <p className="text-caption text-gold-500/85 mt-1.5 font-mono tracking-wider uppercase">
                    {lead.credential}
                  </p>
                ) : null}
                {lead.body ? (
                  <p className="text-body mt-4 max-w-[42ch] text-mist-300">
                    {lead.body}
                  </p>
                ) : null}
              </ScrollReveal>
            </div>

            <div className="lg:col-span-7 lg:pl-14">
              <HighlightRows rows={rows} />
            </div>
          </div>
        ) : (
          <div className="max-w-4xl">
            <HighlightRows rows={rows} />
          </div>
        )}
      </div>
    </section>
  );
}

function HighlightRows({ rows }: { rows: HighlightItem[] }) {
  return (
    <ul className="divide-y divide-mist-800">
      {rows.map((h, i) => {
        const Icon =
          HIGHLIGHT_ICONS[h.icon ?? "shield-check"] ?? IconShieldCheck;
        return (
          <li key={i} className="py-7 first:pt-0 last:pb-0">
            <ScrollReveal delay={i * 0.06}>
              <div className="group/hl grid grid-cols-[2.25rem_1fr_auto] gap-x-4">
                <span className="text-caption group-hover/hl:text-gold-500 pt-1 font-mono text-mist-600 transition-colors">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="text-[19px] leading-snug font-medium tracking-tight text-mist-50">
                    {h.title}
                  </h3>
                  {h.credential ? (
                    <p className="text-caption text-gold-500/85 mt-1 font-mono tracking-wider uppercase">
                      {h.credential}
                    </p>
                  ) : null}
                  {h.body ? (
                    <p className="text-body mt-2.5 max-w-[58ch] text-mist-300">
                      {h.body}
                    </p>
                  ) : null}
                </div>
                <Icon
                  size={22}
                  stroke={1.5}
                  aria-hidden
                  className="group-hover/hl:text-gold-500 mt-1 text-mist-600 transition-colors"
                />
              </div>
            </ScrollReveal>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Counts up when scrolled into view. SSR (and reduced motion) renders the
 * final value; the animation only replaces it once the element is on screen,
 * so nothing below the fold ever sticks at zero.
 */
function StatCount({ n, decimals }: { n: number; decimals: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(n);

  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(0, n, {
      duration: 1.3,
      ease: "easeOut",
      onUpdate: (latest) => setValue(latest),
    });
    return () => controls.stop();
  }, [inView, n, reduced]);

  return (
    <span ref={ref}>
      {value.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}
