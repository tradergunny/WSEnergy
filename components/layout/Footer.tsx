import Link from "next/link";
import {
  IconBrandFacebook,
  IconBrandYoutube,
  IconMail,
  IconPhone,
  IconBrandLine,
} from "@tabler/icons-react";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { footerNav, withLocale } from "@/lib/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Footer — BRIEF §4: 4-column grid + bottom legal strip.
 * Dark-theme refresh: deep forest-950 well, gold accent links.
 */
export function Footer({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const navLabels = dict.nav as Record<string, string>;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-mist-800/60 bg-forest-950">
      <Container>
        <div className="grid grid-cols-1 gap-10 py-16 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-eyebrow mb-3 text-mist-400">
              {navLabels.products}
            </h3>
            <ul className="flex flex-col gap-2">
              {footerNav.col1.map((item) => (
                <li key={item.key}>
                  <Link
                    href={withLocale(locale, item.href)}
                    className="text-body text-mist-200 transition-colors hover:text-gold-500"
                  >
                    {navLabels[item.key] ?? item.key}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-eyebrow mb-3 text-mist-400">
              {navLabels.about}
            </h3>
            <ul className="flex flex-col gap-2">
              {footerNav.col2.map((item) => (
                <li key={item.key}>
                  <Link
                    href={withLocale(locale, item.href)}
                    className="text-body text-mist-200 transition-colors hover:text-gold-500"
                  >
                    {navLabels[item.key] ?? item.key}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-eyebrow mb-3 text-mist-400">
              {navLabels.contact}
            </h3>
            <address className="text-body whitespace-pre-line text-mist-200 not-italic">
              {dict.footer.address}
            </address>
            <ul className="text-body mt-3 flex flex-col gap-1.5 text-mist-200">
              <li>
                <a
                  href="tel:+66000000000"
                  className="inline-flex items-center gap-2 transition-colors hover:text-gold-500"
                >
                  <IconPhone size={16} stroke={1.5} />
                  <span>+66 (0) 0 0000 0000</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:sales@ws-energy.co.th"
                  className="inline-flex items-center gap-2 transition-colors hover:text-gold-500"
                >
                  <IconMail size={16} stroke={1.5} />
                  <span>sales@ws-energy.co.th</span>
                </a>
              </li>
              <li>
                <a
                  href="https://line.me/"
                  className="inline-flex items-center gap-2 transition-colors hover:text-gold-500"
                >
                  <IconBrandLine size={16} stroke={1.5} />
                  <span>{dict.footer.lineLabel}</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-eyebrow mb-3 text-mist-400">
              {dict.footer.newsletterTitle}
            </h3>
            <p className="text-body mb-3 text-mist-400">
              {dict.footer.newsletterCopy}
            </p>
            <form className="flex flex-col gap-2">
              <Input
                label={dict.footer.newsletterTitle}
                type="email"
                placeholder={dict.footer.newsletterPlaceholder}
                className="sr-only-label"
              />
              <Button type="submit" variant="primary" size="md">
                {dict.footer.newsletterSubmit}
              </Button>
            </form>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://facebook.com/"
                aria-label="Facebook"
                className="text-mist-400 transition-colors hover:text-gold-500"
              >
                <IconBrandFacebook size={20} stroke={1.5} />
              </a>
              <a
                href="https://youtube.com/"
                aria-label="YouTube"
                className="text-mist-400 transition-colors hover:text-gold-500"
              >
                <IconBrandYoutube size={20} stroke={1.5} />
              </a>
            </div>
          </div>
        </div>

        <div className="text-caption flex flex-col items-start justify-between gap-2 border-t border-mist-800/60 py-4 text-mist-400 md:flex-row md:items-center">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>{dict.footer.registration}</span>
            <span>{dict.footer.vat}</span>
            <span>
              © {year} WS Energy. {dict.footer.rights}
            </span>
          </div>
          <div className="flex gap-4">
            <Link
              href={withLocale(locale, "/legal/privacy-policy")}
              className="transition-colors hover:text-gold-500"
            >
              {dict.footer.privacy}
            </Link>
            <Link
              href={withLocale(locale, "/legal/terms")}
              className="transition-colors hover:text-gold-500"
            >
              {dict.footer.terms}
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
