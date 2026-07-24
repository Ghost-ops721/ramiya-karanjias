"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useEditMode } from "@/components/admin/EditModeProvider";
import {
  listRevisions,
  loadLiveDoc,
  restoreRevision,
  revalidatePathsFor,
} from "@/components/admin/saveContent";
import { useAdminFetch } from "@/components/admin/useAdminFetch";
import { btnOutline, btnSolid } from "@/lib/buttons";
import type { RevisionDoc } from "@/lib/cms-types";
import {
  diffRevisionAgainstLive,
  summarizeChange,
  type FieldChange,
} from "@/lib/revision-diff";

function formatWhen(date: Date | null): string {
  if (!date) return "Just now";
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function kindLabel(kind: RevisionDoc["kind"]): string {
  if (kind === "article") return "Article";
  if (kind === "settings") return "Settings";
  return "Navigation";
}

function startOfDay(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function endOfDay(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999);
}

function toInputDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Full history page with date filters, view, and restore. */
export function AdminHistoryPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const { busy, setBusy, setStatus, afterSave } = useEditMode();
  const adminFetch = useAdminFetch();
  const router = useRouter();
  const [revisions, setRevisions] = useState<RevisionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [pendingRestore, setPendingRestore] = useState<RevisionDoc | null>(
    null,
  );
  const [viewing, setViewing] = useState<RevisionDoc | null>(null);
  const [viewChanges, setViewChanges] = useState<FieldChange[] | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const confirmTitleId = useId();
  const viewTitleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const viewCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/admin");
    }
  }, [authLoading, user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listRevisions(300);
      setRevisions(rows);
    } catch (err) {
      console.error(err);
      setError("Could not load history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  const filtered = useMemo(() => {
    return revisions.filter((rev) => {
      if (!rev.createdAt) return !fromDate && !toDate;
      if (fromDate && rev.createdAt < startOfDay(fromDate)) return false;
      if (toDate && rev.createdAt > endOfDay(toDate)) return false;
      return true;
    });
  }, [revisions, fromDate, toDate]);

  useEffect(() => {
    if (!pendingRestore) return;
    cancelRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) setPendingRestore(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pendingRestore, busy]);

  useEffect(() => {
    if (!viewing) return;
    viewCloseRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setViewing(null);
        setViewChanges(null);
        setExpandedPaths(new Set());
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewing]);

  function closeView() {
    setViewing(null);
    setViewChanges(null);
    setExpandedPaths(new Set());
  }

  async function openView(rev: RevisionDoc) {
    setViewing(rev);
    setViewChanges(null);
    setExpandedPaths(new Set());
    setViewLoading(true);
    try {
      const live = await loadLiveDoc(rev.kind, rev.targetId);
      setViewChanges(diffRevisionAgainstLive(rev.kind, rev.data, live));
    } catch (err) {
      console.error(err);
      setViewChanges(diffRevisionAgainstLive(rev.kind, rev.data, null));
    } finally {
      setViewLoading(false);
    }
  }

  function toggleExpand(path: string) {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  function clearDates() {
    setFromDate("");
    setToDate("");
  }

  function showToday() {
    const today = toInputDate(new Date());
    setFromDate(today);
    setToDate(today);
  }

  async function confirmRestore() {
    if (!user || !pendingRestore) return;
    const rev = pendingRestore;

    setBusy(true);
    setStatus(null);
    setRestoringId(rev.id);
    try {
      const result = await restoreRevision(rev.id, user.email || user.uid);
      const reval = revalidatePathsFor(result.kind, result.targetId);
      await adminFetch("/api/revalidate", {
        method: "POST",
        body: JSON.stringify(reval),
      });
      setPendingRestore(null);
      closeView();
      afterSave({
        settings: result.settings,
        sections: result.sections,
      });
      await load();
    } catch (err) {
      console.error(err);
      setStatus("Restore failed. Please try again.");
      setPendingRestore(null);
    } finally {
      setRestoringId(null);
      setBusy(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-[1.15rem] text-ink-soft sm:px-6">
        {authLoading ? "Checking sign-in…" : "Taking you to sign in…"}
      </div>
    );
  }

  const hasDateFilter = Boolean(fromDate || toDate);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="kicker mb-2">Admin</p>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">History</h1>
      <p className="mt-3 text-[1.15rem] leading-relaxed text-ink-soft">
        Earlier versions of what you&apos;ve saved. Pick a date range if you
        like, then View to see what changed, or Restore to put an older version
        back.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className={`${btnOutline} text-[1.05rem] px-4 py-2`}>
          Back to site
        </Link>
        <button
          type="button"
          disabled={busy || loading}
          onClick={() => void load()}
          className={`${btnOutline} text-[1.05rem] px-4 py-2`}
        >
          Refresh
        </button>
      </div>

      <div className="mt-8 border border-rule bg-paper-deep/30 p-4 sm:p-5">
        <p className="text-[1.1rem] font-semibold text-ink">Show by date</p>
        <p className="mt-1 text-[1rem] text-ink-soft">
          Leave blank to see everything.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <label className="block">
            <span className="kicker">From</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="admin-field mt-1 block px-3 py-3 text-xl"
            />
          </label>
          <label className="block">
            <span className="kicker">To</span>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => setToDate(e.target.value)}
              className="admin-field mt-1 block px-3 py-3 text-xl"
            />
          </label>
          <div className="flex flex-wrap gap-2 pb-0.5">
            <button
              type="button"
              onClick={showToday}
              className={`${btnOutline} text-[1.05rem] px-4 py-2`}
            >
              Today
            </button>
            {hasDateFilter ? (
              <button
                type="button"
                onClick={clearDates}
                className={`${btnOutline} text-[1.05rem] px-4 py-2`}
              >
                Clear dates
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="text-[1.1rem] text-ink-soft">Loading…</p>
        ) : error ? (
          <p className="text-[1.1rem] text-accent">{error}</p>
        ) : revisions.length === 0 ? (
          <p className="text-[1.1rem] text-ink-soft">
            No history yet. Changes you save from now on will appear here.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-[1.1rem] text-ink-soft">
            Nothing in that date range. Try different dates, or Clear dates.
          </p>
        ) : (
          <>
            <p className="mb-3 text-[1.05rem] text-ink-soft">
              {hasDateFilter
                ? `Showing ${filtered.length} change${filtered.length === 1 ? "" : "s"} in this date range`
                : `Showing ${filtered.length} recent change${filtered.length === 1 ? "" : "s"}`}
            </p>
            <ul className="divide-y divide-rule border-t border-b border-rule">
              {filtered.map((rev) => (
                <li
                  key={rev.id}
                  className="flex flex-wrap items-center gap-3 py-4 sm:gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[1.15rem] font-semibold text-ink">
                      {rev.label}
                      {rev.action === "rollback" ? (
                        <span className="ml-2 text-[1rem] font-normal text-ink-soft">
                          · restored
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-[1.05rem] text-ink-soft">
                      {formatWhen(rev.createdAt)}
                      {" · "}
                      {kindLabel(rev.kind)}
                      {rev.createdBy ? ` · ${rev.createdBy}` : null}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void openView(rev)}
                      className={`${btnOutline} text-[1.05rem] px-4 py-2`}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setPendingRestore(rev)}
                      className={`${btnSolid} text-[1.05rem] px-4 py-2`}
                    >
                      {restoringId === rev.id ? "Restoring…" : "Restore"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {viewing ? (
        <div
          className="fixed inset-0 z-70 flex items-start justify-center bg-ink/40 px-4 pb-4 pt-20 sm:pt-24"
          role="presentation"
          onClick={closeView}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={viewTitleId}
            className="flex max-h-[85vh] w-full max-w-2xl flex-col border border-rule bg-paper shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-rule px-6 py-4">
              <p
                id={viewTitleId}
                className="text-[1.35rem] font-semibold text-ink"
              >
                What changed
              </p>
              <p className="mt-1 text-[1.1rem] text-ink">{viewing.label}</p>
              <p className="mt-1 text-[1rem] text-ink-soft">
                Saved {formatWhen(viewing.createdAt)}
              </p>
              <p className="mt-3 text-[1.05rem] leading-relaxed text-ink-soft">
                Left side is the older version. Right side is what visitors see
                now. Tap Restore if you want the older version back.
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              {viewLoading ? (
                <p className="text-[1.1rem] text-ink-soft">Looking…</p>
              ) : viewChanges && viewChanges.length === 0 ? (
                <p className="text-[1.1rem] text-ink-soft">
                  Nothing is different from what is on the site now.
                </p>
              ) : (
                <ul className="space-y-5">
                  {(viewChanges ?? []).map((change) => {
                    const expanded = expandedPaths.has(change.path);
                    const summary = summarizeChange(change);
                    const before = expanded ? change.before : summary.before;
                    const after = expanded ? change.after : summary.after;
                    if (change.singleColumn) {
                      return (
                        <li
                          key={change.path}
                          className="border-b border-rule pb-5 last:border-0 last:pb-0"
                        >
                          <p className="text-[1.15rem] font-semibold text-ink">
                            {change.label}
                          </p>
                          <p className="mt-3 whitespace-pre-wrap break-words rounded-sm border border-rule bg-paper-deep/40 p-4 text-[1.15rem] leading-relaxed text-ink">
                            {before}
                          </p>
                        </li>
                      );
                    }
                    return (
                      <li
                        key={change.path}
                        className="border-b border-rule pb-5 last:border-0 last:pb-0"
                      >
                        <p className="text-[1.15rem] font-semibold text-ink">
                          {change.label}
                        </p>
                        <div className="mt-3 grid gap-4 sm:grid-cols-2">
                          <div className="rounded-sm border border-rule bg-paper-deep/40 p-3">
                            <p className="text-[1rem] font-semibold text-ink-soft">
                              Older version
                            </p>
                            <p className="mt-2 whitespace-pre-wrap break-words text-[1.1rem] leading-snug text-ink">
                              {before}
                            </p>
                          </div>
                          <div className="rounded-sm border border-rule bg-paper p-3">
                            <p className="text-[1rem] font-semibold text-ink-soft">
                              On the site now
                            </p>
                            <p className="mt-2 whitespace-pre-wrap break-words text-[1.1rem] leading-snug text-ink">
                              {after}
                            </p>
                          </div>
                        </div>
                        {summary.truncated ? (
                          <button
                            type="button"
                            onClick={() => toggleExpand(change.path)}
                            className="mt-3 text-[1.05rem] font-semibold text-ink underline-offset-4 hover:underline"
                          >
                            {expanded ? "Show less" : "Show all the words"}
                          </button>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex flex-wrap gap-3 border-t border-rule px-6 py-4">
              <button
                type="button"
                disabled={busy}
                onClick={() => setPendingRestore(viewing)}
                className={`${btnSolid} text-lg px-5 py-3`}
              >
                Restore this version
              </button>
              <button
                ref={viewCloseRef}
                type="button"
                onClick={closeView}
                className={`${btnOutline} text-lg px-5 py-3`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {pendingRestore ? (
        <div
          className="fixed inset-0 z-80 flex items-start justify-center bg-ink/40 px-4 pb-4 pt-20 sm:pt-24"
          role="presentation"
          onClick={() => {
            if (!busy) setPendingRestore(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={confirmTitleId}
            className="w-full max-w-md border border-rule bg-paper p-6 shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <p
              id={confirmTitleId}
              className="text-[1.25rem] font-semibold text-ink"
            >
              Restore this version?
            </p>
            <p className="mt-2 text-[1.05rem] leading-relaxed text-ink-soft">
              Your current version will be saved to History first, so you can
              undo this restore later.
            </p>
            <p className="mt-3 text-[1rem] text-ink">
              <span className="font-semibold">{pendingRestore.label}</span>
              <span className="text-ink-soft">
                {" · "}
                {formatWhen(pendingRestore.createdAt)}
              </span>
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => void confirmRestore()}
                className={`${btnSolid} text-lg px-5 py-3`}
              >
                {busy ? "Restoring…" : "Restore"}
              </button>
              <button
                ref={cancelRef}
                type="button"
                disabled={busy}
                onClick={() => setPendingRestore(null)}
                className={`${btnOutline} text-lg px-5 py-3`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
