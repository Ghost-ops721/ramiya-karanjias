import { EditableHome } from "@/components/admin/EditableHome";
import { getArticlesBySlugs } from "@/lib/content";
import { getHomeFeatured, getSections } from "@/lib/nav-data";
import { getSiteSettings } from "@/lib/site-data";

export const revalidate = 60;

export default async function HomePage() {
  const [homeFeatured, sections, settings] = await Promise.all([
    getHomeFeatured(),
    getSections(),
    getSiteSettings(),
  ]);
  const featured = await getArticlesBySlugs(homeFeatured);

  return (
    <EditableHome
      settings={settings}
      sections={sections}
      homeFeatured={[...homeFeatured]}
      featured={featured}
    />
  );
}
