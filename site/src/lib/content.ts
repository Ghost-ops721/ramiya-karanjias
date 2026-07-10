import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type Article = {
  slug: string;
  title: string;
  source?: string;
  content: string;
  excerpt: string;
};

const articlesDir = path.join(process.cwd(), "content/articles");

function excerptFrom(body: string, title: string): string {
  const plain = body
    .replace(/^#+\s.*$/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const withoutTitle = plain.startsWith(title) ? plain.slice(title.length).trim() : plain;
  if (withoutTitle.length <= 180) return withoutTitle;
  return withoutTitle.slice(0, 177).trimEnd() + "…";
}

export function getArticleSlugs(): string[] {
  return fs
    .readdirSync(articlesDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getArticle(slug: string): Article | null {
  const full = path.join(articlesDir, `${slug}.md`);
  if (!fs.existsSync(full)) return null;
  const raw = fs.readFileSync(full, "utf8");
  const { data, content } = matter(raw);
  const title = String(data.title ?? slug).replace(/\u00a0/g, " ").trim();
  // Scraped WP bodies often use single newlines between paragraphs.
  const normalized = content
    .trim()
    .replace(/\u00a0/g, " ")
    .replace(/([^\n])\n(?!\n|#|\s*[-*]|\s*\d+\.)/g, "$1\n\n");
  return {
    slug: String(data.slug ?? slug),
    title,
    source: data.source ? String(data.source) : undefined,
    content: normalized,
    excerpt: excerptFrom(normalized, title),
  };
}

export function getAllArticles(): Article[] {
  return getArticleSlugs()
    .map((slug) => getArticle(slug)!)
    .filter(Boolean)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getArticlesBySlugs(slugs: readonly string[]): Article[] {
  return slugs
    .map((slug) => getArticle(slug))
    .filter((a): a is Article => Boolean(a));
}
