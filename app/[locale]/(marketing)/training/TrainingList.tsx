"use client";

import { useMemo, useState } from "react";
import {
  IconArrowUpRight,
  IconCalendarEvent,
  IconMapPin,
  IconUsers,
} from "@tabler/icons-react";
import type {
  TrainingFormat,
  TrainingSessionRow,
} from "@/lib/sanity/training";

type Locale = "en" | "th";

type FormatFilter = "all" | TrainingFormat;

export function TrainingList({
  sessions,
  locale,
}: {
  sessions: TrainingSessionRow[];
  locale: Locale;
}) {
  const [format, setFormat] = useState<FormatFilter>("all");
  const [province, setProvince] = useState<string>("all");

  const provinces = useMemo(() => {
    const set = new Set<string>();
    for (const s of sessions) {
      if (s.province) set.add(s.province);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [sessions]);

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (format !== "all" && s.format !== format) return false;
      if (province !== "all" && s.province !== province) return false;
      return true;
    });
  }, [sessions, format, province]);

  const hasFilters = format !== "all" || province !== "all";
  const clearFilters = () => {
    setFormat("all");
    setProvince("all");
  };

  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl border border-mist-800/60 bg-forest-800/40 p-10 text-center text-mist-400">
        {locale === "th"
          ? "ขณะนี้ยังไม่มีหลักสูตรอบรมที่กำลังจะมาถึง โปรดกลับมาตรวจสอบอีกครั้ง"
          : "No upcoming training sessions right now. Check back soon."}
      </div>
    );
  }

  return (
    <div>
      <FilterBar
        format={format}
        onFormatChange={setFormat}
        province={province}
        onProvinceChange={setProvince}
        provinces={provinces}
        locale={locale}
        resultCount={filtered.length}
      />
      <div className="mt-6">
        <SessionsTable
          sessions={filtered}
          locale={locale}
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */

function FilterBar({
  format,
  onFormatChange,
  province,
  onProvinceChange,
  provinces,
  locale,
  resultCount,
}: {
  format: FormatFilter;
  onFormatChange: (f: FormatFilter) => void;
  province: string;
  onProvinceChange: (p: string) => void;
  provinces: string[];
  locale: Locale;
  resultCount: number;
}) {
  const formatOptions: { value: FormatFilter; label: string }[] = [
    { value: "all", label: locale === "th" ? "ทั้งหมด" : "All" },
    {
      value: "in-person",
      label: locale === "th" ? "ในสถานที่" : "In person",
    },
    { value: "online", label: locale === "th" ? "ออนไลน์" : "Online" },
    { value: "hybrid", label: locale === "th" ? "ผสมผสาน" : "Hybrid" },
  ];

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-3">
        <span className="text-caption font-mono uppercase tracking-wider text-mist-400">
          {locale === "th" ? "รูปแบบ" : "Format"}
        </span>
        <div className="flex flex-wrap gap-2">
          {formatOptions.map((opt) => {
            const active = opt.value === format;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onFormatChange(opt.value)}
                className={`rounded-full px-4 py-2 text-body font-medium transition-colors ${
                  active
                    ? "bg-gold-500 text-forest-900"
                    : "border border-mist-400/30 text-mist-50 hover:border-mist-400/60 hover:bg-mist-50/5"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-6">
        <div className="flex flex-col gap-3">
          <label
            htmlFor="province-filter"
            className="text-caption font-mono uppercase tracking-wider text-mist-400"
          >
            {locale === "th" ? "จังหวัด" : "Province"}
          </label>
          <select
            id="province-filter"
            value={province}
            onChange={(e) => onProvinceChange(e.target.value)}
            className="min-w-[180px] rounded-full border border-mist-400/30 bg-forest-800/40 px-4 py-2 text-body font-medium text-mist-50 hover:border-mist-400/60 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
          >
            <option value="all">
              {locale === "th" ? "ทุกจังหวัด" : "All provinces"}
            </option>
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <span className="text-caption font-mono uppercase tracking-wider text-mist-400 lg:pb-3">
          {formatResultCount(resultCount, locale)}
        </span>
      </div>
    </div>
  );
}

function SessionsTable({
  sessions,
  locale,
  hasFilters,
  onClearFilters,
}: {
  sessions: TrainingSessionRow[];
  locale: Locale;
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-mist-800/60 bg-forest-800/40 p-10 text-center text-mist-400">
        <p>
          {locale === "th"
            ? "ไม่พบหลักสูตรอบรมตามตัวกรองที่เลือก"
            : "No training sessions match these filters."}
        </p>
        {hasFilters ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="rounded-full border border-mist-400/30 px-4 py-2 text-body font-medium text-mist-50 transition-colors hover:bg-mist-50/5 hover:border-mist-400/60"
          >
            {locale === "th" ? "ล้างตัวกรอง" : "Clear filters"}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-card-50 text-card-ink shadow-[var(--shadow-card)]">
      <div className="hidden border-b border-forest-900/10 px-6 py-4 text-caption font-mono uppercase tracking-wider text-forest-900/55 md:grid md:grid-cols-12 md:gap-4">
        <div className="md:col-span-5">
          {locale === "th" ? "หลักสูตร" : "Course"}
        </div>
        <div className="md:col-span-2">
          {locale === "th" ? "วันที่" : "Dates"}
        </div>
        <div className="md:col-span-2">
          {locale === "th" ? "รูปแบบ" : "Format"}
        </div>
        <div className="md:col-span-2">
          {locale === "th" ? "จังหวัด" : "Province"}
        </div>
        <div className="md:col-span-1 md:text-right" />
      </div>

      <ul className="divide-y divide-forest-900/10">
        {sessions.map((s) => (
          <SessionRow key={s._id} session={s} locale={locale} />
        ))}
      </ul>
    </div>
  );
}

function SessionRow({
  session,
  locale,
}: {
  session: TrainingSessionRow;
  locale: Locale;
}) {
  const title =
    locale === "th"
      ? (session.title_th ?? session.title_en)
      : (session.title_en ?? session.title_th ?? "");

  const dateRange = formatDateRange(session.startDate, session.endDate, locale);
  const formatLabel = formatFormat(session.format, locale);
  const seatsLabel = formatSeats(session, locale);
  const isFull = session.seatsRemaining === 0;

  return (
    <li className="px-6 py-5 md:grid md:grid-cols-12 md:items-center md:gap-4">
      <div className="md:col-span-5">
        <h3
          className="font-medium tracking-tight"
          style={{ fontSize: 18, lineHeight: 1.3 }}
        >
          {title}
        </h3>
        {session.host ? (
          <p className="mt-1 text-caption text-forest-900/60">{session.host}</p>
        ) : null}
        {seatsLabel ? (
          <p
            className={`mt-1 inline-flex items-center gap-1.5 text-caption font-mono uppercase tracking-wider ${isFull ? "text-rust-600" : "text-forest-900/55"}`}
          >
            <IconUsers size={12} stroke={1.75} />
            {seatsLabel}
          </p>
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-body text-forest-900/80 md:col-span-2 md:mt-0">
        <IconCalendarEvent
          size={14}
          stroke={1.75}
          className="text-forest-900/55 md:hidden"
        />
        <span className="md:hidden text-caption font-mono uppercase tracking-wider text-forest-900/55">
          {locale === "th" ? "วันที่:" : "Dates:"}
        </span>
        {dateRange}
      </div>

      <div className="mt-2 md:col-span-2 md:mt-0">
        <FormatBadge format={session.format} label={formatLabel} />
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-body text-forest-900/80 md:col-span-2 md:mt-0">
        {session.province ? (
          <>
            <IconMapPin
              size={14}
              stroke={1.75}
              className="text-forest-900/55 md:hidden"
            />
            <span className="md:hidden text-caption font-mono uppercase tracking-wider text-forest-900/55">
              {locale === "th" ? "จังหวัด:" : "Province:"}
            </span>
            {session.province}
          </>
        ) : (
          <span className="text-forest-900/40">—</span>
        )}
      </div>

      <div className="mt-4 md:col-span-1 md:mt-0 md:text-right">
        {session.registrationUrl && !isFull ? (
          <a
            href={session.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group/btn inline-flex items-center gap-1.5 text-body font-medium text-forest-900 hover:text-forest-700"
          >
            {locale === "th" ? "สมัคร" : "Register"}
            <IconArrowUpRight
              size={14}
              stroke={2}
              className="transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
            />
          </a>
        ) : isFull ? (
          <span className="inline-flex items-center rounded-full bg-forest-900/10 px-2.5 py-1 text-caption font-mono uppercase tracking-wider text-forest-900/55">
            {locale === "th" ? "เต็ม" : "Full"}
          </span>
        ) : null}
      </div>
    </li>
  );
}

function FormatBadge({
  format,
  label,
}: {
  format: TrainingFormat;
  label: string;
}) {
  const styles =
    format === "in-person"
      ? "bg-forest-900 text-mist-50"
      : format === "online"
        ? "bg-gold-500/15 text-forest-900"
        : "border border-forest-900/25 text-forest-900";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-caption font-mono uppercase tracking-wider ${styles}`}
    >
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────── */

function formatDateRange(start: string, end: string, locale: Locale): string {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  const sameDay = start === end;
  const intlLocale = locale === "th" ? "th-TH" : "en-GB";
  const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(intlLocale, opts).format(d);

  if (sameDay) {
    return fmt(startDate, { day: "numeric", month: "short", year: "numeric" });
  }
  const sameMonth =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();
  if (sameMonth) {
    return `${fmt(startDate, { day: "numeric" })}–${fmt(endDate, { day: "numeric", month: "short", year: "numeric" })}`;
  }
  return `${fmt(startDate, { day: "numeric", month: "short" })} – ${fmt(endDate, { day: "numeric", month: "short", year: "numeric" })}`;
}

function formatFormat(format: TrainingFormat, locale: Locale): string {
  if (locale === "th") {
    return format === "in-person"
      ? "ในสถานที่"
      : format === "online"
        ? "ออนไลน์"
        : "ผสมผสาน";
  }
  return format === "in-person"
    ? "In person"
    : format === "online"
      ? "Online"
      : "Hybrid";
}

function formatSeats(
  session: TrainingSessionRow,
  locale: Locale,
): string | null {
  if (session.seatsRemaining == null) return null;
  if (session.seatsRemaining === 0) {
    return locale === "th" ? "เต็ม" : "Full";
  }
  return locale === "th"
    ? `เหลือ ${session.seatsRemaining} ที่นั่ง`
    : `${session.seatsRemaining} seats left`;
}

function formatResultCount(count: number, locale: Locale): string {
  if (locale === "th") {
    return `${count} หลักสูตร`;
  }
  return count === 1 ? "1 session" : `${count} sessions`;
}
