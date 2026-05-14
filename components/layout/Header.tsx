import Link from "next/link";
import Image from "next/image";
import { IconPhone, IconBrandLine, IconChevronDown, IconArrowRight } from "@tabler/icons-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { LocaleToggle } from "@/components/layout/LocaleToggle";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { mainNav, withLocale } from "@/lib/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Header — BRIEF §4 (utility bar + main nav) and §6.1 sections 1-2.
 * Dark-theme refresh: forest canvas + glassmorphism on scroll.
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
    <header className="sticky top-0 z-40 border-b border-mist-800/60 bg-forest-900/85 backdrop-blur-md">
      {/* Utility bar */}
      <div className="border-b border-mist-800/60">
        <Container>
          <div className="flex items-center justify-end gap-4 py-1.5 text-caption text-mist-400">
            <a
              href="tel:+66000000000"
              className="hidden items-center gap-1 transition-colors hover:text-gold-500 sm:inline-flex"
            >
              <IconPhone size={14} stroke={1.5} />
              <span>{dict.actions.callUs}</span>
            </a>
            <a
              href="https://line.me/"
              className="hidden items-center gap-1 transition-colors hover:text-gold-500 sm:inline-flex"
            >
              <IconBrandLine size={14} stroke={1.5} />
              <span>{dict.actions.lineOA}</span>
            </a>
            <LocaleToggle current={locale} />
          </div>
        </Container>
      </div>

      {/* Main nav */}
      <Container>
        <div className="flex items-center justify-between py-4">
          <Link
            href={withLocale(locale, "/")}
            aria-label="WS Energy — home"
            className="inline-flex items-center"
          >
            <Image
              src="/WSLogo.png"
              alt="WS Energy"
              width={160}
              height={40}
              priority
              className="h-9 w-auto"
            />
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
                      className="text-body inline-flex items-center gap-1 rounded-full px-3 py-2 font-medium text-mist-200 transition-colors group-hover:text-gold-500"
                    >
                      <span>{label}</span>
                      {hasChildren && (
                        <IconChevronDown size={14} stroke={1.5} />
                      )}
                    </Link>
                    {hasChildren && (
                      <div className="invisible absolute top-full left-0 z-50 min-w-64 -translate-y-1 rounded-xl border border-mist-800 bg-forest-800/95 opacity-0 backdrop-blur-md transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                        <ul className="flex flex-col py-2">
                          {item.children!.map((child) => (
                            <li key={child.key}>
                              <Link
                                href={withLocale(locale, child.href)}
                                className="text-body flex items-center justify-between gap-3 px-4 py-2 text-mist-200 hover:bg-mist-50/5 hover:text-gold-500"
                              >
                                <span>
                                  {navLabels[child.key] ?? child.key}
                                </span>
                                {child.exclusive && (
                                  <span className="text-eyebrow rounded-full bg-gold-500/15 px-2 py-0.5 text-gold-500">
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

          <div className="hidden items-center gap-3 md:flex">
            <Button
              href={withLocale(locale, "/quote")}
              variant="primary"
              size="sm"
            >
              {dict.actions.requestQuote}
              <IconArrowRight size={14} stroke={2} className="transition-transform duration-200 group-hover/btn:translate-x-0.5" />
            </Button>
          </div>

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
