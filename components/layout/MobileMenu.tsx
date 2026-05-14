"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { IconMenu2, IconX, IconChevronDown } from "@tabler/icons-react";
import { mainNav, withLocale } from "@/lib/navigation";
import type { Locale } from "@/lib/i18n/config";

type NavLabels = Record<string, string>;

export function MobileMenu({
  locale,
  navLabels,
  exclusiveLabel,
}: {
  locale: Locale;
  navLabels: NavLabels;
  exclusiveLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex items-center p-2 text-mist-200 transition-colors hover:text-gold-500 md:hidden"
      >
        <IconMenu2 size={24} stroke={1.5} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute top-0 right-0 flex h-full w-[85%] max-w-sm flex-col bg-forest-900 text-mist-50">
            <div className="flex items-center justify-between border-b border-mist-800/60 px-4 py-3">
              <Image
                src="/WSLogo.png"
                alt="WS Energy"
                width={160}
                height={40}
                className="h-9 w-auto"
              />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="p-2 text-mist-200 transition-colors hover:text-gold-500"
              >
                <IconX size={22} stroke={1.5} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-2 py-3">
              <ul className="flex flex-col">
                {mainNav.map((item) => {
                  const label = navLabels[item.key] ?? item.key;
                  const hasChildren = !!item.children?.length;
                  const isOpen = expanded === item.key;
                  return (
                    <li
                      key={item.key}
                      className="border-b border-mist-800/40"
                    >
                      <div className="flex items-center">
                        <Link
                          href={withLocale(locale, item.href)}
                          onClick={() => setOpen(false)}
                          className="text-body flex-1 px-3 py-3 font-medium text-mist-200 transition-colors hover:text-gold-500"
                        >
                          {label}
                        </Link>
                        {hasChildren && (
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            aria-label={`Toggle ${label}`}
                            onClick={() =>
                              setExpanded(isOpen ? null : item.key)
                            }
                            className="p-3 text-mist-400 transition-colors hover:text-gold-500"
                          >
                            <IconChevronDown
                              size={18}
                              stroke={1.5}
                              className={`transition-transform ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        )}
                      </div>
                      {hasChildren && isOpen && (
                        <ul className="flex flex-col bg-forest-950 pb-2">
                          {item.children!.map((child) => (
                            <li key={child.key}>
                              <Link
                                href={withLocale(locale, child.href)}
                                onClick={() => setOpen(false)}
                                className="text-body flex items-center gap-2 px-6 py-2 text-mist-200 transition-colors hover:text-gold-500"
                              >
                                <span>
                                  {navLabels[child.key] ?? child.key}
                                </span>
                                {child.exclusive && (
                                  <span className="text-eyebrow rounded-full bg-gold-500/15 px-2 py-0.5 text-gold-500">
                                    ★ {exclusiveLabel}
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
