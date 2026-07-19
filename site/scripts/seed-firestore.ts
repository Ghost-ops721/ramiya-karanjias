/**
 * Seed Firestore from local Markdown + nav.ts / site.ts.
 * Usage: npx tsx scripts/seed-firestore.ts
 */
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { sections, homeFeatured } from "../src/lib/nav";
import { site, linkWords } from "../src/lib/site";
import { excerptFrom, normalizeMarkdown } from "../src/lib/cms-types";

const root = process.cwd();
const sa = JSON.parse(readFileSync(join(root, "service-account.json"), "utf8"));

if (!getApps().length) {
  initializeApp({ credential: cert(sa), projectId: sa.project_id });
}
const db = getFirestore();

async function main() {
  const articlesDir = join(root, "content/articles");
  const files = readdirSync(articlesDir).filter((f) => f.endsWith(".md"));
  console.log(`Seeding ${files.length} articles…`);

  let batch = db.batch();
  let ops = 0;
  let written = 0;

  const flush = async () => {
    if (ops === 0) return;
    await batch.commit();
    batch = db.batch();
    ops = 0;
  };

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const raw = readFileSync(join(articlesDir, file), "utf8");
    const { data, content } = matter(raw);
    const title = String(data.title ?? slug).replace(/\u00a0/g, " ").trim();
    const normalized = normalizeMarkdown(content);
    batch.set(
      db.collection("articles").doc(slug),
      {
        slug: String(data.slug ?? slug),
        title,
        content: normalized,
        excerpt: excerptFrom(normalized, title),
        source: data.source ? String(data.source) : null,
        published: true,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: "seed",
      },
      { merge: true },
    );
    ops += 1;
    written += 1;
    if (ops >= 400) await flush();
  }
  await flush();
  console.log(`Articles written: ${written}`);

  await db.collection("nav").doc("sections").set(
    {
      sections,
      homeFeatured: [...homeFeatured],
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: "seed",
    },
    { merge: true },
  );

  await db.collection("settings").doc("site").set(
    {
      name: site.name,
      tagline: site.tagline,
      contact: { ...site.contact },
      linkWords: [...linkWords],
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: "seed",
    },
    { merge: true },
  );

  console.log("Nav + settings seeded.");
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
