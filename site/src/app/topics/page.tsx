import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TopicBrowser } from "@/components/TopicBrowser";
import { getAllArticles } from "@/lib/content";
import { findSectionForSlug } from "@/lib/nav-data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All topics",
  description: "Search and browse every article on this site.",
};

export default async function TopicsPage() {
  const articles = await getAllArticles();
  const topics = await Promise.all(
    articles.map(async (article) => ({
      slug: article.slug,
      title: article.title,
      section: (await findSectionForSlug(article.slug))?.title ?? null,
    })),
  );

  return (
    <div className="fade-mount mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "All topics", href: "/topics" },
        ]}
      />

      <h1 className="font-display text-[clamp(1.9rem,4vw,2.8rem)] text-ink">
        All topics
      </h1>
      <p className="mt-3 max-w-2xl text-[1.15rem] text-ink-soft">
        Search by name, or browse the full A–Z list below.
      </p>

      <div className="mt-8">
        <TopicBrowser topics={topics} />
      </div>
    </div>
  );
}
