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
        <h2 className="text-h2 font-medium text-mist-50">{t.heading}</h2>
        <p className="mt-1 text-body text-mist-400">{t.subhead}</p>
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
                  ? "border-gold-500 bg-gold-500/10 font-medium text-gold-500"
                  : "border-mist-800 text-mist-50 hover:border-mist-400"
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
