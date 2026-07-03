import { useState, type ReactNode } from "react";
import type { Language } from "../types";

const LABELS: Record<Language, { more: string; less: string }> = {
  fr: { more: "En savoir plus", less: "Masquer" },
  en: { more: "Learn more", less: "Hide" },
};

/**
 * Expander "en savoir plus" reutilisable (Preferences, Settings...). Le contenu doit aller
 * PLUS LOIN que le hint de la SectionLabel : effet concret sur les fichiers generes.
 */
export function LearnMore({ lang, children }: { lang: Language; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const t = LABELS[lang];
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded px-2 py-0.5 text-xs text-ink-400 transition-colors hover:text-clay-300"
      >
        {open ? t.less : t.more} {open ? "▲" : "▼"}
      </button>
      {open && (
        <div className="mt-1.5 rounded-[10px] border border-ink-700 bg-ink-900/60 px-3 py-2.5 text-xs leading-relaxed text-ink-300">
          {children}
        </div>
      )}
    </div>
  );
}
