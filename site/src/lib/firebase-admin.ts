import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

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
  return (
    process.env.ADMIN_EMAILS ||
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
    ""
  )
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = adminEmails();
  if (allowed.length === 0) return false;
  return allowed.includes(email.toLowerCase());
}

function firebaseProjectId(): string {
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error("Missing FIREBASE_ADMIN_PROJECT_ID");
  }
  return projectId;
}

/** Firebase ID-token JWKS — avoid firebase-admin/auth (jose ESM crash on Vercel). */
const firebaseJwks = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

export async function verifyAdminIdToken(
  idToken: string,
): Promise<JWTPayload & { email?: string }> {
  const projectId = firebaseProjectId();
  const { payload } = await jwtVerify(idToken, firebaseJwks, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });

  const email = typeof payload.email === "string" ? payload.email : undefined;
  if (!isAdminEmail(email)) {
    throw new Error("Not an allowlisted admin");
  }
  return { ...payload, email };
}

export function isFirebaseConfigured(): boolean {
  return Boolean(
    (process.env.FIREBASE_ADMIN_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) &&
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
      privateKeyFromEnv(),
  );
}
