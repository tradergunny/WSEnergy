"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";

const OPTIONS = [
  { value: "<10kw", labelKey: "under10" },
  { value: "10-100kw", labelKey: "from10to100" },
  { value: "100kw-1mw", labelKey: "from100to1mw" },
  { value: "1-5mw", labelKey: "from1to5mw" },
  { value: "5mw+", labelKey: "over5mw" },
] as const;

type Props = {
  dict: Dictionary;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
};

export function RfqStep2Size({ dict, value, onChange, onNext, onBack }: Props) {
  const t = dict.rfq.step2;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-h2 font-medium text-mist-50">{t.heading}</h2>
        <p className="mt-1 text-body text-mist-400">{t.subhead}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`rounded-full border px-5 py-2.5 text-body font-medium transition-colors duration-150 ${
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
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-mist-400/40 bg-transparent px-[22px] py-[12px] text-body font-medium text-mist-50 transition-colors duration-150 hover:border-mist-400/70 hover:bg-mist-50/5"
        >
          {dict.rfq.back}
        </button>
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
