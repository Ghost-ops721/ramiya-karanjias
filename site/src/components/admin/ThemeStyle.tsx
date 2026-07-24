"use client";

import { useEffect } from "react";
import { themeToCssVars } from "@/lib/theme";
import { useEditMode } from "@/components/admin/EditModeProvider";

/** Applies live theme CSS variables (including draft while editing). */
export function ThemeStyle() {
  const { themeLive } = useEditMode();

  useEffect(() => {
    const root = document.documentElement;
    const vars = themeToCssVars(themeLive);
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
  }, [themeLive]);

  return null;
}
