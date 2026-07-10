import Link from "next/link";
import { site } from "@/lib/site";

export function Masthead() {
  const today = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10">
      <div className="flex flex-col items-center text-center">
        <p className="kicker mb-3">Dadar Athornan Institute · Mumbai</p>
        <Link href="/" className="masthead-title text-ink no-underline">
          <span className="block text-[clamp(2.4rem,7vw,4.6rem)]">{site.name}</span>
        </Link>
        <p className="mt-4 max-w-2xl text-[1.15rem] leading-relaxed text-ink-soft sm:text-[1.2rem]">
          {site.tagline}
        </p>
        <p className="mt-3 text-[0.95rem] text-ink-soft">{today}</p>
      </div>
      <hr className="paper-rule mt-7" />
      <hr className="paper-rule mt-1.5" />
    </div>
  );
}
