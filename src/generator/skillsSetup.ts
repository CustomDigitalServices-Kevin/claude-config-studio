import type { Answers } from "../types";
import { skillById, type SkillEntry } from "../data/skills";
import { SOURCES } from "../data/sources";

/**
 * Section "Skills à installer" pour INSTALL.md. Deux blocs distincts :
 *  - slash : commandes `/plugin ...` à taper DANS Claude Code (marketplace add dedupe par repo).
 *  - shell : commandes `npx claude-code-templates ...` à taper dans le TERMINAL.
 * Retourne "" si aucun skill sélectionné. Aucun corps de skill n'est généré : seules les commandes.
 */
export function generateSkillsInstall(a: Answers): string {
  const selected = a.skills
    .map(skillById)
    .filter((s): s is SkillEntry => Boolean(s));
  if (selected.length === 0) {
    return "";
  }
  const fr = a.language === "fr";

  // Bloc slash (marketplace) : un seul `marketplace add` par repo, puis les `install` verbatim.
  const marketplace = [...selected.filter((s) => s.method === "marketplace")].sort((x, y) =>
    (x.marketplaceRepo ?? "").localeCompare(y.marketplaceRepo ?? ""),
  );
  const slashLines: string[] = [];
  const addedRepos = new Set<string>();
  for (const s of marketplace) {
    if (s.marketplaceRepo && !addedRepos.has(s.marketplaceRepo)) {
      slashLines.push(`/plugin marketplace add ${s.marketplaceRepo}`);
      addedRepos.add(s.marketplaceRepo);
    }
    slashLines.push(s.install);
  }

  // Bloc shell (cct-cli) : une commande npx autonome par skill.
  const shellLines = selected.filter((s) => s.method === "cct-cli").map((s) => s.install);

  const out: string[] = [`## ${fr ? "Skills à installer" : "Skills to install"}`, ""];

  if (slashLines.length > 0) {
    out.push(
      fr
        ? "### Dans Claude Code (commandes slash)"
        : "### Inside Claude Code (slash commands)",
      "",
      fr
        ? "Tapez ces commandes DANS une session Claude Code (pas dans le terminal) :"
        : "Type these commands INSIDE a Claude Code session (not in the terminal):",
      "",
      "```",
      ...slashLines,
      "```",
    );
  }

  if (shellLines.length > 0) {
    if (slashLines.length > 0) {
      out.push("");
    }
    out.push(
      fr
        ? "### Dans le terminal (CLI claude-code-templates)"
        : "### In the terminal (claude-code-templates CLI)",
      "",
      fr
        ? "Tapez ces commandes dans votre terminal :"
        : "Run these commands in your terminal:",
      "",
      "```",
      ...shellLines,
      "```",
    );
  }

  out.push(
    "",
    fr
      ? `Référence : ${SOURCES.plugins} , ${SOURCES.skills} .`
      : `Reference: ${SOURCES.plugins} , ${SOURCES.skills} .`,
  );

  return out.join("\n");
}
