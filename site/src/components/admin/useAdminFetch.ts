"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";

export async function adminFetch(
  getIdToken: () => Promise<string | null>,
  input: RequestInfo | URL,
  init: RequestInit = {},
) {
  const token = await getIdToken();
  if (!token) throw new Error("Not signed in");
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(input, { ...init, headers });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Request failed (${res.status})${detail ? `: ${detail}` : ""}`,
    );
  }
  return res;
}

/** Cache bust after a successful Firestore write — never fail the save itself. */
export async function revalidateAfterSave(
  getIdToken: () => Promise<string | null>,
  body: { paths?: string[]; slug?: string },
) {
  try {
    await adminFetch(getIdToken, "/api/revalidate", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error("revalidate after save failed:", err);
  }
}

export function useAdminFetch() {
  const { getIdToken } = useAdminAuth();
  return (input: RequestInfo | URL, init?: RequestInit) =>
    adminFetch(getIdToken, input, init);
}

export function useRevalidateAfterSave() {
  const { getIdToken } = useAdminAuth();
  return (body: { paths?: string[]; slug?: string }) =>
    revalidateAfterSave(getIdToken, body);
}
