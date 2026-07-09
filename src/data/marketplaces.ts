import type { Localized } from "../types";

/**
 * Catalogue des marketplaces de plugins Claude Code.
 * Source : doc officielle code.claude.com + parsing reel des fichiers .claude-plugin/marketplace.json
 * (verifie 2026-06-30). Le suffixe d'install @<nom> est le champ "name" du marketplace.json,
 * qui DIFFERE souvent du slug owner/repo (mapping verifie ci-dessous).
 */

export interface MarketplacePlugin {
  name: string;
  what: Localized;
  purpose: Localized;
  whenToUse: Localized;
}

export type MarketplaceKind = "marketplace" | "list" | "cli" | "aggregator";

export interface Marketplace {
  id: string;
  /** Date ISO (AAAA-MM-JJ) de la derniere verification de la source (audit fraicheur). */
  verifiedAt?: string;
  /** Nom du marketplace (= champ "name", utilise dans @<nom> a l'install). */
  name: string;
  kind: MarketplaceKind;
  official: boolean;
  maintainer: string;
  addCommand: string;
  installExample: string;
  pluginCount?: number;
  what: Localized;
  plugins: MarketplacePlugin[];
  caveat?: Localized;
  source: string;
}

export const MARKETPLACE_KIND_LABELS: Record<MarketplaceKind, Localized> = {
  marketplace: { fr: "Marketplace", en: "Marketplace" },
  list: { fr: "Liste curée", en: "Curated list" },
  cli: { fr: "CLI", en: "CLI" },
  aggregator: { fr: "Agrégateur", en: "Aggregator" },
};

export const INSTALL_MECHANICS: Localized = {
  fr: "Deux étapes : 1) `/plugin marketplace add <owner/repo>` ajoute le marketplace ; 2) `/plugin install <plugin>@<nom-marketplace>` installe un plugin. Le suffixe `@<nom-marketplace>` est le champ `name` du marketplace.json, PAS toujours le owner/repo.",
  en: "Two steps: 1) `/plugin marketplace add <owner/repo>` adds the marketplace; 2) `/plugin install <plugin>@<marketplace-name>` installs a plugin. The `@<marketplace-name>` suffix is the marketplace.json `name` field, NOT always the owner/repo.",
};

export const MARKETPLACES: readonly Marketplace[] = [
  {
    id: "claude-plugins-official",
    verifiedAt: "2026-07-09",
    name: "claude-plugins-official",
    kind: "marketplace",
    official: true,
    maintainer: "Anthropic",
    addCommand: "/plugin marketplace add anthropics/claude-plugins-official",
    installExample: "/plugin install github@claude-plugins-official",
    pluginCount: 255,
    what: {
      fr: "Le marketplace curé par Anthropic, ajouté automatiquement au premier lancement. Le plus important : disponible dès l'installation. Couvre outils Anthropic, plugins LSP officiels et intégrations partenaires vérifiées (GitHub, Playwright, Supabase, Vercel, Sentry...).",
      en: "Anthropic's curated marketplace, auto-added on first launch. The single most important one: available out of the box. Spans Anthropic tools, official LSP plugins and vetted partner integrations (GitHub, Playwright, Supabase, Vercel, Sentry...).",
    },
    plugins: [
      {
        name: "github",
        what: { fr: "Serveur MCP GitHub officiel.", en: "Official GitHub MCP server." },
        purpose: {
          fr: "Créer/gérer issues, PR et dépôts depuis Claude Code.",
          en: "Create/manage issues, PRs and repos from Claude Code.",
        },
        whenToUse: {
          fr: "Quand vous voulez piloter GitHub sans quitter le terminal.",
          en: "When you want to drive GitHub without leaving the terminal.",
        },
      },
      {
        name: "playwright",
        what: {
          fr: "Serveur MCP d'automatisation navigateur + tests E2E (Microsoft).",
          en: "Browser automation + E2E testing MCP server (Microsoft).",
        },
        purpose: {
          fr: "Laisser Claude piloter un vrai navigateur pour l'automatisation et les tests bout en bout.",
          en: "Let Claude drive a real browser for automation and end-to-end tests.",
        },
        whenToUse: {
          fr: "Quand vous voulez des tests navigateur / E2E automatisés.",
          en: "When you want automated browser / E2E tests.",
        },
      },
      {
        name: "context7",
        what: {
          fr: "Serveur MCP Context7 (Upstash) de docs à jour.",
          en: "Context7 (Upstash) MCP server for up-to-date docs.",
        },
        purpose: {
          fr: "Récupérer à la demande la doc actuelle d'une lib/framework.",
          en: "Pull current library/framework docs on demand.",
        },
        whenToUse: {
          fr: "Quand Claude doit chercher une doc fraîche d'une librairie qu'il ne connaît pas à jour.",
          en: "When Claude needs fresh docs for a library it doesn't know up to date.",
        },
      },
      {
        name: "chrome-devtools-mcp",
        what: {
          fr: "Contrôle et inspection d'un Chrome live depuis l'agent.",
          en: "Control and inspect a live Chrome from the agent.",
        },
        purpose: {
          fr: "Enregistrer des interactions, inspecter une page en cours.",
          en: "Record interactions, inspect a running page.",
        },
        whenToUse: {
          fr: "Quand vous voulez inspecter/debugger une session Chrome live.",
          en: "When you want to inspect/debug a live Chrome session.",
        },
      },
      {
        name: "security-guidance",
        what: {
          fr: "Hook de revue sécurité à chaque modification.",
          en: "Security review hook on each change.",
        },
        purpose: {
          fr: "Signaler les vulnérabilités courantes pendant que Claude écrit, et lui demander de corriger.",
          en: "Flag common vulnerabilities as Claude writes, and ask it to fix them.",
        },
        whenToUse: {
          fr: "Quand vous voulez une revue sécurité automatique sur chaque edit.",
          en: "When you want automatic security review on every edit.",
        },
      },
      {
        name: "frontend-design",
        what: {
          fr: "Génération d'interfaces frontend distinctives et production-grade.",
          en: "Distinctive, production-grade frontend interface generation.",
        },
        purpose: {
          fr: "UI de haute qualité, non templatée.",
          en: "High-quality, non-templated UI.",
        },
        whenToUse: {
          fr: "Quand vous voulez une UI frontend soignée, pas générique.",
          en: "When you want polished, non-templated frontend UI.",
        },
      },
      {
        name: "pr-review-toolkit",
        what: {
          fr: "Agents de revue de PR (commentaires, tests, error handling).",
          en: "PR-review agents (comments, tests, error handling).",
        },
        purpose: {
          fr: "Revue de pull request multi-agents.",
          en: "Multi-agent pull-request review.",
        },
        whenToUse: {
          fr: "Quand vous voulez une revue de PR approfondie automatisée.",
          en: "When you want a thorough automated PR review.",
        },
      },
      {
        name: "typescript-lsp / pyright-lsp / rust-analyzer-lsp",
        what: {
          fr: "Plugins LSP de code-intelligence (un par langage).",
          en: "LSP code-intelligence plugins (one per language).",
        },
        purpose: {
          fr: "Donner à Claude go-to-definition, find-references et erreurs de type live après édition (binaire du language server requis).",
          en: "Give Claude go-to-definition, find-references and live type errors after edits (language-server binary required).",
        },
        whenToUse: {
          fr: "Quand vous voulez des diagnostics niveau IDE pour TS / Python / Rust.",
          en: "When you want IDE-grade diagnostics for TS / Python / Rust.",
        },
      },
    ],
    source:
      "https://github.com/anthropics/claude-plugins-official/blob/main/.claude-plugin/marketplace.json",
  },
  {
    id: "claude-community",
    verifiedAt: "2026-07-09",
    name: "claude-community",
    kind: "marketplace",
    official: true,
    maintainer: "Anthropic (soumissions tierces)",
    addCommand: "/plugin marketplace add anthropics/claude-plugins-community",
    installExample: "/plugin install <plugin>@claude-community",
    pluginCount: 2200,
    what: {
      fr: "Le marketplace public d'Anthropic où atterrissent les plugins tiers revus (chacun épinglé à un SHA après validation automatique + screening sécurité). Énorme (~2200 plugins) : une fontaine, pas une short-list curée.",
      en: "Anthropic's public marketplace where reviewed third-party plugins land (each pinned to a SHA after automated validation + safety screening). Huge (~2200 plugins): a firehose, not a curated shortlist.",
    },
    caveat: {
      fr: "L'ajout utilise le repo claude-plugins-community mais l'install utilise le suffixe @claude-community. Les 6 exemples ci-dessous sont représentatifs, pas un classement (la notabilité n'est pas vérifiable sur 2200 entrées).",
      en: "The add uses repo claude-plugins-community but install uses the @claude-community suffix. The 6 examples below are representative, not a ranking (notability can't be verified across 2200 entries).",
    },
    plugins: [
      {
        name: "a11y-fixer",
        what: {
          fr: "Scanne HTML/JSX à la recherche de problèmes d'accessibilité.",
          en: "Scans HTML/JSX for accessibility issues.",
        },
        purpose: {
          fr: "Faire remonter les soucis a11y dans le markup.",
          en: "Surface a11y problems in markup.",
        },
        whenToUse: {
          fr: "Quand vous voulez trouver des problèmes d'accessibilité dans du HTML/JSX.",
          en: "When you want to find accessibility issues in HTML/JSX.",
        },
      },
      {
        name: "accessibility-audit",
        what: {
          fr: "Génère des rapports de conformité WCAG.",
          en: "Generates WCAG compliance reports.",
        },
        purpose: { fr: "Produire un audit WCAG.", en: "Produce a WCAG audit." },
        whenToUse: {
          fr: "Quand vous avez besoin d'un rapport de conformité WCAG.",
          en: "When you need a WCAG compliance report.",
        },
      },
      {
        name: "adr-creator",
        what: {
          fr: "Crée des Architecture Decision Records.",
          en: "Creates Architecture Decision Records.",
        },
        purpose: { fr: "Scaffolder des documents ADR.", en: "Scaffold ADR documents." },
        whenToUse: {
          fr: "Quand vous voulez capturer une décision d'architecture en ADR.",
          en: "When you want to capture an architecture decision as an ADR.",
        },
      },
      {
        name: "ab-testing",
        what: {
          fr: "Génère l'infra et l'analyse de tests A/B.",
          en: "Generates A/B testing infra and analysis.",
        },
        purpose: {
          fr: "Monter un scaffolding de test A/B + analyse.",
          en: "Stand up A/B test scaffolding + analysis.",
        },
        whenToUse: {
          fr: "Quand vous voulez mettre en place un test A/B.",
          en: "When you want to set up an A/B test.",
        },
      },
      {
        name: "10x-team",
        what: {
          fr: "Une équipe d'ingénierie entière sous forme de skills Claude Code.",
          en: "An entire engineering team as Claude Code skills.",
        },
        purpose: {
          fr: "Regrouper des skills par rôle d'ingénierie.",
          en: "Bundle skills by engineering role.",
        },
        whenToUse: {
          fr: "Quand vous voulez plusieurs rôles dev spécialisés dispo en skills.",
          en: "When you want several specialized dev roles available as skills.",
        },
      },
      {
        name: "42crunch-api-security-testing",
        what: {
          fr: "Automatise les tests de sécurité d'API avec 42Crunch.",
          en: "Automates API security testing with 42Crunch.",
        },
        purpose: {
          fr: "Lancer des contrôles sécurité d'API dans Claude Code.",
          en: "Run API security checks in Claude Code.",
        },
        whenToUse: {
          fr: "Quand vous voulez des tests de sécurité d'API automatisés.",
          en: "When you want automated API security testing.",
        },
      },
    ],
    source:
      "https://github.com/anthropics/claude-plugins-community/blob/main/.claude-plugin/marketplace.json",
  },
  {
    id: "claude-code-plugins",
    verifiedAt: "2026-07-09",
    name: "claude-code-plugins",
    kind: "marketplace",
    official: true,
    maintainer: "Anthropic (démo)",
    addCommand: "/plugin marketplace add anthropics/claude-code",
    installExample: "/plugin install commit-commands@claude-code-plugins",
    pluginCount: 13,
    what: {
      fr: "Le petit marketplace démo d'Anthropic (~13 plugins) qui montre ce que le système de plugins permet. C'est le marketplace d'onboarding référencé dans la doc.",
      en: "Anthropic's small demo marketplace (~13 plugins) showcasing what the plugin system can do. The onboarding marketplace referenced in the docs.",
    },
    plugins: [
      {
        name: "commit-commands",
        what: { fr: "Commandes de workflow de commit git.", en: "Git commit workflow commands." },
        purpose: {
          fr: "Skills commit, push et création de PR.",
          en: "Commit, push and PR creation skills.",
        },
        whenToUse: {
          fr: "Quand vous voulez des workflows git commit/PR guidés.",
          en: "When you want guided git commit/PR workflows.",
        },
      },
      {
        name: "code-review",
        what: {
          fr: "Revue de code de PR automatisée multi-agents.",
          en: "Multi-agent automated PR code review.",
        },
        purpose: { fr: "Revue de code multi-agents.", en: "Multi-agent code review." },
        whenToUse: {
          fr: "Quand vous voulez une passe de revue automatisée sur un changement.",
          en: "When you want an automated review pass on a change.",
        },
      },
      {
        name: "feature-dev",
        what: {
          fr: "Workflow complet de développement de fonctionnalité avec agents spécialisés.",
          en: "Full feature-development workflow with specialized agents.",
        },
        purpose: {
          fr: "Guider le travail de feature de bout en bout.",
          en: "Guide feature work end-to-end.",
        },
        whenToUse: {
          fr: "Quand vous voulez un workflow de build de feature structuré.",
          en: "When you want a structured feature-build workflow.",
        },
      },
      {
        name: "hookify",
        what: {
          fr: "Crée des hooks custom à partir de l'analyse de conversation.",
          en: "Creates custom hooks from conversation analysis.",
        },
        purpose: {
          fr: "Transformer des comportements indésirables en hooks de prévention.",
          en: "Turn unwanted behaviors into preventing hooks.",
        },
        whenToUse: {
          fr: "Quand vous voulez auto-générer des hooks pour faire respecter des règles.",
          en: "When you want to auto-generate hooks to enforce rules.",
        },
      },
      {
        name: "plugin-dev",
        what: {
          fr: "Boîte à outils pour développer des plugins Claude Code (7 skills experts).",
          en: "Toolkit for developing Claude Code plugins (7 expert skills).",
        },
        purpose: {
          fr: "Scaffolder et valider vos propres plugins.",
          en: "Scaffold and validate your own plugins.",
        },
        whenToUse: {
          fr: "Quand vous développez un plugin.",
          en: "When you are building a plugin.",
        },
      },
      {
        name: "claude-opus-4-5-migration",
        what: { fr: "Aide à la migration vers Opus 4.5.", en: "Helper for migrating to Opus 4.5." },
        purpose: {
          fr: "Migrer code/prompts depuis Sonnet 4.x / Opus 4.1 vers Opus 4.5.",
          en: "Migrate code/prompts from Sonnet 4.x / Opus 4.1 to Opus 4.5.",
        },
        whenToUse: {
          fr: "Quand vous mettez à niveau prompts/code vers un nouveau modèle.",
          en: "When you upgrade prompts/code to a new model.",
        },
      },
    ],
    source: "https://github.com/anthropics/claude-code/blob/main/.claude-plugin/marketplace.json",
  },
  {
    id: "anthropic-agent-skills",
    verifiedAt: "2026-07-09",
    name: "anthropic-agent-skills",
    kind: "marketplace",
    official: true,
    maintainer: "Anthropic",
    addCommand: "/plugin marketplace add anthropics/skills",
    installExample: "/plugin install document-skills@anthropic-agent-skills",
    pluginCount: 3,
    what: {
      fr: "Le repo public Agent Skills d'Anthropic, exposé en marketplace (3 plugins) qui regroupent les skills de référence Anthropic. Dépôt SÉPARÉ du claude-plugins-official auto-ajouté, ne pas confondre.",
      en: "Anthropic's public Agent Skills repo, exposed as a marketplace (3 plugins) bundling Anthropic's reference skills. A SEPARATE repo from the auto-added claude-plugins-official, don't conflate.",
    },
    plugins: [
      {
        name: "document-skills",
        what: { fr: "Suite de traitement de documents.", en: "Document-processing suite." },
        purpose: {
          fr: "Skills Excel, Word, PowerPoint (et PDF).",
          en: "Excel, Word, PowerPoint (and PDF) skills.",
        },
        whenToUse: {
          fr: "Quand vous voulez que Claude crée/édite des documents Office.",
          en: "When you want Claude to create/edit Office documents.",
        },
      },
      {
        name: "example-skills",
        what: { fr: "Collection de skills d'exemple.", en: "Collection of example skills." },
        purpose: {
          fr: "Démontrer les patterns d'écriture de skills.",
          en: "Demonstrate skill-authoring patterns.",
        },
        whenToUse: {
          fr: "Quand vous voulez des exemples de référence pour écrire vos propres skills.",
          en: "When you want reference examples to write your own skills.",
        },
      },
      {
        name: "claude-api",
        what: { fr: "Skill de doc API & SDK Claude.", en: "Claude API & SDK docs skill." },
        purpose: {
          fr: "Guidance à jour sur l'API/SDK Claude pour construire des apps LLM.",
          en: "Up-to-date Claude API/SDK guidance for building LLM apps.",
        },
        whenToUse: {
          fr: "Quand vous codez contre l'API Claude / l'Agent SDK.",
          en: "When you code against the Claude API / Agent SDK.",
        },
      },
    ],
    source: "https://github.com/anthropics/skills/blob/main/.claude-plugin/marketplace.json",
  },
  {
    id: "claude-code-workflows",
    verifiedAt: "2026-07-09",
    name: "claude-code-workflows",
    kind: "marketplace",
    official: false,
    maintainer: "Seth Hobson (wshobson)",
    addCommand: "/plugin marketplace add wshobson/agents",
    installExample: "/plugin install tdd-workflows@claude-code-workflows",
    pluginCount: 92,
    what: {
      fr: "Le marketplace communautaire indépendant le plus en vue (~88 plugins de workflow) groupés par discipline (backend, frontend/mobile, testing, sécurité, infra, data, ML). Chaque plugin bundle agents + commandes pour un workflow bout en bout.",
      en: "The most prominent independent community marketplace (~88 workflow plugins) grouped by discipline (backend, frontend/mobile, testing, security, infra, data, ML). Each plugin bundles agents + commands for an end-to-end workflow.",
    },
    plugins: [
      {
        name: "backend-development",
        what: {
          fr: "Workflows de design d'API backend + architecture GraphQL.",
          en: "Backend API design + GraphQL architecture workflows.",
        },
        purpose: {
          fr: "Patterns de build backend orchestrés.",
          en: "Orchestrated backend build patterns.",
        },
        whenToUse: {
          fr: "Quand vous concevez/construisez une API backend.",
          en: "When you design/build a backend API.",
        },
      },
      {
        name: "full-stack-orchestration",
        what: {
          fr: "Orchestration de feature end-to-end (testing, sécurité, perf).",
          en: "End-to-end feature orchestration (testing, security, perf).",
        },
        purpose: {
          fr: "Coordonner un build de feature full-stack.",
          en: "Coordinate a full-stack feature build.",
        },
        whenToUse: {
          fr: "Quand vous voulez un seul workflow qui pilote toute une feature.",
          en: "When you want one workflow to drive a whole feature.",
        },
      },
      {
        name: "tdd-workflows",
        what: {
          fr: "Méthodologie de développement piloté par les tests.",
          en: "Test-driven development methodology.",
        },
        purpose: {
          fr: "Automatiser le cycle red-green-refactor.",
          en: "Automate the red-green-refactor cycle.",
        },
        whenToUse: {
          fr: "Quand vous voulez travailler strictement en TDD.",
          en: "When you want to work strictly TDD.",
        },
      },
      {
        name: "security-scanning",
        what: {
          fr: "SAST + scan de vulnérabilités de dépendances, OWASP Top 10.",
          en: "SAST + dependency vulnerability scanning, OWASP Top 10.",
        },
        purpose: {
          fr: "Workflow de scan sécurité automatisé.",
          en: "Automated security-scanning workflow.",
        },
        whenToUse: {
          fr: "Quand vous voulez une passe de scan sécurité sur votre code.",
          en: "When you want a security-scan pass on your code.",
        },
      },
      {
        name: "kubernetes-operations",
        what: {
          fr: "Génération de manifests K8s, networking, security policies.",
          en: "K8s manifest generation, networking, security policies.",
        },
        purpose: { fr: "Automatisation des ops Kubernetes.", en: "Kubernetes ops automation." },
        whenToUse: {
          fr: "Quand vous travaillez des manifests/ops Kubernetes.",
          en: "When you work with Kubernetes manifests/ops.",
        },
      },
      {
        name: "llm-application-dev",
        what: {
          fr: "Dev d'app LLM avec LangGraph, RAG, vector search.",
          en: "LLM app dev with LangGraph, RAG, vector search.",
        },
        purpose: {
          fr: "Patterns pour construire des apps LLM.",
          en: "Patterns for building LLM apps.",
        },
        whenToUse: {
          fr: "Quand vous construisez une application RAG / agent / LLM.",
          en: "When you build a RAG / agent / LLM application.",
        },
      },
      {
        name: "cicd-automation",
        what: {
          fr: "Config de pipeline CI/CD (GitHub Actions / GitLab CI).",
          en: "CI/CD pipeline config (GitHub Actions / GitLab CI).",
        },
        purpose: { fr: "Scaffolding de pipeline.", en: "Pipeline scaffolding." },
        whenToUse: {
          fr: "Quand vous montez ou réparez des pipelines CI/CD.",
          en: "When you set up or fix CI/CD pipelines.",
        },
      },
    ],
    source: "https://github.com/wshobson/agents/blob/main/.claude-plugin/marketplace.json",
  },
  {
    id: "claude-code-templates",
    verifiedAt: "2026-07-09",
    name: "claude-code-templates (aitmpl)",
    kind: "cli",
    official: false,
    maintainer: "davila7",
    addCommand: "npx claude-code-templates@latest",
    installExample:
      "npx claude-code-templates@latest --agent development-tools/code-reviewer --yes",
    what: {
      fr: "Le hub de configuration communautaire le plus étoilé (~28k stars). PAS un marketplace `/plugin marketplace add` : un CLI NPX + annuaire web (aitmpl.com) de composants prêts à l'emploi (agents, commandes, MCPs, settings, hooks, skills) installés individuellement par nom.",
      en: "The most-starred community config hub (~28k stars). NOT a `/plugin marketplace add` marketplace: an NPX CLI + web directory (aitmpl.com) of ready-made components (agents, commands, MCPs, settings, hooks, skills) installed individually by name.",
    },
    caveat: {
      fr: "S'installe via NPX, pas via le flux marketplace standard. Le marketplace.json du repo a parsé vide.",
      en: "Installs via NPX, not the standard marketplace flow. The repo's marketplace.json parsed empty.",
    },
    plugins: [
      {
        name: "code-reviewer (agent)",
        what: { fr: "Agent de revue de code.", en: "Code-review agent." },
        purpose: { fr: "Revue automatisée.", en: "Automated review." },
        whenToUse: {
          fr: "npx claude-code-templates@latest --agent development-tools/code-reviewer --yes",
          en: "npx claude-code-templates@latest --agent development-tools/code-reviewer --yes",
        },
      },
      {
        name: "generate-tests (command)",
        what: { fr: "Commande de génération de tests.", en: "Test-generation command." },
        purpose: { fr: "Scaffolder des tests.", en: "Scaffold tests." },
        whenToUse: {
          fr: "npx claude-code-templates@latest --command testing/generate-tests --yes",
          en: "npx claude-code-templates@latest --command testing/generate-tests --yes",
        },
      },
      {
        name: "github-integration (MCP)",
        what: { fr: "Intégration MCP GitHub.", en: "GitHub MCP integration." },
        purpose: { fr: "Connecter GitHub.", en: "Connect GitHub." },
        whenToUse: {
          fr: "npx claude-code-templates@latest --mcp development/github-integration --yes",
          en: "npx claude-code-templates@latest --mcp development/github-integration --yes",
        },
      },
    ],
    source: "https://github.com/davila7/claude-code-templates",
  },
  {
    id: "awesome-claude-code",
    verifiedAt: "2026-07-09",
    name: "awesome-claude-code",
    kind: "list",
    official: false,
    maintainer: "hesreallyhim",
    addCommand: "(liste GitHub - pas d'install par commande)",
    installExample: "",
    what: {
      fr: "Une awesome list GitHub classique : un README curé de skills, hooks, slash-commands, orchestrateurs d'agents, applications et plugins. Ressource de découverte : on la lit et on suit les liens vers chaque projet.",
      en: "A classic GitHub awesome list: a curated README of skills, hooks, slash-commands, agent orchestrators, applications and plugins. A discovery resource: you read it and follow links to each project.",
    },
    caveat: {
      fr: "Pas de marketplace.json : impossible à ajouter via /plugin marketplace add. Pure ressource de référence.",
      en: "No marketplace.json: cannot be added via /plugin marketplace add. Pure reference resource.",
    },
    plugins: [],
    source: "https://github.com/hesreallyhim/awesome-claude-code",
  },
  {
    id: "awesome-claude-plugins",
    verifiedAt: "2026-07-09",
    name: "awesome-claude-plugins",
    kind: "aggregator",
    official: false,
    maintainer: "Chat2AnyLLM",
    addCommand: "(agrégateur de métadonnées - pas d'install par commande)",
    installExample: "",
    what: {
      fr: "Un catalogue de métadonnées qui suit d'AUTRES marketplaces (ne clone pas le contenu). Auto-déclare ~192 marketplaces et ~2500 plugins découvrables. Utile comme index pour découvrir quels repos de marketplace tiers existent, puis les ajouter directement.",
      en: "A metadata catalog tracking OTHER marketplaces (does not clone content). Self-reports ~192 marketplaces and ~2500 discoverable plugins. Useful as an index to discover which third-party marketplace repos exist, then add those directly.",
    },
    caveat: {
      fr: "Pas de marketplace.json installable : c'est un index, pas un marketplace.",
      en: "No installable marketplace.json: it's an index, not a marketplace.",
    },
    plugins: [],
    source: "https://github.com/Chat2AnyLLM/awesome-claude-plugins",
  },
];
