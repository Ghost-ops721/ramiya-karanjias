"use client";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type DocumentData,
} from "firebase/firestore";
import { clientDb } from "@/lib/firebase-client";
import type {
  RevisionAction,
  RevisionDoc,
  RevisionKind,
  SiteSettings,
} from "@/lib/cms-types";
import type { Section } from "@/lib/nav";
import { normalizeTheme } from "@/lib/theme";
import { excerptFrom, normalizeMarkdown } from "@/lib/cms-types";

function liveDocRef(kind: RevisionKind, targetId: string) {
  const db = clientDb();
  if (kind === "settings") return doc(db, "settings", targetId);
  if (kind === "nav") return doc(db, "nav", targetId);
  return doc(db, "articles", targetId);
}

function stripMeta(data: DocumentData): Record<string, unknown> {
  const { updatedAt: _a, updatedBy: _b, ...rest } = data;
  return rest;
}

async function snapshotBeforeWrite(
  kind: RevisionKind,
  targetId: string,
  label: string,
  email: string,
  action: RevisionAction = "save",
) {
  const snap = await getDoc(liveDocRef(kind, targetId));
  if (!snap.exists()) return;

  await addDoc(collection(clientDb(), "revisions"), {
    kind,
    targetId,
    label,
    data: stripMeta(snap.data()),
    createdAt: serverTimestamp(),
    createdBy: email,
    action,
  });
}

export async function saveSiteSettings(
  settings: SiteSettings,
  email: string,
) {
  await snapshotBeforeWrite("settings", "site", "Site settings", email);

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
  await snapshotBeforeWrite(
    "nav",
    "sections",
    "Navigation & sections",
    email,
  );

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

  await snapshotBeforeWrite(
    "article",
    slug,
    title || slug,
    email,
  );

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

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
}

export async function loadLiveDoc(
  kind: RevisionKind,
  targetId: string,
): Promise<Record<string, unknown> | null> {
  const snap = await getDoc(liveDocRef(kind, targetId));
  if (!snap.exists()) return null;
  return stripMeta(snap.data());
}

export async function listRevisions(max = 100): Promise<RevisionDoc[]> {
  const q = query(
    collection(clientDb(), "revisions"),
    orderBy("createdAt", "desc"),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      kind: data.kind as RevisionKind,
      targetId: String(data.targetId ?? ""),
      label: String(data.label ?? data.targetId ?? "Change"),
      data: (data.data ?? {}) as Record<string, unknown>,
      createdAt: toDate(data.createdAt),
      createdBy: String(data.createdBy ?? ""),
      action: (data.action === "rollback" ? "rollback" : "save") as RevisionAction,
    };
  });
}

export type RestoreResult = {
  kind: RevisionKind;
  targetId: string;
  settings?: SiteSettings;
  sections?: Section[];
};

export async function restoreRevision(
  revisionId: string,
  email: string,
): Promise<RestoreResult> {
  const revSnap = await getDoc(doc(clientDb(), "revisions", revisionId));
  if (!revSnap.exists()) throw new Error("Revision not found");

  const rev = revSnap.data();
  const kind = rev.kind as RevisionKind;
  const targetId = String(rev.targetId ?? "");
  const payload = (rev.data ?? {}) as Record<string, unknown>;
  const label = String(rev.label ?? targetId);

  await snapshotBeforeWrite(kind, targetId, label, email, "rollback");

  await setDoc(
    liveDocRef(kind, targetId),
    {
      ...payload,
      updatedAt: serverTimestamp(),
      updatedBy: email,
    },
    { merge: true },
  );

  const result: RestoreResult = { kind, targetId };

  if (kind === "settings") {
    result.settings = {
      name: String(payload.name ?? ""),
      tagline: String(payload.tagline ?? ""),
      contact: {
        name: String((payload.contact as { name?: string })?.name ?? ""),
        email: String((payload.contact as { email?: string })?.email ?? ""),
        address: String((payload.contact as { address?: string })?.address ?? ""),
      },
      linkWords: Array.isArray(payload.linkWords)
        ? (payload.linkWords as { label: string; href: string }[])
        : [],
      theme: normalizeTheme(payload.theme),
    };
  }

  if (kind === "nav" && Array.isArray(payload.sections)) {
    result.sections = payload.sections as Section[];
  }

  return result;
}

export function revalidatePathsFor(
  kind: RevisionKind,
  targetId: string,
): { paths: string[]; slug?: string } {
  if (kind === "article") {
    return { slug: targetId, paths: ["/", "/topics", `/article/${targetId}`] };
  }
  return { paths: ["/", "/topics"] };
}
