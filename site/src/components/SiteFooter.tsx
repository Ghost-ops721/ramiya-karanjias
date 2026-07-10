import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-rule bg-paper-deep/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="masthead-title text-2xl text-ink">{site.name}</p>
          <p className="mt-3 max-w-md text-[1.05rem] text-ink-soft">{site.tagline}</p>
        </div>
        <div className="text-[1.05rem]">
          <p className="kicker mb-2">Quick links</p>
          <ul className="space-y-2">
            <li>
              <Link href="/topics">All topics</Link>
            </li>
            <li>
              <Link href="/section/faqs">FAQs</Link>
            </li>
            <li>
              <Link href="/article/about">About</Link>
            </li>
            <li>
              <Link href="/article/books-on-zoroastrian-religion">Books</Link>
            </li>
            <li>
              <a href={`mailto:${site.contact.email}`}>Email {site.contact.email}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-rule px-4 py-4 text-center text-[0.95rem] text-ink-soft sm:px-6">
        Content by {site.contact.name}. Redesigned for clear reading.
      </div>
    </footer>
  );
}
