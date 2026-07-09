import type { Answers } from "../types";
import { agentById, type AgentEntry } from "../data/agents";
import { SOURCES } from "../data/sources";

/**
 * Section "Agents à installer" pour INSTALL.md. Deux blocs distincts :
 *  - slash : commandes `/plugin ...` à taper DANS Claude Code (marketplace add dedupe par repo).
 *  - shell : commandes `npx claude-code-templates ... --agent ...` à taper dans le TERMINAL.
 * Retourne "" si aucun agent sélectionné. Aucun corps d'agent n'est généré : seules les commandes.
 */
export function generateAgentsInstall(a: Answers): string {
  const selected = a.agents.map(agentById).filter((x): x is AgentEntry => Boolean(x));
  if (selected.length === 0) {
    return "";
  }
  const fr = a.language === "fr";

  // Bloc slash (marketplace) : un seul `marketplace add` par repo, puis les `install` verbatim.
  const marketplace = [...selected.filter((x) => x.method === "marketplace")].sort((x, y) =>
    (x.marketplaceRepo ?? "").localeCompare(y.marketplaceRepo ?? ""),
  );
  const slashLines: string[] = [];
  const addedRepos = new Set<string>();
  for (const x of marketplace) {
    if (x.marketplaceRepo && !addedRepos.has(x.marketplaceRepo)) {
      slashLines.push(`/plugin marketplace add ${x.marketplaceRepo}`);
      addedRepos.add(x.marketplaceRepo);
    }
    slashLines.push(x.install);
  }

  // Bloc shell (cct-cli) : une commande npx autonome par agent.
  const shellLines = selected.filter((x) => x.method === "cct-cli").map((x) => x.install);

  const out: string[] = [`## ${fr ? "Agents à installer" : "Agents to install"}`, ""];

  if (slashLines.length > 0) {
    out.push(
      fr ? "### Dans Claude Code (commandes slash)" : "### Inside Claude Code (slash commands)",
      "",
      fr
        ? "Tapez ces commandes DANS une session Claude Code (pas dans le terminal). Un plugin marketplace peut regrouper plusieurs agents :"
        : "Type these commands INSIDE a Claude Code session (not in the terminal). A marketplace plugin can bundle several agents:",
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
      fr ? "Tapez ces commandes dans votre terminal :" : "Run these commands in your terminal:",
      "",
      "```",
      ...shellLines,
      "```",
    );
  }

  out.push(
    "",
    fr
      ? `Référence : ${SOURCES.plugins} , ${SOURCES.subAgents} .`
      : `Reference: ${SOURCES.plugins} , ${SOURCES.subAgents} .`,
  );

  return out.join("\n");
}
