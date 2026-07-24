"use client";

import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { clientDb } from "@/lib/firebase-client";
import type { SiteSettings } from "@/lib/cms-types";
import type { Section } from "@/lib/nav";
import { normalizeTheme } from "@/lib/theme";
import { excerptFrom, normalizeMarkdown } from "@/lib/cms-types";

export async function saveSiteSettings(
  settings: SiteSettings,
  email: string,
) {
  await setDoc(
    doc(clientDb(), "settings", "site"),
    {
      name: settings.name.trim(),
      tagline: settings.tagline.trim(),
      contact: {
        name: settings.contact.name.trim(),
        email: settings.contact.email.trim(),
        address: settings.contact.address.trim(),
      },
      linkWords: (settings.linkWords ?? [])
        .map((w) => ({
          label: w.label.trim(),
          href: w.href.trim(),
        }))
        .filter((w) => w.label && w.href),
      theme: normalizeTheme(settings.theme),
      updatedAt: serverTimestamp(),
      updatedBy: email,
    },
    { merge: true },
  );
}

export async function saveNav(
  sections: Section[],
  homeFeatured: string[],
  email: string,
) {
  const cleanSections = sections.map((s) => ({
    id: s.id,
    title: s.title,
    blurb: s.blurb,
    items: s.items.map((i) => {
      const item: { title: string; slug: string; children?: typeof i.children } =
        {
          title: i.title,
          slug: i.slug,
        };
      if (i.children && i.children.length > 0) {
        item.children = i.children.map((c) => ({
          title: c.title,
          slug: c.slug,
        }));
      }
      return item;
    }),
  }));

  await setDoc(
    doc(clientDb(), "nav", "sections"),
    {
      sections: cleanSections,
      homeFeatured: homeFeatured.map((s) => s.trim()).filter(Boolean),
      updatedAt: serverTimestamp(),
      updatedBy: email,
    },
    { merge: true },
  );
}

export async function loadHomeFeatured(): Promise<string[]> {
  const snap = await getDoc(doc(clientDb(), "nav", "sections"));
  if (snap.exists() && Array.isArray(snap.data()?.homeFeatured)) {
    return snap.data()!.homeFeatured as string[];
  }
  return [];
}

export async function saveArticleDoc(
  slug: string,
  data: { title: string; content: string; source: string },
  email: string,
) {
  const title = data.title.trim();
  const normalized = normalizeMarkdown(data.content);
  await setDoc(
    doc(clientDb(), "articles", slug),
    {
      slug,
      title,
      content: normalized,
      excerpt: excerptFrom(normalized, title),
      source: data.source.trim() || null,
      published: true,
      updatedAt: serverTimestamp(),
      updatedBy: email,
    },
    { merge: true },
  );
}
