import type { Localized } from "../types";
import type { RuleOption } from "./options";

/**
 * Catalogue des OUTILS tiers (non-MCP) qui completent Claude Code.
 * Les serveurs MCP sont catalogues a part dans mcpServers.ts.
 * Source : verification par sources primaires (repos GitHub + docs officielles), 2026-06-30.
 */

export type ConnectKind = "cli" | "filesystem" | "manual";

export type ToolCategoryId = "knowledge" | "orchestration" | "cost" | "repo" | "spec";

export interface CompanionTool {
  id: string;
  name: string;
  category: ToolCategoryId;
  connectKind: ConnectKind;
  official: boolean;
  /** Ce que c'est. */
  what: Localized;
  /** Ce que ca apporte a Claude Code. */
  adds: Localized;
  /** Le mecanisme reel de connexion, avec la commande. */
  howToConnect: Localized;
  /** Quand le prendre. */
  whenToUse: Localized;
  /** Avantages. */
  advantages: Localized;
  /** Inconvenients / limites. */
  disadvantages: Localized;
  /** Regle 0 associee (optionnelle) : injectee dans CLAUDE.md si activee a la selection. */
  rule?: {
    title: Localized;
    body: Localized;
    /** Detail "en savoir plus". */
    detail?: Localized;
    /** Parametres configurables de la regle. */
    options?: RuleOption[];
  };
  source: string;
}

export const CONNECT_KIND_LABELS: Record<ConnectKind, Localized> = {
  cli: { fr: "CLI a cote", en: "CLI alongside" },
  filesystem: { fr: "Convention fichier", en: "Filesystem convention" },
  manual: { fr: "Manuel", en: "Manual" },
};

export const TOOL_CATEGORIES: ReadonlyArray<{ id: ToolCategoryId; label: Localized }> = [
  { id: "knowledge", label: { fr: "Connaissances / Mémoire", en: "Knowledge / Memory" } },
  { id: "orchestration", label: { fr: "Orchestration / Multi-agent", en: "Orchestration / Multi-agent" } },
  { id: "spec", label: { fr: "Spec / Planning / Setup", en: "Spec / Planning / Setup" } },
  { id: "repo", label: { fr: "Contexte dépôt", en: "Repo context" } },
  { id: "cost", label: { fr: "Coût / Usage", en: "Cost / Usage" } },
];

export const COMPANION_TOOLS: readonly CompanionTool[] = [
  {
    id: "obsidian",
    name: "Obsidian",
    category: "knowledge",
    connectKind: "filesystem",
    official: false,
    what: {
      fr: "App de notes Markdown local-first. Un vault est un dossier de fichiers .md qui sert de base de connaissances.",
      en: "Local-first Markdown notes app. A vault is a folder of .md files used as a knowledge base.",
    },
    adds: {
      fr: "Une mémoire / RAG persistante et curée à la main, que Claude Code lit et écrit en fichiers plats, qui survit aux sessions.",
      en: "A persistent, hand-curated memory / RAG that Claude Code reads and writes as flat files, surviving across sessions.",
    },
    howToConnect: {
      fr: "Pointer Claude Code sur le dossier du vault (cwd ou @import dans CLAUDE.md) et laisser CLAUDE.md servir d'index. (Des serveurs MCP Obsidian existent aussi, voir l'onglet MCP Serveurs.)",
      en: "Point Claude Code at the vault folder (cwd or @import in CLAUDE.md) and let CLAUDE.md act as the index. (Obsidian MCP servers also exist, see the MCP Servers tab.)",
    },
    whenToUse: {
      fr: "Vous voulez une mémoire projet durable sans serveur, et vous éditez aussi les notes vous-même.",
      en: "You want durable project memory without a server, and you also edit the notes yourself.",
    },
    advantages: {
      fr: "Zéro serveur, fichiers .md versionnables, double usage (vous + Claude).",
      en: "Zero server, versionable .md files, dual use (you + Claude).",
    },
    disadvantages: {
      fr: "Claude lit tout le dossier (coût contexte) ; pas de recherche structurée sans un MCP Obsidian.",
      en: "Claude reads the whole folder (context cost); no structured search without an Obsidian MCP.",
    },
    rule: {
      title: { fr: "Mémoire Obsidian (source de vérité)", en: "Obsidian memory (source of truth)" },
      body: {
        fr: "- Le vault Obsidian est la mémoire et la source de vérité du projet. Le consulter AVANT toute action (décisions, contexte, connaissances acquises).\n- Ne jamais improviser quand l'information peut y être.",
        en: "- The Obsidian vault is the project's memory and source of truth. Consult it BEFORE any action (decisions, context, acquired knowledge).\n- Never improvise when the information may be there.",
      },
      detail: {
        fr: "Transforme un vault Obsidian en cerveau de Claude Code : il consulte le vault avant d'agir et y documente décisions et connaissances. Les paramètres règlent la fraîcheur (re-vérification) et la mise à jour après action.",
        en: "Turns an Obsidian vault into Claude Code's brain: it consults the vault before acting and documents decisions and knowledge there. The parameters tune freshness (re-verification) and post-action updates.",
      },
      options: [
        {
          id: "staleness",
          type: "number",
          default: 30,
          unit: { fr: "jours", en: "days" },
          min: 7,
          max: 180,
          step: 1,
          label: { fr: "Re-vérifier l'info au-delà de N jours", en: "Re-verify info beyond N days" },
          hint: {
            fr: "Délai après lequel une info du vault sur un sujet à évolution rapide doit être re-vérifiée (recherche web).",
            en: "Delay after which vault info on a fast-moving topic must be re-verified (web search).",
          },
          lineOn: {
            fr: "- Re-vérifier (recherche web) toute information du vault datant de plus de {value} {unit} sur un sujet à évolution rapide.",
            en: "- Re-verify (web search) any vault information older than {value} {unit} on a fast-moving topic.",
          },
        },
        {
          id: "updateAfter",
          type: "toggle",
          default: true,
          label: { fr: "Documenter après chaque action", en: "Document after each action" },
          lineOn: {
            fr: "- Après chaque action terminée : mettre à jour le vault (décisions, état, nouvelles connaissances).",
            en: "- After each finished action: update the vault (decisions, state, new knowledge).",
          },
        },
      ],
    },
    source: "https://obsidian.md",
  },
  {
    id: "notebooklm",
    name: "NotebookLM (Google)",
    category: "knowledge",
    connectKind: "manual",
    official: false,
    what: {
      fr: "Outil Google de grounding documentaire : on charge des sources, on obtient une synthèse citée et des Audio Overviews.",
      en: "Google document-grounding tool: upload sources, get cited synthesis and Audio Overviews.",
    },
    adds: {
      fr: "Une surface de synthèse sourcée pour des docs denses (papers, contrats, manuels) que vous réinjectez dans Claude Code.",
      en: "A source-grounded synthesis surface for dense docs (papers, contracts, manuals) you feed back into Claude Code.",
    },
    howToConnect: {
      fr: "Manuel : recherche dans NotebookLM puis export/copie des notes dans le repo / CLAUDE.md / vault. Pas de MCP officiel grand public (API seulement en NotebookLM Enterprise).",
      en: "Manual: research in NotebookLM then export/copy notes into the repo / CLAUDE.md / vault. No official consumer MCP (API only on NotebookLM Enterprise).",
    },
    whenToUse: {
      fr: "Grounding documentaire lourd / synthèse de littérature avant de coder.",
      en: "Heavy document grounding / literature synthesis before coding.",
    },
    advantages: {
      fr: "Synthèse sourcée et citée, Audio Overviews, excellent sur gros corpus.",
      en: "Sourced, cited synthesis, Audio Overviews, great on large corpora.",
    },
    disadvantages: {
      fr: "Pas d'intégration programmatique grand public : flux manuel (copier/coller).",
      en: "No consumer programmatic integration: manual flow (copy/paste).",
    },
    rule: {
      title: { fr: "Grounding NotebookLM", en: "NotebookLM grounding" },
      body: {
        fr: "- Pour les sujets dont les sources sont dans NotebookLM, partir de sa synthèse sourcée avant de répondre ou de coder.",
        en: "- For topics whose sources live in NotebookLM, start from its sourced synthesis before answering or coding.",
      },
    },
    source: "https://notebooklm.google.com",
  },
  {
    id: "claude-squad",
    name: "claude-squad",
    category: "orchestration",
    connectKind: "cli",
    official: false,
    what: {
      fr: "App terminal qui fait tourner PLUSIEURS agents Claude Code (et Codex/Gemini/Aider) en parallèle, chacun isolé dans son git worktree + tmux.",
      en: "Terminal app running MULTIPLE Claude Code (and Codex/Gemini/Aider) agents in parallel, each isolated in its own git worktree + tmux.",
    },
    adds: {
      fr: "Paralléliser des tâches indépendantes dans des workspaces isolés sans conflit ; superviser plusieurs agents depuis un TUI.",
      en: "Parallelize independent tasks in isolated workspaces without conflict; supervise many agents from one TUI.",
    },
    howToConnect: {
      fr: "`curl -fsSL https://raw.githubusercontent.com/smtg-ai/claude-squad/main/install.sh | bash`.",
      en: "`curl -fsSL https://raw.githubusercontent.com/smtg-ai/claude-squad/main/install.sh | bash`.",
    },
    whenToUse: {
      fr: "Plusieurs changements indépendants à lancer en simultané et isolé.",
      en: "Several independent changes to run concurrently and isolated.",
    },
    advantages: {
      fr: "Plusieurs agents en parallèle, isolés (worktree + tmux).",
      en: "Many agents in parallel, isolated (worktree + tmux).",
    },
    disadvantages: {
      fr: "CLI/TUI séparé ; courbe d'apprentissage tmux.",
      en: "Separate CLI/TUI; tmux learning curve.",
    },
    source: "https://github.com/smtg-ai/claude-squad",
  },
  {
    id: "superclaude",
    name: "SuperClaude framework",
    category: "orchestration",
    connectKind: "filesystem",
    official: false,
    what: {
      fr: "Meta-framework de configuration qui installe slash-commands, personas/agents et modes comportementaux dans Claude Code (~30 commandes, ~20 agents).",
      en: "Configuration meta-framework installing slash-commands, personas/agents and behavioral modes into Claude Code (~30 commands, ~20 agents).",
    },
    adds: {
      fr: "Des workflows d'orchestration/brainstorm pré-construits et des personas spécialistes.",
      en: "Pre-built orchestration/brainstorm workflows and specialist personas.",
    },
    howToConnect: {
      fr: "`pipx install superclaude` puis `superclaude install`.",
      en: "`pipx install superclaude` then `superclaude install`.",
    },
    whenToUse: {
      fr: "Vous voulez un scaffold de commandes/personas prêt à l'emploi plutôt que tout coder.",
      en: "You want a ready-made command/persona scaffold rather than coding it all.",
    },
    advantages: {
      fr: "Scaffold prêt à l'emploi (commandes, personas, modes).",
      en: "Ready-made scaffold (commands, personas, modes).",
    },
    disadvantages: {
      fr: "Framework opinioné en fichiers ; peut entrer en conflit avec votre .claude.",
      en: "Opinionated file-based framework; may conflict with your .claude.",
    },
    source: "https://github.com/SuperClaude-Org/SuperClaude_Framework",
  },
  {
    id: "task-master",
    name: "task-master-ai",
    category: "spec",
    connectKind: "cli",
    official: false,
    what: {
      fr: "Transforme un PRD en graphe de tâches structuré et dépendant, avec sous-tâches et suivi de statut.",
      en: "Turns a PRD into a structured, dependency-aware task graph with subtasks and status tracking.",
    },
    adds: {
      fr: "Parse mon PRD -> tâches ordonnées et trackables que Claude Code exécute une par une ; moteur d'orchestration.",
      en: "Parse my PRD -> ordered, trackable tasks Claude Code executes one by one; orchestration engine.",
    },
    howToConnect: {
      fr: "CLI : `npm install -g task-master-ai` puis `task-master init`. (Existe aussi en MCP, voir l'onglet MCP Serveurs.)",
      en: "CLI: `npm install -g task-master-ai` then `task-master init`. (Also available as MCP, see the MCP Servers tab.)",
    },
    whenToUse: {
      fr: "Décomposer une feature/MVP avant de construire ; travail long multi-étapes.",
      en: "Decompose a feature/MVP before building; long multi-step work.",
    },
    advantages: {
      fr: "PRD -> graphe de tâches trackable ; structure le long-cours.",
      en: "PRD -> trackable task graph; structures long work.",
    },
    disadvantages: {
      fr: "Requiert une clé API ; overhead pour de petites tâches.",
      en: "Requires an API key; overhead for small tasks.",
    },
    rule: {
      title: { fr: "Décomposition task-master", en: "task-master decomposition" },
      body: {
        fr: "- Décomposer via task-master (parse PRD) AVANT de coder, puis exécuter les tâches une par une.",
        en: "- Decompose via task-master (parse PRD) BEFORE coding, then execute tasks one by one.",
      },
      detail: {
        fr: "Impose de passer par task-master pour décomposer les features conséquentes en tâches trackables avant de coder. Le seuil règle à partir de quelle taille la décomposition est obligatoire.",
        en: "Requires going through task-master to break sizable features into trackable tasks before coding. The threshold sets from which size decomposition is mandatory.",
      },
      options: [
        {
          id: "minSteps",
          type: "number",
          default: 5,
          unit: { fr: "sous-tâches", en: "subtasks" },
          min: 2,
          max: 20,
          step: 1,
          label: { fr: "Seuil de décomposition", en: "Decomposition threshold" },
          lineOn: {
            fr: "- Décomposer via task-master dès qu'une feature dépasse ~{value} {unit}.",
            en: "- Decompose via task-master as soon as a feature exceeds ~{value} {unit}.",
          },
        },
      ],
    },
    source: "https://github.com/eyaltoledano/claude-task-master",
  },
  {
    id: "spec-kit",
    name: "GitHub Spec Kit",
    category: "spec",
    connectKind: "cli",
    official: true,
    what: {
      fr: "Toolkit GitHub de Spec-Driven Development : les specs deviennent des artefacts exécutables qui génèrent l'implémentation.",
      en: "GitHub Spec-Driven Development toolkit: specs become executable artifacts that generate the implementation.",
    },
    adds: {
      fr: "Un workflow spec -> plan -> implement exposé à Claude Code en slash-commands /speckit.*.",
      en: "A spec -> plan -> implement workflow exposed to Claude Code as /speckit.* slash-commands.",
    },
    howToConnect: {
      fr: "`uv tool install specify-cli --from git+https://github.com/github/spec-kit.git` puis `specify init --integration claude`.",
      en: "`uv tool install specify-cli --from git+https://github.com/github/spec-kit.git` then `specify init --integration claude`.",
    },
    whenToUse: {
      fr: "Vous voulez un workflow discipliné spec-first plutôt que du prompting ad hoc.",
      en: "You want a disciplined spec-first workflow rather than ad hoc prompting.",
    },
    advantages: {
      fr: "Workflow discipliné, slash-commands /speckit.*, officiel GitHub.",
      en: "Disciplined workflow, /speckit.* slash-commands, official GitHub.",
    },
    disadvantages: {
      fr: "CLI + templates ; plus lourd que du prompting direct.",
      en: "CLI + templates; heavier than direct prompting.",
    },
    rule: {
      title: { fr: "Spec-first (Spec Kit)", en: "Spec-first (Spec Kit)" },
      body: {
        fr: "- Travailler en spec-first : écrire ou mettre à jour la spec via /speckit.* AVANT toute implémentation.",
        en: "- Work spec-first: write or update the spec via /speckit.* BEFORE any implementation.",
      },
    },
    source: "https://github.com/github/spec-kit",
  },
  {
    id: "claude-code-templates",
    name: "claude-code-templates (aitmpl)",
    category: "spec",
    connectKind: "cli",
    official: false,
    what: {
      fr: "CLI qui installe des composants Claude Code prêts à l'emploi (agents, commandes, settings, hooks, MCPs, skills) + dashboard config/analytics.",
      en: "CLI installing ready-made Claude Code components (agents, commands, settings, hooks, MCPs, skills) + config/analytics dashboard.",
    },
    adds: {
      fr: "Bootstrappe un .claude/ depuis un catalogue communautaire au lieu d'écrire chaque pièce à la main.",
      en: "Bootstraps a .claude/ from a community catalog instead of writing each piece by hand.",
    },
    howToConnect: {
      fr: "`npx claude-code-templates@latest` (interactif), ou par composant `--agent <path> --yes`.",
      en: "`npx claude-code-templates@latest` (interactive), or per component `--agent <path> --yes`.",
    },
    whenToUse: {
      fr: "Monter ou étendre rapidement le .claude/ d'un projet.",
      en: "Quickly stand up or extend a project's .claude/.",
    },
    advantages: {
      fr: "Bootstrappe un .claude/ depuis un catalogue (~28k stars).",
      en: "Bootstraps a .claude/ from a catalog (~28k stars).",
    },
    disadvantages: {
      fr: "Qualité des composants variable selon l'auteur.",
      en: "Component quality varies by author.",
    },
    source: "https://github.com/davila7/claude-code-templates",
  },
  {
    id: "repomix",
    name: "repomix",
    category: "repo",
    connectKind: "cli",
    official: false,
    what: {
      fr: "Empaquete un dépôt entier dans un seul fichier AI-friendly (respecte .gitignore, compte les tokens, compression).",
      en: "Packs an entire repo into a single AI-friendly file (respects .gitignore, counts tokens, compression).",
    },
    adds: {
      fr: "Un bundle de contexte de tout le repo en un coup pour review/migration/onboarding.",
      en: "A whole-repo context bundle in one shot for review/migration/onboarding.",
    },
    howToConnect: {
      fr: "`npx repomix@latest` produit le fichier. (Existe aussi en mode MCP, voir l'onglet MCP Serveurs.)",
      en: "`npx repomix@latest` produces the file. (Also has an MCP mode, see the MCP Servers tab.)",
    },
    whenToUse: {
      fr: "Donner une base de code complète (ou un repo distant) à Claude Code en une passe.",
      en: "Feed a full codebase (or a remote repo) into Claude Code in one pass.",
    },
    advantages: {
      fr: "Tout le repo en un fichier (respecte .gitignore), simple.",
      en: "Whole repo in one file (respects .gitignore), simple.",
    },
    disadvantages: {
      fr: "Gros repos = gros contexte ; à regénérer après changements.",
      en: "Large repos = large context; regenerate after changes.",
    },
    rule: {
      title: { fr: "Contexte repo (repomix)", en: "Repo context (repomix)" },
      body: {
        fr: "- Avant une review, migration ou onboarding sur tout le repo : générer le contexte complet via repomix.",
        en: "- Before a whole-repo review, migration or onboarding: generate the full context via repomix.",
      },
    },
    source: "https://github.com/yamadashy/repomix",
  },
  {
    id: "ccusage",
    name: "ccusage",
    category: "cost",
    connectKind: "cli",
    official: false,
    what: {
      fr: "CLI qui analyse l'usage de tokens et le coût depuis les logs locaux des agents.",
      en: "CLI analyzing token usage and cost from local agent logs.",
    },
    adds: {
      fr: "Rapports de coût jour/semaine/mois/session et par bloc de 5h depuis vos logs JSONL ~/.claude, widget statusline.",
      en: "Daily/weekly/monthly/session and 5h-block cost reports from your ~/.claude JSONL logs, statusline widget.",
    },
    howToConnect: {
      fr: "`npx ccusage@latest`. (statusline : `ccusage statusline`.)",
      en: "`npx ccusage@latest`. (statusline: `ccusage statusline`.)",
    },
    whenToUse: {
      fr: "Suivre la dépense / le burn de tokens, surtout contre les fenêtres de facturation 5h.",
      en: "Track spend / token burn, especially against the 5h billing windows.",
    },
    advantages: {
      fr: "Suivi coût/tokens précis depuis les logs locaux, widget statusline.",
      en: "Precise cost/token tracking from local logs, statusline widget.",
    },
    disadvantages: {
      fr: "Lecture seule sur logs ; aucune action.",
      en: "Read-only over logs; no actions.",
    },
    rule: {
      title: { fr: "Suivi coût (ccusage)", en: "Cost tracking (ccusage)" },
      body: {
        fr: "- Surveiller la dépense de tokens via ccusage, surtout sur les sessions longues et contre les fenêtres de facturation 5h.",
        en: "- Monitor token spend via ccusage, especially on long sessions and against 5h billing windows.",
      },
    },
    source: "https://github.com/ccusage/ccusage",
  },
];
