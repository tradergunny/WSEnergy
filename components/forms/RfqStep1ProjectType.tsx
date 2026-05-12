"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";

const OPTIONS = [
  { value: "ci-rooftop", labelKey: "ciRooftop" },
  { value: "solar-farm", labelKey: "solarFarm" },
  { value: "residential", labelKey: "residential" },
  { value: "other", labelKey: "other" },
] as const;

type Props = {
  dict: Dictionary;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
};

export function RfqStep1ProjectType({ dict, value, onChange, onNext }: Props) {
  const t = dict.rfq.step1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-h2 font-medium text-graphite-900 dark:text-graphite-50">{t.heading}</h2>
        <p className="mt-1 text-body text-graphite-600 dark:text-graphite-400">{t.subhead}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`rounded-lg border px-4 py-4 text-left text-body font-medium transition-colors duration-150 ${
                selected
                  ? "border-brand-600 bg-brand-50 text-brand-600 dark:bg-brand-900 dark:text-brand-200"
                  : "border-graphite-200 text-graphite-900 hover:border-graphite-400 dark:border-graphite-600 dark:text-graphite-50 dark:hover:border-graphite-400"
              }`}
            >
              {t[opt.labelKey as keyof typeof t]}
            </button>
          );
        })}
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-[22px] py-[12px] text-body font-medium text-white transition-colors duration-150 hover:bg-brand-800"
        >
          {dict.rfq.next}
        </button>
      </div>
    </div>
  );
}
