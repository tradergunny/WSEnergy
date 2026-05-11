"use client";

import { useState } from "react";
import Link from "next/link";
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
        className="text-graphite-900 hover:text-brand-600 inline-flex items-center p-2 md:hidden"
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
          <div className="bg-graphite-50 absolute top-0 right-0 flex h-full w-[85%] max-w-sm flex-col">
            <div className="border-graphite-200 flex items-center justify-between border-b px-4 py-3">
              <span className="text-h4 text-brand-600 font-medium">
                WS Energy
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="text-graphite-800 hover:text-brand-600 p-2"
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
                      className="border-graphite-200/60 border-b"
                    >
                      <div className="flex items-center">
                        <Link
                          href={withLocale(locale, item.href)}
                          onClick={() => setOpen(false)}
                          className="text-body text-graphite-900 hover:text-brand-600 flex-1 px-3 py-3 font-medium"
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
                            className="text-graphite-600 hover:text-brand-600 p-3"
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
                        <ul className="bg-graphite-100 flex flex-col pb-2">
                          {item.children!.map((child) => (
                            <li key={child.key}>
                              <Link
                                href={withLocale(locale, child.href)}
                                onClick={() => setOpen(false)}
                                className="text-body text-graphite-800 hover:text-brand-600 flex items-center gap-2 px-6 py-2"
                              >
                                <span>
                                  {navLabels[child.key] ?? child.key}
                                </span>
                                {child.exclusive && (
                                  <span className="text-eyebrow bg-brand-50 text-brand-800 rounded-sm px-1.5 py-0.5">
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
