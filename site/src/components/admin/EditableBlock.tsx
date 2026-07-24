"use client";

import type { ReactNode } from "react";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import {
  useEditMode,
  type SavePatch,
} from "@/components/admin/EditModeProvider";
import { btnOutline, btnSolid } from "@/lib/buttons";

/** Pencil next to a live section. Click → edit only this block → Save. */
export function EditableBlock({
  id,
  label,
  children,
  editor,
  onSave,
}: {
  id: string;
  label: string;
  children: ReactNode;
  editor: ReactNode;
  onSave: () => Promise<SavePatch | void>;
}) {
  const { user, loading } = useAdminAuth();
  const {
    activeBlockId,
    busy,
    setActiveBlockId,
    setBusy,
    setStatus,
    afterSave,
  } = useEditMode();

  const isEditing = activeBlockId === id;
  const showPencil = !!user && !loading && !busy && activeBlockId === null;

  async function handleSave() {
    setBusy(true);
    setStatus("Saving…");
    try {
      const patch = await onSave();
      afterSave(patch ?? undefined);
    } catch (err) {
      console.error(err);
      setStatus("Save failed. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!user && !loading) {
    return <>{children}</>;
  }

  if (isEditing) {
    return (
      <div className="relative border-2 border-ink bg-paper-deep/30 p-4 sm:p-5">
        <p className="kicker mb-4">Editing: {label}</p>
        <div className="space-y-4">{editor}</div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleSave()}
            className={`${btnSolid} text-lg px-5 py-3`}
          >
            {busy ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setActiveBlockId(null);
              setStatus(null);
            }}
            className={`${btnOutline} text-lg px-5 py-3`}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${showPencil ? "pr-14" : ""}`}>
      {showPencil ? (
        <button
          type="button"
          onClick={() => setActiveBlockId(id)}
          className="absolute right-0 top-0 z-10 inline-flex h-11 w-11 items-center justify-center border-2 border-ink bg-paper text-ink hover:bg-ink hover:text-paper"
          aria-label={`Edit ${label}`}
          title={`Edit ${label}`}
        >
          <PencilIcon />
        </button>
      ) : null}
      {children}
    </div>
  );
}

function PencilIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
