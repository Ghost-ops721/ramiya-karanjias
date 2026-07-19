"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useAdminFetch } from "@/components/admin/useAdminFetch";
import { clientDb } from "@/lib/firebase-client";
import type { Section } from "@/lib/nav";
import { btnOutline, btnSolid } from "@/lib/buttons";

export default function AdminNavPage() {
  const { user, loading } = useAdminAuth();
  const router = useRouter();
  const adminFetch = useAdminFetch();
  const [sections, setSections] = useState<Section[]>([]);
  const [homeFeatured, setHomeFeatured] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/admin");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await getDoc(doc(clientDb(), "nav", "sections"));
      if (snap.exists()) {
        const data = snap.data();
        setSections((data.sections as Section[]) || []);
        setHomeFeatured(
          Array.isArray(data.homeFeatured) ? data.homeFeatured.join("\n") : "",
        );
      }
      setReady(true);
    })().catch(console.error);
  }, [user]);

  function updateSection(index: number, patch: Partial<Section>) {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    );
  }

  function updateItemsJson(index: number, raw: string) {
    try {
      const items = JSON.parse(raw) as Section["items"];
      updateSection(index, { items });
      setStatus(null);
    } catch {
      setStatus("Invalid JSON in items for a section.");
    }
  }

  async function save() {
    if (!user) return;
    setBusy(true);
    setStatus(null);
    try {
      await setDoc(
        doc(clientDb(), "nav", "sections"),
        {
          sections,
          homeFeatured: homeFeatured
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          updatedAt: serverTimestamp(),
          updatedBy: user.email || user.uid,
        },
        { merge: true },
      );
      await adminFetch("/api/revalidate", {
        method: "POST",
        body: JSON.stringify({ paths: ["/", "/topics"] }),
      });
      setStatus("Saved. Public navigation will refresh shortly.");
    } catch (err) {
      console.error(err);
      setStatus("Save failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user || !ready) {
    return <div className="mx-auto max-w-4xl px-4 py-12 text-ink-soft">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="kicker mb-1">
        <Link href="/admin" className="no-underline">
          Admin
        </Link>{" "}
        / Navigation
      </p>
      <h1 className="font-display text-3xl text-ink">Sections & navigation</h1>
      <p className="mt-2 text-[1.05rem] text-ink-soft">
        Edit section titles and blurbs. Article links are edited as JSON arrays of
        {" "}
        <code>{`{ "title", "slug" }`}</code>.
      </p>

      <div className="mt-8 space-y-8">
        {sections.map((section, index) => (
          <div key={section.id} className="border border-rule bg-paper p-4">
            <p className="kicker mb-2">Section id: {section.id}</p>
            <label className="mt-2 block">
              <span className="kicker">Title</span>
              <input
                value={section.title}
                onChange={(e) => updateSection(index, { title: e.target.value })}
                className="mt-1 w-full border border-rule bg-paper px-3 py-2 text-[1.05rem] outline-none focus:border-ink"
              />
            </label>
            <label className="mt-3 block">
              <span className="kicker">Blurb</span>
              <textarea
                value={section.blurb}
                onChange={(e) => updateSection(index, { blurb: e.target.value })}
                rows={2}
                className="mt-1 w-full border border-rule bg-paper px-3 py-2 text-[1.05rem] outline-none focus:border-ink"
              />
            </label>
            <label className="mt-3 block">
              <span className="kicker">Items (JSON)</span>
              <textarea
                defaultValue={JSON.stringify(section.items, null, 2)}
                key={`${section.id}-${section.items.length}`}
                onBlur={(e) => updateItemsJson(index, e.target.value)}
                rows={8}
                className="mt-1 w-full border border-rule bg-paper px-3 py-2 font-mono text-[0.9rem] outline-none focus:border-ink"
              />
            </label>
          </div>
        ))}
      </div>

      <label className="mt-8 block">
        <span className="kicker">Homepage featured slugs (one per line)</span>
        <textarea
          value={homeFeatured}
          onChange={(e) => setHomeFeatured(e.target.value)}
          rows={6}
          className="mt-1 w-full border border-rule bg-paper px-3 py-2 font-mono text-[0.95rem] outline-none focus:border-ink"
        />
      </label>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={save} disabled={busy} className={btnSolid}>
          {busy ? "Saving…" : "Save navigation"}
        </button>
        <Link href="/admin" className={btnOutline}>
          Dashboard
        </Link>
      </div>
      {status ? <p className="mt-4 text-[1.05rem] text-ink-soft">{status}</p> : null}
    </div>
  );
}
