"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { btnSolid } from "@/lib/buttons";

export default function AdminLoginPage() {
  const { user, loading, error, login } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      await login(email.trim(), password);
      router.replace("/");
    } catch {
      setFormError("Sign-in failed. Check email and password.");
    } finally {
      setBusy(false);
    }
  }

  if (loading || user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-[1.15rem] text-ink-soft">
        {user ? "Taking you to the site…" : "Checking sign-in…"}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <p className="kicker mb-2">Admin</p>
      <h1 className="font-display text-3xl text-ink">Sign in</h1>
      <p className="mt-3 text-[1.15rem] text-ink-soft">
        After you sign in, you will see the normal website. Click the pencil on any
        section to edit just that part, then Save.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="kicker">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="admin-field mt-1 w-full px-3 py-3 text-xl"
            autoComplete="username"
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
            className="admin-field mt-1 w-full px-3 py-3 text-xl"
            autoComplete="current-password"
          />
        </label>
        {(formError || error) && (
          <p className="text-[1.1rem] text-accent">{formError || error}</p>
        )}
        <button
          type="submit"
          disabled={busy}
          className={`${btnSolid} text-lg px-5 py-3`}
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
