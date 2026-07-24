import {
  site as fallbackSite,
  linkWords as fallbackLinkWords,
} from "@/lib/site-static";
import { adminDb, isFirebaseConfigured } from "@/lib/firebase-admin";
import type { SiteSettings } from "@/lib/cms-types";
import { DEFAULT_THEME, normalizeTheme } from "@/lib/theme";

export type { SiteSettings };

export async function getSiteSettings(): Promise<SiteSettings> {
  if (isFirebaseConfigured()) {
    try {
      const doc = await adminDb().collection("settings").doc("site").get();
      if (doc.exists) {
        const data = doc.data()!;
        return {
          name: String(data.name ?? fallbackSite.name),
          tagline: String(data.tagline ?? fallbackSite.tagline),
          contact: {
            name: String(data.contact?.name ?? fallbackSite.contact.name),
            address: String(
              data.contact?.address ?? fallbackSite.contact.address,
            ),
            email: String(data.contact?.email ?? fallbackSite.contact.email),
          },
          linkWords: Array.isArray(data.linkWords)
            ? data.linkWords
            : [...fallbackLinkWords],
          theme: normalizeTheme(data.theme),
        };
      }
    } catch (err) {
      console.error("Firestore getSiteSettings failed:", err);
    }
  }
  return {
    name: fallbackSite.name,
    tagline: fallbackSite.tagline,
    contact: { ...fallbackSite.contact },
    linkWords: [...fallbackLinkWords],
    theme: { ...DEFAULT_THEME },
  };
}
