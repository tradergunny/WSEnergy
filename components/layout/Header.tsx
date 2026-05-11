import Link from "next/link";
import { IconPhone, IconBrandLine, IconChevronDown } from "@tabler/icons-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { LocaleToggle } from "@/components/layout/LocaleToggle";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { mainNav, withLocale } from "@/lib/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Header — BRIEF §4 (utility bar + main nav) and §6.1 sections 1-2.
 * Server component; only LocaleToggle and MobileMenu opt into "use client".
 * Mega-menu dropdowns render on hover/focus via CSS group-hover (no JS).
 */
export function Header({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const navLabels = dict.nav as Record<string, string>;
  const exclusiveLabel = navLabels.exclusive ?? "Exclusive";

  return (
    <header className="border-graphite-200 bg-graphite-50 sticky top-0 z-40 border-b">
      {/* Utility bar */}
      <div className="border-graphite-200 bg-graphite-100 border-b">
        <Container>
          <div className="text-caption text-graphite-800 flex items-center justify-end gap-4 py-1.5">
            <a
              href="tel:+66000000000"
              className="hover:text-brand-600 hidden items-center gap-1 sm:inline-flex"
            >
              <IconPhone size={14} stroke={1.5} />
              <span>{dict.actions.callUs}</span>
            </a>
            <a
              href="https://line.me/"
              className="hover:text-brand-600 hidden items-center gap-1 sm:inline-flex"
            >
              <IconBrandLine size={14} stroke={1.5} />
              <span>{dict.actions.lineOA}</span>
            </a>
            <LocaleToggle current={locale} />
            <Button
              href={withLocale(locale, "/quote")}
              variant="primary"
              size="sm"
            >
              {dict.actions.requestQuote}
            </Button>
          </div>
        </Container>
      </div>

      {/* Main nav */}
      <Container>
        <div className="flex items-center justify-between py-4">
          <Link
            href={withLocale(locale, "/")}
            className="text-h3 text-brand-600 font-medium tracking-tight"
          >
            WS Energy
          </Link>

          <nav className="hidden md:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => {
                const label = navLabels[item.key] ?? item.key;
                const hasChildren = !!item.children?.length;
                return (
                  <li key={item.key} className="group relative">
                    <Link
                      href={withLocale(locale, item.href)}
                      className="text-body text-graphite-900 group-hover:text-brand-600 inline-flex items-center gap-1 rounded-md px-3 py-2 font-medium"
                    >
                      <span>{label}</span>
                      {hasChildren && (
                        <IconChevronDown size={14} stroke={1.5} />
                      )}
                    </Link>
                    {hasChildren && (
                      <div className="border-graphite-200 invisible absolute top-full left-0 z-50 min-w-64 -translate-y-1 border bg-white opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                        <ul className="flex flex-col py-2">
                          {item.children!.map((child) => (
                            <li key={child.key}>
                              <Link
                                href={withLocale(locale, child.href)}
                                className="text-body text-graphite-800 hover:bg-graphite-50 hover:text-brand-600 flex items-center justify-between gap-3 px-4 py-2"
                              >
                                <span>
                                  {navLabels[child.key] ?? child.key}
                                </span>
                                {child.exclusive && (
                                  <span className="text-eyebrow bg-brand-50 text-brand-800 rounded-sm px-1.5 py-0.5">
                                    ★ {exclusiveLabel}
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <MobileMenu
            locale={locale}
            navLabels={navLabels}
            exclusiveLabel={exclusiveLabel}
          />
        </div>
      </Container>
    </header>
  );
}
