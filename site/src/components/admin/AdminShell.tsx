"use client";

import type { ReactNode } from "react";
import { AdminAuthProvider } from "@/components/admin/AdminAuthProvider";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { EditModeProvider } from "@/components/admin/EditModeProvider";
import { ThemeStyle } from "@/components/admin/ThemeStyle";
import type { SiteSettings } from "@/lib/cms-types";
import type { Section } from "@/lib/nav";

export function AdminShell({
  settings,
  sections,
  children,
}: {
  settings: SiteSettings;
  sections: Section[];
  children: ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <EditModeProvider settings={settings} sections={sections}>
        <ThemeStyle />
        <AdminToolbar />
        {children}
      </EditModeProvider>
    </AdminAuthProvider>
  );
}
