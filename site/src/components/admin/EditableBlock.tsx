"use client";

import type { ReactNode } from "react";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import {
  useEditMode,
  type SavePatch,
} from "@/components/admin/EditModeProvider";
import { btnOutline, btnSolid } from "@/lib/buttons";

/**
 * Soft pencil on the live page. Edit keeps the layout — type in place, Save.
 */
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
    setStatus(null);
    try {
      const patch = await onSave();
      afterSave(patch ?? undefined);
    } catch (err) {
      console.error(err);
      setStatus("Save failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!user && !loading) {
    return <>{children}</>;
  }

  if (isEditing) {
    return (
      <div className="relative rounded-sm px-1 py-1">
        {editor}
        <div className="mt-4 flex flex-wrap gap-3">
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
    <div className={`relative ${showPencil ? "pr-12" : ""}`}>
      {showPencil ? (
        <button
          type="button"
          onClick={() => setActiveBlockId(id)}
          className="absolute right-0 top-0 z-10 inline-flex h-9 w-9 items-center justify-center rounded-md border border-rule bg-paper text-ink-soft transition-colors hover:border-ink hover:text-ink"
          aria-label={`Change this: ${label}`}
          title="Change this"
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
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
