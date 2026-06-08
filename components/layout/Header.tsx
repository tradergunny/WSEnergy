import Link from "next/link";
import Image from "next/image";
import { IconPhone, IconBrandLine, IconChevronDown, IconChevronRight, IconArrowRight } from "@tabler/icons-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { LocaleToggle } from "@/components/layout/LocaleToggle";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { mainNav, secondaryNav, withLocale } from "@/lib/navigation";
import { sanityClient } from "@/lib/sanity/client";
import { productNavBrandsQuery } from "@/lib/sanity/queries";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** Brand metadata exposed under each product-category nav item. */
type NavBrand = { name: string; slug: string };

/** Extract the category slug from a "/products/<slug>" href; returns null
 *  for any other href shape (e.g. safety, solutions). */
function categorySlugFromHref(href: string): string | null {
  const m = href.match(/^\/products\/([^/]+)/);
  return m?.[1] ?? null;
}

/**
 * Header — BRIEF §4 (utility bar + main nav) and §6.1 sections 1-2.
 * Dark-theme refresh: forest canvas + glassmorphism on scroll.
 *
 * Async because it fetches the Products dropdown brand sub-items from
 * Sanity. Cached by Next.js fetch dedup, so the cost is one query per
 * deploy/revalidation rather than per request.
 */
export async function Header({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const navLabels = dict.nav as Record<string, string>;
  const exclusiveLabel = navLabels.exclusive ?? "Exclusive";

  // Fetch all (category, brand) product pairs and dedup into a
  // categorySlug → brands[] map for the nav dropdown.
  const navBrandRows = await sanityClient.fetch<
    { category: string; brand: NavBrand }[]
  >(productNavBrandsQuery);
  const brandsByCategory: Record<string, NavBrand[]> = {};
  for (const row of navBrandRows) {
    if (!brandsByCategory[row.category]) brandsByCategory[row.category] = [];
    const list = brandsByCategory[row.category];
    if (!list.some((b) => b.slug === row.brand.slug)) {
      list.push(row.brand);
    }
  }
  // Sort brands alphabetically within each category for stable ordering.
  for (const cat of Object.keys(brandsByCategory)) {
    brandsByCategory[cat].sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <header className="sticky top-0 z-40 border-b border-mist-800/60 bg-forest-900/85 backdrop-blur-md">
      {/* Utility bar — secondary nav (left) + contact/locale (right) */}
      <div className="border-b border-mist-800/60">
        <Container>
          <div className="flex items-center justify-between gap-4 py-1.5 text-caption text-mist-400">
            <nav className="hidden md:block">
              <ul className="flex items-center gap-5">
                {secondaryNav.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={withLocale(locale, item.href)}
                      className="transition-colors hover:text-gold-500"
                    >
                      {navLabels[item.key] ?? item.key}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="ml-auto flex items-center gap-4">
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
                          {item.children!.map((child) => {
                            const catSlug = categorySlugFromHref(child.href);
                            const childBrands = catSlug
                              ? (brandsByCategory[catSlug] ?? [])
                              : [];
                            const hasBrands = childBrands.length > 0;
                            return (
                              <li
                                key={child.key}
                                className="group/cat relative"
                              >
                                <Link
                                  href={withLocale(locale, child.href)}
                                  className="text-body flex items-center justify-between gap-3 px-4 py-2 text-mist-200 hover:bg-mist-50/5 group-hover/cat:bg-mist-50/5 group-hover/cat:text-gold-500"
                                >
                                  <span>
                                    {navLabels[child.key] ?? child.key}
                                  </span>
                                  <span className="flex items-center gap-2">
                                    {child.exclusive && (
                                      <span className="text-eyebrow rounded-full bg-gold-500/15 px-2 py-0.5 text-gold-500">
                                        ★ {exclusiveLabel}
                                      </span>
                                    )}
                                    {hasBrands && (
                                      <IconChevronRight
                                        size={14}
                                        stroke={1.5}
                                        className="text-mist-500 group-hover/cat:text-gold-500"
                                      />
                                    )}
                                  </span>
                                </Link>
                                {/* Cascading brand sub-panel — opens to the
                                    right when this specific category is
                                    hovered. Sits flush against the parent
                                    dropdown's right edge. */}
                                {hasBrands && (
                                  <div className="invisible absolute top-0 left-full z-50 -ml-px min-w-[180px] rounded-r-xl border border-l-0 border-mist-800 bg-forest-800/95 opacity-0 backdrop-blur-md transition-opacity duration-100 group-hover/cat:visible group-hover/cat:opacity-100 group-focus-within/cat:visible group-focus-within/cat:opacity-100">
                                    <ul className="flex flex-col py-2">
                                      {childBrands.map((b) => (
                                        <li key={b.slug}>
                                          <Link
                                            href={withLocale(
                                              locale,
                                              `${child.href}/${b.slug}`,
                                            )}
                                            className="text-body block px-4 py-2 text-mist-200 transition-colors hover:bg-mist-50/5 hover:text-gold-500"
                                          >
                                            {b.name}
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
