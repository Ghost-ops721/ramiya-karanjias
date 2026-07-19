"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { btnSolid, btnOutline } from "@/lib/buttons";

export default function AdminHomePage() {
  const { user, loading, error, login, logout } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      await login(email.trim(), password);
    } catch {
      setFormError("Sign-in failed. Check email and password.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-[1.1rem] text-ink-soft">
        Checking sign-in…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <p className="kicker mb-2">Admin</p>
        <h1 className="font-display text-3xl text-ink">Sign in</h1>
        <p className="mt-3 text-[1.08rem] text-ink-soft">
          Only allowlisted editors can manage content on this site.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="kicker">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-field mt-1 w-full px-3 py-2.5 text-[1.05rem]"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <label className="block">
            <span className="kicker">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-field mt-1 w-full px-3 py-2.5 text-[1.05rem]"
              autoComplete="current-password"
            />
          </label>
          {(formError || error) && (
            <p className="text-[1.02rem] text-accent">{formError || error}</p>
          )}
          <button type="submit" disabled={busy} className={btnSolid}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="kicker mb-2">Admin</p>
          <h1 className="font-display text-3xl text-ink">Dashboard</h1>
          <p className="mt-2 text-[1.05rem] text-ink-soft">Signed in as {user.email}</p>
        </div>
        <button type="button" onClick={() => logout()} className={btnOutline}>
          Sign out
        </button>
      </div>

      <ul className="mt-10 space-y-4">
        <li>
          <Link
            href="/admin/articles"
            className="block border border-rule bg-paper p-5 no-underline transition-colors hover:border-ink"
          >
            <h2 className="font-display text-2xl text-ink">Articles</h2>
            <p className="mt-1 text-[1.05rem] text-ink-soft">
              Create, edit, and publish article pages.
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/nav"
            className="block border border-rule bg-paper p-5 no-underline transition-colors hover:border-ink"
          >
            <h2 className="font-display text-2xl text-ink">Sections & navigation</h2>
            <p className="mt-1 text-[1.05rem] text-ink-soft">
              Edit section titles, blurbs, and article links.
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/settings"
            className="block border border-rule bg-paper p-5 no-underline transition-colors hover:border-ink"
          >
            <h2 className="font-display text-2xl text-ink">Site settings</h2>
            <p className="mt-1 text-[1.05rem] text-ink-soft">
              Homepage name, tagline, and contact details.
            </p>
          </Link>
        </li>
      </ul>
    </div>
  );
}
