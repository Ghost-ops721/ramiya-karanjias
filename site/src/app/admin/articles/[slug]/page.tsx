import { AdminArticleEditor } from "@/components/admin/AdminArticleEditor";

export default async function AdminArticleEditorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <AdminArticleEditor slug={slug} />;
}
