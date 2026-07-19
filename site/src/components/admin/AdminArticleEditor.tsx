"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useAdminFetch } from "@/components/admin/useAdminFetch";
import { clientDb } from "@/lib/firebase-client";
import { excerptFrom, normalizeMarkdown, slugify } from "@/lib/cms-types";
import { btnOutline, btnSolid } from "@/lib/buttons";

export function AdminArticleEditor({ slug: paramSlug }: { slug: string }) {
  const isNew = paramSlug === "new";
  const router = useRouter();
  const { user, loading } = useAdminAuth();
  const adminFetch = useAdminFetch();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState(isNew ? "" : paramSlug);
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(isNew);

  useEffect(() => {
    if (!loading && !user) router.replace("/admin");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || isNew) return;
    (async () => {
      const snap = await getDoc(doc(clientDb(), "articles", paramSlug));
      if (!snap.exists()) {
        setStatus("Article not found.");
        setLoaded(true);
        return;
      }
      const data = snap.data();
      setTitle(String(data.title ?? ""));
      setSlug(String(data.slug ?? paramSlug));
      setContent(String(data.content ?? ""));
      setSource(data.source ? String(data.source) : "");
      setLoaded(true);
    })().catch((err) => {
      console.error(err);
      setStatus("Failed to load article.");
      setLoaded(true);
    });
  }, [user, isNew, paramSlug]);

  const preview = useMemo(() => normalizeMarkdown(content), [content]);

  async function save() {
    if (!user) return;
    const finalSlug = (slug || slugify(title)).trim();
    if (!finalSlug || !title.trim()) {
      setStatus("Title and slug are required.");
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const normalized = normalizeMarkdown(content);
      await setDoc(
        doc(clientDb(), "articles", finalSlug),
        {
          slug: finalSlug,
          title: title.trim(),
          content: normalized,
          excerpt: excerptFrom(normalized, title.trim()),
          source: source.trim() || null,
          published: true,
          updatedAt: serverTimestamp(),
          updatedBy: user.email || user.uid,
        },
        { merge: true },
      );
      await adminFetch("/api/revalidate", {
        method: "POST",
        body: JSON.stringify({ slug: finalSlug }),
      });
      setStatus("Saved. Public site will refresh shortly.");
      if (isNew || finalSlug !== paramSlug) {
        router.replace(`/admin/articles/${finalSlug}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("Save failed. Check permissions and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user || !loaded) {
    return <div className="mx-auto max-w-5xl px-4 py-12 text-ink-soft">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="kicker mb-1">
        <Link href="/admin" className="no-underline">
          Admin
        </Link>{" "}
        /{" "}
        <Link href="/admin/articles" className="no-underline">
          Articles
        </Link>{" "}
        / {isNew ? "New" : paramSlug}
      </p>
      <h1 className="font-display text-3xl text-ink">
        {isNew ? "New article" : "Edit article"}
      </h1>

      <div className="mt-8 space-y-4">
        <label className="block">
          <span className="kicker">Title</span>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (isNew && !slug) setSlug(slugify(e.target.value));
            }}
            className="admin-field mt-1 w-full px-3 py-2.5 text-[1.05rem]"
          />
        </label>
        <label className="block">
          <span className="kicker">Slug (URL)</span>
          <input
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            disabled={!isNew}
            className="admin-field mt-1 w-full px-3 py-2.5 text-[1.05rem] disabled:opacity-60"
          />
          <span className="mt-1 block text-[0.95rem] text-ink-soft">
            Public URL: /article/{slug || "…"}
          </span>
        </label>
        <label className="block">
          <span className="kicker">Source URL (optional)</span>
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="admin-field mt-1 w-full px-3 py-2.5 text-[1.05rem]"
          />
        </label>
        <label className="block">
          <span className="kicker">Body (Markdown)</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={18}
            className="admin-field mt-1 w-full px-3 py-2.5 font-mono text-[0.98rem] leading-relaxed"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={save} disabled={busy} className={btnSolid}>
          {busy ? "Saving…" : "Save"}
        </button>
        <Link href="/admin/articles" className={btnOutline}>
          Back to list
        </Link>
        {!isNew ? (
          <Link href={`/article/${paramSlug}`} className={btnOutline} target="_blank">
            View public page
          </Link>
        ) : null}
      </div>
      {status ? <p className="mt-4 text-[1.05rem] text-ink-soft">{status}</p> : null}

      <hr className="paper-rule my-10" />
      <p className="kicker mb-3">Preview</p>
      <article className="prose-article border border-rule bg-paper p-5">
        <h2 className="font-display text-2xl text-ink">{title || "Untitled"}</h2>
        <div className="mt-4 text-[1.08rem] leading-relaxed text-ink">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{preview}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
