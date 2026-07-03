import type { Answers } from "../types";
import { depthById, hasProjectLayer } from "../data/depths";
import { sectorById } from "../data/sectors";
import { quote } from "./text";

/**
 * Sections du CLAUDE.md spécifiques à la refonte D24 (extraites de claudeMd.ts pour tenir
 * la Règle 8 : fichier < 300 lignes). Toutes compactes (contribuent au plafond 200 non déportable).
 */

/** Section Hiérarchie : rangement des projets par secteur. Racine avec secteurs uniquement. */
export function hierarchySection(a: Answers): string {
  const fr = a.language === "fr";
  const depth = depthById(a.depth);
  const sectorNames = a.sectors.map((id) => sectorById(id).slug);
  const sectorList = sectorNames.length > 0 ? sectorNames.join(", ") : fr ? "(aucun coché)" : "(none selected)";
  const lines: string[] = [
    `## ${fr ? "Hiérarchie" : "Hierarchy"}`,
    "",
    quote([
      fr
        ? `Profondeur : ${depth.level} (racine + secteurs${hasProjectLayer(a.depth) ? " + projets" : ""}).`
        : `Depth: ${depth.level} (root + sectors${hasProjectLayer(a.depth) ? " + projects" : ""}).`,
    ]),
    "",
    fr
      ? "- Racine (ce fichier) : règles transverses à tout."
      : "- Root (this file): rules shared across everything.",
    fr
      ? `- Secteurs (N1) : ${sectorList}. Un nouveau projet va dans le bon secteur.`
      : `- Sectors (N1): ${sectorList}. A new project goes into the right sector.`,
  ];
  if (hasProjectLayer(a.depth)) {
    lines.push(
      fr
        ? "- Projets (N2) : un .claude minimal par projet, héritant du secteur et de la racine."
        : "- Projects (N2): a minimal .claude per project, inheriting sector and root.",
    );
  }
  lines.push(
    fr
      ? "- À la création d'un projet : le ranger sous le bon secteur, vérifier/proposer les skills et agents au bon niveau."
      : "- When creating a project: file it under the right sector, check/suggest skills and agents at the right level.",
  );
  return lines.join("\n");
}

/** Directive d'auto-initialisation au premier lancement. Racine avec INITIALIZE.md uniquement. */
export function initializeDirective(a: Answers): string {
  const fr = a.language === "fr";
  return [
    `## ${fr ? "Initialisation (premier lancement)" : "Initialization (first launch)"}`,
    "",
    fr
      ? "- Si un fichier `INITIALIZE.md` existe à la racine, l'exécuter intégralement à la première interaction, puis le supprimer."
      : "- If an `INITIALIZE.md` file exists at the root, run it fully on the first interaction, then delete it.",
    fr
      ? "- Chaque étape est idempotente ; en cas d'échec à mi-parcours, relancer (le fichier reste tant que l'init n'est pas terminée)."
      : "- Each step is idempotent; if it fails midway, re-run (the file stays until init completes).",
  ].join("\n");
}

/** Contenu d'un stub de sous-couche (secteur / projet) : minimal, hérité du parent. */
export function stubGuidance(a: Answers, isSector: boolean): string {
  const fr = a.language === "fr";
  if (isSector) {
    return fr
      ? "Ajoutez ici les conventions propres à ce secteur : stack, outils, gotchas, sources de référence."
      : "Add this sector's own conventions here: stack, tools, gotchas, reference sources.";
  }
  return fr
    ? "Identité, stack lockée et liens spécifiques à ce projet. Le reste est hérité."
    : "Identity, locked stack and project-specific links. Everything else is inherited.";
}
