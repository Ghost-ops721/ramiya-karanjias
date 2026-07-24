"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArticleBody } from "@/components/ArticleBody";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CtaBar } from "@/components/CtaBar";
import { EditableBlock } from "@/components/admin/EditableBlock";
import { InlineArea, InlineText } from "@/components/admin/InlineEdit";
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

  useEffect(() => {
    setCommitted(article);
  }, [article]);

  useEffect(() => {
    if (activeBlockId === "article") {
      setTitle(committed.title);
      setContent(committed.content);
    }
  }, [activeBlockId, committed]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs items={crumbs} />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <EditableBlock
          id="article"
          label="this article"
          onSave={async () => {
            if (!user) throw new Error("Not signed in");
            await saveArticleDoc(
              article.slug,
              { title, content, source: committed.source ?? "" },
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
              excerpt: excerptFrom(normalized, title.trim()),
            });
          }}
          editor={
            <article>
              {section ? <p className="kicker mb-3">{section.title}</p> : null}
              <InlineText
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="Title"
                className="font-display text-[clamp(1.9rem,4vw,2.75rem)] leading-tight text-ink"
              />
              <hr className="paper-rule my-6" />
              <InlineArea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                aria-label="Article text"
                rows={20}
                className="min-h-[20rem] text-[1.12rem] leading-relaxed text-ink"
              />
            </article>
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
