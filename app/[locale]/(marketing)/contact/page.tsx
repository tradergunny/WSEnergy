import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Container } from "@/components/ui/Container";
import { RfqForm } from "@/components/forms/RfqForm";
import { alternates } from "@/lib/seo";
import {
  IconPhone,
  IconBrandLine,
  IconMail,
  IconMapPin,
  IconClock,
} from "@tabler/icons-react";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const PHONE = "087-053-8668";
const PHONE_HREF = "tel:+66870538668";
const EMAIL = "ws.energy.co.ltd@gmail.com";
const LINE_HREF = "https://line.me/R/ti/p/@ws.energy";
const MAPS_HREF =
  "https://www.google.com/maps/search/?api=1&query=51%2F17+Moo+3+Bangpla+Bangplee+Samut+Prakan+10540+Thailand";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return { title: dict.contact.hero.headline, description: dict.contact.hero.body, alternates: alternates("/contact") };
}

export default async function ContactPage({
  params,
}: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.contact;

  const directLines = [
    t.directLines.sales,
    t.directLines.technical,
    t.directLines.training,
    t.directLines.partner,
  ];

  return (
    <>
      {/* §6.7-1 Hero */}
      <section className="border-b border-mist-800">
        <Container className="py-12">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex gap-2 text-caption text-mist-400">
              <li>
                <a
                  href={`/${locale}`}
                  className="text-gold-500 transition-colors duration-150 hover:text-gold-400"
                >
                  {dict.nav.home}
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-mist-400">
                {t.breadcrumb}
              </li>
            </ol>
          </nav>
          <h1 className="text-h1 font-medium text-mist-50">
            {t.hero.headline}
          </h1>
          <p className="mt-2 max-w-xl text-body-lg text-mist-400">
            {t.hero.body}
          </p>
        </Container>
      </section>

      {/* §6.7-2 Quick contact strip */}
      <section>
        <Container className="py-10">
          <div className="grid gap-4 sm:grid-cols-3">
            <a
              href={PHONE_HREF}
              className="flex items-center gap-4 rounded-lg border border-mist-800 p-5 transition-colors duration-150 hover:border-gold-500"
            >
              <IconPhone
                size={24}
                stroke={1.5}
                className="text-gold-500"
              />
              <div>
                <p className="text-caption font-medium text-mist-400">
                  {t.quickContact.phoneTitle}
                </p>
                <p className="text-body font-medium text-mist-50">
                  {t.quickContact.phoneValue}
                </p>
              </div>
            </a>
            <a
              href={LINE_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-lg border border-mist-800 p-5 transition-colors duration-150 hover:border-gold-500"
            >
              <IconBrandLine
                size={24}
                stroke={1.5}
                className="text-gold-500"
              />
              <div>
                <p className="text-caption font-medium text-mist-400">
                  {t.quickContact.lineTitle}
                </p>
                <p className="text-body font-medium text-mist-50">
                  {t.quickContact.lineValue}
                </p>
              </div>
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center gap-4 rounded-lg border border-mist-800 p-5 transition-colors duration-150 hover:border-gold-500"
            >
              <IconMail
                size={24}
                stroke={1.5}
                className="text-gold-500"
              />
              <div>
                <p className="text-caption font-medium text-mist-400">
                  {t.quickContact.emailTitle}
                </p>
                <p className="text-body font-medium text-mist-50">
                  {t.quickContact.emailValue}
                </p>
              </div>
            </a>
          </div>
        </Container>
      </section>

      {/* §6.7-3 Embedded RFQ form */}
      <section className="border-t border-mist-800">
        <Container className="py-12">
          <h2 className="mb-8 text-h2 font-medium text-mist-50">
            {t.formHeading}
          </h2>
          <div className="mx-auto max-w-2xl">
            <RfqForm dict={dict} locale={locale} />
          </div>
        </Container>
      </section>

      {/* §6.7-4 Direct lines */}
      <section className="border-t border-mist-800">
        <Container className="py-12">
          <h2 className="mb-6 text-h2 font-medium text-mist-50">
            {t.directLines.heading}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {directLines.map((line) => (
              <div
                key={line.name}
                className="rounded-lg border border-mist-800 p-5"
              >
                <p className="text-h4 font-medium text-mist-50">
                  {line.name}
                </p>
                <p className="mt-1 text-caption text-mist-400">
                  {line.role}
                </p>
                <div className="mt-3 flex flex-col gap-1">
                  <a
                    href={PHONE_HREF}
                    className="text-body text-gold-500 transition-colors duration-150 hover:text-gold-400"
                  >
                    {PHONE}
                  </a>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="text-body text-gold-500 transition-colors duration-150 hover:text-gold-400"
                  >
                    {EMAIL}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* §6.7-5 Office */}
      <section className="border-t border-mist-800">
        <Container className="py-12">
          <h2 className="mb-6 text-h2 font-medium text-mist-50">
            {t.office.heading}
          </h2>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Map embed */}
            <div className="aspect-[4/3] overflow-hidden rounded-lg border border-mist-800">
              <iframe
                title="WS Energy office"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3877.6!2d100.7!3d13.6!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDM2JzAwLjAiTiAxMDDCsDQyJzAwLjAiRQ!5e0!3m2!1sen!2sth!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            {/* Address + hours */}
            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <IconMapPin
                  size={20}
                  stroke={1.5}
                  className="mt-0.5 text-gold-500"
                />
                <p className="whitespace-pre-line text-body text-mist-50">
                  {t.office.address}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <IconClock
                  size={20}
                  stroke={1.5}
                  className="mt-0.5 text-gold-500"
                />
                <div>
                  <p className="text-body text-mist-50">
                    {t.office.hours}
                  </p>
                  <p className="text-body text-mist-400">
                    {t.office.hoursSat}
                  </p>
                </div>
              </div>
              <a
                href={MAPS_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-full border border-gold-500 px-[22px] py-[12px] text-body font-medium text-gold-500 transition-colors duration-150 hover:bg-gold-500/10"
              >
                {t.office.directions}
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
