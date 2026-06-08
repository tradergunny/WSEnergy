"use client";

import { motion } from "framer-motion";
import { Fragment } from "react";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type Locale = "en" | "th";

type Testimonial = {
  text: { en: string; th: string };
  name: string;
  initials: string;
  role: { en: string; th: string };
};

/**
 * DEMO: Only Somchai is a real customer quote (matches the prior single-quote
 * section). The other eight are placeholder copy for layout review — replace
 * with real testimonials (and verified Thai translations) before launch.
 * Long-term home: a `testimonial` Sanity schema feeding this component.
 */
const TESTIMONIALS: Testimonial[] = [
  {
    text: {
      en: "WS Energy is the partner we call before every bid — specs come back accurate, product lands on time, and their on-site team actually knows the safety codes.",
      th: "WS Energy เป็นพันธมิตรที่เราโทรหาก่อนการประมูลทุกครั้ง — ข้อมูลจำเพาะถูกต้อง สินค้ามาตรงเวลา และทีมงานท้องถิ่นรู้จักกฎความปลอดภัยเป็นอย่างดี",
    },
    name: "Somchai Charoenkul",
    initials: "SC",
    role: {
      en: "Project Director · Solar Power EPC",
      th: "ผู้อำนวยการโครงการ · Solar Power EPC",
    },
  },
  {
    text: {
      en: "Lead times held even when our 4 MW expansion shifted forward by six weeks. That kind of supply reliability is rare in this market.",
      th: "ระยะเวลาส่งมอบยังคงตรงตามแผน แม้โครงการขยาย 4 MW ของเราจะเลื่อนเข้ามาเร็วขึ้นหกสัปดาห์ ความน่าเชื่อถือด้านอุปทานแบบนี้หาได้ยากในตลาด",
    },
    name: "Anchalee Wong",
    initials: "AW",
    role: {
      en: "Procurement Manager · Solar developer",
      th: "ผู้จัดการจัดซื้อ · ผู้พัฒนาพลังงานแสงอาทิตย์",
    },
  },
  {
    text: {
      en: "Their post-sale support shows up. We had a rapid shutdown question on a Saturday and had an engineer on a call within the hour.",
      th: "การสนับสนุนหลังการขายของพวกเขามาทันเวลา เราเคยมีคำถามเรื่อง rapid shutdown ในวันเสาร์ และได้คุยกับวิศวกรภายในหนึ่งชั่วโมง",
    },
    name: "Niran Phakdee",
    initials: "NP",
    role: {
      en: "O&M Manager · Utility-scale plant",
      th: "ผู้จัดการ O&M · โรงไฟฟ้าระดับสาธารณูปโภค",
    },
  },
  {
    text: {
      en: "Datasheets and IEC certificates are organised the way we actually need them for submittal — not the usual scramble at the end of a project.",
      th: "เอกสารข้อมูลและใบรับรอง IEC ถูกจัดเรียงในแบบที่เราต้องใช้สำหรับการยื่นเอกสารจริง ไม่ใช่ความวุ่นวายช่วงท้ายโครงการแบบที่เคยเจอ",
    },
    name: "Kittipong Saetang",
    initials: "KS",
    role: {
      en: "Senior Engineer · Consulting firm",
      th: "วิศวกรอาวุโส · บริษัทที่ปรึกษา",
    },
  },
  {
    text: {
      en: "Margins held up over the past two years even when the rest of the market got squeezed on Tier-2 panels. They protect the channel.",
      th: "อัตรากำไรของเรายังคงอยู่ตลอดสองปีที่ผ่านมา แม้ส่วนอื่นของตลาดจะถูกบีบในกลุ่มแผงระดับ Tier-2 พวกเขาดูแลช่องทางการจัดจำหน่ายเป็นอย่างดี",
    },
    name: "Pattara Lim",
    initials: "PL",
    role: {
      en: "Distributor partner · Bangkok",
      th: "คู่ค้าตัวแทนจำหน่าย · กรุงเทพ",
    },
  },
  {
    text: {
      en: "We compared three EPCs for our 1.2 MW factory roof. WS Energy was the only one whose proposal walked us through O&M costs over twenty years, not just CapEx.",
      th: "เราเปรียบเทียบ EPC สามรายสำหรับโครงการหลังคาโรงงาน 1.2 MW ของเรา WS Energy เป็นรายเดียวที่ข้อเสนออธิบายค่าใช้จ่าย O&M ตลอด 20 ปี ไม่ใช่แค่ CapEx",
    },
    name: "Ratchanok Suthikorn",
    initials: "RS",
    role: {
      en: "Facilities Director · C&I owner",
      th: "ผู้อำนวยการสิ่งอำนวยความสะดวก · เจ้าของ C&I",
    },
  },
  {
    text: {
      en: "Installer training paid for itself on the first job — the crew finished a 250 kW rooftop two days ahead of schedule.",
      th: "การอบรมช่างติดตั้งคุ้มทุนตั้งแต่งานแรก ทีมงานติดตั้งหลังคา 250 kW เสร็จเร็วกว่ากำหนดสองวัน",
    },
    name: "Thanawat Boon",
    initials: "TB",
    role: {
      en: "Site Supervisor · Installer network",
      th: "หัวหน้าหน่วยติดตั้ง · เครือข่ายผู้ติดตั้ง",
    },
  },
  {
    text: {
      en: "Plant performance has tracked within 1.5% of guarantees across our 12 MW portfolio. The Projoy rapid shutdown integration was painless.",
      th: "ประสิทธิภาพของโรงไฟฟ้าอยู่ในช่วง 1.5% จากค่าที่รับประกัน ในพอร์ตโฟลิโอ 12 MW ของเรา การติดตั้งระบบ rapid shutdown ของ Projoy ราบรื่นมาก",
    },
    name: "Daranee Mokarat",
    initials: "DM",
    role: {
      en: "Asset Manager · IPP",
      th: "ผู้จัดการสินทรัพย์ · IPP",
    },
  },
  {
    text: {
      en: "Homeowners actually understand the warranty terms when we hand them the brochure — that's saved us hours on every sale.",
      th: "เจ้าของบ้านเข้าใจเงื่อนไขการรับประกันได้จริงเมื่อเราส่งโบรชัวร์ให้ ช่วยประหยัดเวลาในการขายได้หลายชั่วโมงต่อหนึ่งงาน",
    },
    name: "Voravut Inthep",
    initials: "VI",
    role: {
      en: "Residential installer partner",
      th: "พันธมิตรผู้ติดตั้งที่พักอาศัย",
    },
  },
];

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-900 text-gold-500">
      <span className="text-caption font-medium tracking-tight">{initials}</span>
    </div>
  );
}

function TestimonialsColumn({
  testimonials,
  duration,
  locale,
  className = "",
}: {
  testimonials: Testimonial[];
  duration: number;
  locale: Locale;
  className?: string;
}) {
  return (
    <div className={className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[0, 1].map((loop) => (
          <Fragment key={loop}>
            {testimonials.map((t, i) => (
              <div
                key={`${loop}-${i}`}
                className="w-full max-w-sm rounded-xl bg-card-50 p-8 text-card-ink"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <p className="text-body leading-relaxed">{t.text[locale]}</p>
                <div className="mt-5 flex items-center gap-3">
                  <Avatar initials={t.initials} />
                  <div className="flex flex-col">
                    <span className="text-h4 font-medium tracking-tight">
                      {t.name}
                    </span>
                    <span className="text-caption text-forest-900/65">
                      {t.role[locale]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </Fragment>
        ))}
      </motion.div>
    </div>
  );
}

export function TestimonialsMarquee({ locale }: { locale: Locale }) {
  const firstColumn = TESTIMONIALS.slice(0, 3);
  const secondColumn = TESTIMONIALS.slice(3, 6);
  const thirdColumn = TESTIMONIALS.slice(6, 9);

  return (
    <section className="bg-forest-950">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
        <ScrollReveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <MonoLabel tone="mist">
            {locale === "th" ? "เสียงจากพันธมิตร" : "Partner voices"}
          </MonoLabel>
          <h2
            className="mt-3 font-medium tracking-tight text-mist-50"
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              lineHeight: 1.1,
              letterSpacing: "-0.015em",
            }}
          >
            {locale === "th"
              ? "พันธมิตรของเราพูดถึงเราอย่างไร"
              : "What our partners say"}
          </h2>
          <p className="mt-4 text-body-lg text-mist-400">
            {locale === "th"
              ? "EPC ผู้พัฒนา และเจ้าของโครงการที่ใช้ WS Energy ในงานจริง"
              : "EPCs, developers, and project owners who put WS Energy on real projects."}
          </p>
        </ScrollReveal>

        <div
          className="mt-12 flex max-h-[680px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]"
        >
          <TestimonialsColumn
            testimonials={firstColumn}
            duration={22}
            locale={locale}
          />
          <TestimonialsColumn
            testimonials={secondColumn}
            duration={28}
            locale={locale}
            className="hidden md:block"
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            duration={25}
            locale={locale}
            className="hidden lg:block"
          />
        </div>
      </div>
    </section>
  );
}
