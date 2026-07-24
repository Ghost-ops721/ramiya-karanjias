"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CtaBar } from "@/components/CtaBar";
import { EditableBlock } from "@/components/admin/EditableBlock";
import { InlineArea, InlineText } from "@/components/admin/InlineEdit";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useEditMode } from "@/components/admin/EditModeProvider";
import { loadHomeFeatured, saveNav } from "@/components/admin/saveContent";
import { useAdminFetch } from "@/components/admin/useAdminFetch";
import type { Article } from "@/lib/content";
import type { NavItem } from "@/lib/nav";

type Listed = { item: NavItem; article: Article | null };

type Props = {
  sectionId: string;
  articles: Listed[];
};

export function EditableSection({ sectionId, articles }: Props) {
  const { user } = useAdminAuth();
  const { settings, sections, activeBlockId } = useEditMode();
  const adminFetch = useAdminFetch();
  const section = sections.find((s) => s.id === sectionId);

  const [title, setTitle] = useState(section?.title ?? "");
  const [blurb, setBlurb] = useState(section?.blurb ?? "");

  useEffect(() => {
    if (!section) return;
    if (activeBlockId === "section-header") {
      setTitle(section.title);
      setBlurb(section.blurb);
    }
  }, [activeBlockId, section]);

  if (!section) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 text-[1.15rem] text-ink-soft">
        Section not found.
      </div>
    );
  }

  return (
    <div className="fade-mount mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: section.title, href: `/section/${section.id}` },
        ]}
      />

      <EditableBlock
        id="section-header"
        label="section title"
        onSave={async () => {
          if (!user) throw new Error("Not signed in");
          const next = sections.map((s) =>
            s.id === sectionId
              ? { ...s, title: title.trim(), blurb: blurb.trim() }
              : s,
          );
          const featured = await loadHomeFeatured();
          await saveNav(next, featured, user.email || user.uid);
          await adminFetch("/api/revalidate", {
            method: "POST",
            body: JSON.stringify({
              paths: ["/", `/section/${sectionId}`, "/topics"],
            }),
          });
          return { sections: next };
        }}
        editor={
          <div>
            <p className="kicker mb-3">Section</p>
            <InlineText
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Section title"
              className="font-display text-[clamp(1.9rem,4vw,2.8rem)] text-ink"
            />
            <InlineArea
              value={blurb}
              onChange={(e) => setBlurb(e.target.value)}
              aria-label="Short description"
              rows={3}
              className="mt-4 max-w-2xl text-[1.2rem] leading-relaxed text-ink-soft"
            />
          </div>
        }
      >
        <div>
          <p className="kicker mb-3">Section</p>
          <h1 className="font-display text-[clamp(1.9rem,4vw,2.8rem)] text-ink">
            {section.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[1.2rem] leading-relaxed text-ink-soft">
            {section.blurb}
          </p>
        </div>
      </EditableBlock>

      <hr className="paper-rule my-8" />

      <ol className="space-y-6">
        {articles.map(({ item, article }, index) => (
          <li key={item.slug} className="border-b border-rule pb-6">
            <p className="text-[0.95rem] text-ink-soft">Article {index + 1}</p>
            <h2 className="mt-1 font-display text-[1.45rem] text-ink sm:text-[1.65rem]">
              <Link
                href={`/article/${item.slug}`}
                className="text-ink no-underline hover:text-accent"
              >
                {item.title}
              </Link>
            </h2>
            {article ? (
              <p className="mt-2 max-w-3xl text-[1.08rem] leading-relaxed text-ink-soft">
                {article.excerpt}
              </p>
            ) : null}
            <p className="mt-3">
              <Link
                href={`/article/${item.slug}`}
                className="text-[1.05rem] font-semibold"
              >
                Read this article →
              </Link>
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-10">
        <CtaBar
          compact
          contactName={settings.contact.name}
          contactEmail={settings.contact.email}
          contactAddress={settings.contact.address}
        />
      </div>
    </div>
  );
}
