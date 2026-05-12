"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";

const OPTIONS = [
  "rapidShutdown",
  "inverters",
  "ffSwitches",
  "batteryStorage",
  "optimizers",
  "microInverters",
  "evChargers",
  "accessories",
  "scada",
  "notSure",
] as const;

type Props = {
  dict: Dictionary;
  value: string[];
  onChange: (value: string[]) => void;
  onNext: () => void;
  onBack: () => void;
};

export function RfqStep3Products({
  dict,
  value,
  onChange,
  onNext,
  onBack,
}: Props) {
  const t = dict.rfq.step3;

  function toggle(key: string) {
    if (value.includes(key)) {
      onChange(value.filter((v) => v !== key));
    } else {
      onChange([...value, key]);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-h2 font-medium text-graphite-900 dark:text-graphite-50">{t.heading}</h2>
        <p className="mt-1 text-body text-graphite-600 dark:text-graphite-400">{t.subhead}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((key) => {
          const selected = value.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              className={`rounded-full border px-4 py-2 text-body transition-colors duration-150 ${
                selected
                  ? "border-brand-600 bg-brand-50 font-medium text-brand-600 dark:bg-brand-900 dark:text-brand-200"
                  : "border-graphite-200 text-graphite-900 hover:border-graphite-400 dark:border-graphite-600 dark:text-graphite-50 dark:hover:border-graphite-400"
              }`}
            >
              {t[key as keyof typeof t]}
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
