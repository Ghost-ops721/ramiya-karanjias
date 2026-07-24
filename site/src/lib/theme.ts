export type TextSizePreset = "smaller" | "normal" | "larger" | "largest";

export type SiteTheme = {
  paper: string;
  paperDeep: string;
  ink: string;
  inkSoft: string;
  rule: string;
  accent: string;
  accentSoft: string;
  link: string;
  textSize: TextSizePreset;
};

export const DEFAULT_THEME: SiteTheme = {
  paper: "#f2efe8",
  paperDeep: "#e8e3d8",
  ink: "#161410",
  inkSoft: "#3d3830",
  rule: "#c9c2b4",
  accent: "#6b2d1a",
  accentSoft: "#8a3d28",
  link: "#1f3d5c",
  textSize: "normal",
};

export const TEXT_SIZE_LABELS: { id: TextSizePreset; label: string }[] = [
  { id: "smaller", label: "Smaller" },
  { id: "normal", label: "Normal" },
  { id: "larger", label: "Larger" },
  { id: "largest", label: "Largest" },
];

export const TEXT_SIZE_CSS: Record<TextSizePreset, string> = {
  smaller: "1rem",
  normal: "1.125rem",
  larger: "1.25rem",
  largest: "1.4rem",
};

export const THEME_COLOR_FIELDS: {
  key: keyof Omit<SiteTheme, "textSize">;
  label: string;
}[] = [
  { key: "paper", label: "Page background" },
  { key: "paperDeep", label: "Soft background" },
  { key: "ink", label: "Main text" },
  { key: "inkSoft", label: "Soft text" },
  { key: "link", label: "Links" },
  { key: "accent", label: "Accent" },
  { key: "accentSoft", label: "Accent soft" },
  { key: "rule", label: "Lines" },
];

export function normalizeTheme(raw: unknown): SiteTheme {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_THEME };
  const t = raw as Partial<SiteTheme>;
  const textSize = TEXT_SIZE_LABELS.some((x) => x.id === t.textSize)
    ? (t.textSize as TextSizePreset)
    : DEFAULT_THEME.textSize;
  return {
    paper: String(t.paper ?? DEFAULT_THEME.paper),
    paperDeep: String(t.paperDeep ?? DEFAULT_THEME.paperDeep),
    ink: String(t.ink ?? DEFAULT_THEME.ink),
    inkSoft: String(t.inkSoft ?? DEFAULT_THEME.inkSoft),
    rule: String(t.rule ?? DEFAULT_THEME.rule),
    accent: String(t.accent ?? DEFAULT_THEME.accent),
    accentSoft: String(t.accentSoft ?? DEFAULT_THEME.accentSoft),
    link: String(t.link ?? DEFAULT_THEME.link),
    textSize,
  };
}

export function themeToCssVars(theme: SiteTheme): Record<string, string> {
  return {
    "--paper": theme.paper,
    "--paper-deep": theme.paperDeep,
    "--ink": theme.ink,
    "--ink-soft": theme.inkSoft,
    "--rule": theme.rule,
    "--accent": theme.accent,
    "--accent-soft": theme.accentSoft,
    "--link": theme.link,
    "--focus": theme.link,
    "--body-size": TEXT_SIZE_CSS[theme.textSize],
  };
}
