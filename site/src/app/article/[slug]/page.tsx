import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/ArticleBody";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CtaBar } from "@/components/CtaBar";
import { getArticle, getArticleSlugs } from "@/lib/content";
import { breadcrumbsForSlug, findSectionForSlug } from "@/lib/nav";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const section = findSectionForSlug(slug);
  const crumbs = breadcrumbsForSlug(slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs items={crumbs} />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <article>
          {section ? <p className="kicker mb-3">{section.title}</p> : null}
          <h1 className="font-display text-[clamp(1.9rem,4vw,2.75rem)] leading-tight text-ink">
            {article.title}
          </h1>
          <hr className="paper-rule my-6" />
          <ArticleBody content={article.content} />

          <div className="mt-12">
            <CtaBar compact />
          </div>
        </article>

        <aside className="lg:pt-2">
          <div className="sticky top-4 space-y-6">
            {section ? (
              <div className="border border-rule p-4">
                <p className="kicker mb-3">In this section</p>
                <ul className="space-y-2.5 text-[1.02rem]">
                  {section.items.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/article/${item.slug}`}
                        className={
                          item.slug === slug
                            ? "font-semibold text-ink no-underline"
                            : "text-link"
                        }
                        aria-current={item.slug === slug ? "page" : undefined}
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-4">
                  <Link href={`/section/${section.id}`} className="font-semibold">
                    Section overview →
                  </Link>
                </p>
              </div>
            ) : null}
            <div className="border border-rule p-4 text-[1.02rem]">
              <p className="kicker mb-2">Need help finding something?</p>
              <Link href="/topics" className="font-semibold">
                Browse all topics →
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
