"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArticleCard } from "@/components/ArticleCard";
import { CtaBar } from "@/components/CtaBar";
import { Masthead } from "@/components/Masthead";
import { EditableBlock } from "@/components/admin/EditableBlock";
import { EditField } from "@/components/admin/EditFields";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useEditMode } from "@/components/admin/EditModeProvider";
import {
  loadHomeFeatured,
  saveNav,
  saveSiteSettings,
} from "@/components/admin/saveContent";
import { useAdminFetch } from "@/components/admin/useAdminFetch";
import { btnOutline, btnSolid } from "@/lib/buttons";
import type { Article } from "@/lib/content";
import type { SiteSettings } from "@/lib/cms-types";
import type { Section } from "@/lib/nav";

type Props = {
  settings: SiteSettings;
  sections: Section[];
  homeFeatured: string[];
  featured: Article[];
  latestSeries: Article | null;
};

export function EditableHome({
  homeFeatured: serverFeatured,
  featured,
  latestSeries,
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
  const [linkWords, setLinkWords] = useState(settings.linkWords ?? []);
  const [featuredText, setFeaturedText] = useState(serverFeatured.join("\n"));
  const [sectionDrafts, setSectionDrafts] = useState(
    sections.map((s) => ({ id: s.id, title: s.title, blurb: s.blurb })),
  );

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
    if (activeBlockId === "featured") {
      setFeaturedText(serverFeatured.join("\n"));
    }
    if (activeBlockId?.startsWith("section-")) {
      setSectionDrafts(
        sections.map((s) => ({ id: s.id, title: s.title, blurb: s.blurb })),
      );
    }
  }, [activeBlockId, settings, sections, serverFeatured]);

  const lead = featured[0];
  const rest = featured.slice(1);
  const words = settings.linkWords ?? [];

  async function saveSettingsPatch(patch: Partial<SiteSettings>) {
    if (!user) throw new Error("Not signed in");
    const next: SiteSettings = {
      ...settings,
      ...patch,
      contact: patch.contact ?? settings.contact,
      linkWords: patch.linkWords ?? settings.linkWords,
      theme: settings.theme,
    };
    await saveSiteSettings(next, user.email || user.uid);
    await adminFetch("/api/revalidate", {
      method: "POST",
      body: JSON.stringify({ paths: ["/", "/topics"] }),
    });
    return { settings: next };
  }

  return (
    <div className="fade-mount pb-16">
      <EditableBlock
        id="masthead"
        label="Site name & tagline"
        onSave={() =>
          saveSettingsPatch({ name: name.trim(), tagline: tagline.trim() })
        }
        editor={
          <>
            <EditField label="Site name" value={name} onChange={setName} />
            <EditField
              label="Tagline"
              value={tagline}
              onChange={setTagline}
              rows={3}
            />
          </>
        }
      >
        <Masthead name={settings.name} tagline={settings.tagline} />
      </EditableBlock>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <EditableBlock
          id="explore"
          label="Explore more about"
          onSave={() =>
            saveSettingsPatch({
              linkWords: linkWords
                .map((w) => ({
                  label: w.label.trim(),
                  href: w.href.trim(),
                }))
                .filter((w) => w.label && w.href),
            })
          }
          editor={
            <>
              {linkWords.map((word, index) => (
                <div
                  key={index}
                  className="space-y-3 border border-rule bg-paper p-4"
                >
                  <EditField
                    label="Word shown"
                    value={word.label}
                    onChange={(label) =>
                      setLinkWords((list) =>
                        list.map((w, i) => (i === index ? { ...w, label } : w)),
                      )
                    }
                  />
                  <EditField
                    label="Link (for example /article/ahura-mazda)"
                    value={word.href}
                    onChange={(href) =>
                      setLinkWords((list) =>
                        list.map((w, i) => (i === index ? { ...w, href } : w)),
                      )
                    }
                  />
                  <button
                    type="button"
                    className={`${btnOutline} text-lg`}
                    onClick={() =>
                      setLinkWords((list) =>
                        list.filter((_, i) => i !== index),
                      )
                    }
                  >
                    Remove this word
                  </button>
                </div>
              ))}
              <button
                type="button"
                className={`${btnSolid} text-lg`}
                onClick={() =>
                  setLinkWords((list) => [
                    ...list,
                    { label: "", href: "/" },
                  ])
                }
              >
                Add a word
              </button>
            </>
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

        <EditableBlock
          id="featured"
          label="Featured articles"
          onSave={async () => {
            if (!user) throw new Error("Not signed in");
            const lines = featuredText
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean);
            await saveNav(sections, lines, user.email || user.uid);
            await adminFetch("/api/revalidate", {
              method: "POST",
              body: JSON.stringify({ paths: ["/", "/topics"] }),
            });
          }}
          editor={
            <EditField
              label="One article page name per line (the part after /article/)"
              value={featuredText}
              onChange={setFeaturedText}
              rows={8}
            />
          }
        >
          <>
            {lead ? (
              <section className="mb-10 border-b border-rule pb-10">
                <ArticleCard article={lead} kicker="Start here" large />
              </section>
            ) : null}
            <section className="mb-12 grid gap-8 border-b border-rule pb-10 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((article, i) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  kicker={i < 2 ? "Featured" : undefined}
                />
              ))}
            </section>
          </>
        </EditableBlock>

        {latestSeries ? (
          <section className="mb-12 border-b border-rule pb-10">
            <ArticleCard
              article={latestSeries}
              kicker="Latest in the history series"
            />
          </section>
        ) : null}

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
                    const next = sections.map((s) =>
                      s.id === section.id
                        ? {
                            ...s,
                            title: draft.title.trim(),
                            blurb: draft.blurb.trim(),
                          }
                        : s,
                    );
                    const featured = await loadHomeFeatured();
                    await saveNav(next, featured, user.email || user.uid);
                    await adminFetch("/api/revalidate", {
                      method: "POST",
                      body: JSON.stringify({
                        paths: ["/", `/section/${section.id}`, "/topics"],
                      }),
                    });
                    return { sections: next };
                  }}
                  editor={
                    <>
                      <EditField
                        label="Section title"
                        value={draft?.title ?? section.title}
                        onChange={(title) =>
                          setSectionDrafts((list) =>
                            list.map((d) =>
                              d.id === section.id ? { ...d, title } : d,
                            ),
                          )
                        }
                      />
                      <EditField
                        label="Short description"
                        value={draft?.blurb ?? section.blurb}
                        onChange={(blurb) =>
                          setSectionDrafts((list) =>
                            list.map((d) =>
                              d.id === section.id ? { ...d, blurb } : d,
                            ),
                          )
                        }
                        rows={2}
                      />
                      <p className="text-[1.05rem] text-ink-soft">
                        To change which articles are listed, open this section
                        page and use the pencil there.
                      </p>
                    </>
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
          label="Contact"
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
            <>
              <EditField
                label="Contact name"
                value={contactName}
                onChange={setContactName}
              />
              <EditField
                label="Contact email"
                type="email"
                value={contactEmail}
                onChange={setContactEmail}
              />
              <EditField
                label="Contact address"
                value={contactAddress}
                onChange={setContactAddress}
                rows={3}
              />
            </>
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
