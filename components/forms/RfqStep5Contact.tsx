"use client";

import { useRef } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Input, Textarea } from "@/components/ui/Input";

type ContactData = {
  name: string;
  company: string;
  email: string;
  phone: string;
  role: string;
  notes: string;
  file: File | null;
};

type Props = {
  dict: Dictionary;
  value: ContactData;
  onChange: (value: ContactData) => void;
  errors: Record<string, string>;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
  companyRequired?: boolean;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/octet-stream",
];
const ACCEPTED_EXTENSIONS = [".pdf", ".dwg", ".xlsx"];

export function RfqStep5Contact({
  dict,
  value,
  onChange,
  errors,
  onSubmit,
  onBack,
  submitting,
  companyRequired = true,
}: Props) {
  const t = dict.rfq.step5;
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof ContactData>(key: K, val: ContactData[K]) {
    onChange({ ...value, [key]: val });
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (!ACCEPTED_EXTENSIONS.includes(ext) && !ACCEPTED_TYPES.includes(file.type)) {
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        return;
      }
    }
    set("file", file);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-h2 font-medium text-mist-50">{t.heading}</h2>
        <p className="mt-1 text-body text-mist-400">{t.subhead}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t.nameLabel}
          required
          value={value.name}
          onChange={(e) => set("name", e.target.value)}
          error={errors.name}
        />
        <Input
          label={t.companyLabel}
          required={companyRequired}
          value={value.company}
          onChange={(e) => set("company", e.target.value)}
          error={errors.company}
        />
        <Input
          label={t.emailLabel}
          required
          type="email"
          value={value.email}
          onChange={(e) => set("email", e.target.value)}
          error={errors.email}
        />
        <Input
          label={t.phoneLabel}
          required
          type="tel"
          value={value.phone}
          onChange={(e) => set("phone", e.target.value)}
          error={errors.phone}
        />
        <Input
          label={t.roleLabel}
          value={value.role}
          onChange={(e) => set("role", e.target.value)}
          className="sm:col-span-2"
        />
        <Textarea
          label={t.notesLabel}
          value={value.notes}
          onChange={(e) => set("notes", e.target.value)}
          className="sm:col-span-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-caption text-mist-200 font-medium">
          {t.fileLabel}
        </label>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.dwg,.xlsx"
          onChange={handleFile}
          className="text-body text-mist-400 file:mr-3 file:rounded-md file:border file:border-mist-800 file:bg-forest-800 file:px-3 file:py-1.5 file:text-caption file:font-medium file:text-mist-50"
        />
        <p className="text-caption text-mist-400">{t.fileHint}</p>
      </div>

      {errors._form && (
        <p className="text-body text-[var(--color-safety-400)]">{errors._form}</p>
      )}

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
          onClick={onSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-[22px] py-[12px] text-body font-medium text-forest-900 transition-colors duration-150 hover:bg-gold-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? dict.rfq.submitting : dict.rfq.submit}
        </button>
      </div>
    </div>
  );
}
