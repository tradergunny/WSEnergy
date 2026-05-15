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
        <h2 className="text-h2 font-medium text-mist-50">{t.heading}</h2>
        <p className="mt-1 text-body text-mist-400">{t.subhead}</p>
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
                  ? "border-gold-500 bg-gold-500/10 text-gold-500"
                  : "border-mist-800 text-mist-50 hover:border-mist-400"
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
          className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-[22px] py-[12px] text-body font-medium text-forest-900 transition-colors duration-150 hover:bg-gold-600"
        >
          {dict.rfq.next}
        </button>
      </div>
    </div>
  );
}
