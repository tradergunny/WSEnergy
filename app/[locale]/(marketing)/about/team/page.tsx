import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { IconChevronRight, IconMail, IconPhone } from "@tabler/icons-react";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityClient, urlFor } from "@/lib/sanity/client";
import { allTeamMembersQuery } from "@/lib/sanity/queries";
import { Container } from "@/components/ui/Container";
import { withLocale } from "@/lib/navigation";
import { alternates } from "@/lib/seo";

type SanityImageRef = Parameters<typeof urlFor>[0] | undefined | null;

type TeamMember = {
  _id: string;
  name?: string;
  role_en?: string;
  role_th?: string;
  department?: "sales" | "technical" | "training" | "partner";
  photo?: SanityImageRef;
  email?: string;
  phone?: string;
  lineId?: string;
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/about/team">): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.teamPage;
  return { title: t.headline, description: t.subhead, alternates: alternates("/about/team") };
}

export default async function TeamPage({
  params,
}: PageProps<"/[locale]/about/team">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.teamPage;

  const members = await sanityClient.fetch<TeamMember[]>(allTeamMembersQuery);

  const localized = (en?: string, th?: string) =>
    locale === "th" ? (th ?? en ?? "") : (en ?? th ?? "");

  const deptLabel = (dept?: string) => {
    if (!dept) return "";
    return t.departments[dept as keyof typeof t.departments] ?? dept;
  };

  const grouped = members.reduce<Record<string, TeamMember[]>>((acc, m) => {
    const key = m.department ?? "other";
    (acc[key] ??= []).push(m);
    return acc;
  }, {});

  const deptOrder = ["sales", "technical", "training", "partner", "other"];
  const sortedDepts = deptOrder.filter((d) => grouped[d]?.length);

  return (
    <>
      <Container as="nav" aria-label="Breadcrumb" className="pt-6">
        <ol className="text-caption text-mist-400 flex items-center gap-1">
          <li>
            <Link href={withLocale(locale, "/")} className="hover:text-gold-500">
              {t.breadcrumbHome}
            </Link>
          </li>
          <IconChevronRight size={12} stroke={1.5} aria-hidden />
          <li>
            <Link href={withLocale(locale, "/about")} className="hover:text-gold-500">
              {t.breadcrumbAbout}
            </Link>
          </li>
          <IconChevronRight size={12} stroke={1.5} aria-hidden />
          <li className="text-mist-50">{t.breadcrumbTeam}</li>
        </ol>
      </Container>

      <section className="border-mist-800 border-b">
        <Container className="py-12">
          <p className="text-eyebrow text-mist-400 mb-3">{t.eyebrow}</p>
          <h1 className="text-display text-mist-50 font-medium">{t.headline}</h1>
          <p className="text-body-lg text-mist-400 mt-4 max-w-3xl">{t.subhead}</p>
        </Container>
      </section>

      {members.length > 0 ? (
        sortedDepts.map((dept, i) => (
          <section key={dept} className={i % 2 === 1 ? "bg-forest-950" : undefined}>
            <Container className="py-12">
              <h2 className="text-h2 text-mist-50 mb-6 font-medium">{deptLabel(dept)}</h2>
              <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {grouped[dept]!.map((m) => (
                  <li
                    key={m._id}
                    className="border-mist-800 bg-forest-800 flex flex-col items-center rounded-xl border p-6 text-center"
                  >
                    <div className="bg-forest-950 relative mb-4 size-24 overflow-hidden rounded-full">
                      {m.photo ? (
                        <Image
                          src={urlFor(m.photo).width(192).height(192).fit("crop").url()}
                          alt={m.name ?? ""}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="text-mist-400 flex h-full w-full items-center justify-center text-2xl font-medium">
                          {m.name?.[0] ?? "?"}
                        </div>
                      )}
                    </div>
                    <h3 className="text-h4 text-mist-50 font-medium">{m.name}</h3>
                    <p className="text-body text-mist-400 mt-1">
                      {localized(m.role_en, m.role_th)}
                    </p>
                    {(m.email || m.phone) && (
                      <div className="mt-3 flex items-center gap-3">
                        {m.email && (
                          <a
                            href={`mailto:${m.email}`}
                            className="text-mist-400 hover:text-gold-500 transition-colors"
                            aria-label={`Email ${m.name}`}
                          >
                            <IconMail size={18} stroke={1.5} />
                          </a>
                        )}
                        {m.phone && (
                          <a
                            href={`tel:${m.phone}`}
                            className="text-mist-400 hover:text-gold-500 transition-colors"
                            aria-label={`Call ${m.name}`}
                          >
                            <IconPhone size={18} stroke={1.5} />
                          </a>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        ))
      ) : (
        <section>
          <Container className="py-12">
            <p className="text-body text-mist-400">{t.empty}</p>
          </Container>
        </section>
      )}
    </>
  );
}
