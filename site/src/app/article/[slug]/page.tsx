import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditableArticle } from "@/components/admin/EditableArticle";
import { getArticle, getArticleSlugs } from "@/lib/content";
import { breadcrumbsForSlug, findSectionForSlug } from "@/lib/nav-data";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const section = await findSectionForSlug(slug);
  const crumbs = await breadcrumbsForSlug(slug);

  return (
    <EditableArticle article={article} section={section} crumbs={crumbs} />
  );
}
