import type { Language } from "../types";
import { pick } from "../types";
import { CHROME } from "../i18n/chrome";

/**
 * Encart d'erreur affiche quand buildConfig leve : une regression du generateur ne doit plus
 * se traduire par une preview silencieuse a "0 fichier". Message utilisateur + detail technique
 * repliable, bordure ambre/rouge sombre coherente avec le theme.
 */
export function GeneratorError({ error, lang }: { error: Error; lang: Language }) {
  return (
    <div
      className="rounded-[12px] border px-4 py-3 text-xs leading-relaxed"
      style={{
        background: "oklch(0.26 0.08 32 / 0.4)",
        borderColor: "oklch(0.55 0.16 32 / 0.55)",
        color: "oklch(0.85 0.06 45)",
      }}
    >
      <p className="text-sm font-semibold" style={{ color: "oklch(0.82 0.14 42)" }}>
        {pick(CHROME.preview.errorTitle, lang)}
      </p>
      <p className="mt-1">{pick(CHROME.preview.errorBody, lang)}</p>
      <details className="mt-2">
        <summary className="cursor-pointer text-ink-400">
          {pick(CHROME.preview.errorDetails, lang)}
        </summary>
        <pre className="mt-1.5 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-ink-950 p-2 font-mono text-[11px] text-ink-300">
          {error.message}
          {error.stack ? `\n\n${error.stack}` : ""}
        </pre>
      </details>
    </div>
  );
}
