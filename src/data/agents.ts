import type { Localized } from "../types";

/**
 * Catalogue d'agents (subagents) Claude Code installables, SOURCÉ et vérifié par fetch réel
 * des sources primaires (2026-07-01) :
 *  - marketplace.json bruts de `wshobson/agents` (marketplace `claude-code-workflows`) et
 *    `anthropics/claude-code` (marketplace `claude-code-plugins`) ;
 *  - frontmatter `description` des fichiers agents de `davila7/claude-code-templates`.
 * Le générateur n'écrit JAMAIS le corps d'un agent : il ajoute la COMMANDE D'INSTALL dans INSTALL.md.
 *
 * Deux mécaniques canoniques (identiques à celles des skills) :
 *  - "marketplace" : commandes slash DANS Claude Code (`/plugin marketplace add` puis `/plugin install`).
 *    Le suffixe `@<name>` est le champ `name` du marketplace.json, PAS le chemin owner/repo
 *    (wshobson/agents -> `claude-code-workflows` ; anthropics/claude-code -> `claude-code-plugins`).
 *    Un plugin marketplace regroupe souvent PLUSIEURS agents.
 *  - "cct-cli" : commande shell DANS le terminal
 *    (`npx claude-code-templates@latest --agent <dossier>/<nom> --yes`). Le segment `<dossier>`
 *    est le nom de répertoire exact du repo davila7 (ex data-ai/ai-engineer), pas la catégorie ci-dessous.
 *
 * Convention de ce fichier : prose FR accentuée (orthographe complète), alignée sur data/skills.ts (jumeau).
 */
export type AgentInstallMethod = "marketplace" | "cct-cli";

export type AgentCategoryId =
  | "backend"
  | "frontend"
  | "dev-workflow"
  | "security"
  | "data"
  | "devops"
  | "testing"
  | "docs"
  | "ai-ml";

export interface AgentEntry {
  id: string;
  name: string;
  category: AgentCategoryId;
  method: AgentInstallMethod;
  what: Localized;
  why: Localized;
  /** Commande d'install VERBATIM (slash `/plugin install ...` ou shell `npx ...`). Jamais reconstruite. */
  install: string;
  /** marketplace : repo à enregistrer via `/plugin marketplace add` (dedupe à la génération). cct-cli : absent. */
  marketplaceRepo?: string;
  source: string;
}

export const AGENT_CATEGORIES: Record<AgentCategoryId, Localized> = {
  backend: { fr: "Backend", en: "Backend" },
  frontend: { fr: "Frontend", en: "Frontend" },
  "dev-workflow": { fr: "Workflow dev", en: "Dev workflow" },
  security: { fr: "Sécurité", en: "Security" },
  data: { fr: "Data", en: "Data" },
  devops: { fr: "DevOps", en: "DevOps" },
  testing: { fr: "Tests", en: "Testing" },
  docs: { fr: "Documentation", en: "Documentation" },
  "ai-ml": { fr: "IA & ML", en: "AI & ML" },
};

export const AGENT_METHOD_LABELS: Record<AgentInstallMethod, Localized> = {
  marketplace: { fr: "Dans Claude Code", en: "In Claude Code" },
  "cct-cli": { fr: "Terminal (npx)", en: "Terminal (npx)" },
};

export const AGENT_INTRO: Localized = {
  fr: "Catalogue d'agents (subagents) vérifiés. La sélection n'écrit aucun fichier d'agent : elle ajoute la commande d'install exacte dans INSTALL.md. Les commandes `/plugin` se tapent dans Claude Code ; les commandes `npx` dans le terminal. Un plugin marketplace peut regrouper plusieurs agents.",
  en: "Catalog of verified agents (subagents). Selecting one writes no agent file: it adds the exact install command to INSTALL.md. `/plugin` commands run inside Claude Code; `npx` commands in the terminal. A marketplace plugin can bundle several agents.",
};

const WSHOBSON_REPO = "https://github.com/wshobson/agents";
const ANTHROPIC_REPO = "https://github.com/anthropics/claude-code";
const CCT_REPO = "https://github.com/davila7/claude-code-templates";

export const AGENT_ENTRIES: readonly AgentEntry[] = [
  {
    id: "wshobson-backend-development",
    name: "backend-development",
    category: "backend",
    method: "marketplace",
    what: {
      fr: "Pack d'agents backend (backend-architect, graphql-architect, security-auditor, performance-engineer, tdd-orchestrator, test-automator) pour concevoir API et architecture serveur.",
      en: "Backend agent bundle (backend-architect, graphql-architect, security-auditor, performance-engineer, tdd-orchestrator, test-automator) for API and server architecture design.",
    },
    why: {
      fr: "Une équipe backend complète (conception plus revue sécurité/perf) en un seul install.",
      en: "A full backend team (design plus security/perf review) in a single install.",
    },
    install: "/plugin install backend-development@claude-code-workflows",
    marketplaceRepo: "wshobson/agents",
    source: WSHOBSON_REPO,
  },
  {
    id: "wshobson-frontend-mobile-development",
    name: "frontend-mobile-development",
    category: "frontend",
    method: "marketplace",
    what: {
      fr: "Agents frontend et mobile (frontend-developer, mobile-developer) pour l'UI web et les applications multiplateformes.",
      en: "Frontend and mobile agents (frontend-developer, mobile-developer) for web UI and cross-platform apps.",
    },
    why: {
      fr: "Un seul pack pour le développement UI web et mobile.",
      en: "A single pack covering web UI and mobile implementation.",
    },
    install: "/plugin install frontend-mobile-development@claude-code-workflows",
    marketplaceRepo: "wshobson/agents",
    source: WSHOBSON_REPO,
  },
  {
    id: "anthropics-pr-review-toolkit",
    name: "pr-review-toolkit",
    category: "dev-workflow",
    method: "marketplace",
    what: {
      fr: "Suite officielle Anthropic de 6 agents de revue de PR (code-reviewer, code-simplifier, comment-analyzer, pr-test-analyzer, silent-failure-hunter, type-design-analyzer).",
      en: "Official Anthropic 6-agent PR review suite (code-reviewer, code-simplifier, comment-analyzer, pr-test-analyzer, silent-failure-hunter, type-design-analyzer).",
    },
    why: {
      fr: "Revue multi-angles (tests, erreurs, types, style) maintenue par Anthropic.",
      en: "Multi-aspect review (tests, errors, types, style) maintained by Anthropic.",
    },
    install: "/plugin install pr-review-toolkit@claude-code-plugins",
    marketplaceRepo: "anthropics/claude-code",
    source: ANTHROPIC_REPO,
  },
  {
    id: "cct-code-reviewer",
    name: "code-reviewer",
    category: "dev-workflow",
    method: "cct-cli",
    what: {
      fr: "Revue de code complète axée qualité, vulnérabilités de sécurité et bonnes pratiques.",
      en: "Comprehensive code review focused on quality, security vulnerabilities and best practices.",
    },
    why: {
      fr: "Une passe de revue détaillée avant commit ou PR.",
      en: "A detailed review pass before commit or PR.",
    },
    install: "npx claude-code-templates@latest --agent development-tools/code-reviewer --yes",
    source: CCT_REPO,
  },
  {
    id: "wshobson-security-scanning",
    name: "security-scanning",
    category: "security",
    method: "marketplace",
    what: {
      fr: "Agents sécurité (security-auditor, threat-modeling-expert) : SAST, scan de vulnérabilités de dépendances, conformité OWASP Top 10.",
      en: "Security agents (security-auditor, threat-modeling-expert): SAST, dependency vulnerability scanning, OWASP Top 10 compliance.",
    },
    why: {
      fr: "Ajoute un audit sécurité automatisé sans configuration.",
      en: "Adds automated security review with zero setup.",
    },
    install: "/plugin install security-scanning@claude-code-workflows",
    marketplaceRepo: "wshobson/agents",
    source: WSHOBSON_REPO,
  },
  {
    id: "cct-database-optimizer",
    name: "database-optimizer",
    category: "data",
    method: "cct-cli",
    what: {
      fr: "Analyse les requêtes lentes et optimise la performance base de données (plans d'exécution, index) sur PostgreSQL, MySQL, MongoDB et autres.",
      en: "Analyzes slow queries and optimizes database performance (execution plans, indexing) across PostgreSQL, MySQL, MongoDB and more.",
    },
    why: {
      fr: "Cible les requêtes lentes et la structure d'index.",
      en: "Targets slow queries and index design.",
    },
    install: "npx claude-code-templates@latest --agent database/database-optimizer --yes",
    source: CCT_REPO,
  },
  {
    id: "wshobson-kubernetes-operations",
    name: "kubernetes-operations",
    category: "devops",
    method: "marketplace",
    what: {
      fr: "Agent kubernetes-architect : génération de manifests K8s, configuration réseau, policies de sécurité.",
      en: "kubernetes-architect agent: K8s manifest generation, networking, security policies.",
    },
    why: {
      fr: "Assistant Kubernetes spécialisé pour l'infra conteneurisée.",
      en: "Specialized Kubernetes helper for containerized infra.",
    },
    install: "/plugin install kubernetes-operations@claude-code-workflows",
    marketplaceRepo: "wshobson/agents",
    source: WSHOBSON_REPO,
  },
  {
    id: "cct-terraform-specialist",
    name: "terraform-specialist",
    category: "devops",
    method: "cct-cli",
    what: {
      fr: "Spécialiste Terraform / Infrastructure as Code : modules, gestion d'état, configuration des providers, détection de drift.",
      en: "Terraform / Infrastructure as Code specialist: modules, state management, provider configuration, drift detection.",
    },
    why: {
      fr: "Aide à écrire et réviser du IaC Terraform fiable.",
      en: "Helps author and review reliable Terraform IaC.",
    },
    install: "npx claude-code-templates@latest --agent devops-infrastructure/terraform-specialist --yes",
    source: CCT_REPO,
  },
  {
    id: "cct-load-testing-specialist",
    name: "load-testing-specialist",
    category: "testing",
    method: "cct-cli",
    what: {
      fr: "Spécialiste tests de charge et de stress : scénarios de charge, analyse sous contrainte, détection de goulots et de limites de capacité.",
      en: "Load and stress testing specialist: load scenarios, performance-under-stress analysis, bottleneck and capacity detection.",
    },
    why: {
      fr: "Prépare et analyse des tests de charge réalistes.",
      en: "Designs and analyzes realistic load tests.",
    },
    install: "npx claude-code-templates@latest --agent performance-testing/load-testing-specialist --yes",
    source: CCT_REPO,
  },
  {
    id: "cct-api-documenter",
    name: "api-documenter",
    category: "docs",
    method: "cct-cli",
    what: {
      fr: "Documentation d'API : specs OpenAPI, portails de documentation interactifs, exemples de code.",
      en: "API documentation: OpenAPI specs, interactive documentation portals, code examples.",
    },
    why: {
      fr: "Génère et améliore la documentation d'API à partir du code.",
      en: "Generates and improves API docs from code.",
    },
    install: "npx claude-code-templates@latest --agent documentation/api-documenter --yes",
    source: CCT_REPO,
  },
  {
    id: "cct-ai-engineer",
    name: "ai-engineer",
    category: "ai-ml",
    method: "cct-cli",
    what: {
      fr: "Conçoit et optimise des systèmes IA de bout en bout : choix de modèle, pipelines d'entraînement, déploiement et monitoring.",
      en: "Architects and optimizes end-to-end AI systems: model selection, training pipelines, deployment and monitoring.",
    },
    why: {
      fr: "Support au développement de features IA / LLM en production.",
      en: "Support for building production AI / LLM features.",
    },
    install: "npx claude-code-templates@latest --agent data-ai/ai-engineer --yes",
    source: CCT_REPO,
  },
];

export function agentById(id: string): AgentEntry | undefined {
  return AGENT_ENTRIES.find((a) => a.id === id);
}

/** Catégories présentes dans le catalogue, dans l'ordre des entrées. */
export function agentCategoriesInOrder(): AgentCategoryId[] {
  const seen = new Set<AgentCategoryId>();
  const out: AgentCategoryId[] = [];
  for (const a of AGENT_ENTRIES) {
    if (!seen.has(a.category)) {
      seen.add(a.category);
      out.push(a.category);
    }
  }
  return out;
}
