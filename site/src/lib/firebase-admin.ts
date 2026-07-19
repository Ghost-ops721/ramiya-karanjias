import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function privateKeyFromEnv(): string | undefined {
  const raw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!raw) return undefined;
  return raw.replace(/\\n/g, "\n");
}

function getAdminApp(): App {
  if (getApps().length) return getApps()[0]!;

  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = privateKeyFromEnv();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY.",
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId,
  });
}

export function adminDb() {
  return getFirestore(getAdminApp());
}

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

/** Lazy-load Auth to avoid jose/jwks-rsa ESM crash on Vercel serverless. */
export async function verifyAdminIdToken(idToken: string) {
  const { getAuth } = await import("firebase-admin/auth");
  const decoded = await getAuth(getAdminApp()).verifyIdToken(idToken);
  if (!isAdminEmail(decoded.email)) {
    throw new Error("Not an allowlisted admin");
  }
  return decoded;
}

export function isFirebaseConfigured(): boolean {
  return Boolean(
    (process.env.FIREBASE_ADMIN_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) &&
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
      privateKeyFromEnv(),
  );
}
