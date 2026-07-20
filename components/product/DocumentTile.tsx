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
 * When `href` is absent (PDF asset not yet uploaded to Sanity) the tile renders
 * as a non-interactive placeholder instead of a dead link.
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
  href?: string | null;
  unavailableLabel?: string;
};

export function DocumentTile({
  type,
  title,
  meta,
  href,
  unavailableLabel = "File being prepared",
}: DocumentTileProps) {
  const Icon = iconMap[type];

  if (!href) {
    return (
      <div className="border-mist-800 bg-forest-800/50 flex items-center gap-3 rounded-md border px-4 py-3">
        <span className="text-mist-600 shrink-0">
          <Icon size={20} stroke={1.5} />
        </span>
        <span className="flex flex-1 flex-col">
          <span className="text-body text-mist-400 font-medium">{title}</span>
          {meta && <span className="text-caption text-mist-600">{meta}</span>}
        </span>
        <span className="text-caption text-mist-600 shrink-0">
          {unavailableLabel}
        </span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group border-mist-800 hover:border-gold-500 bg-forest-800 flex items-center gap-3 rounded-md border px-4 py-3"
    >
      <span className="text-mist-400 group-hover:text-gold-500 shrink-0">
        <Icon size={20} stroke={1.5} />
      </span>
      <span className="flex flex-1 flex-col">
        <span className="text-body text-mist-50 font-medium">
          {title}
        </span>
        {meta && (
          <span className="text-caption text-mist-400">{meta}</span>
        )}
      </span>
      <span className="text-gold-500 shrink-0">
        <IconDownload size={18} stroke={1.5} />
      </span>
    </Link>
  );
}
