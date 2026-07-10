import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getAllArticles } from "@/lib/content";
import { findSectionForSlug } from "@/lib/nav";

export const metadata: Metadata = {
  title: "All topics",
  description: "A–Z list of every article on this site.",
};

export default function TopicsPage() {
  const articles = getAllArticles();

  const grouped = articles.reduce<Record<string, typeof articles>>((acc, article) => {
    const letter = article.title.replace(/^[^A-Za-z]+/, "").charAt(0).toUpperCase() || "#";
    (acc[letter] ??= []).push(article);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort();

  return (
    <div className="fade-mount mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "All topics", href: "/topics" },
        ]}
      />

      <h1 className="font-display text-[clamp(1.9rem,4vw,2.8rem)] text-ink">
        All topics
      </h1>
      <p className="mt-3 max-w-2xl text-[1.15rem] text-ink-soft">
        {articles.length} articles, listed A to Z. Tap any title to read.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="inline-flex h-10 w-10 items-center justify-center border border-rule text-[1.05rem] font-semibold text-ink no-underline hover:border-ink"
          >
            {letter}
          </a>
        ))}
      </div>

      <div className="mt-10 space-y-10">
        {letters.map((letter) => (
          <section key={letter} id={`letter-${letter}`}>
            <h2 className="font-display border-b border-rule pb-2 text-3xl text-ink">
              {letter}
            </h2>
            <ul className="mt-4 space-y-3">
              {grouped[letter].map((article) => {
                const section = findSectionForSlug(article.slug);
                return (
                  <li key={article.slug} className="text-[1.1rem]">
                    <Link href={`/article/${article.slug}`} className="font-semibold">
                      {article.title}
                    </Link>
                    {section ? (
                      <span className="text-ink-soft"> — {section.title}</span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
