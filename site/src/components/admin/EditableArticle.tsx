"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArticleBody } from "@/components/ArticleBody";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CtaBar } from "@/components/CtaBar";
import { EditableBlock } from "@/components/admin/EditableBlock";
import { EditField } from "@/components/admin/EditFields";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useEditMode } from "@/components/admin/EditModeProvider";
import { saveArticleDoc } from "@/components/admin/saveContent";
import { useAdminFetch } from "@/components/admin/useAdminFetch";
import { excerptFrom, normalizeMarkdown } from "@/lib/cms-types";
import type { Article } from "@/lib/content";
import type { Section } from "@/lib/nav";

type Props = {
  article: Article;
  section: Section | undefined;
  crumbs: { label: string; href: string }[];
};

export function EditableArticle({ article, section, crumbs }: Props) {
  const { user } = useAdminAuth();
  const { settings, activeBlockId } = useEditMode();
  const adminFetch = useAdminFetch();
  const [committed, setCommitted] = useState(article);
  const [title, setTitle] = useState(article.title);
  const [content, setContent] = useState(article.content);
  const [source, setSource] = useState(article.source ?? "");

  useEffect(() => {
    setCommitted(article);
  }, [article]);

  useEffect(() => {
    if (activeBlockId === "article") {
      setTitle(committed.title);
      setContent(committed.content);
      setSource(committed.source ?? "");
    }
  }, [activeBlockId, committed]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs items={crumbs} />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <EditableBlock
          id="article"
          label="This article"
          onSave={async () => {
            if (!user) throw new Error("Not signed in");
            await saveArticleDoc(
              article.slug,
              { title, content, source },
              user.email || user.uid,
            );
            await adminFetch("/api/revalidate", {
              method: "POST",
              body: JSON.stringify({
                slug: article.slug,
                paths: ["/", "/topics"],
              }),
            });
            const normalized = normalizeMarkdown(content);
            setCommitted({
              ...article,
              title: title.trim(),
              content: normalized,
              source: source.trim() || undefined,
              excerpt: excerptFrom(normalized, title.trim()),
            });
          }}
          editor={
            <>
              <EditField label="Title" value={title} onChange={setTitle} />
              <EditField
                label="Article text"
                value={content}
                onChange={setContent}
                rows={22}
              />
              <EditField
                label="Source web address (optional)"
                type="url"
                value={source}
                onChange={setSource}
              />
            </>
          }
        >
          <article>
            {section ? <p className="kicker mb-3">{section.title}</p> : null}
            <h1 className="font-display text-[clamp(1.9rem,4vw,2.75rem)] leading-tight text-ink">
              {committed.title}
            </h1>
            <hr className="paper-rule my-6" />
            <ArticleBody content={committed.content} />
            <div className="mt-12">
              <CtaBar
                compact
                contactName={settings.contact.name}
                contactEmail={settings.contact.email}
                contactAddress={settings.contact.address}
              />
            </div>
          </article>
        </EditableBlock>

        <aside className="lg:pt-2">
          <div className="sticky top-4 space-y-6">
            {section ? (
              <div className="border border-rule p-4">
                <p className="kicker mb-3">In this section</p>
                <ul className="space-y-2.5 text-[1.02rem]">
                  {section.items.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/article/${item.slug}`}
                        className={
                          item.slug === article.slug
                            ? "font-semibold text-ink no-underline"
                            : "text-link"
                        }
                        aria-current={
                          item.slug === article.slug ? "page" : undefined
                        }
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-4">
                  <Link
                    href={`/section/${section.id}`}
                    className="font-semibold"
                  >
                    Section overview →
                  </Link>
                </p>
              </div>
            ) : null}
            <div className="border border-rule p-4 text-[1.02rem]">
              <p className="kicker mb-2">Need help finding something?</p>
              <Link href="/topics" className="font-semibold">
                Browse all topics →
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
