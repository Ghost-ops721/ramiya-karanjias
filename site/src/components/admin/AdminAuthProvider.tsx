"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { clientAuth } from "@/lib/firebase-client";

type AdminAuthValue = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
};

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

const ALLOWED = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAllowed(email: string | null | undefined) {
  if (!email) return false;
  if (ALLOWED.length === 0) return true;
  return ALLOWED.includes(email.toLowerCase());
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = clientAuth();
    return onAuthStateChanged(auth, async (next) => {
      if (next && !isAllowed(next.email)) {
        await signOut(auth);
        setUser(null);
        setError("This account is not allowed to administer the site.");
      } else {
        setUser(next);
      }
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    if (!isAllowed(email)) {
      setError("This account is not allowed to administer the site.");
      throw new Error("not allowed");
    }
    await signInWithEmailAndPassword(clientAuth(), email, password);
  }, []);

  const logout = useCallback(async () => {
    await signOut(clientAuth());
  }, []);

  const getIdToken = useCallback(async () => {
    if (!user) return null;
    return user.getIdToken();
  }, [user]);

  const value = useMemo(
    () => ({ user, loading, error, login, logout, getIdToken }),
    [user, loading, error, login, logout, getIdToken],
  );

  return (
    <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
