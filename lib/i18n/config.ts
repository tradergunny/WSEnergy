export const locales = ["en", "th"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "th";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);
