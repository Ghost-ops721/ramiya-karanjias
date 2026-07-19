import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CtaBar } from "@/components/CtaBar";
import { getArticle } from "@/lib/content";
import { getSections } from "@/lib/nav-data";

type Props = { params: Promise<{ section: string }> };

export const revalidate = 60;

export async function generateStaticParams() {
  const sections = await getSections();
  return sections.map((s) => ({ section: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section: id } = await params;
  const sections = await getSections();
  const section = sections.find((s) => s.id === id);
  if (!section) return {};
  return {
    title: section.title,
    description: section.blurb,
  };
}

export default async function SectionPage({ params }: Props) {
  const { section: id } = await params;
  const sections = await getSections();
  const section = sections.find((s) => s.id === id);
  if (!section) notFound();

  const articles = (
    await Promise.all(
      section.items.map(async (item) => ({
        item,
        article: await getArticle(item.slug),
      })),
    )
  ).filter((x) => x.article);

  return (
    <div className="fade-mount mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: section.title, href: `/section/${section.id}` },
        ]}
      />

      <p className="kicker mb-3">Section</p>
      <h1 className="font-display text-[clamp(1.9rem,4vw,2.8rem)] text-ink">
        {section.title}
      </h1>
      <p className="mt-4 max-w-2xl text-[1.2rem] leading-relaxed text-ink-soft">
        {section.blurb}
      </p>
      <hr className="paper-rule my-8" />

      <ol className="space-y-6">
        {articles.map(({ item, article }, index) => (
          <li key={item.slug} className="border-b border-rule pb-6">
            <p className="text-[0.95rem] text-ink-soft">Article {index + 1}</p>
            <h2 className="mt-1 font-display text-[1.45rem] text-ink sm:text-[1.65rem]">
              <Link
                href={`/article/${item.slug}`}
                className="text-ink no-underline hover:text-accent"
              >
                {item.title}
              </Link>
            </h2>
            {article ? (
              <p className="mt-2 max-w-3xl text-[1.08rem] leading-relaxed text-ink-soft">
                {article.excerpt}
              </p>
            ) : null}
            <p className="mt-3">
              <Link
                href={`/article/${item.slug}`}
                className="text-[1.05rem] font-semibold"
              >
                Read this article →
              </Link>
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-10">
        <CtaBar compact />
      </div>
    </div>
  );
}
