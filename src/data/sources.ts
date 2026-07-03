/**
 * URLs officielles Claude Code. Source unique des liens cites dans les fichiers generes
 * et l'UI. Toutes verifiees sur code.claude.com/docs (doc officielle migree depuis
 * docs.anthropic.com en 2026).
 */
export const SOURCES = {
  memory: "https://code.claude.com/docs/en/memory",
  settings: "https://code.claude.com/docs/en/settings",
  hooks: "https://code.claude.com/docs/en/hooks",
  permissions: "https://code.claude.com/docs/en/permissions",
  subAgents: "https://code.claude.com/docs/en/sub-agents",
  skills: "https://code.claude.com/docs/en/skills",
  plugins: "https://code.claude.com/docs/en/plugins",
  pluginMarketplaces: "https://code.claude.com/docs/en/plugin-marketplaces",
  agentTeams: "https://code.claude.com/docs/en/agent-teams",
  outputStyles: "https://code.claude.com/docs/en/output-styles",
  sandboxing: "https://code.claude.com/docs/en/sandboxing",
  mcp: "https://code.claude.com/docs/en/mcp",
  contextWindow: "https://code.claude.com/docs/en/context-window",
  bestPractices: "https://code.claude.com/docs/en/best-practices",
  changelog: "https://code.claude.com/docs/en/changelog",
  contextEngineering:
    "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents",
  agentSkills:
    "https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills",
} as const;

export type SourceKey = keyof typeof SOURCES;
