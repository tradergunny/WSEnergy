import Link from "next/link";
import {
  IconFileText,
  IconFileCode,
  IconBook2,
  IconDownload,
} from "@tabler/icons-react";

/**
 * DocumentTile — BRIEF §8.6.
 * Compact: file icon left, title + meta center, download icon right (Brand 600).
 */

type DocumentType = "datasheet" | "manual" | "diagram";

const iconMap = {
  datasheet: IconFileText,
  manual: IconBook2,
  diagram: IconFileCode,
} as const;

export type DocumentTileProps = {
  type: DocumentType;
  title: string;
  meta?: string;
  href: string;
};

export function DocumentTile({ type, title, meta, href }: DocumentTileProps) {
  const Icon = iconMap[type];
  return (
    <Link
      href={href}
      className="group border-graphite-200 hover:border-brand-600 flex items-center gap-3 rounded-md border bg-white px-4 py-3"
    >
      <span className="text-graphite-600 group-hover:text-brand-600 shrink-0">
        <Icon size={20} stroke={1.5} />
      </span>
      <span className="flex flex-1 flex-col">
        <span className="text-body text-graphite-900 font-medium">
          {title}
        </span>
        {meta && (
          <span className="text-caption text-graphite-600">{meta}</span>
        )}
      </span>
      <span className="text-brand-600 shrink-0">
        <IconDownload size={18} stroke={1.5} />
      </span>
    </Link>
  );
}
