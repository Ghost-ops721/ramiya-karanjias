"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { sortLetter } from "@/lib/sortLetter";

export type TopicItem = {
  slug: string;
  title: string;
  section: string | null;
};

export { sortLetter };

export function TopicBrowser({ topics }: { topics: TopicItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter((t) => {
      const hay = `${t.title} ${t.section ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, topics]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, TopicItem[]>>((acc, topic) => {
      const letter = sortLetter(topic.title);
      (acc[letter] ??= []).push(topic);
      return acc;
    }, {});
  }, [filtered]);

  const letters = Object.keys(grouped).sort();
  const searching = query.trim().length > 0;

  return (
    <div>
      <label htmlFor="topic-search" className="kicker mb-2 block">
        Search topics
      </label>
      <input
        id="topic-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type a word — e.g. Navjot, prayer, Shahnameh"
        autoComplete="off"
        className="w-full max-w-2xl border border-[#161410] bg-[#f7f4ed] px-4 py-3 text-[1.2rem] text-[#161410] outline-none ring-0 placeholder:text-[#3d3830]/70 focus:border-[#161410] focus:outline-none focus:ring-0 focus-visible:outline-none"
      />
      <p className="mt-3 text-[1.1rem] text-ink-soft" aria-live="polite">
        {searching
          ? `${filtered.length} match${filtered.length === 1 ? "" : "es"} for “${query.trim()}”`
          : `${topics.length} articles, listed A to Z. Tap any title to read.`}
      </p>

      {!searching && letters.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="inline-flex h-10 w-10 items-center justify-center border border-rule text-[1.05rem] font-semibold text-[#161410] no-underline hover:border-ink"
            >
              {letter}
            </a>
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="mt-10 text-[1.2rem] text-ink">
          No topics matched. Try a shorter word, or{" "}
          <button
            type="button"
            className="font-semibold text-[#1f3d5c] underline"
            onClick={() => setQuery("")}
          >
            clear the search
          </button>
          .
        </p>
      ) : (
        <div className="mt-10 space-y-10">
          {letters.map((letter) => (
            <section key={letter} id={searching ? undefined : `letter-${letter}`}>
              {!searching ? (
                <h2 className="font-display border-b border-rule pb-2 text-3xl text-ink">
                  {letter}
                </h2>
              ) : null}
              <ul className={`space-y-3 ${searching ? "" : "mt-4"}`}>
                {grouped[letter].map((topic) => (
                  <li key={topic.slug} className="text-[1.15rem]">
                    <Link
                      href={`/article/${topic.slug}`}
                      className="font-semibold text-[#1f3d5c] no-underline hover:text-[#6b2d1a]"
                    >
                      {topic.title}
                    </Link>
                    {topic.section ? (
                      <span className="text-ink-soft"> — {topic.section}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
