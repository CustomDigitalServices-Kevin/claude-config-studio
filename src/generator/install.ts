import type { Answers } from "../types";
import { pick } from "../types";
import { effectiveProfiles, profileById } from "../data/profiles";
import { depthById, hasProjectLayer, hasSectorLayer } from "../data/depths";
import { sectorById } from "../data/sectors";
import { selectedHookCaveats } from "./hooks";
import { generateSkillsInstall } from "./skillsSetup";
import { generateAgentsInstall } from "./agentsSetup";
import { SOURCES } from "./../data/sources";
import { joinSections, slugify } from "./text";

/** Destination de dépôt en clair, dérivée de la profondeur et des secteurs cochés. */
function destinationText(a: Answers): string {
  const fr = a.language === "fr";
  if (!hasSectorLayer(a.depth)) {
    return fr
      ? "Racine de votre dépôt : `<projet>/.claude/` (ou `~/.claude/` pour une config globale machine)."
      : "Repo root: `<project>/.claude/` (or `~/.claude/` for a machine-wide global config).";
  }
  const slugs = a.sectors.map((id) => sectorById(id).slug);
  const first = slugs[0] ?? "web";
  const proj = slugify(a.projectName);
  if (hasProjectLayer(a.depth)) {
    return fr
      ? `Racine workspace : \`<workspace>/.claude/\`, puis chaque secteur (\`<workspace>/${first}/.claude/\`), puis le projet (\`<workspace>/${first}/${proj}/.claude/\`).`
      : `Workspace root: \`<workspace>/.claude/\`, then each sector (\`<workspace>/${first}/.claude/\`), then the project (\`<workspace>/${first}/${proj}/.claude/\`).`;
  }
  return fr
    ? `Racine workspace : \`<workspace>/.claude/\`, puis chaque secteur (\`<workspace>/${first}/.claude/\`).`
    : `Workspace root: \`<workspace>/.claude/\`, then each sector (\`<workspace>/${first}/.claude/\`).`;
}

/** Section 1 : où déposer la configuration générée. */
function placementSection(a: Answers): string {
  const fr = a.language === "fr";
  return [
    `## 1. ${fr ? "Où déposer la configuration" : "Where to place the configuration"}`,
    "",
    `${fr ? "Destination" : "Destination"} : ${destinationText(a)}`,
    "",
    fr
      ? "Copiez le contenu de cette archive à cet emplacement (le dossier `.claude/` doit se retrouver là où Claude Code le cherche en remontant depuis votre dossier de travail)."
      : "Copy the contents of this archive to that location (the `.claude/` folder must end up where Claude Code looks for it when walking up from your working directory).",
  ].join("\n");
}

/** Section 2 : initialiser et vérifier la config dans Claude Code. */
function initStepsSection(a: Answers): string {
  const fr = a.language === "fr";
  return [
    `## 2. ${fr ? "Initialiser dans Claude Code" : "Initialize in Claude Code"}`,
    "",
    fr
      ? "1. Ouvrez un terminal dans le projet et lancez `claude`."
      : "1. Open a terminal in the project and run `claude`.",
    fr
      ? "2. Vérifiez que la config est chargée : `/memory` liste les CLAUDE.md actifs, `/context` montre l'usage de la fenêtre."
      : "2. Check the config is loaded: `/memory` lists active CLAUDE.md files, `/context` shows window usage.",
    fr
      ? "3. Vérifiez les permissions : `/permissions` (les règles deny/ask de `settings.json` doivent apparaître)."
      : "3. Check permissions: `/permissions` (the deny/ask rules from `settings.json` should appear).",
    a.profiles.includes("audit")
      ? fr
        ? "4. Profil audit : lancez en mode plan pour une posture lecture seule stricte : `claude --permission-mode plan`."
        : "4. Audit profile: run in plan mode for a strict read-only posture: `claude --permission-mode plan`."
      : fr
        ? "4. (Optionnel) `/init` complète un CLAUDE.md existant ; ici il est déjà fourni, ne l'écrasez pas."
        : "4. (Optional) `/init` augments an existing CLAUDE.md; here it is already provided, do not overwrite it.",
  ].join("\n");
}

/** Section 3 : héritage, fusion settings, taille. */
function precedenceSection(a: Answers): string {
  const fr = a.language === "fr";
  const lines = [
    fr
      ? "- Héritage : Claude Code concatène tous les `CLAUDE.md` de votre dossier jusqu'à `~/.claude`, sans écrasement."
      : "- Inheritance: Claude Code concatenates every `CLAUDE.md` from your folder up to `~/.claude`, without overriding.",
    fr
      ? "- `settings.json` : les listes (allow/ask/deny) fusionnent ; un `deny` gagne partout. Ordre d'évaluation : deny > ask > allow."
      : "- `settings.json`: lists (allow/ask/deny) merge; a `deny` wins everywhere. Evaluation order: deny > ask > allow.",
    fr
      ? "- Taille : gardez chaque `CLAUDE.md` sous ~200 lignes (au-delà, moins d'adhérence). Le procédural va dans `rules/` avec `paths:`."
      : "- Size: keep each `CLAUDE.md` under ~200 lines (beyond that, less adherence). Procedural content goes to `rules/` with `paths:`.",
    // Prudence npx/npm : les catalogues (skills, agents, MCP locaux) pointent des paquets tiers a version flottante.
    fr
      ? "- Prudence `npx`/`npm` : relisez toute commande avant de l'exécuter ; les catalogues pointent des paquets tiers à version flottante."
      : "- `npx`/`npm` caution: review any command before running it; the catalogs point to third-party packages at floating versions.",
  ];
  // Note .mcp.json : approbation requise a la premiere ouverture interactive (serveurs projet).
  if (a.mcpServers.length > 0) {
    lines.push(
      fr
        ? "- `.mcp.json` : les serveurs MCP fournis restent inactifs jusqu'à approbation ; Claude Code propose de les approuver à la première ouverture interactive."
        : "- `.mcp.json`: the bundled MCP servers stay inactive until approved; Claude Code prompts to approve them at the first interactive launch.",
    );
  }
  return [`## 3. ${fr ? "Bon à savoir" : "Good to know"}`, "", ...lines].join("\n");
}

/** Section 4 (optionnelle) : avertissement OS/shell sur les hooks cochés. Vide si aucun hook. */
function hooksSection(a: Answers): string {
  if (a.hooks.length === 0) {
    return "";
  }
  const fr = a.language === "fr";
  const caveats = selectedHookCaveats(a.hooks, a.language).map((c) => `- ${c}`);
  return [
    `## 4. ${fr ? "Hooks (attention OS / shell)" : "Hooks (OS / shell caveat)"}`,
    "",
    fr
      ? "Les hooks sont sensibles à l'OS et au shell. Vérifiez-les avant de compter dessus :"
      : "Hooks are OS- and shell-sensitive. Verify them before relying on them:",
    "",
    ...caveats,
  ].join("\n");
}

/** Section finale : sources officielles. */
function sourcesSection(a: Answers): string {
  const fr = a.language === "fr";
  return [
    `## ${fr ? "Sources" : "Sources"}`,
    "",
    `- ${SOURCES.memory}`,
    `- ${SOURCES.settings}`,
    `- ${SOURCES.permissions}`,
    `- ${SOURCES.hooks}`,
  ].join("\n");
}

/** Génère INSTALL.md : où déposer la config et comment l'initialiser dans Claude Code. */
export function generateInstall(a: Answers): string {
  const fr = a.language === "fr";
  const depth = depthById(a.depth);
  const profiles = effectiveProfiles(a.profiles).map(profileById);
  const profileLabels = profiles.map((p) => pick(p.label, a.language)).join(", ");

  const title = `# Installation - ${a.projectName}`;
  const intro = fr
    ? `Configuration Claude Code générée pour le(s) profil(s) **${profileLabels}**, profondeur **${pick(depth.label, a.language)}** (${depth.level}).`
    : `Claude Code configuration generated for the **${profileLabels}** profile(s), **${pick(depth.label, a.language)}** depth (${depth.level}).`;

  const sections: string[] = [
    title,
    intro,
    placementSection(a),
    initStepsSection(a),
    precedenceSection(a),
  ];

  for (const section of [hooksSection(a), generateSkillsInstall(a), generateAgentsInstall(a)]) {
    if (section) {
      sections.push(section);
    }
  }
  sections.push(sourcesSection(a));

  return joinSections(sections);
}
