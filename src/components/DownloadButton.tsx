import { useState } from "react";
import type { Answers, GeneratedFile, Language } from "../types";
import { pick } from "../types";
import { CHROME } from "../i18n/chrome";
import { downloadZip } from "../lib/zip";
import { buildManifest } from "../lib/manifest";
import { slugify } from "../generator/text";
import { cn } from "./primitives";

/**
 * Bouton de telechargement du ZIP, reutilisable (colonne preview + barre compacte mobile).
 * Il porte l'etat `building` et la logique onDownload, pour qu'un seul composant les detienne.
 * Le ZIP embarque le manifeste config-studio.json (re-import), construit depuis answers.
 * L'aria-label reste "Telecharger le .zip" (localise) meme pendant la generation, pour un nom
 * accessible stable (l'E2E cible ce libelle).
 */
export function DownloadButton({
  files,
  answers,
  lang,
  disabled = false,
  className,
}: {
  files: GeneratedFile[];
  answers: Answers;
  lang: Language;
  disabled?: boolean;
  className?: string;
}) {
  const [building, setBuilding] = useState(false);

  async function onDownload() {
    setBuilding(true);
    try {
      await downloadZip(
        files,
        `${slugify(answers.projectName)}-claude-config.zip`,
        buildManifest(answers),
      );
    } finally {
      setBuilding(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDownload}
      disabled={building || disabled || files.length === 0}
      aria-label={pick(CHROME.preview.download, lang)}
      className={cn(
        "rounded-lg bg-clay-500 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-clay-400 disabled:opacity-50",
        className,
      )}
    >
      {building ? pick(CHROME.preview.generating, lang) : pick(CHROME.preview.download, lang)}
    </button>
  );
}
