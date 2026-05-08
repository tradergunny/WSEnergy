"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";

export function LocaleToggle({ current }: { current: Locale }) {
  const pathname = usePathname();

  function pathFor(target: Locale) {
    const segments = pathname.split("/").filter(Boolean);
    if (
      segments.length &&
      (locales as readonly string[]).includes(segments[0])
    ) {
      segments[0] = target;
    } else {
      segments.unshift(target);
    }
    return "/" + segments.join("/");
  }

  return (
    <div className="text-eyebrow inline-flex gap-1">
      {locales.map((l) => (
        <Link
          key={l}
          href={pathFor(l)}
          aria-current={l === current ? "true" : undefined}
          className={
            l === current
              ? "bg-brand-600 rounded-md px-2 py-1 text-white"
              : "text-graphite-600 hover:text-brand-600 rounded-md px-2 py-1"
          }
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
