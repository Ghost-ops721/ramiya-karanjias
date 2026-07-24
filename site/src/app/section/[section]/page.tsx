import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditableSection } from "@/components/admin/EditableSection";
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

  return <EditableSection sectionId={id} articles={articles} />;
}
