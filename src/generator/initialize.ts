import type { Answers } from "../types";
import { generateSkillsInstall } from "./skillsSetup";
import { generateAgentsInstall } from "./agentsSetup";
import { joinSections, quote } from "./text";

/** En-tete + intro (role et garde-fous du fichier). */
function introBlock(a: Answers): string[] {
  const fr = a.language === "fr";
  const intro = quote(
    fr
      ? [
          "Exécuté par Claude Code à la première interaction (directive dans CLAUDE.md), puis SUPPRIMÉ.",
          "N'exécute QUE les commandes sourcées ci-dessous. Ne crée RIEN de zéro qui n'y figure pas.",
        ]
      : [
          "Run by Claude Code on the first interaction (directive in CLAUDE.md), then DELETED.",
          "Run ONLY the sourced commands below. Do NOT create anything from scratch that is not listed.",
        ],
  );
  return [`# INITIALIZE - ${a.projectName}`, intro];
}

/** Règles d'exécution (idempotence globale + ordre d'auto-suppression). */
function rulesBlock(fr: boolean): string {
  return [
    `## ${fr ? "Règles d'exécution" : "Execution rules"}`,
    "",
    ...(fr
      ? [
          "- Exécuter les commandes listées telles quelles (elles sont déjà sourcées par le générateur).",
          "- Vérifier AVANT chaque étape si elle est déjà faite (idempotence) ; ne pas refaire l'existant.",
          "- Pour un gap explicitement marqué `[RECHERCHE]` : limiter la recherche aux sources officielles.",
          "- DERNIÈRE étape seulement, après succès de toutes les précédentes : supprimer ce fichier.",
        ]
      : [
          "- Run the listed commands as-is (they are already sourced by the generator).",
          "- Before each step, check whether it is already done (idempotence); do not redo what exists.",
          "- For a gap explicitly marked `[RECHERCHE]`: limit research to official sources.",
          "- Only as the LAST step, after all previous ones succeed: delete this file.",
        ]),
  ].join("\n");
}

/** Une étape "installer les X" : garde d'idempotence propre à l'étape + commandes sourcées réutilisées. */
function installStep(idempotence: string, sourced: string): string[] {
  return [quote([idempotence]), sourced];
}

/** Étape outils : référence TOOLS.md (pas de .mcp.json généré depuis D12). */
function toolsBlock(fr: boolean): string {
  return [
    `## ${fr ? "Outils / MCP à connecter" : "Tools / MCP to connect"}`,
    "",
    quote([
      fr ? "Idempotence : sauter les outils déjà connectés." : "Idempotence: skip already-connected tools.",
    ]),
    "",
    fr
      ? "- Suivre `TOOLS.md` pour chaque outil coché (procédure de connexion, commandes `claude mcp add` / configuration)."
      : "- Follow `TOOLS.md` for each selected tool (connection procedure, `claude mcp add` / configuration).",
  ].join("\n");
}

/** Vérification post-init + auto-suppression finale (marqueur d'idempotence). */
function closingBlocks(fr: boolean): string[] {
  const verif = [
    `## ${fr ? "Vérification" : "Verification"}`,
    "",
    fr
      ? "- `/memory` (CLAUDE.md chargés), `/permissions` (deny/ask), `/context` (fenêtre)."
      : "- `/memory` (loaded CLAUDE.md), `/permissions` (deny/ask), `/context` (window).",
  ].join("\n");
  const selfDelete = [
    `## ${fr ? "Auto-suppression (dernière étape)" : "Self-deletion (last step)"}`,
    "",
    fr
      ? "- Une fois TOUTES les étapes ci-dessus réussies, supprimer ce fichier `INITIALIZE.md`."
      : "- Once ALL the steps above succeed, delete this `INITIALIZE.md` file.",
    fr
      ? "- Sa disparition atteste que l'initialisation est terminée ; s'il reste, relancer l'init."
      : "- Its removal attests initialization is complete; if it remains, re-run the init.",
  ].join("\n");
  return [verif, selfDelete];
}

/**
 * Playbook d'auto-initialisation exécuté par Claude Code au premier lancement (directive dans CLAUDE.md),
 * puis auto-supprimé (D24). Retourne null si rien à bootstrapper (ni skill, ni agent, ni outil coché).
 *
 * LOI (D19/D21) : PORTE et EXÉCUTE les commandes déjà SOURCÉES par le générateur
 * (réutilise `generateSkillsInstall` / `generateAgentsInstall`, source unique, zéro drift). N'invente
 * jamais "de zéro". Idempotence PAR étape ; auto-suppression en DERNIÈRE étape seulement.
 */
export function generateInitialize(a: Answers): string | null {
  const hasSkills = a.skills.length > 0;
  const hasAgents = a.agents.length > 0;
  const hasTools = a.tools.length > 0;
  if (!hasSkills && !hasAgents && !hasTools) {
    return null;
  }
  const fr = a.language === "fr";

  const sections: string[] = [...introBlock(a), rulesBlock(fr)];

  if (hasSkills) {
    sections.push(
      ...installStep(
        fr
          ? "Idempotence : vérifier `/plugin` ; n'installer que les skills absents."
          : "Idempotence: check `/plugin`; install only missing skills.",
        generateSkillsInstall(a),
      ),
    );
  }
  if (hasAgents) {
    sections.push(
      ...installStep(
        fr
          ? "Idempotence : vérifier `/agents` ; n'installer que les agents absents."
          : "Idempotence: check `/agents`; install only missing agents.",
        generateAgentsInstall(a),
      ),
    );
  }
  if (hasTools) {
    sections.push(toolsBlock(fr));
  }

  sections.push(...closingBlocks(fr));

  return joinSections(sections);
}
