"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useEditMode } from "@/components/admin/EditModeProvider";
import { EditColorField } from "@/components/admin/EditFields";
import { saveSiteSettings } from "@/components/admin/saveContent";
import { useAdminFetch } from "@/components/admin/useAdminFetch";
import { btnOutline, btnSolid } from "@/lib/buttons";
import {
  TEXT_SIZE_LABELS,
  THEME_COLOR_FIELDS,
  type TextSizePreset,
} from "@/lib/theme";

/** Slim bar: who is signed in, colours panel, sign out. No whole-page Edit. */
export function AdminToolbar() {
  const { user, loading, logout } = useAdminAuth();
  const {
    busy,
    status,
    themeOpen,
    themeLive,
    settings,
    setThemeOpen,
    setTheme,
    setBusy,
    setStatus,
    afterSave,
  } = useEditMode();
  const adminFetch = useAdminFetch();

  if (loading || !user) return null;

  async function saveTheme() {
    setBusy(true);
    setStatus("Saving…");
    try {
      const next = { ...settings, theme: themeLive };
      await saveSiteSettings(next, user!.email || user!.uid);
      await adminFetch("/api/revalidate", {
        method: "POST",
        body: JSON.stringify({ paths: ["/", "/topics"] }),
      });
      afterSave({ settings: next });
    } catch (err) {
      console.error(err);
      setStatus("Save failed. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sticky top-0 z-50 border-b-2 border-ink bg-paper shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <p className="mr-auto text-[1.05rem] text-ink">
          Signed in as <span className="font-semibold">{user.email}</span>
          <span className="ml-2 text-ink-soft">
            — click the pencil on a section to edit it
          </span>
        </p>
        <button
          type="button"
          onClick={() => setThemeOpen(!themeOpen)}
          className={`${btnOutline} text-lg px-4 py-2.5`}
        >
          {themeOpen ? "Hide colours" : "Colours & size"}
        </button>
        <button
          type="button"
          onClick={() => void logout()}
          className={`${btnOutline} text-lg px-4 py-2.5`}
        >
          Sign out
        </button>
      </div>

      {status ? (
        <p className="border-t border-rule bg-paper-deep/50 px-4 py-2 text-center text-[1.1rem] text-ink sm:px-6">
          {status}
        </p>
      ) : null}

      {themeOpen ? (
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {THEME_COLOR_FIELDS.map(({ key, label }) => (
                <EditColorField
                  key={key}
                  label={label}
                  value={themeLive[key]}
                  onChange={(value) =>
                    setTheme((t) => ({ ...t, [key]: value }))
                  }
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => void saveTheme()}
                className={`${btnSolid} text-lg px-5 py-3`}
              >
                {busy ? "Saving…" : "Save colours & size"}
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
  );
}
