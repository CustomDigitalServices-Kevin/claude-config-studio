import type { Answers } from "../types";
import { pick } from "../types";
import { behaviorById } from "../data/workflow";

/** Directive de posture (comportement par défaut) pour la section Posture du CLAUDE.md. */
export function behaviorDirective(a: Answers): string {
  return pick(behaviorById(a.workflow.defaultBehavior).directive, a.language);
}

/** Directive advisor pour le CLAUDE.md (si le sous-agent advisor est activé). */
export function advisorDirective(a: Answers): string | null {
  if (!a.workflow.advisor.enabled) {
    return null;
  }
  return a.language === "fr"
    ? "- Avant toute décision structurante (architecture, dépendance, migration, config) : invoquer le sous-agent `advisor` pour valider l'approche contre les sources officielles avant d'agir."
    : "- Before any structural decision (architecture, dependency, migration, config): invoke the `advisor` subagent to validate the approach against official sources before acting.";
}

/**
 * Contenu du fichier `.claude/agents/advisor.md` (sous-agent de validation).
 * Frontmatter au format officiel Claude Code (name / description / tools / model).
 * Retourne null si l'advisor est désactivé.
 */
export function generateAdvisorAgent(a: Answers): string | null {
  if (!a.workflow.advisor.enabled) {
    return null;
  }
  const fr = a.language === "fr";
  const model = a.workflow.advisor.model;
  const front: string[] = [
    "---",
    "name: advisor",
    fr
      ? "description: Valide une approche ou une décision structurante AVANT d'agir (architecture, ajout de dépendance, migration de version, config). Retourne un go/no-go sourcé. Invoquer avant tout changement non trivial."
      : "description: Validates an approach or a structural decision BEFORE acting (architecture, dependency addition, version migration, config). Returns a sourced go/no-go. Invoke before any non-trivial change.",
    "tools: Read, Grep, Glob, WebSearch, WebFetch",
  ];
  if (model) {
    front.push(`model: ${model}`);
  }
  front.push("---");
  const body = fr
    ? `Tu es un relecteur senior. On t'invoque pour valider une approche ou une décision AVANT qu'elle soit exécutée.

Protocole :
1. Reformuler la décision à valider et son contexte.
2. Vérifier l'approche contre les sources autoritatives : doc officielle (WebSearch/WebFetch) et code du repo (Read/Grep/Glob). Jamais d'avis sans source.
3. Identifier les risques, les breaking changes, les alternatives plus simples.
4. Rendre un verdict clair : GO ou NO-GO, avec la raison factuelle et les URLs des sources.
5. Si NO-GO : proposer l'alternative correcte, sourcée.

Direct et factuel. Pas de flatterie. Signaler les trade-offs sans les adoucir.`
    : `You are a senior reviewer. You are invoked to validate an approach or a decision BEFORE it is executed.

Protocol:
1. Restate the decision to validate and its context.
2. Verify the approach against authoritative sources: official docs (WebSearch/WebFetch) and repo code (Read/Grep/Glob). Never an opinion without a source.
3. Identify risks, breaking changes, simpler alternatives.
4. Return a clear verdict: GO or NO-GO, with the factual reason and the source URLs.
5. If NO-GO: propose the correct, sourced alternative.

Direct and factual. No flattery. Surface trade-offs without softening them.`;
  return `${front.join("\n")}\n\n${body}\n`;
}

/**
 * Contenu du fichier `.claude/commands/orchestrate.md` (commande /orchestrate).
 * Frontmatter au format officiel Claude Code. Retourne null si l'orchestration est désactivée.
 */
export function generateOrchestrateCommand(a: Answers): string | null {
  if (!a.workflow.orchestration) {
    return null;
  }
  const fr = a.language === "fr";
  const front: string[] = [
    "---",
    fr
      ? "description: Orchestre une tâche complexe en la décomposant en sous-tâches déléguées à des sous-agents parallèles, puis en synthétisant."
      : "description: Orchestrates a complex task by decomposing it into subtasks delegated to parallel subagents, then synthesizing.",
    fr ? "argument-hint: [objectif]" : "argument-hint: [goal]",
    "allowed-tools: Task, Read, Grep, Glob, Edit, Write, Bash",
    "---",
  ];
  const body = fr
    ? `Objectif : $ARGUMENTS

Orchestre la réalisation :
1. Décomposer l'objectif en sous-tâches indépendantes (les lister explicitement).
2. Déléguer chaque sous-tâche indépendante à un sous-agent (Task) en parallèle, avec un périmètre et un livrable clairs. Fichiers disjoints pour éviter les conflits d'écriture.
3. Vérifier chaque résultat (tests, relecture) avant de l'intégrer.
4. Synthétiser : rassembler les livrables, résoudre les conflits, lancer la vérification globale (build + tests).
5. Rapporter les fichiers touchés et l'état final.

Ne rien laisser à moitié fait. Signaler tout blocage.`
    : `Goal: $ARGUMENTS

Orchestrate the work:
1. Decompose the goal into independent subtasks (list them explicitly).
2. Delegate each independent subtask to a parallel subagent (Task) with a clear scope and deliverable. Disjoint files to avoid write conflicts.
3. Verify each result (tests, review) before integrating it.
4. Synthesize: gather deliverables, resolve conflicts, run the global check (build + tests).
5. Report the touched files and the final state.

Leave nothing half done. Flag any blocker.`;
  return `${front.join("\n")}\n\n${body}\n`;
}
