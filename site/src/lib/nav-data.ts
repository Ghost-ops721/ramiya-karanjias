import {
  sections as fallbackSections,
  homeFeatured as fallbackHomeFeatured,
  type NavItem,
  type Section,
} from "@/lib/nav";
import { adminDb, isFirebaseConfigured } from "@/lib/firebase-admin";

export type { NavItem, Section };

export async function getSections(): Promise<Section[]> {
  if (isFirebaseConfigured()) {
    try {
      const doc = await adminDb().collection("nav").doc("sections").get();
      if (doc.exists) {
        const data = doc.data();
        if (Array.isArray(data?.sections) && data.sections.length > 0) {
          return data.sections as Section[];
        }
      }
    } catch (err) {
      console.error("Firestore getSections failed:", err);
    }
  }
  return fallbackSections;
}

export async function getHomeFeatured(): Promise<readonly string[]> {
  if (isFirebaseConfigured()) {
    try {
      const doc = await adminDb().collection("nav").doc("sections").get();
      if (doc.exists) {
        const data = doc.data();
        if (Array.isArray(data?.homeFeatured) && data.homeFeatured.length > 0) {
          return data.homeFeatured as string[];
        }
      }
    } catch (err) {
      console.error("Firestore getHomeFeatured failed:", err);
    }
  }
  return fallbackHomeFeatured;
}

export async function findSectionForSlug(
  slug: string,
): Promise<Section | undefined> {
  const sections = await getSections();
  return sections.find((s) => s.items.some((i) => i.slug === slug));
}

export async function breadcrumbsForSlug(
  slug: string,
): Promise<{ label: string; href: string }[]> {
  const crumbs: { label: string; href: string }[] = [
    { label: "Home", href: "/" },
  ];
  const section = await findSectionForSlug(slug);
  if (section) {
    crumbs.push({ label: section.title, href: `/section/${section.id}` });
    const item = section.items.find((i) => i.slug === slug);
    if (item) crumbs.push({ label: item.title, href: `/article/${slug}` });
  } else if (slug === "about") {
    crumbs.push({ label: "About", href: "/article/about" });
  }
  return crumbs;
}
