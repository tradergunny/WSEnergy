import { headers } from "next/headers";
import { IconArrowRight } from "@tabler/icons-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { MonoLabel } from "@/components/ui/MonoLabel";

/**
 * NotFoundView — the branded 404, shared by the per-segment not-found.tsx
 * boundary files. In this Next version a not-found boundary must be a
 * SERVER component (client boundaries silently fall back to the default
 * 404) and boundaries do not bubble across segments, so every segment
 * that calls notFound() re-exports this view. not-found receives no
 * params, so the locale comes from the x-pathname request header that
 * proxy.ts forwards.
 */

const COPY = {
  en: {
    eyebrow: "PAGE NOT FOUND",
    headline: "This page isn't in our catalog",
    body: "The link may be outdated, or the product has moved. Everything we stock is one step away.",
    browse: "Browse products",
    home: "Back to homepage",
    contact: "Contact us",
  },
  th: {
    eyebrow: "ไม่พบหน้านี้",
    headline: "ไม่พบหน้าที่คุณต้องการ",
    body: "ลิงก์อาจล้าสมัย หรือสินค้าถูกย้ายตำแหน่งแล้ว ทุกอย่างที่เราจำหน่ายอยู่ห่างเพียงคลิกเดียว",
    browse: "ดูสินค้าทั้งหมด",
    home: "กลับหน้าแรก",
    contact: "ติดต่อเรา",
  },
} as const;

export default async function NotFoundView() {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const locale = pathname.split("/")[1] === "th" ? "th" : "en";
  const t = COPY[locale];

  return (
    <Container as="section" className="py-24 lg:py-32">
      <div className="max-w-2xl">
        <MonoLabel tone="gold">{t.eyebrow}</MonoLabel>
        <p
          className="text-forest-700 mt-6 font-mono text-7xl leading-none font-medium tracking-tight lg:text-8xl"
          aria-hidden
        >
          404
        </p>
        <h1 className="text-h1 md:text-display text-mist-50 mt-4 font-medium">
          {t.headline}
        </h1>
        <p className="text-body-lg text-mist-400 mt-4 max-w-xl">{t.body}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button variant="primary" size="md" href={`/${locale}/products`}>
            {t.browse}
            <IconArrowRight size={16} stroke={1.5} aria-hidden />
          </Button>
          <Button variant="secondary" size="md" href={`/${locale}`}>
            {t.home}
          </Button>
          <Button variant="tertiary" href={`/${locale}/contact`}>
            {t.contact}
          </Button>
        </div>
      </div>
    </Container>
  );
}
