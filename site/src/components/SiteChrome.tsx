"use client";

import type { ReactNode } from "react";
import { useEditMode } from "@/components/admin/EditModeProvider";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { SiteSettings } from "@/lib/cms-types";
import type { Section } from "@/lib/nav";

/** Header/footer follow live settings (including after a pencil-save). */
export function SiteChrome({
  sections: _serverSections,
  settings: _serverSettings,
  children,
}: {
  sections: Section[];
  settings: SiteSettings;
  children: ReactNode;
}) {
  const { settings, sections } = useEditMode();

  return (
    <>
      <SiteHeader
        sections={sections}
        contactEmail={settings.contact.email}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter
        name={settings.name}
        tagline={settings.tagline}
        contactEmail={settings.contact.email}
        contactName={settings.contact.name}
      />
    </>
  );
}
