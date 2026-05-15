import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { getUpcomingTrainingSessions } from "@/lib/sanity/training";
import { TrainingList } from "./TrainingList";

export default async function TrainingPage({
  params,
}: PageProps<"/[locale]/training">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  await getDictionary(locale);

  const sessions = await getUpcomingTrainingSessions();

  return (
    <>
      {/* ── Intro ─────────────────────────────────────────────── */}
      <section className="bg-forest-950">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
          <ScrollReveal className="max-w-3xl">
            <MonoLabel tone="gold">
              {locale === "th" ? "ตารางอบรม" : "Training calendar"}
            </MonoLabel>
            <h1
              className="mt-4 font-medium tracking-tight text-mist-50"
              style={{
                fontSize: "clamp(32px, 5vw, 56px)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              {locale === "th"
                ? "อบรมและสัมมนา การติดตั้งโซลาร์ที่ปลอดภัย"
                : "Upcoming training & workshops"}
            </h1>
            <p className="text-body-lg mt-5 max-w-2xl text-mist-400">
              {locale === "th"
                ? "หลักสูตรการรับรองช่างติดตั้งและสัมมนาเกี่ยวกับเทคโนโลยีโซลาร์ที่ปลอดภัย จัดโดย WS Energy และพันธมิตร"
                : "Partner installer certifications and workshops on safe solar technology, hosted by WS Energy and our partners."}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Filters + sessions list ───────────────────────────── */}
      <section className="bg-forest-900">
        <div className="mx-auto max-w-6xl px-6 pb-24 md:pb-28">
          <ScrollReveal>
            <TrainingList sessions={sessions} locale={locale} />
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
