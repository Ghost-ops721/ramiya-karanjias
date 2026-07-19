/**
 * Create (or update passwords for) the two allowlisted admin Auth users.
 * Usage: node scripts/create-admins.mjs
 * Reads emails/passwords from .admin-credentials.local and service-account.json
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const saPath = resolve(root, "service-account.json");
const credPath = resolve(root, ".admin-credentials.local");

if (!existsSync(saPath) || !existsSync(credPath)) {
  console.error("Missing service-account.json or .admin-credentials.local");
  process.exit(1);
}

const sa = JSON.parse(readFileSync(saPath, "utf8"));
const creds = Object.fromEntries(
  readFileSync(credPath, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

initializeApp({ credential: cert(sa), projectId: sa.project_id });
const auth = getAuth();

for (const [email, password] of Object.entries(creds)) {
  try {
    const existing = await auth.getUserByEmail(email);
    await auth.updateUser(existing.uid, { password, emailVerified: true });
    console.log(`Updated password for ${email}`);
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      await auth.createUser({ email, password, emailVerified: true });
      console.log(`Created user ${email}`);
    } else {
      throw err;
    }
  }
}

console.log("Done. Change passwords after first login.");
