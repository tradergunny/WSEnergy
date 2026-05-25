import Link from "next/link";
import { headers } from "next/headers";
import { IconCalendarEvent, IconMapPin, IconArrowRight } from "@tabler/icons-react";
import { getNextUpcomingTrainingSessions } from "@/lib/sanity/training";
import { withLocale } from "@/lib/navigation";
import type { Locale } from "@/lib/i18n/config";

/** Routes where the band must NOT render. Matched against the path after the locale segment. */
const HIDE_ON = ["/training", "/quote", "/contact", "/studio"];

function shouldHide(pathname: string | null): boolean {
  if (!pathname) return false;
  const afterLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  return HIDE_ON.some((p) => afterLocale === p || afterLocale.startsWith(`${p}/`));
}

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

function formatDate(iso: string, locale: Locale): string {
  const d = new Date(iso);
  const months = locale === "th" ? MONTHS_TH : MONTHS_EN;
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export async function TrainingHighlightBand({ locale }: { locale: Locale }) {
  const pathname = (await headers()).get("x-pathname");
  if (shouldHide(pathname)) return null;

  const sessions = await getNextUpcomingTrainingSessions();
  const next = sessions[0];
  if (!next) return null;

  const title = (locale === "th" ? next.title_th : next.title_en) ?? next.title_en;
  const date = formatDate(next.startDate, locale);
  const location = next.format === "online"
    ? (locale === "th" ? "ออนไลน์" : "Online")
    : next.province;

  const label = locale === "th" ? "อบรมครั้งถัดไป" : "Next training";
  const cta = locale === "th" ? "ดูตารางทั้งหมด" : "See full schedule";
  const moreCount = sessions.length - 1;
  const moreLabel = locale === "th" ? `+${moreCount} เพิ่มเติม` : `+${moreCount} more`;

  return (
    <div className="border-b border-mist-800/60 bg-forest-950">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-6 py-2.5 text-caption">
        <Link
          href={withLocale(locale, "/training")}
          className="group inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/5 px-3 py-1 text-mist-100 transition-colors hover:border-gold-500 hover:bg-gold-500/10"
        >
          <IconCalendarEvent size={14} stroke={1.75} className="text-gold-500" />
          <span className="text-mist-400">{label}:</span>
          <span className="font-medium text-mist-50">{date}</span>
          {location && (
            <>
              <span className="text-mist-600">·</span>
              <IconMapPin size={12} stroke={1.75} className="text-mist-400" />
              <span className="text-mist-200">{location}</span>
            </>
          )}
          <span className="mx-1 hidden text-mist-600 sm:inline">—</span>
          <span className="hidden truncate text-mist-300 sm:inline">{title}</span>
          {moreCount > 0 && (
            <span className="text-eyebrow ml-1 rounded-full bg-gold-500/15 px-2 py-0.5 text-gold-500">
              {moreLabel}
            </span>
          )}
        </Link>
        <Link
          href={withLocale(locale, "/training")}
          className="inline-flex items-center gap-1 text-mist-400 transition-colors hover:text-gold-500"
        >
          {cta}
          <IconArrowRight size={12} stroke={2} />
        </Link>
      </div>
    </div>
  );
}
