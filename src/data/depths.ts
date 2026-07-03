import type { DepthId, Localized } from "../types";

export interface DepthOption {
  id: DepthId;
  label: Localized;
  /** Notation courte affichée dans l'UI (0 / 0+1 / 0+1+2). */
  level: string;
  summary: Localized;
  description: Localized;
}

/**
 * Les 3 profondeurs d'arborescence (D24). Remplacent les anciennes STRUCTURE_OPTIONS.
 * Mécanique d'héritage inchangée (doc officielle code.claude.com/docs/en/memory) :
 * Claude Code concatène tous les CLAUDE.md de cwd jusqu'à ~/.claude, du plus loin au plus proche.
 */
export const DEPTH_OPTIONS: readonly DepthOption[] = [
  {
    id: "n0",
    label: { fr: "Racine seule", en: "Root only" },
    level: "0",
    summary: {
      fr: "Un seul .claude/ global. Le cas le plus simple.",
      en: "A single global .claude/. The simplest case.",
    },
    description: {
      fr: "Génère un seul .claude/ (CLAUDE.md + settings.json + rules) à placer à la racine d'un dépôt ou dans ~/.claude. Aucune couche de secteur.",
      en: "Generates a single .claude/ (CLAUDE.md + settings.json + rules) to place at a repo root or in ~/.claude. No sector layer.",
    },
  },
  {
    id: "n0n1",
    label: { fr: "Racine + secteurs", en: "Root + sectors" },
    level: "0+1",
    summary: {
      fr: "La racine plus un dossier par secteur coché (Niveau 1).",
      en: "The root plus one folder per selected sector (Level 1).",
    },
    description: {
      fr: "Génère la racine (règles + settings complets) et un squelette .claude/ par secteur coché. Chaque secteur AJOUTE son spécifique et hérite de la racine.",
      en: "Generates the root (rules + full settings) and a .claude/ skeleton per selected sector. Each sector ADDS its specifics and inherits from the root.",
    },
  },
  {
    id: "n0n1n2",
    label: { fr: "Racine + secteurs + projets", en: "Root + sectors + projects" },
    level: "0+1+2",
    summary: {
      fr: "L'arbre complet : racine, secteurs, puis un projet exemple (Niveau 2).",
      en: "The full tree: root, sectors, then an example project (Level 2).",
    },
    description: {
      fr: "Génère la racine, les squelettes de secteurs, et un projet exemple sous le premier secteur pour démontrer l'héritage cumulatif sur 3 niveaux.",
      en: "Generates the root, the sector skeletons, and an example project under the first sector to demonstrate cumulative 3-level inheritance.",
    },
  },
];

export function depthById(id: DepthId): DepthOption {
  const found = DEPTH_OPTIONS.find((d) => d.id === id);
  if (!found) {
    throw new Error(`Profondeur inconnue: ${id}`);
  }
  return found;
}

/** Vrai si la profondeur comporte une couche de secteurs (N1). */
export function hasSectorLayer(id: DepthId): boolean {
  return id === "n0n1" || id === "n0n1n2";
}

/** Vrai si la profondeur comporte une couche de projet exemple (N2). */
export function hasProjectLayer(id: DepthId): boolean {
  return id === "n0n1n2";
}
