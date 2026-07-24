"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArticleCard } from "@/components/ArticleCard";
import { CtaBar } from "@/components/CtaBar";
import { Masthead } from "@/components/Masthead";
import { EditableBlock } from "@/components/admin/EditableBlock";
import { InlineArea, InlineText } from "@/components/admin/InlineEdit";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useEditMode } from "@/components/admin/EditModeProvider";
import {
  patchNav,
  saveSiteSettings,
  saveArticleDoc,
} from "@/components/admin/saveContent";
import { useAdminFetch } from "@/components/admin/useAdminFetch";
import { btnOutline, btnSolid } from "@/lib/buttons";
import type { Article } from "@/lib/content";
import type { SiteSettings } from "@/lib/cms-types";
import type { Section } from "@/lib/nav";
import { excerptFrom, normalizeMarkdown } from "@/lib/cms-types";

type Props = {
  settings: SiteSettings;
  sections: Section[];
  homeFeatured: string[];
  featured: Article[];
};

function renameNavItem(sections: Section[], slug: string, title: string): Section[] {
  return sections.map((s) => ({
    ...s,
    items: s.items.map((item) => {
      if (item.slug === slug) return { ...item, title };
      if (!item.children?.length) return item;
      return {
        ...item,
        children: item.children.map((c) =>
          c.slug === slug ? { ...c, title } : c,
        ),
      };
    }),
  }));
}

export function EditableHome({
  featured: featuredProp,
}: Props) {
  const { user } = useAdminAuth();
  const { settings, sections, activeBlockId } = useEditMode();
  const adminFetch = useAdminFetch();

  const [name, setName] = useState(settings.name);
  const [tagline, setTagline] = useState(settings.tagline);
  const [contactName, setContactName] = useState(settings.contact.name);
  const [contactEmail, setContactEmail] = useState(settings.contact.email);
  const [contactAddress, setContactAddress] = useState(
    settings.contact.address,
  );
  const [sectionDrafts, setSectionDrafts] = useState(
    sections.map((s) => ({ id: s.id, title: s.title, blurb: s.blurb })),
  );
  const [linkWords, setLinkWords] = useState(
    () => (settings.linkWords ?? []).map((w) => ({ ...w })),
  );
  const [featuredTitles, setFeaturedTitles] = useState<Record<string, string>>(
    {},
  );
  const [featured, setFeatured] = useState(featuredProp);
  const pendingFeaturedRef = useRef<Record<string, Article> | null>(null);

  useEffect(() => {
    const pending = pendingFeaturedRef.current;
    if (!pending) {
      setFeatured(featuredProp);
      return;
    }
    const nextPending = { ...pending };
    for (const slug of Object.keys(nextPending)) {
      const server = featuredProp.find((a) => a.slug === slug);
      const local = nextPending[slug];
      if (
        server &&
        server.title === local.title &&
        server.content === local.content
      ) {
        delete nextPending[slug];
      }
    }
    pendingFeaturedRef.current =
      Object.keys(nextPending).length > 0 ? nextPending : null;
    setFeatured(featuredProp.map((a) => nextPending[a.slug] ?? a));
  }, [featuredProp]);

  useEffect(() => {
    if (activeBlockId === "masthead") {
      setName(settings.name);
      setTagline(settings.tagline);
    }
    if (activeBlockId === "contact") {
      setContactName(settings.contact.name);
      setContactEmail(settings.contact.email);
      setContactAddress(settings.contact.address);
    }
    if (activeBlockId === "explore") {
      setLinkWords((settings.linkWords ?? []).map((w) => ({ ...w })));
    }
    if (activeBlockId?.startsWith("article-")) {
      const slug = activeBlockId.slice("article-".length);
      const art = featured.find((a) => a.slug === slug);
      if (art && art.slug === slug) {
        setFeaturedTitles((prev) => ({ ...prev, [slug]: art.title }));
      }
    }
    if (activeBlockId?.startsWith("section-")) {
      setSectionDrafts(
        sections.map((s) => ({ id: s.id, title: s.title, blurb: s.blurb })),
      );
    }
  }, [activeBlockId, settings, sections, featured]);

  const lead = featured[0];
  const rest = featured.slice(1);
  const words = settings.linkWords ?? [];

  async function saveSettingsPatch(patch: Partial<SiteSettings>) {
    if (!user) throw new Error("Not signed in");
    const saved = await saveSiteSettings(patch, user.email || user.uid);
    await adminFetch("/api/revalidate", {
      method: "POST",
      body: JSON.stringify({ paths: ["/", "/topics"] }),
    });
    return { settings: saved };
  }

  async function saveArticleTitle(article: Article, title: string) {
    if (!user) throw new Error("Not signed in");
    const trimmed = title.trim();
    await saveArticleDoc(
      article.slug,
      {
        title: trimmed,
        content: article.content,
        source: article.source ?? "",
      },
      user.email || user.uid,
    );
    const { sections: nextSections } = await patchNav(
      (current) => ({
        sections: renameNavItem(current, article.slug, trimmed),
      }),
      user.email || user.uid,
    );
    await adminFetch("/api/revalidate", {
      method: "POST",
      body: JSON.stringify({
        slug: article.slug,
        paths: ["/", "/topics"],
      }),
    });
    const updated: Article = { ...article, title: trimmed };
    pendingFeaturedRef.current = {
      ...(pendingFeaturedRef.current ?? {}),
      [article.slug]: updated,
    };
    setFeatured((list) =>
      list.map((a) => (a.slug === article.slug ? updated : a)),
    );
    return { sections: nextSections };
  }

  function FeaturedEditable({
    article,
    kicker,
    large,
  }: {
    article: Article;
    kicker?: string;
    large?: boolean;
  }) {
    const draftTitle = featuredTitles[article.slug] ?? article.title;
    return (
      <EditableBlock
        id={`article-${article.slug}`}
        label={article.title}
        onSave={async () => saveArticleTitle(article, draftTitle)}
        editor={
          <div>
            {kicker ? <p className="kicker mb-2">{kicker}</p> : null}
            <InlineText
              value={draftTitle}
              onChange={(e) =>
                setFeaturedTitles((prev) => ({
                  ...prev,
                  [article.slug]: e.target.value,
                }))
              }
              aria-label="Article title"
              className={`font-display leading-snug text-ink ${
                large
                  ? "text-[1.85rem] sm:text-[2.2rem]"
                  : "text-[1.35rem] sm:text-[1.5rem]"
              }`}
            />
            <p
              className={`mt-2 text-ink-soft ${
                large
                  ? "text-[1.15rem] leading-relaxed"
                  : "text-[1.05rem] leading-relaxed"
              }`}
            >
              {article.excerpt ||
                excerptFrom(normalizeMarkdown(article.content), article.title)}
            </p>
          </div>
        }
      >
        <ArticleCard article={article} kicker={kicker} large={large} />
      </EditableBlock>
    );
  }

  return (
    <div className="fade-mount pb-16">
      <EditableBlock
        id="masthead"
        label="name and tagline"
        onSave={() =>
          saveSettingsPatch({ name: name.trim(), tagline: tagline.trim() })
        }
        editor={
          <div className="mx-auto max-w-6xl px-2 pt-6 text-center sm:px-4 sm:pt-8">
            <InlineText
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Site name"
              className="masthead-title text-center text-[clamp(2.4rem,7vw,4.6rem)] text-ink"
            />
            <InlineArea
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              aria-label="Tagline"
              rows={3}
              className="mx-auto mt-4 max-w-2xl text-center text-[1.15rem] leading-relaxed text-ink-soft sm:text-[1.2rem]"
            />
          </div>
        }
      >
        <Masthead name={settings.name} tagline={settings.tagline} />
      </EditableBlock>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <EditableBlock
          id="explore"
          label="explore words"
          onSave={() =>
            saveSettingsPatch({
              linkWords: linkWords
                .map((w) => ({
                  label: w.label.trim(),
                  href: w.href,
                }))
                .filter((w) => w.label),
            })
          }
          editor={
            <div>
              <p className="kicker mb-3">Explore more about</p>
              <div className="flex flex-col gap-2">
                {linkWords.map((word, index) => (
                  <InlineText
                    key={index}
                    value={word.label}
                    onChange={(e) =>
                      setLinkWords((list) =>
                        list.map((w, i) =>
                          i === index ? { ...w, label: e.target.value } : w,
                        ),
                      )
                    }
                    aria-label={`Word ${index + 1}`}
                    className="text-[1.1rem] font-semibold text-link sm:text-[1.15rem]"
                  />
                ))}
              </div>
            </div>
          }
        >
          <section className="mb-10 border-b border-rule pb-8">
            <p className="kicker mb-3">Explore more about</p>
            <p className="text-[1.1rem] leading-relaxed text-ink-soft sm:text-[1.15rem]">
              {words.map((word, index) => (
                <span key={`${word.label}-${index}`}>
                  {index > 0 ? ", " : null}
                  <Link
                    href={word.href}
                    className="font-semibold text-link no-underline hover:text-accent"
                  >
                    {word.label}
                  </Link>
                </span>
              ))}
              .
            </p>
          </section>
        </EditableBlock>

        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[1.15rem] text-ink-soft">
            Large, clear type. Simple paths. Start with a section below.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/topics" className={btnSolid}>
              Browse all topics
            </Link>
            <Link href="/section/faqs" className={btnOutline}>
              Read FAQs
            </Link>
          </div>
        </div>

        {lead ? (
          <section className="mb-10 border-b border-rule pb-10">
            <FeaturedEditable article={lead} kicker="Start here" large />
          </section>
        ) : null}

        <section className="mb-12 grid gap-8 border-b border-rule pb-10 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((article, i) => (
            <FeaturedEditable
              key={article.slug}
              article={article}
              kicker={i < 2 ? "Featured" : undefined}
            />
          ))}
        </section>

        <section className="mb-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="kicker mb-2">The paper</p>
              <h2 className="font-display text-3xl text-ink sm:text-4xl">
                Sections
              </h2>
            </div>
            <Link
              href="/topics"
              className="hidden text-[1.05rem] font-semibold sm:inline"
            >
              A–Z list →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {sections.map((section) => {
              const draft = sectionDrafts.find((d) => d.id === section.id);
              return (
                <EditableBlock
                  key={section.id}
                  id={`section-${section.id}`}
                  label={section.title}
                  onSave={async () => {
                    if (!user || !draft) throw new Error("Nothing to save");
                    const { sections: next } = await patchNav(
                      (current) => ({
                        sections: current.map((s) =>
                          s.id === section.id
                            ? {
                                ...s,
                                title: draft.title.trim(),
                                blurb: draft.blurb.trim(),
                              }
                            : s,
                        ),
                      }),
                      user.email || user.uid,
                    );
                    await adminFetch("/api/revalidate", {
                      method: "POST",
                      body: JSON.stringify({
                        paths: ["/", `/section/${section.id}`, "/topics"],
                      }),
                    });
                    return { sections: next };
                  }}
                  editor={
                    <div className="space-y-3 p-2">
                      <InlineText
                        value={draft?.title ?? section.title}
                        onChange={(e) =>
                          setSectionDrafts((list) =>
                            list.map((d) =>
                              d.id === section.id
                                ? { ...d, title: e.target.value }
                                : d,
                            ),
                          )
                        }
                        aria-label="Section title"
                        className="font-display text-[1.35rem] text-ink"
                      />
                      <InlineArea
                        value={draft?.blurb ?? section.blurb}
                        onChange={(e) =>
                          setSectionDrafts((list) =>
                            list.map((d) =>
                              d.id === section.id
                                ? { ...d, blurb: e.target.value }
                                : d,
                            ),
                          )
                        }
                        aria-label="Short description"
                        rows={2}
                        className="text-[1.05rem] leading-relaxed text-ink-soft"
                      />
                    </div>
                  }
                >
                  <Link
                    href={`/section/${section.id}`}
                    className="block border border-rule bg-paper/40 p-5 no-underline transition-colors hover:border-ink hover:bg-paper-deep/50"
                  >
                    <h3 className="font-display text-[1.35rem] text-ink">
                      {section.title}
                    </h3>
                    <p className="mt-2 text-[1.05rem] leading-relaxed text-ink-soft">
                      {section.blurb}
                    </p>
                    <p className="mt-3 text-[1rem] font-semibold text-link">
                      {`${section.items.length} ${
                        section.items.length === 1 ? "article" : "articles"
                      } →`}
                    </p>
                  </Link>
                </EditableBlock>
              );
            })}
          </div>
        </section>

        <EditableBlock
          id="contact"
          label="contact"
          onSave={() =>
            saveSettingsPatch({
              contact: {
                name: contactName.trim(),
                email: contactEmail.trim(),
                address: contactAddress.trim(),
              },
            })
          }
          editor={
            <aside className="border border-rule bg-paper-deep/60 p-4 sm:p-5">
              <p className="kicker mb-2">Contact</p>
              <p className="mb-1 text-[0.95rem] text-ink-soft">Name</p>
              <InlineText
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                aria-label="Contact name"
                className="font-display text-2xl text-ink"
              />
              <p className="mb-1 mt-3 text-[0.95rem] text-ink-soft">Email</p>
              <InlineText
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                aria-label="Contact email"
                className="text-[1.1rem] text-ink"
              />
              <p className="mb-1 mt-3 text-[0.95rem] text-ink-soft">Address</p>
              <InlineArea
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                aria-label="Contact address"
                rows={3}
                className="text-[0.98rem] leading-relaxed text-ink-soft"
              />
            </aside>
          }
        >
          <CtaBar
            contactName={settings.contact.name}
            contactEmail={settings.contact.email}
            contactAddress={settings.contact.address}
          />
        </EditableBlock>
      </div>
    </div>
  );
}
