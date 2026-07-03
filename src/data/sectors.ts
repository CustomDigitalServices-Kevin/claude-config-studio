import type { Localized, SectorId } from "../types";

export interface Sector {
  id: SectorId;
  label: Localized;
  tagline: Localized;
  /** Slug ASCII = nom du dossier N1 généré (ex "power-platform"). */
  slug: string;
}

/**
 * 7 secteurs prédéfinis (D24, validés Kevin). Chacun devient un dossier N1
 * (`<slug>/.claude/`) en profondeur n0n1 / n0n1n2. Prose FR accentuée (convention data/).
 */
export const SECTORS: readonly Sector[] = [
  {
    id: "web",
    label: { fr: "Web", en: "Web" },
    tagline: { fr: "Sites, SaaS, apps full-stack.", en: "Sites, SaaS, full-stack apps." },
    slug: "web",
  },
  {
    id: "power-platform",
    label: { fr: "Power Platform", en: "Power Platform" },
    tagline: {
      fr: "Power Apps, Automate, BI, Copilot.",
      en: "Power Apps, Automate, BI, Copilot.",
    },
    slug: "power-platform",
  },
  {
    id: "data-ml",
    label: { fr: "Data / ML", en: "Data / ML" },
    tagline: { fr: "Data science, ML, dashboards.", en: "Data science, ML, dashboards." },
    slug: "data-ml",
  },
  {
    id: "infra",
    label: { fr: "Infra", en: "Infra" },
    tagline: { fr: "Déploiement, CI/CD, IaC.", en: "Deployment, CI/CD, IaC." },
    slug: "infra",
  },
  {
    id: "mobile",
    label: { fr: "Mobile", en: "Mobile" },
    tagline: { fr: "iOS, Android, cross-platform.", en: "iOS, Android, cross-platform." },
    slug: "mobile",
  },
  {
    id: "bots-agents",
    label: { fr: "Bots-Agents", en: "Bots-Agents" },
    tagline: { fr: "Agents IA, bots, automatisations.", en: "AI agents, bots, automations." },
    slug: "bots-agents",
  },
  {
    id: "other",
    label: { fr: "Autre", en: "Other" },
    tagline: { fr: "Tout autre domaine.", en: "Any other domain." },
    slug: "other",
  },
];

export function sectorById(id: SectorId): Sector {
  const found = SECTORS.find((s) => s.id === id);
  if (!found) {
    throw new Error(`Secteur inconnu: ${id}`);
  }
  return found;
}
