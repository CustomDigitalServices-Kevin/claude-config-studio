import type { AdvisorModel, DefaultBehavior, Localized } from "../types";

/**
 * Comportement par défaut face à une demande utilisateur. Chaque posture injecte une
 * directive dans la section Posture du CLAUDE.md généré.
 */
export interface BehaviorOption {
  value: DefaultBehavior;
  label: Localized;
  sub: Localized;
  /** Ligne de directive injectée dans la posture du CLAUDE.md. */
  directive: Localized;
}

export const BEHAVIOR_OPTIONS: readonly BehaviorOption[] = [
  {
    value: "act",
    label: { fr: "Agir directement", en: "Act directly" },
    sub: { fr: "Exécute la demande sans détour", en: "Executes the request right away" },
    directive: {
      fr: "- Face à une demande claire : agir directement. Ne rechercher que si une information technique manque ou n'est pas fiable.",
      en: "- On a clear request: act directly. Only research when a technical detail is missing or unreliable.",
    },
  },
  {
    value: "research",
    label: { fr: "Recherche d'abord", en: "Research first" },
    sub: { fr: "Vérifie la doc avant d'agir", en: "Checks the docs before acting" },
    directive: {
      fr: "- Avant d'agir sur un sujet technique : consulter la doc officielle (ou un MCP de doc) et citer la source. Pas d'action sur une hypothèse non vérifiée.",
      en: "- Before acting on a technical topic: check the official docs (or a docs MCP) and cite the source. No action on an unverified assumption.",
    },
  },
  {
    value: "brainstorm",
    label: { fr: "Brainstorm d'abord", en: "Brainstorm first" },
    sub: { fr: "Qualifie la demande avant de commencer", en: "Qualifies the request before starting" },
    directive: {
      fr: "- Avant toute création ou changement de comportement : brainstormer pour qualifier et préciser la demande (intention, contraintes, critères de succès), présenter un plan, puis exécuter après validation.",
      en: "- Before any creation or behavior change: brainstorm to qualify and refine the request (intent, constraints, success criteria), present a plan, then execute after approval.",
    },
  },
];

export function behaviorById(value: DefaultBehavior): BehaviorOption {
  const found = BEHAVIOR_OPTIONS.find((b) => b.value === value);
  if (!found) {
    throw new Error(`Comportement inconnu: ${value}`);
  }
  return found;
}

/** Libellés des modèles proposés pour le sous-agent advisor. */
export const ADVISOR_MODEL_LABELS: readonly { value: AdvisorModel; label: Localized; sub: Localized }[] = [
  { value: "", label: { fr: "Hériter", en: "Inherit" }, sub: { fr: "Modèle courant", en: "Current model" } },
  { value: "opus", label: { fr: "Opus", en: "Opus" }, sub: { fr: "Le plus capable", en: "Most capable" } },
  { value: "sonnet", label: { fr: "Sonnet", en: "Sonnet" }, sub: { fr: "Équilibré", en: "Balanced" } },
  { value: "haiku", label: { fr: "Haiku", en: "Haiku" }, sub: { fr: "Le plus rapide", en: "Fastest" } },
];
