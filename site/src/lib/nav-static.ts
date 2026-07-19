/** Static fallback IA — runtime prefers Firestore via nav-data.ts */
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

export {
  sections,
  homeFeatured,
  findSectionForSlug,
  breadcrumbsForSlug,
} from "./nav";
