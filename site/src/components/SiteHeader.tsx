"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/LogoMark";
import { btnOutline, btnSolid, btnSolidSm } from "@/lib/buttons";
import type { Section } from "@/lib/nav";

export function SiteHeader({
  sections,
  contactEmail,
}: {
  sections: Section[];
  contactEmail: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="border-b border-rule bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <LogoMark />

        <nav className="hidden items-center gap-5 text-[1.05rem] md:flex" aria-label="Main">
          <Link href="/topics" className="font-semibold text-ink no-underline hover:text-accent">
            Search topics
          </Link>
          <Link href="/section/faqs" className="font-semibold text-ink no-underline hover:text-accent">
            FAQs
          </Link>
          <Link href="/article/about" className="font-semibold text-ink no-underline hover:text-accent">
            About
          </Link>
          <a href={`mailto:${contactEmail}`} className={btnSolidSm}>
            Email Dr. Karanjia
          </a>
        </nav>

        <button
          type="button"
          className={`${btnOutline} px-3 py-2 md:hidden`}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open ? (
        <div
          id="mobile-menu"
          className="border-t border-rule bg-paper px-4 py-4 md:hidden"
        >
          <div className="mb-4 flex flex-col gap-3 text-[1.15rem]">
            <Link href="/topics" onClick={() => setOpen(false)} className="font-semibold text-ink no-underline">
              Search topics
            </Link>
            <Link href="/section/faqs" onClick={() => setOpen(false)} className="font-semibold text-ink no-underline">
              FAQs
            </Link>
            <Link href="/article/about" onClick={() => setOpen(false)} className="font-semibold text-ink no-underline">
              About
            </Link>
            <a href={`mailto:${contactEmail}`} className={`${btnSolid} mt-1`}>
              Email Dr. Karanjia
            </a>
          </div>
          <p className="kicker mb-2">Sections</p>
          <ul className="max-h-[50vh] space-y-2 overflow-y-auto text-[1.05rem]">
            {sections.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/section/${s.id}`}
                  onClick={() => setOpen(false)}
                  className="text-ink no-underline"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
