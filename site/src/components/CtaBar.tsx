import { btnOutline, btnSolid } from "@/lib/buttons";
import { site } from "@/lib/site";

export function CtaBar({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      className={`border border-rule bg-paper-deep/60 ${
        compact ? "p-4" : "p-5 sm:p-6"
      }`}
    >
      <p className="kicker mb-2">Contact</p>
      <p className={`font-display text-ink ${compact ? "text-xl" : "text-2xl"}`}>
        Speak with {site.contact.name}
      </p>
      <p className="mt-2 text-[1.05rem] text-ink-soft">{site.contact.role}</p>
      <div className={`mt-4 flex flex-col gap-3 sm:flex-row ${compact ? "" : "sm:gap-4"}`}>
        <a href={`mailto:${site.contact.email}`} className={`${btnSolid} text-[1.1rem]`}>
          Email
        </a>
        <a href={`tel:${site.contact.phoneTel}`} className={`${btnOutline} text-[1.1rem]`}>
          Call mobile
        </a>
        <a href={`tel:${site.contact.landlineTel}`} className={`${btnOutline} text-[1.05rem]`}>
          Call landline
        </a>
      </div>
      {!compact ? (
        <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-soft">
          {site.contact.address}
        </p>
      ) : null}
    </aside>
  );
}
