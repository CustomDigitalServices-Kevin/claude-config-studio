import type { Localized, ProfileId, RuleId, StackId } from "../types";
import { RULE_MODULES } from "./rules";

export interface Profile {
  id: ProfileId;
  label: Localized;
  tagline: Localized;
  description: Localized;
  /** Note de posture injectée en tête de CLAUDE.md, avant les règles. */
  intro: Localized;
  recommendedStacks: StackId[];
  /** Permissions deny additionnelles propres au profil. */
  extraDeny: string[];
  /** Permissions ask additionnelles propres au profil. */
  extraAsk: string[];
}

export const PROFILES: readonly Profile[] = [
  {
    id: "dev",
    label: { fr: "Développement", en: "Software development" },
    tagline: {
      fr: "Code fonctionnel, testé, sourcé.",
      en: "Working, tested, sourced code.",
    },
    description: {
      fr: "Développement logiciel général (web, backend, outils). Anti vibe coding, tests, livraison end to end.",
      en: "General software development (web, backend, tooling). Anti vibe coding, tests, end-to-end delivery.",
    },
    intro: {
      fr: "Profil développement : livrer du code complet, testé et vérifié. Aucune source inventée.",
      en: "Development profile: ship complete, tested, verified code. No invented sources.",
    },
    recommendedStacks: ["web-ts", "python", "rust", "go"],
    extraDeny: [],
    extraAsk: [],
  },
  {
    id: "audit",
    label: { fr: "Audit / Revue", en: "Audit / Review" },
    tagline: {
      fr: "Lecture seule, livrable = rapport.",
      en: "Read-only, deliverable = report.",
    },
    description: {
      fr: "Audit de code ou de configuration en lecture seule. Aucune modification sans GO explicite, findings priorisés.",
      en: "Read-only code or configuration audit. No change without explicit GO, prioritized findings.",
    },
    intro: {
      fr: "Profil audit : analyse en LECTURE SEULE. Toute modification exige un GO explicite. Le livrable est un rapport de findings priorisés, jamais des changements silencieux.",
      en: "Audit profile: READ-ONLY analysis. Any modification requires an explicit GO. The deliverable is a prioritized findings report, never silent changes.",
    },
    recommendedStacks: ["none", "web-ts", "python"],
    extraDeny: [
      "Bash(git push --force*)",
      "Bash(git reset --hard*)",
      "Bash(git commit*)",
    ],
    extraAsk: [],
  },
  {
    id: "business",
    label: { fr: "Business / Recherche", en: "Business / Research" },
    tagline: {
      fr: "Réponses sourcées, zéro fabrication.",
      en: "Sourced answers, zero fabrication.",
    },
    description: {
      fr: "Usage non-dev : recherche, rédaction, synthèse, documentation. Pas de règles de code, focus sourcing et structure.",
      en: "Non-dev usage: research, writing, synthesis, documentation. No code rules, focus on sourcing and structure.",
    },
    intro: {
      fr: "Profil business / recherche : réponses sourcées, structurées et vérifiables. Zéro fabrication, zéro flatterie.",
      en: "Business / research profile: sourced, structured, verifiable answers. Zero fabrication, zero flattery.",
    },
    recommendedStacks: ["none"],
    extraDeny: [],
    extraAsk: [],
  },
  {
    id: "data-ml",
    label: { fr: "Data / ML", en: "Data / ML" },
    tagline: {
      fr: "Reproductibilité, env isolé.",
      en: "Reproducibility, isolated env.",
    },
    description: {
      fr: "Data science et machine learning. Seed fixe, environnement isolé, datasets hors git, expériences reproductibles.",
      en: "Data science and machine learning. Fixed seed, isolated environment, datasets out of git, reproducible experiments.",
    },
    intro: {
      fr: "Profil data / ML : reproductibilité avant tout (seed fixe, env isolé, datasets hors git).",
      en: "Data / ML profile: reproducibility first (fixed seed, isolated env, datasets out of git).",
    },
    recommendedStacks: ["python"],
    extraDeny: [],
    extraAsk: [],
  },
  {
    id: "power-platform",
    label: { fr: "Power Platform", en: "Power Platform" },
    tagline: {
      fr: "Syntaxe vérifiée sur doc Microsoft.",
      en: "Syntax verified against Microsoft docs.",
    },
    description: {
      fr: "Power Apps, Power Automate, Power BI, Copilot Studio. Vérification systématique de la syntaxe sur la doc Microsoft officielle.",
      en: "Power Apps, Power Automate, Power BI, Copilot Studio. Systematic syntax verification against official Microsoft docs.",
    },
    intro: {
      fr: "Profil Power Platform : vérifier toute syntaxe (Power Fx, DAX, Power Automate) sur learn.microsoft.com AVANT génération. Jamais de guess sur la locale.",
      en: "Power Platform profile: verify any syntax (Power Fx, DAX, Power Automate) on learn.microsoft.com BEFORE generating. Never guess on locale.",
    },
    recommendedStacks: ["power-platform"],
    extraDeny: [],
    extraAsk: [],
  },
  {
    id: "agents",
    label: { fr: "Agents / Bots IA", en: "AI Agents / Bots" },
    tagline: {
      fr: "Licences OSI, secrets sûrs, testé.",
      en: "OSI licenses, safe secrets, tested.",
    },
    description: {
      fr: "Agents IA, bots, automatisations LLM. Dépendances OSI uniquement, gestion stricte des secrets, code testé.",
      en: "AI agents, bots, LLM automations. OSI dependencies only, strict secret handling, tested code.",
    },
    intro: {
      fr: "Profil agents / bots IA : licences OSI uniquement, secrets en variables d'environnement, code testé de bout en bout.",
      en: "AI agents / bots profile: OSI licenses only, secrets in environment variables, end-to-end tested code.",
    },
    recommendedStacks: ["python", "web-ts"],
    extraDeny: [],
    extraAsk: [],
  },
  {
    id: "infra",
    label: { fr: "Infra / DevOps", en: "Infra / DevOps" },
    tagline: {
      fr: "Idempotent, secrets sûrs, garde-fous.",
      en: "Idempotent, safe secrets, guardrails.",
    },
    description: {
      fr: "Infrastructure, déploiement, CI/CD. Scripts idempotents, opérations destructives gardées, gestion stricte des secrets.",
      en: "Infrastructure, deployment, CI/CD. Idempotent scripts, guarded destructive operations, strict secret handling.",
    },
    intro: {
      fr: "Profil infra / DevOps : scripts rejouables (idempotents), opérations destructives derrière confirmation, aucun secret dans le code.",
      en: "Infra / DevOps profile: replayable (idempotent) scripts, destructive operations behind confirmation, no secret in code.",
    },
    recommendedStacks: ["docker-infra", "python"],
    extraDeny: [],
    extraAsk: ["Bash(terraform destroy*)", "Bash(kubectl delete*)"],
  },
  {
    id: "generic",
    label: { fr: "Générique", en: "Generic" },
    tagline: { fr: "Garde-fous de base, adaptable.", en: "Base guardrails, adaptable." },
    description: {
      fr: "Point de départ minimal, adaptable à tout usage. Garde-fous de base (sourcing, factuel, contexte).",
      en: "Minimal starting point, adaptable to any usage. Base guardrails (sourcing, factual, context).",
    },
    intro: {
      fr: "Configuration générique : garde-fous de base, à compléter selon le besoin.",
      en: "Generic configuration: base guardrails, to extend as needed.",
    },
    recommendedStacks: ["none"],
    extraDeny: [],
    extraAsk: [],
  },
];

export function profileById(id: ProfileId): Profile {
  const found = PROFILES.find((p) => p.id === id);
  if (!found) {
    throw new Error(`Profil inconnu: ${id}`);
  }
  return found;
}

/** Règles cochées par défaut pour un profil, dérivées des modules (source unique, pas de drift). */
export function defaultRulesForProfile(profile: ProfileId): RuleId[] {
  return RULE_MODULES.filter((r) => r.defaultForProfiles.includes(profile)).map(
    (r) => r.id,
  );
}

/** Union ordonnée des règles par défaut de plusieurs profils (sélection multiple). */
export function defaultRulesForProfiles(profiles: ProfileId[]): RuleId[] {
  const ids = new Set<RuleId>();
  for (const p of profiles) {
    for (const id of defaultRulesForProfile(p)) {
      ids.add(id);
    }
  }
  return [...ids];
}

/** Stacks recommandées (union, hors "none") pour pré-cocher la stack à la sélection. */
export function recommendedStacksForProfiles(profiles: ProfileId[]): StackId[] {
  const ids = new Set<StackId>();
  for (const p of profiles) {
    for (const s of profileById(p).recommendedStacks) {
      if (s !== "none") {
        ids.add(s);
      }
    }
  }
  return [...ids];
}

/** Profils effectifs : au moins "generic" si la sélection est vide. */
export function effectiveProfiles(profiles: ProfileId[]): ProfileId[] {
  return profiles.length > 0 ? profiles : ["generic"];
}
