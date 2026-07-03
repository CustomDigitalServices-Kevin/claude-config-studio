import type { Localized } from "../types";

/**
 * Catalogue des serveurs MCP les plus connus, par categorie.
 * Source : doc officielle code.claude.com/docs/en/mcp + repos/docs vendeurs (verifie 2026-06-30).
 * .mcp.json : remote = {"type":"http","url":...} ; local = {"command","args","env"}.
 *
 * Contexte : la plupart des serveurs de reference modelcontextprotocol/servers ont ete
 * ARCHIVES le 2025-05-29 (servers-archived). Seuls actifs : Everything, Fetch, Filesystem,
 * Git, Memory, Sequential Thinking, Time. Les autres ont un successeur vendeur ou communautaire.
 */

export type McpCategoryId =
  | "dev-git"
  | "db"
  | "browser"
  | "docs"
  | "productivity"
  | "observability"
  | "files-web"
  | "cloud"
  | "design"
  | "search"
  | "knowledge"
  | "repo"
  | "planning";

export interface McpServer {
  id: string;
  name: string;
  category: McpCategoryId;
  official: boolean;
  what: Localized;
  /** Ce que ca permet a l'agent. */
  does: Localized;
  /** Commande claude mcp add (vide si archive/non recommandee). */
  addCommand: string;
  /** Entree .mcp.json compacte (vide si necessite un secret/setup specifique ou archive). */
  mcpJson: string;
  /** Avertissement eventuel (archive, depreciation, auth requise). */
  note?: Localized;
  source: string;
}

export const MCP_CATEGORIES: ReadonlyArray<{ id: McpCategoryId; label: Localized }> = [
  { id: "dev-git", label: { fr: "Dev / Git", en: "Dev / Git" } },
  { id: "db", label: { fr: "Bases de données", en: "Databases" } },
  { id: "browser", label: { fr: "Navigateur / Automatisation", en: "Browser / Automation" } },
  { id: "docs", label: { fr: "Docs / Contexte", en: "Docs / Context" } },
  { id: "productivity", label: { fr: "Productivité / PM", en: "Productivity / PM" } },
  { id: "observability", label: { fr: "Observabilité", en: "Observability" } },
  { id: "files-web", label: { fr: "Fichiers / Web", en: "Files / Web" } },
  { id: "cloud", label: { fr: "Cloud / Infra", en: "Cloud / Infra" } },
  { id: "design", label: { fr: "Design", en: "Design" } },
  { id: "search", label: { fr: "Recherche / Web", en: "Search / Web" } },
  { id: "knowledge", label: { fr: "Connaissances (Obsidian)", en: "Knowledge (Obsidian)" } },
  { id: "repo", label: { fr: "Contexte dépôt", en: "Repo context" } },
  { id: "planning", label: { fr: "Planning / Orchestration", en: "Planning / Orchestration" } },
];

export const MCP_INTRO: Localized = {
  fr: "Un serveur MCP donne a Claude Code des outils sur un systeme externe. Ajout : `claude mcp add --transport http <nom> <url>` (distant) ou `claude mcp add <nom> -- <commande>` (local), ou via un `.mcp.json` projet (Claude Code propose d'approuver les serveurs au premier lancement interactif). Note : les endpoints `/sse` sont depreces, utiliser `/mcp` (HTTP).",
  en: "An MCP server gives Claude Code tools over an external system. Add: `claude mcp add --transport http <name> <url>` (remote) or `claude mcp add <name> -- <command>` (local), or via a project `.mcp.json` (Claude Code prompts to approve servers at first interactive launch). Note: `/sse` endpoints are deprecated, use `/mcp` (HTTP).",
};

export const MCP_SERVERS: readonly McpServer[] = [
  // Dev / Git
  {
    id: "github",
    name: "GitHub MCP",
    category: "dev-git",
    official: true,
    what: { fr: "Serveur officiel GitHub (repos, issues, PR, Actions, code scanning).", en: "Official GitHub server (repos, issues, PRs, Actions, code scanning)." },
    does: { fr: "Lister/créer issues et PR, lire fichiers et diffs, déclencher/inspecter des workflows, rechercher du code.", en: "List/create issues and PRs, read files and diffs, trigger/inspect workflows, search code." },
    addCommand: "claude mcp add --transport http github https://api.githubcopilot.com/mcp/",
    mcpJson: '{ "type": "http", "url": "https://api.githubcopilot.com/mcp/" }',
    source: "https://github.com/github/github-mcp-server",
  },
  {
    id: "gitlab",
    name: "GitLab MCP (GitLab Duo)",
    category: "dev-git",
    official: true,
    what: { fr: "Endpoint MCP officiel GitLab Duo (issues, MR, pipelines) via OAuth.", en: "Official GitLab Duo MCP endpoint (issues, MRs, pipelines) via OAuth." },
    does: { fr: "Lire projets, issues et merge requests, interagir avec les pipelines CI/CD.", en: "Read projects, issues and merge requests, interact with CI/CD pipelines." },
    addCommand: "claude mcp add --transport http gitlab https://gitlab.com/api/v4/mcp",
    mcpJson: '{ "type": "http", "url": "https://gitlab.com/api/v4/mcp" }',
    note: { fr: "Self-managed : remplacer gitlab.com par l'hôte de l'instance. L'ancien serveur de référence est archivé.", en: "Self-managed: replace gitlab.com with your instance host. The old reference server is archived." },
    source: "https://docs.gitlab.com/user/gitlab_duo/model_context_protocol/mcp_server/",
  },
  {
    id: "git",
    name: "Git (mcp-server-git)",
    category: "dev-git",
    official: true,
    what: { fr: "Serveur de référence ACTIF pour un dépôt Git local (Python).", en: "ACTIVE reference server for a local Git repo (Python)." },
    does: { fr: "git status/diff/log, stage et commit, créer/checkout des branches, lire l'historique.", en: "git status/diff/log, stage and commit, create/checkout branches, read history." },
    addCommand: "claude mcp add git -- uvx mcp-server-git --repository /path/to/repo",
    mcpJson: '{ "command": "uvx", "args": ["mcp-server-git", "--repository", "/path/to/repo"] }',
    source: "https://github.com/modelcontextprotocol/servers",
  },
  // Bases de données
  {
    id: "supabase",
    name: "Supabase MCP",
    category: "db",
    official: true,
    what: { fr: "Serveur officiel Supabase (Postgres, tables, migrations, edge functions, logs).", en: "Official Supabase server (Postgres, tables, migrations, edge functions, logs)." },
    does: { fr: "Lister/interroger des tables, exécuter du SQL, gérer migrations, générer des types (scopé projet, read-only possible).", en: "List/query tables, run SQL, manage migrations, generate types (project-scoped, read-only optional)." },
    addCommand: 'claude mcp add --transport http supabase "https://mcp.supabase.com/mcp?project_ref=<ref>&read_only=true"',
    mcpJson: '{ "type": "http", "url": "https://mcp.supabase.com/mcp?project_ref=<ref>&read_only=true" }',
    note: { fr: "Auth via header Authorization Bearer <SUPABASE_ACCESS_TOKEN>. Package local stdio : @supabase/mcp-server-supabase.", en: "Auth via Authorization Bearer <SUPABASE_ACCESS_TOKEN> header. Local stdio package: @supabase/mcp-server-supabase." },
    source: "https://supabase.com/docs/guides/getting-started/mcp",
  },
  {
    id: "mongodb",
    name: "MongoDB MCP",
    category: "db",
    official: true,
    what: { fr: "Serveur officiel MongoDB (déploiement MongoDB et/ou Atlas).", en: "Official MongoDB server (MongoDB deployment and/or Atlas)." },
    does: { fr: "Lister bases/collections, find/aggregate, inspecter le schéma (écriture off par défaut).", en: "List databases/collections, find/aggregate, inspect schema (writes off by default)." },
    addCommand: 'claude mcp add mongodb -- npx -y mongodb-mcp-server@latest --connectionString "<mongodb-uri>"',
    mcpJson: '{ "command": "npx", "args": ["-y", "mongodb-mcp-server@latest", "--connectionString", "<mongodb-uri>"] }',
    source: "https://www.mongodb.com/docs/mcp-server/configuration/manual-file-configuration/",
  },
  {
    id: "postgres-pro",
    name: "Postgres MCP Pro (crystaldba)",
    category: "db",
    official: false,
    what: { fr: "Successeur communautaire du serveur Postgres de référence (archivé).", en: "Community successor to the archived reference Postgres server." },
    does: { fr: "Lister tables/schémas, exécuter du SQL, health checks, tuning d'index, analyse EXPLAIN.", en: "List tables/schemas, run SQL, health checks, index tuning, EXPLAIN analysis." },
    addCommand: "claude mcp add postgres-mcp -e DATABASE_URI=postgresql://user:pass@host:5432/db -- postgres-mcp --access-mode=unrestricted",
    mcpJson: '{ "command": "postgres-mcp", "args": ["--access-mode=unrestricted"], "env": { "DATABASE_URI": "postgresql://user:pass@host:5432/db" } }',
    note: { fr: "Le serveur de référence @modelcontextprotocol/server-postgres est archivé ; celui-ci est communautaire.", en: "The reference @modelcontextprotocol/server-postgres is archived; this one is community-maintained." },
    source: "https://github.com/crystaldba/postgres-mcp",
  },
  {
    id: "sqlite",
    name: "SQLite MCP (archivé)",
    category: "db",
    official: true,
    what: { fr: "Ancien serveur de référence SQLite, ARCHIVÉ et non maintenu.", en: "Former SQLite reference server, ARCHIVED and unmaintained." },
    does: { fr: "Exécuter du SQL et inspecter le schéma d'un fichier .db (historique).", en: "Run SQL and inspect the schema of a .db file (historical)." },
    addCommand: "",
    mcpJson: "",
    note: { fr: "Archivé le 2025-05-29, aucun successeur vendeur vérifié. Non recommandé.", en: "Archived 2025-05-29, no verified vendor successor. Not recommended." },
    source: "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/sqlite",
  },
  // Navigateur / Automatisation
  {
    id: "playwright",
    name: "Playwright MCP (Microsoft)",
    category: "browser",
    official: true,
    what: { fr: "Serveur officiel Microsoft pilotant un navigateur via l'arbre d'accessibilité.", en: "Official Microsoft server driving a browser via the accessibility tree." },
    does: { fr: "Naviguer, cliquer, remplir, asserter, screenshots, tests E2E déterministes.", en: "Navigate, click, fill, assert, screenshots, deterministic E2E tests." },
    addCommand: "claude mcp add playwright -- npx @playwright/mcp@latest",
    mcpJson: '{ "command": "npx", "args": ["@playwright/mcp@latest"] }',
    source: "https://github.com/microsoft/playwright-mcp",
  },
  {
    id: "chrome-devtools",
    name: "Chrome DevTools MCP (Google)",
    category: "browser",
    official: true,
    what: { fr: "Serveur officiel Google contrôlant Chrome via le Chrome DevTools Protocol.", en: "Official Google server controlling Chrome via the Chrome DevTools Protocol." },
    does: { fr: "Inspecter le DOM, traces de performance, console/réseau, debug d'une page Chrome réelle.", en: "Inspect the DOM, performance traces, console/network, debug a real Chrome page." },
    addCommand: "claude mcp add chrome-devtools -- npx chrome-devtools-mcp@latest",
    mcpJson: '{ "command": "npx", "args": ["-y", "chrome-devtools-mcp@latest"] }',
    source: "https://github.com/ChromeDevTools/chrome-devtools-mcp",
  },
  {
    id: "puppeteer",
    name: "Puppeteer MCP (déprécié)",
    category: "browser",
    official: true,
    what: { fr: "Ancien serveur de référence d'automatisation via Puppeteer, ARCHIVÉ/déprécié.", en: "Former Puppeteer automation reference server, ARCHIVED/deprecated." },
    does: { fr: "Historiquement navigation/clics/screenshots dans un Chromium Puppeteer.", en: "Historically navigation/clicks/screenshots in a Puppeteer Chromium." },
    addCommand: "",
    mcpJson: "",
    note: { fr: "Repo archivé, package npm déprécié. Successeur : Playwright MCP ou Chrome DevTools MCP.", en: "Repo archived, npm package deprecated. Successor: Playwright MCP or Chrome DevTools MCP." },
    source: "https://github.com/modelcontextprotocol/servers-archived",
  },
  // Docs / Contexte
  {
    id: "context7",
    name: "context7 (Upstash)",
    category: "docs",
    official: true,
    what: { fr: "Doc de lib à jour et spécifique à la version, injectée dans le contexte.", en: "Up-to-date, version-specific library docs injected into context." },
    does: { fr: "Récupérer la doc API / exemples d'une lib avant d'écrire du code, évitant les API périmées.", en: "Fetch a library's current API docs/examples before writing code, avoiding stale APIs." },
    addCommand: 'claude mcp add --transport http context7 https://mcp.context7.com/mcp --header "CONTEXT7_API_KEY: YOUR_KEY"',
    mcpJson: '{ "type": "http", "url": "https://mcp.context7.com/mcp" }',
    note: { fr: "Clé API gratuite Upstash via header CONTEXT7_API_KEY ; local : npx -y @upstash/context7-mcp.", en: "Free Upstash API key via CONTEXT7_API_KEY header; local: npx -y @upstash/context7-mcp." },
    source: "https://github.com/upstash/context7",
  },
  {
    id: "microsoft-learn",
    name: "Microsoft Learn MCP",
    category: "docs",
    official: true,
    what: { fr: "Serveur officiel Microsoft (doc Microsoft/Azure/Power Platform), sans auth.", en: "Official Microsoft server (Microsoft/Azure/Power Platform docs), no auth." },
    does: { fr: "Rechercher dans Learn, récupérer des articles complets, chercher des exemples de code.", en: "Search Learn, fetch full articles, search code samples." },
    addCommand: "claude mcp add --transport http microsoft-learn https://learn.microsoft.com/api/mcp",
    mcpJson: '{ "type": "http", "url": "https://learn.microsoft.com/api/mcp" }',
    source: "https://learn.microsoft.com/en-us/training/support/mcp",
  },
  {
    id: "aws-docs",
    name: "AWS Documentation MCP",
    category: "docs",
    official: true,
    what: { fr: "Serveur officiel AWS Labs (doc AWS et références API à jour).", en: "Official AWS Labs server (up-to-date AWS docs and API references)." },
    does: { fr: "Rechercher et lire la doc des services AWS et les références API.", en: "Search and read AWS service docs and API references." },
    addCommand: "claude mcp add aws-documentation -- uvx awslabs.aws-documentation-mcp-server@latest",
    mcpJson: '{ "command": "uvx", "args": ["awslabs.aws-documentation-mcp-server@latest"] }',
    source: "https://github.com/awslabs/mcp",
  },
  // Productivité / PM
  {
    id: "notion",
    name: "Notion MCP",
    category: "productivity",
    official: true,
    what: { fr: "Serveur officiel hébergé Notion (pages, bases) via OAuth.", en: "Official hosted Notion server (pages, databases) via OAuth." },
    does: { fr: "Rechercher, lire, créer et mettre à jour des pages et entrées de base Notion.", en: "Search, read, create and update Notion pages and database entries." },
    addCommand: "claude mcp add --transport http notion https://mcp.notion.com/mcp",
    mcpJson: '{ "type": "http", "url": "https://mcp.notion.com/mcp" }',
    source: "https://developers.notion.com/guides/mcp/get-started-with-mcp",
  },
  {
    id: "linear",
    name: "Linear MCP",
    category: "productivity",
    official: true,
    what: { fr: "Serveur officiel hébergé Linear (suivi de tickets / projets).", en: "Official hosted Linear server (issue tracking / projects)." },
    does: { fr: "Trouver, créer et mettre à jour des issues, projets et commentaires Linear.", en: "Find, create and update Linear issues, projects and comments." },
    addCommand: "claude mcp add --transport http linear https://mcp.linear.app/mcp",
    mcpJson: '{ "type": "http", "url": "https://mcp.linear.app/mcp" }',
    source: "https://linear.app/docs/mcp",
  },
  {
    id: "slack",
    name: "Slack MCP (officiel)",
    category: "productivity",
    official: true,
    what: { fr: "Serveur remote officiel Slack/Salesforce (HTTP, pas SSE).", en: "Official Slack/Salesforce remote server (HTTP, not SSE)." },
    does: { fr: "Rechercher et envoyer des messages, gérer des canvases, travailler avec les utilisateurs Slack.", en: "Search and send messages, manage canvases, work with Slack users." },
    addCommand: "claude mcp add --transport http slack https://mcp.slack.com/mcp",
    mcpJson: '{ "type": "http", "url": "https://mcp.slack.com/mcp" }',
    note: { fr: "Requiert une app Slack enregistrée (une simple URL ne suffit pas). L'ancienne référence est archivée.", en: "Requires a registered Slack app (a plain URL is not enough). The old reference is archived." },
    source: "https://docs.slack.dev/ai/slack-mcp-server/",
  },
  {
    id: "atlassian",
    name: "Atlassian Rovo MCP (Jira / Confluence)",
    category: "productivity",
    official: true,
    what: { fr: "Serveur remote cloud officiel Atlassian (Jira, Confluence, JSM, Bitbucket, Compass).", en: "Official Atlassian cloud remote server (Jira, Confluence, JSM, Bitbucket, Compass)." },
    does: { fr: "Rechercher, résumer, créer, mettre à jour et gérer en masse issues Jira et pages Confluence.", en: "Search, summarize, create, update and bulk-manage Jira issues and Confluence pages." },
    addCommand: "claude mcp add --transport http atlassian https://mcp.atlassian.com/v1/mcp/authv2",
    mcpJson: '{ "type": "http", "url": "https://mcp.atlassian.com/v1/mcp/authv2" }',
    note: { fr: "Ancien endpoint SSE /v1/sse déprécié (fin de support 30/06/2026).", en: "Old SSE endpoint /v1/sse deprecated (end of support 2026-06-30)." },
    source: "https://support.atlassian.com/atlassian-rovo-mcp-server/docs/setting-up-ides/",
  },
  {
    id: "asana",
    name: "Asana MCP",
    category: "productivity",
    official: true,
    what: { fr: "Serveur remote officiel Asana V2 (gestion du travail) via OAuth.", en: "Official Asana V2 remote server (work management) via OAuth." },
    does: { fr: "Lire et gérer tâches, projets et espaces de travail Asana.", en: "Read and manage Asana tasks, projects and workspaces." },
    addCommand: "claude mcp add --transport http asana https://mcp.asana.com/v2/mcp",
    mcpJson: '{ "type": "http", "url": "https://mcp.asana.com/v2/mcp" }',
    note: { fr: "Ancien endpoint V1 /sse déprécié.", en: "Old V1 /sse endpoint deprecated." },
    source: "https://developers.asana.com/docs/using-asanas-mcp-server",
  },
  // Observabilité
  {
    id: "sentry",
    name: "Sentry MCP",
    category: "observability",
    official: true,
    what: { fr: "Serveur remote officiel Sentry (erreurs/traces + analyse IA Seer).", en: "Official Sentry remote server (errors/traces + Seer AI analysis)." },
    does: { fr: "Interroger issues, erreurs, releases, lancer Seer, rechercher des événements.", en: "Query issues, errors, releases, run Seer, search events." },
    addCommand: "claude mcp add --transport http sentry https://mcp.sentry.dev/mcp",
    mcpJson: '{ "type": "http", "url": "https://mcp.sentry.dev/mcp" }',
    note: { fr: "Variante stdio self-hosted : @sentry/mcp-server. L'ancienne référence est archivée.", en: "Self-hosted stdio variant: @sentry/mcp-server. The old reference is archived." },
    source: "https://mcp.sentry.dev/",
  },
  // Fichiers / Web
  {
    id: "filesystem",
    name: "Filesystem MCP",
    category: "files-web",
    official: true,
    what: { fr: "Serveur de référence ACTIF pour le système de fichiers local (répertoires whitelistés).", en: "ACTIVE reference server for local filesystem (whitelisted directories)." },
    does: { fr: "Lire/écrire/éditer des fichiers, créer/lister/déplacer dossiers, rechercher (répertoires autorisés).", en: "Read/write/edit files, create/list/move folders, search (allowed directories only)." },
    addCommand: "claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem /path/to/allowed/dir",
    mcpJson: '{ "command": "npx", "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dir"] }',
    source: "https://github.com/modelcontextprotocol/servers",
  },
  {
    id: "fetch",
    name: "Fetch MCP",
    category: "files-web",
    official: true,
    what: { fr: "Serveur de référence ACTIF qui récupère une URL et la convertit en markdown.", en: "ACTIVE reference server that fetches a URL and converts it to markdown." },
    does: { fr: "Récupérer une page web et lire son contenu en markdown (url, max_length, start_index).", en: "Fetch a web page and read its content as markdown (url, max_length, start_index)." },
    addCommand: "claude mcp add fetch -- uvx mcp-server-fetch",
    mcpJson: '{ "command": "uvx", "args": ["mcp-server-fetch"] }',
    source: "https://github.com/modelcontextprotocol/servers",
  },
  // Cloud / Infra
  {
    id: "cloudflare",
    name: "Cloudflare MCP",
    category: "cloud",
    official: true,
    what: { fr: "Plusieurs serveurs remote officiels Cloudflare, un par domaine produit.", en: "Several official Cloudflare remote servers, one per product domain." },
    does: { fr: "Interroger la doc, gérer Workers, lire l'observabilité, browser rendering, analytics GraphQL.", en: "Query docs, manage Workers, read observability, browser rendering, GraphQL analytics." },
    addCommand: "claude mcp add --transport http cloudflare-docs https://docs.mcp.cloudflare.com/mcp",
    mcpJson: '{ "type": "http", "url": "https://docs.mcp.cloudflare.com/mcp" }',
    note: { fr: "Autres : bindings.mcp.cloudflare.com/mcp, observability.mcp.cloudflare.com/mcp, browser.mcp.cloudflare.com/mcp.", en: "Others: bindings.mcp.cloudflare.com/mcp, observability.mcp.cloudflare.com/mcp, browser.mcp.cloudflare.com/mcp." },
    source: "https://github.com/cloudflare/mcp-server-cloudflare",
  },
  {
    id: "aws",
    name: "AWS MCP (suite awslabs)",
    category: "cloud",
    official: true,
    what: { fr: "Suite awslabs/mcp : 60+ serveurs MCP open-source par service/domaine AWS.", en: "awslabs/mcp suite: 60+ open-source MCP servers per AWS service/domain." },
    does: { fr: "Appeler des opérations API/CLI AWS, interroger doc et best practices, serveurs par domaine (CDK, ECS, DynamoDB, Bedrock...).", en: "Call AWS API/CLI operations, query docs and best practices, per-domain servers (CDK, ECS, DynamoDB, Bedrock...)." },
    addCommand: "claude mcp add aws-api -- uvx awslabs.aws-api-mcp-server@latest",
    mcpJson: '{ "command": "uvx", "args": ["awslabs.aws-api-mcp-server@latest"] }',
    source: "https://github.com/awslabs/mcp",
  },
  {
    id: "azure",
    name: "Azure MCP",
    category: "cloud",
    official: true,
    what: { fr: "Serveur officiel Azure de Microsoft (opérations de ressources + tooling).", en: "Official Microsoft Azure server (resource operations + tooling)." },
    does: { fr: "Interroger/gérer Storage, Cosmos, Key Vault, Monitor, AKS, App Service, SQL/Postgres, guidance az/azd.", en: "Query/manage Storage, Cosmos, Key Vault, Monitor, AKS, App Service, SQL/Postgres, az/azd guidance." },
    addCommand: "claude mcp add azure -- npx -y @azure/mcp@latest server start",
    mcpJson: '{ "command": "npx", "args": ["-y", "@azure/mcp@latest", "server", "start"] }',
    source: "https://github.com/microsoft/mcp",
  },
  // Design
  {
    id: "figma",
    name: "Figma MCP (Dev Mode)",
    category: "design",
    official: true,
    what: { fr: "Serveur officiel Figma (Dev Mode), local desktop ou remote hébergé.", en: "Official Figma server (Dev Mode), local desktop or hosted remote." },
    does: { fr: "Récupérer le contexte de design (frames, composants, variables) pour générer du code conforme.", en: "Fetch design context (frames, components, variables) to generate design-accurate code." },
    addCommand: "claude mcp add --transport http figma https://mcp.figma.com/mcp",
    mcpJson: '{ "type": "http", "url": "https://mcp.figma.com/mcp" }',
    note: { fr: "Local desktop : http://127.0.0.1:3845/mcp (app Figma desktop ouverte).", en: "Local desktop: http://127.0.0.1:3845/mcp (Figma desktop app open)." },
    source: "https://developers.figma.com/docs/figma-mcp-server/",
  },
  // Recherche / Web
  {
    id: "brave-search",
    name: "Brave Search MCP",
    category: "search",
    official: true,
    what: { fr: "Serveur local officiel Brave (web, local, image, video, news, résumé IA).", en: "Official Brave local server (web, local, image, video, news, AI summary)." },
    does: { fr: "Recherches web/news/image/video en direct via l'API Brave (index privacy-friendly).", en: "Live web/news/image/video searches via the Brave API (privacy-friendly index)." },
    addCommand: "claude mcp add brave-search -e BRAVE_API_KEY=YOUR_KEY -- npx -y @brave/brave-search-mcp-server",
    mcpJson: '{ "command": "npx", "args": ["-y", "@brave/brave-search-mcp-server", "--transport", "stdio"], "env": { "BRAVE_API_KEY": "YOUR_KEY" } }',
    note: { fr: "Serveur local uniquement (pas d'endpoint remote hébergé). L'ancienne référence est archivée.", en: "Local server only (no hosted remote endpoint). The old reference is archived." },
    source: "https://github.com/brave/brave-search-mcp-server",
  },
  {
    id: "exa",
    name: "Exa MCP",
    category: "search",
    official: true,
    what: { fr: "Serveur officiel Exa (recherche web sémantique/neuronale et crawl).", en: "Official Exa server (semantic/neural web search and crawl)." },
    does: { fr: "Recherches web sémantiques et crawl de pages via Exa pour lire du contenu en direct.", en: "Semantic web searches and page crawling via Exa to read live content." },
    addCommand: "claude mcp add --transport http exa https://mcp.exa.ai/mcp",
    mcpJson: '{ "type": "http", "url": "https://mcp.exa.ai/mcp" }',
    note: { fr: "Local : npx -y exa-mcp-server.", en: "Local: npx -y exa-mcp-server." },
    source: "https://github.com/exa-labs/exa-mcp-server",
  },
  // Connaissances (Obsidian)
  {
    id: "obsidian-claude-code-mcp",
    name: "obsidian-claude-code-mcp (iansinnott)",
    category: "knowledge",
    official: false,
    what: { fr: "Plugin Obsidian exposant le vault en MCP (pas de Local REST API requis).", en: "Obsidian plugin exposing the vault as MCP (no Local REST API required)." },
    does: { fr: "Lire/chercher/éditer le vault ; auto-découvert par /ide (WebSocket 22360).", en: "Read/search/edit the vault; auto-discovered by /ide (WebSocket 22360)." },
    addCommand: "(plugin Obsidian, auto-decouvert par /ide)",
    mcpJson: "",
    source: "https://github.com/iansinnott/obsidian-claude-code-mcp",
  },
  {
    id: "mcp-obsidian",
    name: "mcp-obsidian (MarkusPfundstein)",
    category: "knowledge",
    official: false,
    what: { fr: "MCP Python sur le vault (requiert le plugin Local REST API).", en: "Python MCP over the vault (requires the Local REST API plugin)." },
    does: { fr: "Outils structurés list/read/search/append/patch sur le vault.", en: "Structured list/read/search/append/patch tools over the vault." },
    addCommand: "claude mcp add mcp-obsidian -- uvx mcp-obsidian",
    mcpJson: '{ "command": "uvx", "args": ["mcp-obsidian"], "env": { "OBSIDIAN_API_KEY": "${OBSIDIAN_API_KEY}" } }',
    source: "https://github.com/MarkusPfundstein/mcp-obsidian",
  },
  // Contexte dépôt
  {
    id: "repomix-mcp",
    name: "repomix (mode MCP)",
    category: "repo",
    official: false,
    what: { fr: "Empaquete un dépôt en un fichier, exposé en outils MCP.", en: "Packs a repo into a file, exposed as MCP tools." },
    does: { fr: "Donner tout le contexte d'un repo à Claude en une passe.", en: "Give Claude a whole repo's context in one pass." },
    addCommand: "claude mcp add repomix -- npx -y repomix --mcp",
    mcpJson: '{ "command": "npx", "args": ["-y", "repomix", "--mcp"] }',
    source: "https://github.com/yamadashy/repomix",
  },
  // Planning / Orchestration
  {
    id: "task-master-mcp",
    name: "task-master-ai (mode MCP)",
    category: "planning",
    official: false,
    what: { fr: "PRD -> graphe de tâches, exposé en MCP.", en: "PRD -> task graph, exposed as MCP." },
    does: { fr: "Décomposer un PRD en tâches ordonnées et trackables dans la session.", en: "Decompose a PRD into ordered, trackable tasks in the session." },
    addCommand: "claude mcp add task-master-ai -- npx -y task-master-ai",
    mcpJson: '{ "command": "npx", "args": ["-y", "task-master-ai"], "env": { "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}" } }',
    source: "https://github.com/eyaltoledano/claude-task-master",
  },
];
