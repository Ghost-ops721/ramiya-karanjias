import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  adminDb,
  isFirebaseConfigured,
} from "@/lib/firebase-admin";
import type { ArticleDoc } from "@/lib/cms-types";
import { excerptFrom, normalizeMarkdown } from "@/lib/cms-types";

export type Article = {
  slug: string;
  title: string;
  source?: string;
  content: string;
  excerpt: string;
};

const articlesDir = path.join(process.cwd(), "content/articles");

function fromFs(slug: string): Article | null {
  const full = path.join(articlesDir, `${slug}.md`);
  if (!fs.existsSync(full)) return null;
  const raw = fs.readFileSync(full, "utf8");
  const { data, content } = matter(raw);
  const title = String(data.title ?? slug).replace(/\u00a0/g, " ").trim();
  const normalized = normalizeMarkdown(content);
  return {
    slug: String(data.slug ?? slug),
    title,
    source: data.source ? String(data.source) : undefined,
    content: normalized,
    excerpt: excerptFrom(normalized, title),
  };
}

function getFsSlugs(): string[] {
  if (!fs.existsSync(articlesDir)) return [];
  return fs
    .readdirSync(articlesDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

function mapDoc(
  slug: string,
  data: {
    slug?: unknown;
    title?: unknown;
    source?: unknown;
    content?: unknown;
    excerpt?: unknown;
  },
): Article {
  return {
    slug: String(data.slug ?? slug),
    title: String(data.title ?? slug),
    source: data.source ? String(data.source) : undefined,
    content: String(data.content ?? ""),
    excerpt: String(data.excerpt ?? ""),
  };
}

export async function getArticleSlugs(): Promise<string[]> {
  if (isFirebaseConfigured()) {
    try {
      const snap = await adminDb().collection("articles").select().get();
      if (!snap.empty) return snap.docs.map((d) => d.id);
    } catch (err) {
      console.error("Firestore getArticleSlugs failed, falling back to files:", err);
    }
  }
  return getFsSlugs();
}

export async function getArticle(slug: string): Promise<Article | null> {
  if (isFirebaseConfigured()) {
    try {
      const doc = await adminDb().collection("articles").doc(slug).get();
      if (doc.exists) {
        const data = doc.data()!;
        if (data.published === false) return null;
        return mapDoc(slug, data);
      }
    } catch (err) {
      console.error("Firestore getArticle failed, falling back to files:", err);
    }
  }
  return fromFs(slug);
}

export async function getAllArticles(): Promise<Article[]> {
  if (isFirebaseConfigured()) {
    try {
      const snap = await adminDb().collection("articles").get();
      if (!snap.empty) {
        return snap.docs
          .filter((d) => d.data().published !== false)
          .map((d) => mapDoc(d.id, d.data()))
          .sort((a, b) => a.title.localeCompare(b.title));
      }
    } catch (err) {
      console.error("Firestore getAllArticles failed, falling back to files:", err);
    }
  }
  const slugs = getFsSlugs();
  return slugs
    .map((slug) => fromFs(slug)!)
    .filter(Boolean)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function getArticlesBySlugs(
  slugs: readonly string[],
): Promise<Article[]> {
  const results: Article[] = [];
  for (const slug of slugs) {
    const article = await getArticle(slug);
    if (article) results.push(article);
  }
  return results;
}

export type { ArticleDoc };
