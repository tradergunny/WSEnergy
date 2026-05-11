import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/client";

/**
 * CaseStudyCard — BRIEF §8.8.
 * Surfaces customer, sector, capacity, year, and a single project photo.
 */

type SanityImageRef = Parameters<typeof urlFor>[0] | undefined | null;

export type CaseStudyCardProps = {
  customer?: string | null;
  sector?: string | null;
  capacity?: string | null;
  year?: number | null;
  title?: string | null;
  image?: SanityImageRef;
  href: string;
};

export function CaseStudyCard({
  customer,
  sector,
  capacity,
  year,
  title,
  image,
  href,
}: CaseStudyCardProps) {
  const heading = customer ?? title ?? "";
  const metaParts = [sector, capacity, year ? String(year) : null].filter(
    Boolean,
  ) as string[];

  return (
    <Link
      href={href}
      className="group border-graphite-200 flex flex-col overflow-hidden rounded-lg border bg-white"
    >
      <div className="bg-graphite-100 relative aspect-[4/3] w-full overflow-hidden">
        {image ? (
          <Image
            src={urlFor(image).width(800).height(600).fit("crop").url()}
            alt={heading}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="text-graphite-400 text-eyebrow flex h-full w-full items-center justify-center">
            Project
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {metaParts.length > 0 && (
          <p className="text-eyebrow text-graphite-600">
            {metaParts.join(" · ")}
          </p>
        )}
        <h3 className="text-h4 text-graphite-900 group-hover:text-brand-600 font-medium">
          {heading}
        </h3>
        {title && customer && title !== customer && (
          <p className="text-body text-graphite-600">{title}</p>
        )}
      </div>
    </Link>
  );
}
