"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  IconMapPin,
  IconPhone,
  IconMail,
  IconExternalLink,
  IconAward,
  IconFilter,
  IconX,
} from "@tabler/icons-react";
import type {
  InstallerRow,
  InstallerTier,
  ServiceTypeRow,
} from "@/lib/sanity/installers";

type Locale = "en" | "th";

export function InstallersDirectory({
  installers,
  serviceTypes,
  provinces,
  locale,
}: {
  installers: InstallerRow[];
  serviceTypes: ServiceTypeRow[];
  provinces: string[];
  locale: Locale;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state: ?province=X&service=a,b,c
  const province = searchParams.get("province") ?? "all";
  const selectedServices = useMemo(() => {
    const raw = searchParams.get("service");
    return new Set(raw ? raw.split(",").filter(Boolean) : []);
  }, [searchParams]);

  const updateParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    },
    [router, searchParams],
  );

  const setProvince = (next: string) =>
    updateParams((p) => {
      if (next === "all") p.delete("province");
      else p.set("province", next);
    });

  const toggleService = (slug: string) =>
    updateParams((p) => {
      const current = new Set(
        (p.get("service") ?? "").split(",").filter(Boolean),
      );
      if (current.has(slug)) current.delete(slug);
      else current.add(slug);
      if (current.size === 0) p.delete("service");
      else p.set("service", Array.from(current).join(","));
    });

  const clearFilters = () =>
    updateParams((p) => {
      p.delete("province");
      p.delete("service");
    });

  const filtered = useMemo(() => {
    return installers.filter((inst) => {
      if (province !== "all" && inst.province !== province) return false;
      if (selectedServices.size > 0) {
        const hasAny = (inst.services ?? []).some((s) =>
          selectedServices.has(s.slug),
        );
        if (!hasAny) return false;
      }
      return true;
    });
  }, [installers, province, selectedServices]);

  const hasFilters = province !== "all" || selectedServices.size > 0;

  if (installers.length === 0) {
    return (
      <div className="rounded-2xl border border-mist-800/60 bg-forest-800/40 p-10 text-center text-mist-400">
        {locale === "th"
          ? "ยังไม่มีผู้ติดตั้งที่ลงทะเบียนในขณะนี้"
          : "No certified installers listed yet. Check back soon."}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="lg:col-span-3">
        <div className="lg:sticky lg:top-24 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-caption font-mono uppercase tracking-wider text-mist-400">
              <IconFilter size={12} stroke={1.75} />
              {locale === "th" ? "ตัวกรอง" : "Filter"}
            </span>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-caption font-mono uppercase tracking-wider text-gold-500 hover:text-gold-400"
              >
                <IconX size={11} stroke={2} />
                {locale === "th" ? "ล้าง" : "Clear"}
              </button>
            ) : null}
          </div>

          {/* Province */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="province-filter"
              className="text-caption font-mono uppercase tracking-wider text-mist-400"
            >
              {locale === "th" ? "จังหวัด" : "Province"}
            </label>
            <select
              id="province-filter"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="rounded-full border border-mist-400/30 bg-forest-800/40 px-4 py-2 text-body font-medium text-mist-50 hover:border-mist-400/60 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
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

          {/* Services */}
          {serviceTypes.length > 0 ? (
            <div className="flex flex-col gap-3">
              <span className="text-caption font-mono uppercase tracking-wider text-mist-400">
                {locale === "th" ? "บริการ" : "Services"}
              </span>
              <ul className="flex flex-col gap-2">
                {serviceTypes.map((s) => {
                  const active = selectedServices.has(s.slug);
                  return (
                    <li key={s._id}>
                      <button
                        type="button"
                        onClick={() => toggleService(s.slug)}
                        aria-pressed={active}
                        className={`flex w-full items-center justify-between gap-2 rounded-full px-3 py-2 text-left text-body transition-colors ${
                          active
                            ? "bg-gold-500 text-forest-900 font-medium"
                            : "border border-mist-400/20 text-mist-50 hover:border-mist-400/50 hover:bg-mist-50/5"
                        }`}
                      >
                        <span>
                          {locale === "th"
                            ? (s.title_th ?? s.title_en)
                            : s.title_en}
                        </span>
                        {active ? (
                          <IconX size={12} stroke={2.25} />
                        ) : (
                          <span aria-hidden className="opacity-0">
                            <IconX size={12} stroke={2.25} />
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      </aside>

      {/* ── Results ─────────────────────────────────────────── */}
      <div className="lg:col-span-9">
        <div className="mb-6 text-caption font-mono uppercase tracking-wider text-mist-400">
          {formatResultCount(filtered.length, locale)}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-mist-800/60 bg-forest-800/40 p-10 text-center text-mist-400">
            <p>
              {locale === "th"
                ? "ไม่พบผู้ติดตั้งที่ตรงกับตัวกรองที่เลือก"
                : "No installers match these filters."}
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-mist-400/30 px-4 py-2 text-body font-medium text-mist-50 hover:bg-mist-50/5 hover:border-mist-400/60"
            >
              {locale === "th" ? "ล้างตัวกรอง" : "Clear filters"}
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filtered.map((installer) => (
              <li key={installer._id}>
                <InstallerCard installer={installer} locale={locale} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */

function InstallerCard({
  installer,
  locale,
}: {
  installer: InstallerRow;
  locale: Locale;
}) {
  const services = installer.services ?? [];
  const address =
    locale === "th"
      ? (installer.address_th ?? installer.address_en)
      : (installer.address_en ?? installer.address_th);

  return (
    <article className="flex h-full flex-col gap-5 rounded-2xl bg-card-50 p-7 text-card-ink shadow-[var(--shadow-card)] transition-transform duration-200 hover:-translate-y-0.5">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2
            className="font-medium tracking-tight"
            style={{ fontSize: 22, lineHeight: 1.2 }}
          >
            {installer.companyName}
          </h2>
          <p className="mt-1 inline-flex items-center gap-1.5 text-body text-forest-900/65">
            <IconMapPin size={14} stroke={1.75} className="text-forest-900/50" />
            <span>
              {installer.province}
              {installer.district ? ` · ${installer.district}` : ""}
            </span>
          </p>
        </div>
        <TierBadge tier={installer.tier} locale={locale} />
      </header>

      {services.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {services.map((s) => (
            <span
              key={s._id}
              className="inline-flex items-center rounded-full bg-forest-900/8 px-2.5 py-1 text-caption font-medium text-forest-900/80"
            >
              {locale === "th" ? (s.title_th ?? s.title_en) : s.title_en}
            </span>
          ))}
        </div>
      ) : null}

      {address ? (
        <p className="text-body text-forest-900/70 whitespace-pre-line">
          {address}
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-forest-900/10 pt-4 text-body">
        {installer.phone ? (
          <a
            href={`tel:${installer.phone.replace(/\s+/g, "")}`}
            className="inline-flex items-center gap-1.5 font-medium text-forest-900 hover:text-forest-700"
          >
            <IconPhone size={14} stroke={1.75} />
            {installer.phone}
          </a>
        ) : null}
        {installer.email ? (
          <a
            href={`mailto:${installer.email}`}
            className="inline-flex items-center gap-1.5 font-medium text-forest-900 hover:text-forest-700"
          >
            <IconMail size={14} stroke={1.75} />
            {locale === "th" ? "อีเมล" : "Email"}
          </a>
        ) : null}
        {installer.website ? (
          <a
            href={installer.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-forest-900 hover:text-forest-700"
          >
            <IconExternalLink size={14} stroke={1.75} />
            {locale === "th" ? "เว็บไซต์" : "Website"}
          </a>
        ) : null}
        {installer.yearsActive != null ? (
          <span className="ml-auto inline-flex items-center gap-1.5 text-caption font-mono uppercase tracking-wider text-forest-900/55">
            <IconAward size={12} stroke={1.75} />
            {locale === "th"
              ? `${installer.yearsActive} ปี`
              : installer.yearsActive === 1
                ? "1 year"
                : `${installer.yearsActive} years`}
          </span>
        ) : null}
      </div>
    </article>
  );
}

function TierBadge({ tier, locale }: { tier: InstallerTier; locale: Locale }) {
  const styles =
    tier === "gold"
      ? "bg-gold-500 text-forest-900"
      : tier === "silver"
        ? "bg-forest-900 text-mist-50"
        : "border border-forest-900/25 text-forest-900/80";
  const label =
    locale === "th"
      ? tier === "gold"
        ? "พันธมิตรระดับโกลด์"
        : tier === "silver"
          ? "พันธมิตรระดับซิลเวอร์"
          : "ผู้รับมอบอำนาจ"
      : tier === "gold"
        ? "Gold partner"
        : tier === "silver"
          ? "Silver partner"
          : "Authorized";
  return (
    <span
      className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-caption font-mono uppercase tracking-wider ${styles}`}
    >
      {label}
    </span>
  );
}

function formatResultCount(count: number, locale: Locale): string {
  if (locale === "th") return `${count} ผู้ติดตั้ง`;
  return count === 1 ? "1 installer" : `${count} installers`;
}
