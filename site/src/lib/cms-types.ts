export type ArticleDoc = {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  source?: string;
  published?: boolean;
  updatedAt?: string;
  updatedBy?: string;
};

export type NavItem = {
  title: string;
  slug: string;
  children?: NavItem[];
};

export type Section = {
  id: string;
  title: string;
  blurb: string;
  items: NavItem[];
};

import type { SiteTheme } from "@/lib/theme";

export type SiteSettings = {
  name: string;
  tagline: string;
  contact: {
    name: string;
    address: string;
    email: string;
  };
  linkWords?: { label: string; href: string }[];
  homeFeatured?: string[];
  theme?: SiteTheme;
};

export type RevisionKind = "article" | "settings" | "nav";
export type RevisionAction = "save" | "rollback";

export type RevisionDoc = {
  id: string;
  kind: RevisionKind;
  targetId: string;
  label: string;
  data: Record<string, unknown>;
  createdAt: Date | null;
  createdBy: string;
  action: RevisionAction;
};

export function excerptFrom(body: string, title: string): string {
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

export function normalizeMarkdown(content: string): string {
  return content
    .trim()
    .replace(/\u00a0/g, " ")
    .replace(/([^\n])\n(?!\n|#|\s*[-*]|\s*\d+\.)/g, "$1\n\n");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
