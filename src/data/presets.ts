import type { Answers, Localized } from "../types";
import { initialAnswers } from "./defaults";
import { defaultRulesForProfiles, recommendedStacksForProfiles } from "./profiles";

/**
 * Preset metier "Depart rapide" : un point de depart coherent applique par-dessus l'etat initial.
 * `answers` est un Partial des reponses SANS aucun champ d'identite (garanti par le type Omit) :
 * l'identite reste saisie par l'utilisateur et n'est jamais portee par un preset.
 * Tous les ids referances existent dans les catalogues (profiles / stacks / rules / hooks).
 */
export type PresetAnswers = Partial<
  Omit<Answers, "projectName" | "author" | "org" | "companyId" | "authorRole">
>;

export interface Preset {
  id: string;
  name: Localized;
  description: Localized;
  /** Teinte d'accent oklch (reprend le langage PROFILE_HUE). */
  hue: number;
  answers: PresetAnswers;
}

export const PRESETS: readonly Preset[] = [
  {
    id: "freelance-power-platform",
    name: { fr: "Freelance Power Platform", en: "Power Platform freelancer" },
    description: {
      fr: "Power Platform + dev, syntaxe vérifiée, rigueur standard.",
      en: "Power Platform + dev, verified syntax, standard rigor.",
    },
    hue: 94,
    answers: {
      profiles: ["power-platform", "dev"],
      stacks: ["power-platform"],
      rigor: "standard",
    },
  },
  {
    id: "web-team-ts",
    name: { fr: "Équipe web TypeScript", en: "Web TypeScript team" },
    description: {
      fr: "Dev web strict, TypeScript, tests obligatoires.",
      en: "Strict web dev, TypeScript, tests required.",
    },
    hue: 30,
    answers: {
      profiles: ["dev"],
      stacks: ["web-ts"],
      rigor: "strict",
    },
  },
  {
    id: "data-scientist",
    name: { fr: "Data scientist", en: "Data scientist" },
    description: {
      fr: "Data / ML, Python, reproductibilité.",
      en: "Data / ML, Python, reproducibility.",
    },
    hue: 78,
    answers: {
      profiles: ["data-ml"],
      stacks: ["python"],
      rigor: "standard",
    },
  },
  {
    id: "auditeur",
    name: { fr: "Auditeur", en: "Auditor" },
    description: {
      fr: "Lecture seule, rigueur stricte, livrable = rapport.",
      en: "Read-only, strict rigor, deliverable = report.",
    },
    hue: 46,
    answers: {
      profiles: ["audit"],
      stacks: ["none"],
      rigor: "strict",
    },
  },
  {
    id: "devops-infra",
    name: { fr: "DevOps / Infra", en: "DevOps / Infra" },
    description: {
      fr: "Infra, Docker, idempotence et secrets sûrs.",
      en: "Infra, Docker, idempotence and safe secrets.",
    },
    hue: 38,
    answers: {
      profiles: ["infra"],
      stacks: ["docker-infra"],
      rigor: "standard",
    },
  },
  {
    id: "debutant",
    name: { fr: "Débutant", en: "Beginner" },
    description: {
      fr: "Générique, souple, garde-fous de base et rappels.",
      en: "Generic, loose, base guardrails and reminders.",
    },
    hue: 110,
    answers: {
      profiles: ["generic"],
      stacks: ["none"],
      rigor: "light",
      hooks: ["session-start-reminder", "session-end-reminder"],
    },
  },
];

/**
 * Applique un preset par-dessus l'etat initial en PRESERVANT les champs d'identite deja saisis.
 * Les regles et stacks sont derivees des profils du preset (comme la selection de profils dans l'UI),
 * pour ne jamais laisser des regles qui contredisent les profils.
 */
export function applyPreset(current: Answers, preset: Preset): Answers {
  const base = initialAnswers();
  const p = preset.answers;
  const profiles = p.profiles ?? base.profiles;
  return {
    ...base,
    ...p,
    profiles,
    rules: p.rules ?? defaultRulesForProfiles(profiles),
    stacks: p.stacks ?? recommendedStacksForProfiles(profiles),
    // Identite : on ne l'ecrase jamais, on garde ce que l'utilisateur a saisi.
    projectName: current.projectName,
    author: current.author,
    org: current.org,
    companyId: current.companyId,
    authorRole: current.authorRole,
  };
}
