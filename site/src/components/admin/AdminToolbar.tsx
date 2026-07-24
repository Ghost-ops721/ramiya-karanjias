"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useEditMode } from "@/components/admin/EditModeProvider";
import { saveSiteSettings } from "@/components/admin/saveContent";
import { useRevalidateAfterSave } from "@/components/admin/useAdminFetch";
import { btnOutline, btnSolid } from "@/lib/buttons";
import {
  TEXT_SIZE_LABELS,
  THEME_COLOR_FIELDS,
  type TextSizePreset,
} from "@/lib/theme";

/** Quiet bar + Look panel + Saved wink toast. History lives at /admin/history. */
export function AdminToolbar() {
  const { user, loading, logout } = useAdminAuth();
  const pathname = usePathname();
  const {
    busy,
    status,
    wink,
    clearWink,
    themeOpen,
    themeLive,
    setThemeOpen,
    setTheme,
    setBusy,
    setStatus,
    afterSave,
  } = useEditMode();
  const revalidate = useRevalidateAfterSave();
  const onHistoryPage = pathname === "/admin/history";

  useEffect(() => {
    if (!wink) return;
    const t = window.setTimeout(() => clearWink(), 2500);
    return () => window.clearTimeout(t);
  }, [wink, clearWink]);

  if (loading || !user) return null;

  async function saveTheme() {
    setBusy(true);
    setStatus(null);
    try {
      const next = { theme: themeLive };
      const saved = await saveSiteSettings(next, user!.email || user!.uid);
      await revalidate({ paths: ["/", "/topics"] });
      afterSave({ settings: saved });
    } catch (err) {
      console.error(err);
      setStatus("Save failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="sticky top-0 z-50 border-b border-rule bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-2.5 sm:px-6">
          <p className="mr-auto text-[1.05rem] text-ink-soft">
            {onHistoryPage
              ? "History of your saved changes"
              : "Hi - tap a pencil to change something"}
          </p>
          {!onHistoryPage ? (
            <button
              type="button"
              onClick={() => setThemeOpen(!themeOpen)}
              className="text-[1.05rem] font-semibold text-ink underline-offset-4 hover:underline"
            >
              {themeOpen ? "Close look" : "Look of the page"}
            </button>
          ) : null}
          <Link
            href={onHistoryPage ? "/" : "/admin/history"}
            className="text-[1.05rem] font-semibold text-ink underline-offset-4 hover:underline"
          >
            {onHistoryPage ? "Back to site" : "History"}
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className={`${btnOutline} text-[1.05rem] px-4 py-2`}
          >
            Sign out
          </button>
        </div>

        {status ? (
          <p className="border-t border-rule bg-paper-deep/50 px-4 py-2 text-center text-[1.1rem] text-accent sm:px-6">
            {status}
          </p>
        ) : null}

        {themeOpen && !onHistoryPage ? (
          <div className="border-t border-rule bg-paper px-4 py-5 sm:px-6">
            <div className="mx-auto max-w-6xl space-y-5">
              <div>
                <p className="mb-3 text-[1.1rem] font-semibold text-ink">
                  Text size
                </p>
                <div className="flex flex-wrap gap-2">
                  {TEXT_SIZE_LABELS.map((opt) => {
                    const active = themeLive.textSize === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setTheme((t) => ({
                            ...t,
                            textSize: opt.id as TextSizePreset,
                          }))
                        }
                        className={
                          active
                            ? `${btnSolid} text-lg px-4 py-3`
                            : `${btnOutline} text-lg px-4 py-3`
                        }
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-3 text-[1.1rem] font-semibold text-ink">
                  Colours
                </p>
                <div className="flex flex-wrap gap-4">
                  {THEME_COLOR_FIELDS.map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex flex-col items-center gap-1.5 text-[0.95rem] text-ink-soft"
                    >
                      <input
                        type="color"
                        value={normalizeHex(themeLive[key])}
                        onChange={(e) =>
                          setTheme((t) => ({ ...t, [key]: e.target.value }))
                        }
                        className="h-12 w-12 cursor-pointer rounded-md border border-rule bg-paper p-0.5"
                        aria-label={label}
                        title={label}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void saveTheme()}
                  className={`${btnSolid} text-lg px-5 py-3`}
                >
                  {busy ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setThemeOpen(false)}
                  className={`${btnOutline} text-lg px-5 py-3`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {wink ? (
        <div
          className="saved-wink pointer-events-none fixed left-1/2 top-20 z-[60] -translate-x-1/2"
          role="status"
        >
          <div className="flex items-center gap-2 rounded-full border border-rule bg-paper px-5 py-2.5 text-[1.15rem] font-semibold text-ink shadow-sm">
            <span>Saved</span>
            <span className="saved-wink-eye" aria-hidden>
              ;)
            </span>
          </div>
        </div>
      ) : null}
    </>
  );
}

function normalizeHex(value: string) {
  const v = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
  return "#000000";
}
