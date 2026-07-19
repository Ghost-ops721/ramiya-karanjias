/** Letter for A–Z browse: skip leading Roman numerals and articles The/A/An. */
export function sortLetter(title: string): string {
  let cleaned = title.replace(/\u00a0/g, " ").trim();
  cleaned = cleaned.replace(/^(?:X{0,3})(?:IX|IV|V?I{0,3})\b[.\s-]*/i, "").trim();
  cleaned = cleaned.replace(/^(?:The|An|A)\s+/i, "").trim();
  const letter = cleaned.replace(/^[^A-Za-z]+/, "").charAt(0).toUpperCase();
  return letter || "#";
}
