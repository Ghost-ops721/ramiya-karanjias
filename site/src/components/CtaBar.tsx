import { btnSolid } from "@/lib/buttons";
import { site as fallbackSite } from "@/lib/site";

export function CtaBar({
  compact = false,
  contactName = fallbackSite.contact.name,
  contactEmail = fallbackSite.contact.email,
  contactAddress = fallbackSite.contact.address,
}: {
  compact?: boolean;
  contactName?: string;
  contactEmail?: string;
  contactAddress?: string;
}) {
  return (
    <aside
      className={`border border-rule bg-paper-deep/60 ${
        compact ? "p-4" : "p-5 sm:p-6"
      }`}
    >
      <p className="kicker mb-2">Contact</p>
      <p className={`font-display text-ink ${compact ? "text-xl" : "text-2xl"}`}>
        Connect with {contactName}
      </p>
      <div className={`mt-4 flex flex-col gap-3 sm:flex-row ${compact ? "" : "sm:gap-4"}`}>
        <a href={`mailto:${contactEmail}`} className={`${btnSolid} text-[1.1rem]`}>
          Email
        </a>
      </div>
      {!compact ? (
        <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-soft">
          {contactAddress}
        </p>
      ) : null}
    </aside>
  );
}
