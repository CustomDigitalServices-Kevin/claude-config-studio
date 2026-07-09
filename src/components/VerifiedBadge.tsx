import type { Language } from "../types";
import { formatVerified } from "../i18n/chrome";

/**
 * Badge discret "Vérifié le ..." affiche quand une entree de catalogue porte `verifiedAt`.
 * Defensif : ne rend rien si le champ est absent ou malforme (les catalogues peuvent ne pas
 * encore etre horodates). Petit texte ink-500, sans dependance de formatage de date.
 */
export function VerifiedBadge({
  verifiedAt,
  lang,
  className,
}: {
  verifiedAt: string | undefined;
  lang: Language;
  className?: string;
}) {
  const label = formatVerified(verifiedAt, lang);
  if (!label) {
    return null;
  }
  return <span className={className ?? "text-[10px] text-ink-500"}>{label}</span>;
}
