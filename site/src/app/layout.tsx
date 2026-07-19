import type { Metadata } from "next";
import { Literata } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getSections } from "@/lib/nav-data";
import { getSiteSettings } from "@/lib/site-data";
import "./globals.css";

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: {
      default: `${settings.name} — Zoroastrian religion & Iranian history`,
      template: `%s · ${settings.name}`,
    },
    description: settings.tagline,
    keywords: (settings.linkWords ?? []).map((w) => w.label),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sections, settings] = await Promise.all([
    getSections(),
    getSiteSettings(),
  ]);

  return (
    <html lang="en" className={`${literata.variable} h-full`}>
      <body className="flex min-h-full flex-col font-body text-ink antialiased">
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
      </body>
    </html>
  );
}
