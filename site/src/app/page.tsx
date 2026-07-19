import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { CtaBar } from "@/components/CtaBar";
import { Masthead } from "@/components/Masthead";
import { btnOutline, btnSolid } from "@/lib/buttons";
import { getArticle, getArticlesBySlugs } from "@/lib/content";
import { getHomeFeatured, getSections } from "@/lib/nav-data";
import { getSiteSettings } from "@/lib/site-data";

export const revalidate = 60;

export default async function HomePage() {
  const [homeFeatured, sections, settings] = await Promise.all([
    getHomeFeatured(),
    getSections(),
    getSiteSettings(),
  ]);
  const featured = await getArticlesBySlugs(homeFeatured);
  const lead = featured[0];
  const rest = featured.slice(1);
  const latestSeries = await getArticle(
    "sss-41-yazdezerd-iii-yazdezerd-sheheryar-the-last-sasanian-emperor-part-4",
  );
  const linkWords = settings.linkWords ?? [];

  return (
    <div className="fade-mount pb-16">
      <Masthead name={settings.name} tagline={settings.tagline} />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <section className="mb-10 border-b border-rule pb-8">
          <p className="kicker mb-3">Explore more about</p>
          <p className="text-[1.1rem] leading-relaxed text-ink-soft sm:text-[1.15rem]">
            {linkWords.map((word, index) => (
              <span key={word.label}>
                {index > 0 ? ", " : null}
                <Link
                  href={word.href}
                  className="font-semibold text-[#1f3d5c] no-underline hover:text-[#6b2d1a]"
                >
                  {word.label}
                </Link>
              </span>
            ))}
            .
          </p>
        </section>

        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[1.15rem] text-ink-soft">
            Large, clear type. Simple paths. Start with a section below.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/topics" className={btnSolid}>
              Browse all topics
            </Link>
            <Link href="/section/faqs" className={btnOutline}>
              Read FAQs
            </Link>
          </div>
        </div>

        {lead ? (
          <section className="mb-10 border-b border-rule pb-10">
            <ArticleCard article={lead} kicker="Start here" large />
          </section>
        ) : null}

        <section className="mb-12 grid gap-8 border-b border-rule pb-10 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((article, i) => (
            <ArticleCard
              key={article.slug}
              article={article}
              kicker={i < 2 ? "Featured" : undefined}
            />
          ))}
        </section>

        {latestSeries ? (
          <section className="mb-12 border-b border-rule pb-10">
            <ArticleCard article={latestSeries} kicker="Latest in the history series" />
          </section>
        ) : null}

        <section className="mb-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="kicker mb-2">The paper</p>
              <h2 className="font-display text-3xl text-ink sm:text-4xl">Sections</h2>
            </div>
            <Link href="/topics" className="hidden text-[1.05rem] font-semibold sm:inline">
              A–Z list →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {sections.map((section) => (
              <Link
                key={section.id}
                href={`/section/${section.id}`}
                className="block border border-rule bg-paper/40 p-5 no-underline transition-colors hover:border-ink hover:bg-paper-deep/50"
              >
                <h3 className="font-display text-[1.35rem] text-ink">{section.title}</h3>
                <p className="mt-2 text-[1.05rem] leading-relaxed text-ink-soft">
                  {section.blurb}
                </p>
                <p className="mt-3 text-[1rem] font-semibold text-link">
                  {`${section.items.length} ${
                    section.items.length === 1 ? "article" : "articles"
                  } →`}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <CtaBar
          contactName={settings.contact.name}
          contactEmail={settings.contact.email}
          contactAddress={settings.contact.address}
        />
      </div>
    </div>
  );
}
