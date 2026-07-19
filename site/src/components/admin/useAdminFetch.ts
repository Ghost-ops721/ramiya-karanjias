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
  return fetch(input, { ...init, headers });
}

export function useAdminFetch() {
  const { getIdToken } = useAdminAuth();
  return (input: RequestInfo | URL, init?: RequestInit) =>
    adminFetch(getIdToken, input, init);
}
