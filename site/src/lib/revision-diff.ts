import type { RevisionKind } from "@/lib/cms-types";
import { TEXT_SIZE_LABELS } from "@/lib/theme";

export type FieldChange = {
  path: string;
  label: string;
  before: string;
  after: string;
  /** When true, show one plain sentence block instead of Older / Now columns. */
  singleColumn?: boolean;
};

const META_KEYS = new Set(["updatedAt", "updatedBy"]);

const FIELD_LABELS: Record<string, string> = {
  name: "Site name",
  tagline: "Tagline under the name",
  "contact.name": "Contact name",
  "contact.email": "Contact email",
  "contact.address": "Contact address",
  linkWords: "Explore words (links on the home page)",
  "theme.paper": "Page background colour",
  "theme.paperDeep": "Soft background colour",
  "theme.ink": "Main text colour",
  "theme.inkSoft": "Lighter text colour",
  "theme.rule": "Line colour",
  "theme.accent": "Accent colour",
  "theme.accentSoft": "Soft accent colour",
  "theme.link": "Link colour",
  "theme.textSize": "Text size",
  sections: "Topics & menu sections",
  homeFeatured: "Featured articles on the home page",
  title: "Title",
  content: "Article text",
  excerpt: "Short summary",
  source: "Source note",
  published: "Shown on the site",
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function empty(): string {
  return "Nothing here";
}

function formatLinkWords(value: unknown): string {
  if (!Array.isArray(value) || value.length === 0) return empty();
  return value
    .map((item, i) => {
      if (!isPlainObject(item)) return `${i + 1}. ${String(item)}`;
      const label = String(item.label ?? "").trim() || "(no name)";
      return `${i + 1}. ${label}`;
    })
    .join("\n");
}

/** Plain English for explore-word list changes (only what moved). */
function formatLinkWordsDiff(before: unknown, after: unknown): FieldChange | null {
  const toLabels = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    return value.map((item) => {
      if (isPlainObject(item)) return String(item.label ?? "").trim() || "(no name)";
      return String(item);
    });
  };
  const a = toLabels(before);
  const b = toLabels(after);
  if (a.join("\n") === b.join("\n")) return null;

  const lines: string[] = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    const older = a[i];
    const newer = b[i];
    if (older === newer) continue;
    if (older && newer) lines.push(`“${older}” became “${newer}”`);
    else if (older && !newer) lines.push(`Removed: “${older}”`);
    else if (!older && newer) lines.push(`Added: “${newer}”`);
  }
  if (lines.length === 0) {
    lines.push("The list order changed.");
  }

  return {
    path: "linkWords",
    label: "Explore words (links on the home page)",
    before: lines.join("\n"),
    after: "",
    singleColumn: true,
  };
}

function formatSections(value: unknown): string {
  if (!Array.isArray(value) || value.length === 0) return empty();
  return value
    .map((section) => {
      if (!isPlainObject(section)) return String(section);
      const title = String(section.title ?? section.id ?? "Section");
      const blurb = String(section.blurb ?? "").trim();
      const items = Array.isArray(section.items) ? section.items : [];
      const itemLines = items.map((item) => {
        if (!isPlainObject(item)) return `  • ${String(item)}`;
        const name = String(item.title ?? "").trim() || "Untitled";
        const children = Array.isArray(item.children) ? item.children : [];
        const childLines = children
          .map((c) => {
            if (!isPlainObject(c)) return `    – ${String(c)}`;
            return `    – ${String(c.title ?? "").trim() || "Untitled"}`;
          })
          .join("\n");
        return childLines ? `  • ${name}\n${childLines}` : `  • ${name}`;
      });
      const head = blurb ? `${title}\n  ${blurb}` : title;
      return itemLines.length ? `${head}\n${itemLines.join("\n")}` : head;
    })
    .join("\n\n");
}

function formatFeatured(value: unknown): string {
  if (!Array.isArray(value) || value.length === 0) return empty();
  return value
    .map((slug, i) => `${i + 1}. ${String(slug).replace(/-/g, " ")}`)
    .join("\n");
}

function formatTextSize(value: unknown): string {
  const id = String(value ?? "");
  const match = TEXT_SIZE_LABELS.find((o) => o.id === id);
  return match?.label ?? (id || empty());
}

function formatColour(value: unknown): string {
  const hex = String(value ?? "").trim();
  if (!hex) return empty();
  return hex.toUpperCase();
}

function formatPublished(value: unknown): string {
  if (value === false) return "No — hidden";
  if (value === true) return "Yes — visible";
  return empty();
}

function formatValue(path: string, value: unknown): string {
  if (value === undefined || value === null || value === "") return empty();

  if (path === "linkWords") return formatLinkWords(value);
  if (path === "sections") return formatSections(value);
  if (path === "homeFeatured") return formatFeatured(value);
  if (path === "theme.textSize") return formatTextSize(value);
  if (path.startsWith("theme.")) return formatColour(value);
  if (path === "published") return formatPublished(value);

  if (typeof value === "string") return value;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return empty();
    return value.map((v, i) => `${i + 1}. ${String(v)}`).join("\n");
  }

  if (isPlainObject(value)) {
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${String(v)}`)
      .join("\n");
  }

  return String(value);
}

function labelFor(path: string): string {
  return FIELD_LABELS[path] ?? path;
}

function flatten(
  data: Record<string, unknown>,
  prefix = "",
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (META_KEYS.has(key)) continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(value) && (key === "contact" || key === "theme")) {
      Object.assign(out, flatten(value, path));
    } else {
      out[path] = value;
    }
  }
  return out;
}

function valuesEqual(path: string, a: unknown, b: unknown): boolean {
  return formatValue(path, a) === formatValue(path, b);
}

/**
 * Compare a history snapshot against the live doc.
 * before = older saved version, after = what is live now.
 */
export function diffRevisionAgainstLive(
  kind: RevisionKind,
  historyData: Record<string, unknown>,
  liveData: Record<string, unknown> | null,
): FieldChange[] {
  const before = flatten(historyData);
  const after = flatten(liveData ?? {});
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changes: FieldChange[] = [];

  for (const path of [...keys].sort()) {
    if (path === "slug" && kind === "article") continue;
    if (path === "excerpt") continue;
    const b = before[path];
    const a = after[path];
    if (valuesEqual(path, b, a)) continue;

    if (path === "linkWords") {
      const special = formatLinkWordsDiff(b, a);
      if (special) changes.push(special);
      continue;
    }

    changes.push({
      path,
      label: labelFor(path),
      before: formatValue(path, b),
      after: formatValue(path, a),
    });
  }

  return changes;
}

export function summarizeChange(change: FieldChange, max = 280): {
  before: string;
  after: string;
  truncated: boolean;
} {
  const truncate = (s: string) =>
    s.length > max ? s.slice(0, max).trimEnd() + "…" : s;
  const before = truncate(change.before);
  const after = truncate(change.after);
  return {
    before,
    after,
    truncated: change.before.length > max || change.after.length > max,
  };
}
