"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { clientDb } from "@/lib/firebase-client";
import { btnSolid } from "@/lib/buttons";

type Row = { slug: string; title: string };

export default function AdminArticlesPage() {
  const { user, loading } = useAdminAuth();
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/admin");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await getDocs(collection(clientDb(), "articles"));
      setRows(
        snap.docs
          .map((d) => ({
            slug: d.id,
            title: String(d.data().title ?? d.id),
          }))
          .sort((a, b) => a.title.localeCompare(b.title)),
      );
      setReady(true);
    })().catch(console.error);
  }, [user]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(needle) ||
        r.slug.toLowerCase().includes(needle),
    );
  }, [rows, q]);

  if (loading || !user) {
    return <div className="mx-auto max-w-4xl px-4 py-12 text-ink-soft">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="kicker mb-1">
            <Link href="/admin" className="no-underline">
              Admin
            </Link>{" "}
            / Articles
          </p>
          <h1 className="font-display text-3xl text-ink">Articles</h1>
        </div>
        <Link href="/admin/articles/new" className={btnSolid}>
          New article
        </Link>
      </div>

      <input
        type="search"
        placeholder="Search by title or slug…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="mb-6 w-full border border-rule bg-paper px-3 py-2.5 text-[1.05rem] outline-none focus:border-ink"
      />

      {!ready ? (
        <p className="text-ink-soft">Loading articles…</p>
      ) : (
        <ul className="divide-y divide-rule border border-rule bg-paper">
          {filtered.map((row) => (
            <li key={row.slug}>
              <Link
                href={`/admin/articles/${row.slug}`}
                className="flex items-center justify-between gap-4 px-4 py-3 no-underline hover:bg-paper-deep/40"
              >
                <span className="text-[1.08rem] font-semibold text-ink">{row.title}</span>
                <span className="shrink-0 text-[0.95rem] text-ink-soft">{row.slug}</span>
              </Link>
            </li>
          ))}
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-ink-soft">No articles match.</li>
          ) : null}
        </ul>
      )}

      <p className="mt-6">
        <Link href="/admin" className="font-semibold">
          ← Dashboard
        </Link>
      </p>
    </div>
  );
}
