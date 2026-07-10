import Link from "next/link";
import type { Article } from "@/lib/content";

export function ArticleCard({
  article,
  kicker,
  large = false,
}: {
  article: Article;
  kicker?: string;
  large?: boolean;
}) {
  return (
    <article className={large ? "sm:col-span-2" : ""}>
      {kicker ? <p className="kicker mb-2">{kicker}</p> : null}
      <h2
        className={`font-display leading-snug text-ink ${
          large ? "text-[1.85rem] sm:text-[2.2rem]" : "text-[1.35rem] sm:text-[1.5rem]"
        }`}
      >
        <Link href={`/article/${article.slug}`} className="text-ink no-underline hover:text-accent">
          {article.title}
        </Link>
      </h2>
      <p
        className={`mt-2 text-ink-soft ${
          large ? "text-[1.15rem] leading-relaxed" : "text-[1.05rem] leading-relaxed"
        }`}
      >
        {article.excerpt}
      </p>
      <p className="mt-3">
        <Link
          href={`/article/${article.slug}`}
          className="text-[1.05rem] font-semibold text-link no-underline hover:text-accent"
        >
          Read this article →
        </Link>
      </p>
    </article>
  );
}
