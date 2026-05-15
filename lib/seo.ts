import type { Metadata } from "next";
import { locales } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/site";

export function alternates(path: string): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = `${SITE_URL}/${locale}${path}`;
  }
  return { languages };
}
