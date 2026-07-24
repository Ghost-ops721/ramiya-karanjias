"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useEditMode } from "@/components/admin/EditModeProvider";
import {
  listRevisions,
  restoreRevision,
  revalidatePathsFor,
} from "@/components/admin/saveContent";
import { useAdminFetch } from "@/components/admin/useAdminFetch";
import { btnOutline, btnSolid } from "@/lib/buttons";
import type { RevisionDoc } from "@/lib/cms-types";

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

export function AdminHistoryPanel() {
  const { user } = useAdminAuth();
  const { busy, setBusy, setStatus, afterSave, setHistoryOpen } = useEditMode();
  const adminFetch = useAdminFetch();
  const [revisions, setRevisions] = useState<RevisionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listRevisions(100);
      setRevisions(rows);
    } catch (err) {
      console.error(err);
      setError("Could not load history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onRestore(rev: RevisionDoc) {
    if (!user) return;
    const ok = window.confirm(
      "Restore this version? Your current version will be saved to History first.",
    );
    if (!ok) return;

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
      afterSave({
        settings: result.settings,
        sections: result.sections,
      });
      setHistoryOpen(false);
    } catch (err) {
      console.error(err);
      setStatus("Restore failed. Please try again.");
    } finally {
      setRestoringId(null);
      setBusy(false);
    }
  }

  return (
    <div className="border-t border-rule bg-paper px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-[1.1rem] font-semibold text-ink">History</p>
            <p className="text-[1rem] text-ink-soft">
              Earlier versions of what you&apos;ve saved. Restore to roll back a
              change.
            </p>
          </div>
          <button
            type="button"
            disabled={busy || loading}
            onClick={() => void load()}
            className={`${btnOutline} text-[1.05rem] px-4 py-2`}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-[1.05rem] text-ink-soft">Loading…</p>
        ) : error ? (
          <p className="text-[1.05rem] text-accent">{error}</p>
        ) : revisions.length === 0 ? (
          <p className="text-[1.05rem] text-ink-soft">
            No history yet. Changes you save from now on will appear here.
          </p>
        ) : (
          <ul className="divide-y divide-rule border-t border-b border-rule">
            {revisions.map((rev) => (
              <li
                key={rev.id}
                className="flex flex-wrap items-center gap-3 py-3 sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[1.05rem] font-semibold text-ink">
                    {rev.label}
                    {rev.action === "rollback" ? (
                      <span className="ml-2 text-[0.95rem] font-normal text-ink-soft">
                        · restored
                      </span>
                    ) : null}
                  </p>
                  <p className="text-[0.95rem] text-ink-soft">
                    {formatWhen(rev.createdAt)}
                    {" · "}
                    {kindLabel(rev.kind)}
                    {rev.createdBy ? ` · ${rev.createdBy}` : null}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onRestore(rev)}
                  className={`${btnSolid} text-[1.05rem] px-4 py-2`}
                >
                  {restoringId === rev.id ? "Restoring…" : "Restore"}
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={() => setHistoryOpen(false)}
          className={`${btnOutline} text-lg px-5 py-3`}
        >
          Close
        </button>
      </div>
    </div>
  );
}
