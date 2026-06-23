/**
 * Language Translation helper for Kerala Supplyco E-Commerce applet
 */
export function t(
  en: string,
  ml: string,
  userLang?: "english" | "malayalam" | "bilingual"
): string {
  const lang = userLang || "bilingual";
  if (lang === "english") {
    return en;
  }
  if (lang === "malayalam") {
    return ml;
  }
  // Bilingual: join with standard separator
  return `${en} / ${ml}`;
}
