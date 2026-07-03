import type { Answers } from "../types";
import { pick } from "../types";
import { COMPANION_TOOLS, CONNECT_KIND_LABELS } from "../data/tools";
import { applyOptions } from "../data/options";
import { joinSections } from "./text";

function selectedTools(a: Answers) {
  return COMPANION_TOOLS.filter((t) => a.tools.includes(t.id));
}

/** Section courte injectée dans CLAUDE.md : instruction de configuration à la première ouverture. */
export function toolsClaudeMdSection(a: Answers): string {
  const tools = selectedTools(a);
  if (tools.length === 0) {
    return "";
  }
  const fr = a.language === "fr";
  return [
    `## ${fr ? "Outils à connecter (première ouverture)" : "Tools to connect (first launch)"}`,
    "",
    fr
      ? "- Au premier lancement de ce projet, proposer à l'utilisateur de configurer les outils ci-dessous. Ne rien installer ni connecter sans son accord explicite."
      : "- On first launch of this project, offer to set up the tools below. Do not install or connect anything without explicit user consent.",
    fr
      ? "- Détail (à quoi sert chaque outil, commande, avantages/limites) : voir `TOOLS.md`."
      : "- Details (what each tool is for, command, pros/cons): see `TOOLS.md`.",
    "",
    ...tools.map((t) => `- **${t.name}** : ${pick(t.howToConnect, a.language)}`),
  ].join("\n");
}

/** Section CLAUDE.md des règles 0 associées aux outils sélectionnés (activées par l'utilisateur). */
export function toolRulesSection(a: Answers): string {
  const fr = a.language === "fr";
  const rules = COMPANION_TOOLS.filter(
    (t) => a.tools.includes(t.id) && a.toolRules.includes(t.id) && t.rule,
  );
  if (rules.length === 0) {
    return "";
  }
  const header = `## ${fr ? "Règles liées aux outils" : "Tool-related rules"}`;
  const blocks = rules.map((t) => {
    const rule = t.rule;
    if (!rule) {
      return "";
    }
    const body = applyOptions(t.id, pick(rule.body, a.language), rule.options, a.ruleOptions, a.language, a.rigor);
    return `### ${pick(rule.title, a.language)}\n\n${body}`;
  });
  return [header, "", blocks.join("\n\n")].join("\n");
}

/** Document TOOLS.md : fiche complète de chaque outil sélectionné. */
export function generateToolsDoc(a: Answers): string | null {
  const tools = selectedTools(a);
  if (tools.length === 0) {
    return null;
  }
  const fr = a.language === "fr";
  const header = [
    `# ${fr ? "Outils à connecter" : "Tools to connect"} - ${a.projectName}`,
    "",
    fr
      ? "Ces outils complètent Claude Code. Suivez la connexion indiquée, après validation de votre besoin."
      : "These tools complement Claude Code. Follow the connection shown, after confirming your need.",
  ].join("\n");

  const blocks = tools.map((t) => {
    const l: string[] = [
      `## ${t.name}`,
      "",
      `- **${fr ? "Type" : "Type"}** : ${pick(CONNECT_KIND_LABELS[t.connectKind], a.language)}${t.official ? (fr ? " (officiel)" : " (official)") : ""}`,
      `- **${fr ? "Ce que c'est" : "What it is"}** : ${pick(t.what, a.language)}`,
      `- **${fr ? "Apporte" : "Adds"}** : ${pick(t.adds, a.language)}`,
      `- **${fr ? "Connexion" : "Connect"}** : ${pick(t.howToConnect, a.language)}`,
      `- **${fr ? "Avantages" : "Pros"}** : ${pick(t.advantages, a.language)}`,
      `- **${fr ? "Limites" : "Cons"}** : ${pick(t.disadvantages, a.language)}`,
      `- **${fr ? "Quand" : "When"}** : ${pick(t.whenToUse, a.language)}`,
      `- ${fr ? "Source" : "Source"} : ${t.source}`,
    ];
    return l.join("\n");
  });

  return joinSections([header, ...blocks]);
}
