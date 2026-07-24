"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { SiteSettings } from "@/lib/cms-types";
import type { Section } from "@/lib/nav";
import { DEFAULT_THEME, normalizeTheme, type SiteTheme } from "@/lib/theme";

export type SavePatch = {
  settings?: SiteSettings;
  sections?: Section[];
};

type EditModeValue = {
  activeBlockId: string | null;
  busy: boolean;
  status: string | null;
  wink: boolean;
  themeOpen: boolean;
  themeLive: SiteTheme;
  settings: SiteSettings;
  sections: Section[];
  setActiveBlockId: (id: string | null) => void;
  setBusy: (busy: boolean) => void;
  setStatus: (status: string | null) => void;
  clearWink: () => void;
  setThemeOpen: (open: boolean) => void;
  setTheme: (next: SiteTheme | ((prev: SiteTheme) => SiteTheme)) => void;
  afterSave: (patch?: SavePatch) => void;
};

const EditModeContext = createContext<EditModeValue | null>(null);

function cloneSettings(settings: SiteSettings): SiteSettings {
  return {
    ...settings,
    contact: { ...settings.contact },
    linkWords: (settings.linkWords ?? []).map((w) => ({ ...w })),
    theme: { ...normalizeTheme(settings.theme) },
  };
}

function cloneSections(sections: Section[]): Section[] {
  return sections.map((s) => ({
    ...s,
    items: s.items.map((i) => ({
      ...i,
      children: i.children?.map((c) => ({ ...c })),
    })),
  }));
}

export function EditModeProvider({
  settings,
  sections,
  children,
}: {
  settings: SiteSettings;
  sections: Section[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeBlockId, setActiveBlockIdState] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [wink, setWink] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [baselineSettings, setBaselineSettings] = useState(() =>
    cloneSettings(settings),
  );
  const [baselineSections, setBaselineSections] = useState(() =>
    cloneSections(sections),
  );
  const [themeDraft, setThemeDraft] = useState<SiteTheme | null>(null);
  const skipPathCancel = useRef(true);

  useEffect(() => {
    if (!activeBlockId && !themeOpen) {
      setBaselineSettings(cloneSettings(settings));
      setBaselineSections(cloneSections(sections));
    }
  }, [settings, sections, activeBlockId, themeOpen]);

  useEffect(() => {
    if (skipPathCancel.current) {
      skipPathCancel.current = false;
      return;
    }
    setActiveBlockIdState(null);
    setThemeOpen(false);
    setThemeDraft(null);
    setStatus(null);
  }, [pathname]);

  const setActiveBlockId = useCallback((id: string | null) => {
    setActiveBlockIdState(id);
    if (id) {
      setThemeOpen(false);
      setStatus(null);
    }
  }, []);

  const themeLive = useMemo(() => {
    if (themeOpen && themeDraft) return themeDraft;
    return normalizeTheme(baselineSettings.theme ?? DEFAULT_THEME);
  }, [themeOpen, themeDraft, baselineSettings.theme]);

  const setThemeOpenSafe = useCallback(
    (open: boolean) => {
      if (open) {
        setActiveBlockIdState(null);
        setThemeDraft(
          normalizeTheme(baselineSettings.theme ?? DEFAULT_THEME),
        );
        setStatus(null);
      } else {
        setThemeDraft(null);
      }
      setThemeOpen(open);
    },
    [baselineSettings.theme],
  );

  const setTheme = useCallback(
    (next: SiteTheme | ((prev: SiteTheme) => SiteTheme)) => {
      setThemeDraft((prev) => {
        const current =
          prev ?? normalizeTheme(baselineSettings.theme ?? DEFAULT_THEME);
        return typeof next === "function" ? next(current) : next;
      });
    },
    [baselineSettings.theme],
  );

  const clearWink = useCallback(() => setWink(false), []);

  const afterSave = useCallback(
    (patch?: SavePatch) => {
      if (patch?.settings) setBaselineSettings(cloneSettings(patch.settings));
      if (patch?.sections) setBaselineSections(cloneSections(patch.sections));
      setActiveBlockIdState(null);
      setThemeOpen(false);
      setThemeDraft(null);
      setStatus(null);
      setWink(true);
      router.refresh();
    },
    [router],
  );

  const value = useMemo(
    () => ({
      activeBlockId,
      busy,
      status,
      wink,
      themeOpen,
      themeLive,
      settings: baselineSettings,
      sections: baselineSections,
      setActiveBlockId,
      setBusy,
      setStatus,
      clearWink,
      setThemeOpen: setThemeOpenSafe,
      setTheme,
      afterSave,
    }),
    [
      activeBlockId,
      busy,
      status,
      wink,
      themeOpen,
      themeLive,
      baselineSettings,
      baselineSections,
      setActiveBlockId,
      clearWink,
      setThemeOpenSafe,
      setTheme,
      afterSave,
    ],
  );

  return (
    <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>
  );
}

export function useEditMode() {
  const ctx = useContext(EditModeContext);
  if (!ctx) throw new Error("useEditMode must be used within EditModeProvider");
  return ctx;
}
