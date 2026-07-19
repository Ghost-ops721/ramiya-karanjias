/**
 * Quick regression checks for site content / nav fixes.
 * Usage: npx tsx scripts/verify-fixes.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sections, findSectionForSlug } from "../src/lib/nav";
import { linkWords } from "../src/lib/site";
import { sortLetter } from "../src/lib/sortLetter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const articlesDir = path.join(__dirname, "../content/articles");

let failed = 0;
function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed += 1;
  } else {
    console.log("ok:", msg);
  }
}

const correcting = sections.find((s) => s.id === "correcting-misinformation");
assert(Boolean(correcting), "correcting-misinformation section exists");
assert(
  correcting?.items.some(
    (i) => i.slug === "resurrection-in-the-zoroastrian-apocalyptic-tradition",
  ) ?? false,
  "Resurrection is in Correcting Misinformation",
);
assert(
  findSectionForSlug("resurrection-in-the-zoroastrian-apocalyptic-tradition")?.id ===
    "correcting-misinformation",
  "findSectionForSlug maps Resurrection to correcting-misinformation",
);
assert(
  !sections
    .find((s) => s.id === "introduction")
    ?.items.some((i) => i.slug === "resurrection-in-the-zoroastrian-apocalyptic-tradition"),
  "Resurrection removed from introduction",
);

const tamam = sections.find((s) => s.id === "tamam-khordeh-avesta");
assert(Boolean(tamam), "tamam-khordeh-avesta section exists");
assert(
  !(
    sections
      .find((s) => s.id === "languages")
      ?.items.some((i) => i.slug === "tamam-khordeh-avesta-shahenshahi") ?? false
  ),
  "Tamam removed from languages",
);

const series = sections.find((s) => s.id === "series");
assert((series?.items.length ?? 0) === 41, `series has 41 items (got ${series?.items.length})`);
assert(
  series?.items.some((i) => i.slug === "sss1-sasanian-dynasty-224-651-ce") ?? false,
  "series includes SSS1",
);
assert(
  series?.items.some((i) => i.slug === "sss-35-king-kobad-ii-shiroy-feb-628-nov-628") ?? false,
  "series includes SSS35",
);

for (const item of series?.items ?? []) {
  const file = path.join(articlesDir, `${item.slug}.md`);
  assert(fs.existsSync(file), `article file exists: ${item.slug}`);
}

assert(sortLetter("V Sasan") === "S", 'sortLetter("V Sasan") === "S"');
assert(sortLetter("I Peshdad") === "P", 'sortLetter("I Peshdad") === "P"');
assert(
  sortLetter("The rise and fall of KING JAMSHED – A story") === "R",
  'sortLetter("The rise…") === "R"',
);
assert(sortLetter("II Kayan") === "K", 'sortLetter("II Kayan") === "K"');
assert(sortLetter("Vendidad ritual") === "V", 'sortLetter("Vendidad ritual") stays V');

assert(linkWords.length === 16, `16 link words (got ${linkWords.length})`);

if (failed) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log("\nAll checks passed.");
