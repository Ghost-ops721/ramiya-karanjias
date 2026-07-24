import Link from "next/link";

/** Simple RK monogram in the masthead display font. */
export function LogoMark({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "lg" ? "text-[2rem]" : size === "sm" ? "text-[1.25rem]" : "text-[1.6rem]";

  return (
    <Link
      href="/"
      aria-label="Ramiyar Karanjia — Home"
      className={`font-display font-[650] leading-none tracking-tight text-ink no-underline hover:text-accent ${sizeClass} ${className}`}
    >
      RK
    </Link>
  );
}
