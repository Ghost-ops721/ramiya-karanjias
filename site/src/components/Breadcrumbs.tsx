import Link from "next/link";

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href: string }[];
}) {
  if (items.length < 2) return null;
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-[1rem] text-ink-soft">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.href + item.label} className="flex items-center gap-2">
              {i > 0 ? <span aria-hidden="true">/</span> : null}
              {last ? (
                <span className="text-ink" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="text-link">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
