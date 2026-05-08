import "server-only";
import type { Locale } from "./config";
import en from "@/app/[locale]/dictionaries/en.json";

export type Dictionary = typeof en;

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  en: () =>
    import("@/app/[locale]/dictionaries/en.json").then(
      (m) => m.default as Dictionary,
    ),
  th: () =>
    import("@/app/[locale]/dictionaries/th.json").then(
      (m) => m.default as Dictionary,
    ),
};

export const getDictionary = (locale: Locale): Promise<Dictionary> =>
  loaders[locale]();
