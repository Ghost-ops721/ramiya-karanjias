/**
 * One-off: scrape SSS1–SSS35 from WordPress into content/articles/.
 * Usage: node scripts/scrape-sss.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import TurndownService from "turndown";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const articlesDir = path.join(__dirname, "../content/articles");
const manifestPath = path.join(__dirname, "../content/_manifest.json");

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});
turndown.addRule("wordpressImages", {
  filter: "img",
  replacement(_content, node) {
    const alt = node.getAttribute("alt") || "";
    let src = node.getAttribute("src") || "";
    src = src.replace("ramiyarkaranjia.wordpress.com", "ramiyarkaranjia.com");
    if (!src) return "";
    return `\n\n![](${src})\n\n`;
  },
});

function decodeEntities(html) {
  return html
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "");
}

function stripHtmlTitle(title) {
  return decodeEntities(title).replace(/\s+/g, " ").trim();
}

function sssNumber(title) {
  const m = title.match(/SSS\s*(\d+)/i);
  return m ? Number(m[1]) : null;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function listSssPosts() {
  const url =
    "https://public-api.wordpress.com/rest/v1.1/sites/ramiyarkaranjia.com/posts?search=SSS&number=100&fields=ID,title,URL,slug";
  const data = await fetchJson(url);
  const posts = [];
  for (const p of data.posts || []) {
    const title = stripHtmlTitle(p.title || "");
    const n = sssNumber(title);
    if (n != null && n >= 1 && n <= 35) {
      posts.push({
        id: p.ID,
        title,
        url: (p.URL || "").replace(/^http:/, "https:"),
        slug: p.slug,
        number: n,
      });
    }
  }
  // Prefer unique by number (keep first if duplicates)
  const byNum = new Map();
  for (const p of posts.sort((a, b) => a.number - b.number)) {
    if (!byNum.has(p.number)) byNum.set(p.number, p);
  }
  return [...byNum.values()];
}

function yamlEscape(s) {
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

async function scrapePost(meta) {
  const data = await fetchJson(
    `https://public-api.wordpress.com/rest/v1.1/sites/ramiyarkaranjia.com/posts/${meta.id}?fields=title,URL,slug,content`,
  );
  const title = stripHtmlTitle(data.title || meta.title);
  const slug = data.slug || meta.slug;
  const source = (data.URL || meta.url).replace(/^http:/, "https:");
  let html = data.content || "";
  // Drop common WP cruft
  html = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");
  let md = turndown.turndown(html).trim();
  md = md.replace(/\n{3,}/g, "\n\n");
  const body = `---\ntitle: ${yamlEscape(title)}\nsource: ${yamlEscape(source)}\nslug: ${yamlEscape(slug)}\n---\n\n${md}\n`;
  const outPath = path.join(articlesDir, `${slug}.md`);
  fs.writeFileSync(outPath, body, "utf8");
  return {
    slug,
    title,
    source,
    chars: md.length,
    number: meta.number,
    navTitle: title.replace(/\s+/g, " ").trim(),
  };
}

function navTitleFor(fullTitle, number) {
  // Compact nav labels like existing SSS36–41 entries
  let t = fullTitle.replace(/^SSS\s*\d+\.\s*/i, "").trim();
  if (t.length > 72) t = t.slice(0, 69).trimEnd() + "…";
  return `SSS ${number}. ${t}`;
}

async function main() {
  const list = await listSssPosts();
  console.log(`Found ${list.length} SSS posts (1–35)`);
  const missing = [];
  for (let n = 1; n <= 35; n++) {
    if (!list.some((p) => p.number === n)) missing.push(n);
  }
  if (missing.length) {
    console.warn("Missing numbers:", missing.join(", "));
  }

  const scraped = [];
  for (const meta of list) {
    process.stdout.write(`Scraping SSS ${meta.number}… `);
    try {
      const item = await scrapePost(meta);
      scraped.push(item);
      console.log(item.slug);
      await new Promise((r) => setTimeout(r, 200));
    } catch (e) {
      console.error("FAIL", e.message);
    }
  }

  // Update manifest
  let manifest = [];
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  }
  const bySlug = new Map(manifest.map((m) => [m.slug, m]));
  for (const item of scraped) {
    bySlug.set(item.slug, {
      slug: item.slug,
      title: item.title,
      source: item.source,
      chars: item.chars,
    });
  }
  fs.writeFileSync(
    manifestPath,
    JSON.stringify([...bySlug.values()], null, 2) + "\n",
    "utf8",
  );

  // Write nav snippet for series items (SSS35…SSS1 after existing 41–36)
  const seriesItems = scraped
    .sort((a, b) => b.number - a.number)
    .map(
      (item) =>
        `      {\n        title: ${JSON.stringify(navTitleFor(item.title, item.number))},\n        slug: ${JSON.stringify(item.slug)},\n      },`,
    )
    .join("\n");

  const snippetPath = path.join(__dirname, "sss-nav-snippet.txt");
  fs.writeFileSync(snippetPath, seriesItems + "\n", "utf8");
  console.log(`Wrote ${scraped.length} articles; nav snippet → ${snippetPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
