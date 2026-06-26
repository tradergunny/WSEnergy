import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Container } from "@/components/ui/Container";
import { RfqForm } from "@/components/forms/RfqForm";
import { alternates } from "@/lib/seo";
import { ESTIMATOR_SOURCE, parseEstimateParam, type RfqSeed } from "@/lib/estimator/lead";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/quote">): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return { title: dict.rfq.heading, description: dict.rfq.subhead, alternates: alternates("/quote") };
}

export default async function QuotePage({
  params,
  searchParams,
}: PageProps<"/[locale]/quote">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.rfq;

  // Estimator handoff (Step 5): pre-seed the form from the ?estimate= param.
  const sp = await searchParams;
  const estimate = sp.source === ESTIMATOR_SOURCE ? parseEstimateParam(sp.estimate) : null;
  const seed: RfqSeed | undefined = estimate ? { source: ESTIMATOR_SOURCE, estimate } : undefined;

  return (
    <Container className="py-12">
      {/* Breadcrumb */}
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
          <li className="text-mist-400">{t.breadcrumb}</li>
        </ol>
      </nav>

      {/* Intro */}
      <div className="mb-10 max-w-2xl">
        <h1 className="text-h1 font-medium text-mist-50">{t.heading}</h1>
        <p className="mt-2 text-body-lg text-mist-400">{t.subhead}</p>
        {!seed ? (
          <Link
            href={`/${locale}/solar-calculator`}
            className="group/est mt-3 inline-flex items-center gap-1.5 text-body font-medium text-gold-500 transition-colors hover:text-gold-400"
          >
            {locale === "th"
              ? "ไม่แน่ใจว่าต้องใช้ขนาดไหน? ลองคำนวณก่อน"
              : "Not sure of your size? Try the calculator first"}
            <IconArrowRight
              size={14}
              stroke={2}
              className="transition-transform group-hover/est:translate-x-0.5"
              aria-hidden
            />
          </Link>
        ) : null}
      </div>

      {/* Form */}
      <div className="mx-auto max-w-2xl">
        <RfqForm dict={dict} locale={locale} seed={seed} />
      </div>
    </Container>
  );
}
