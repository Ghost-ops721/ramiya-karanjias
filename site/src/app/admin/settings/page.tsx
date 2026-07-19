"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useAdminFetch } from "@/components/admin/useAdminFetch";
import { clientDb } from "@/lib/firebase-client";
import { btnOutline, btnSolid } from "@/lib/buttons";

export default function AdminSettingsPage() {
  const { user, loading } = useAdminAuth();
  const router = useRouter();
  const adminFetch = useAdminFetch();
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/admin");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await getDoc(doc(clientDb(), "settings", "site"));
      if (snap.exists()) {
        const data = snap.data();
        setName(String(data.name ?? ""));
        setTagline(String(data.tagline ?? ""));
        setContactName(String(data.contact?.name ?? ""));
        setContactEmail(String(data.contact?.email ?? ""));
        setContactAddress(String(data.contact?.address ?? ""));
      }
      setReady(true);
    })().catch(console.error);
  }, [user]);

  async function save() {
    if (!user) return;
    setBusy(true);
    setStatus(null);
    try {
      await setDoc(
        doc(clientDb(), "settings", "site"),
        {
          name: name.trim(),
          tagline: tagline.trim(),
          contact: {
            name: contactName.trim(),
            email: contactEmail.trim(),
            address: contactAddress.trim(),
          },
          updatedAt: serverTimestamp(),
          updatedBy: user.email || user.uid,
        },
        { merge: true },
      );
      await adminFetch("/api/revalidate", {
        method: "POST",
        body: JSON.stringify({ paths: ["/"] }),
      });
      setStatus("Saved. Public site will refresh shortly.");
    } catch (err) {
      console.error(err);
      setStatus("Save failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user || !ready) {
    return <div className="mx-auto max-w-2xl px-4 py-12 text-ink-soft">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <p className="kicker mb-1">
        <Link href="/admin" className="no-underline">
          Admin
        </Link>{" "}
        / Settings
      </p>
      <h1 className="font-display text-3xl text-ink">Site settings</h1>

      <div className="mt-8 space-y-4">
        <label className="block">
          <span className="kicker">Site name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border border-rule bg-paper px-3 py-2.5 text-[1.05rem] outline-none focus:border-ink"
          />
        </label>
        <label className="block">
          <span className="kicker">Tagline</span>
          <textarea
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            rows={3}
            className="mt-1 w-full border border-rule bg-paper px-3 py-2.5 text-[1.05rem] outline-none focus:border-ink"
          />
        </label>
        <label className="block">
          <span className="kicker">Contact name</span>
          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="mt-1 w-full border border-rule bg-paper px-3 py-2.5 text-[1.05rem] outline-none focus:border-ink"
          />
        </label>
        <label className="block">
          <span className="kicker">Contact email</span>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="mt-1 w-full border border-rule bg-paper px-3 py-2.5 text-[1.05rem] outline-none focus:border-ink"
          />
        </label>
        <label className="block">
          <span className="kicker">Contact address</span>
          <textarea
            value={contactAddress}
            onChange={(e) => setContactAddress(e.target.value)}
            rows={3}
            className="mt-1 w-full border border-rule bg-paper px-3 py-2.5 text-[1.05rem] outline-none focus:border-ink"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={save} disabled={busy} className={btnSolid}>
          {busy ? "Saving…" : "Save settings"}
        </button>
        <Link href="/admin" className={btnOutline}>
          Dashboard
        </Link>
      </div>
      {status ? <p className="mt-4 text-[1.05rem] text-ink-soft">{status}</p> : null}
    </div>
  );
}
