import type { Metadata } from "next";
import Link from "next/link";
import { btnOutline, btnSolid } from "@/lib/buttons";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <p className="kicker mb-3">404</p>
      <h1 className="font-display text-4xl text-ink">Page not found</h1>
      <p className="mt-4 text-[1.15rem] text-ink-soft">
        That article may have moved. Try the topic list.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/" className={btnSolid}>
          Home
        </Link>
        <Link href="/topics" className={btnOutline}>
          All topics
        </Link>
      </div>
    </div>
  );
}
