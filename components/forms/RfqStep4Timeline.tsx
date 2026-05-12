"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";

const OPTIONS = [
  { value: "this-month", labelKey: "thisMonth" },
  { value: "1-3-months", labelKey: "oneToThree" },
  { value: "3-6-months", labelKey: "threeToSix" },
  { value: "just-scoping", labelKey: "justScoping" },
] as const;

type Props = {
  dict: Dictionary;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
};

export function RfqStep4Timeline({
  dict,
  value,
  onChange,
  onNext,
  onBack,
}: Props) {
  const t = dict.rfq.step4;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-h2 font-medium text-graphite-900 dark:text-graphite-50">{t.heading}</h2>
        <p className="mt-1 text-body text-graphite-600 dark:text-graphite-400">{t.subhead}</p>
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
                  ? "border-brand-600 bg-brand-50 text-brand-600 dark:bg-brand-900 dark:text-brand-200"
                  : "border-graphite-200 text-graphite-900 hover:border-graphite-400 dark:border-graphite-600 dark:text-graphite-50 dark:hover:border-graphite-400"
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
          className="inline-flex items-center gap-2 rounded-md border border-graphite-600 bg-transparent px-[22px] py-[12px] text-body font-medium text-graphite-900 transition-colors duration-150 hover:bg-graphite-100 dark:border-graphite-400 dark:text-graphite-50 dark:hover:bg-graphite-800"
        >
          {dict.rfq.back}
        </button>
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
