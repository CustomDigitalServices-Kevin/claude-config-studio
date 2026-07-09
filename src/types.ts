import { z } from "zod";

/** Langue de la prose generee dans CLAUDE.md / INSTALL.md. Le code reste en anglais par convention. */
export type Language = "fr" | "en";

/** Niveau de rigueur : module le TS strict, les seuils de tests, la severite des interdits. */
export type Rigor = "strict" | "standard" | "light";

export const PROFILE_IDS = [
  "dev",
  "audit",
  "business",
  "data-ml",
  "power-platform",
  "agents",
  "infra",
  "generic",
] as const;
export type ProfileId = (typeof PROFILE_IDS)[number];

/**
 * Profondeur de l'arborescence generee (remplace les anciennes STRUCTURE_IDS, D24).
 * - n0     : racine seule (~/.claude ou racine d'un depot).
 * - n0n1   : racine + un squelette N1 par secteur coche.
 * - n0n1n2 : racine + secteurs + un projet exemple (demonstration de l'heritage 3 niveaux).
 */
export const DEPTH_IDS = ["n0", "n0n1", "n0n1n2"] as const;
export type DepthId = (typeof DEPTH_IDS)[number];

/** Secteurs (domaines predefinis) cochables. Chacun devient un dossier N1 en profondeur >= n0n1. */
export const SECTOR_IDS = [
  "web",
  "power-platform",
  "data-ml",
  "infra",
  "mobile",
  "bots-agents",
  "other",
] as const;
export type SectorId = (typeof SECTOR_IDS)[number];

export const RULE_IDS = [
  "zero-improvisation",
  "anti-vibe-coding",
  "end-to-end",
  "factual-no-flattery",
  "green-flag",
  "context-alert",
  "memory-hygiene",
  "tests-required",
  "owasp-security",
  "research-before-code",
  "git-conventions",
  "kiss-architecture",
  "reproducibility",
  "idempotence",
  "osi-licenses",
  "secret-safety",
  "audit-readonly",
] as const;
export type RuleId = (typeof RULE_IDS)[number];

export const STACK_IDS = [
  "web-ts",
  "python",
  "rust",
  "go",
  "docker-infra",
  "power-platform",
  "none",
] as const;
export type StackId = (typeof STACK_IDS)[number];

export const HOOK_IDS = [
  "block-dangerous-bash",
  "prompt-destructive-guard",
  "session-start-reminder",
  "stop-checklist",
  "prompt-guardrail",
  "session-end-reminder",
  "precompact-note",
] as const;
export type HookId = (typeof HOOK_IDS)[number];

/** Comportement par défaut face à une demande utilisateur (posture de travail). */
export const DEFAULT_BEHAVIORS = ["act", "research", "brainstorm"] as const;
export type DefaultBehavior = (typeof DEFAULT_BEHAVIORS)[number];

/** Modèle du sous-agent advisor ("" = hériter du modèle courant, pas de clé model). */
export type AdvisorModel = "" | "opus" | "sonnet" | "haiku";

/** Posture de travail : comportement par défaut + sous-agent advisor + orchestration. */
export interface WorkflowSettings {
  /** Face à une demande : agir directement, rechercher d'abord, ou brainstormer pour qualifier. */
  defaultBehavior: DefaultBehavior;
  /** Génère un sous-agent advisor (.claude/agents/advisor.md) + directive de validation. */
  advisor: { enabled: boolean; model: AdvisorModel };
  /** Génère une commande /orchestrate (.claude/commands/orchestrate.md). */
  orchestration: boolean;
}

/**
 * Reglages avances ecrits dans settings.json. Chaque cle est verifiee contre le schema
 * officiel (json.schemastore.org/claude-code-settings.json) : on n'expose que des cles reelles.
 * Une valeur vide / le defaut Claude => la cle n'est PAS ecrite (settings.json minimal).
 */
export interface AdvancedSettings {
  /** Alias de modele principal ("" = ne pas fixer). Le schema accepte opus/sonnet/haiku ou un ID complet. */
  model: "" | "opus" | "sonnet" | "haiku";
  /** Memoire automatique inter-sessions (defaut Claude = true). false => ecrit autoMemoryEnabled:false. */
  autoMemory: boolean;
  /** Style de sortie ("" = defaut). */
  outputStyle: "" | "Explanatory" | "Learning";
  /** Mode de permission par defaut ("" = ne pas fixer). Limite aux valeurs sures (jamais bypass/auto/dontAsk). */
  permissionMode: "" | "default" | "acceptEdits" | "plan";
  /** Modele de repli si le principal est surcharge ("" = aucun). Emis en array (schema officiel maxItems 3, schemastore verifie 2026-07-09) ; l'UI n'expose qu'un choix, on emet un seul element. */
  fallbackModel: "" | "opus" | "sonnet" | "haiku";
  /** Langue preferee des reponses de Claude ("" = defaut). Cle settings "language", string libre (ex "french"). */
  responseLanguage: string;
  /** Attribution git ("" = defaut Claude ; "none" = retire la mention des commits et PRs via commit:"" et pr:""). */
  attribution: "" | "none";
}

/** Reponses collectees par le wizard. Aucune valeur Kevin-specifique : tout vient de l'utilisateur. */
/** Ton et longueur souhaites des reponses. "" = aucune directive (defaut). Tone/longueur uniquement. */
export type ResponseStyle = "" | "concise" | "detailed";

export interface Answers {
  /** Nom du dossier de travail (le dossier ou vit .claude). Sert d'identite projet dans la sortie. */
  projectName: string;
  author: string;
  org: string;
  /** Role/metier de l'auteur (optionnel). Injecte dans l'identite du CLAUDE.md. */
  authorRole: string;
  /** Numero d'entreprise (SIREN/TVA/EIN...), optionnel, affiche seulement si org rempli. Sortie neutre. */
  companyId: string;
  /** Directive de ton/longueur en prose dans la posture du CLAUDE.md. */
  responseStyle: ResponseStyle;
  language: Language;
  profiles: ProfileId[];
  /** Profondeur de l'arborescence generee (D24). */
  depth: DepthId;
  /** Secteurs coches : un squelette N1 par secteur en profondeur >= n0n1. */
  sectors: SectorId[];
  stacks: StackId[];
  rules: RuleId[];
  rigor: Rigor;
  hooks: HookId[];
  tools: string[];
  /** Ids des skills (catalogue source) a installer ; genere une commande d'install dans INSTALL.md. */
  skills: string[];
  /** Ids des agents (subagents, catalogue source) a installer ; genere une commande d'install dans INSTALL.md. */
  agents: string[];
  /** Ids des serveurs MCP (catalogue mcpServers, entrees avec mcpJson pret) a emettre dans un .mcp.json opt-in. */
  mcpServers: string[];
  /** Ids des outils dont la regle 0 associee est activee. */
  toolRules: string[];
  /** Valeurs des parametres de regles/outils, cle = `${ownerId}.${optionId}`. */
  ruleOptions: Record<string, string | number | boolean>;
  memoryNote: string;
  /** Reglages avances ecrits dans settings.json. */
  advanced: AdvancedSettings;
  /** Posture de travail : comportement par défaut + advisor + orchestration. */
  workflow: WorkflowSettings;
}

/** Un fichier produit par le generateur, destine au ZIP et au preview. */
export interface GeneratedFile {
  /** Chemin relatif dans l'archive, ex ".claude/CLAUDE.md" */
  path: string;
  content: string;
  lang: "markdown" | "json" | "bash" | "text";
}

/**
 * Schema du settings.json Claude Code, derive des fichiers reels sur disque
 * (Antigravity/.claude/settings.json + web-apps/.claude/settings.json).
 * Sert de test de conformite de la sortie generee.
 */
export const settingsSchema = z.object({
  $schema: z.string().optional(),
  /** Alias ou ID de modele (schema officiel : string libre). */
  model: z.string().optional(),
  /** Style de sortie (schema officiel : string libre). */
  outputStyle: z.string().optional(),
  /** Memoire automatique inter-sessions. */
  autoMemoryEnabled: z.boolean().optional(),
  /** Chaine de repli modele. Schema officiel (schemastore, verifie 2026-07-09) : array de strings, maxItems 3. */
  fallbackModel: z.array(z.string()).max(3).optional(),
  /** Langue preferee des reponses (schema officiel : string libre, ex "french"). */
  language: z.string().optional(),
  /** Attribution des commits/PRs (schema officiel : objet {commit?, pr?} de strings, additionalProperties false). */
  attribution: z.object({ commit: z.string().optional(), pr: z.string().optional() }).optional(),
  env: z.record(z.string(), z.string()).optional(),
  permissions: z
    .object({
      /** Limite aux valeurs sures : le test rejette tout mode dangereux (bypass/auto/dontAsk). */
      defaultMode: z.enum(["default", "acceptEdits", "plan"]).optional(),
      allow: z.array(z.string()).optional(),
      ask: z.array(z.string()).optional(),
      deny: z.array(z.string()).optional(),
    })
    .optional(),
  hooks: z
    .record(
      z.string(),
      z.array(
        z.object({
          matcher: z.string().optional(),
          hooks: z.array(
            z.union([
              z.object({
                type: z.literal("command"),
                command: z.string(),
              }),
              /** Hook type "prompt" (evaluation modele, sans shell). Champs requis : type + prompt. */
              z.object({
                type: z.literal("prompt"),
                prompt: z.string(),
                timeout: z.number().optional(),
              }),
            ]),
          ),
        }),
      ),
    )
    .optional(),
});

export type ClaudeSettings = z.infer<typeof settingsSchema>;

/**
 * Schema Zod des Answers. Valide tout Answers venant d'une source EXTERNE
 * (localStorage, permalink d'URL, manifeste config-studio.json re-importe).
 * L'annotation z.ZodType<Answers> garantit a la compilation que le schema
 * reste aligne sur l'interface : tout champ ajoute a Answers casse ici.
 */
export const answersSchema: z.ZodType<Answers> = z.object({
  projectName: z.string(),
  author: z.string(),
  org: z.string(),
  authorRole: z.string(),
  companyId: z.string(),
  responseStyle: z.enum(["", "concise", "detailed"]),
  language: z.enum(["fr", "en"]),
  profiles: z.array(z.enum(PROFILE_IDS)),
  depth: z.enum(DEPTH_IDS),
  sectors: z.array(z.enum(SECTOR_IDS)),
  stacks: z.array(z.enum(STACK_IDS)),
  rules: z.array(z.enum(RULE_IDS)),
  rigor: z.enum(["strict", "standard", "light"]),
  hooks: z.array(z.enum(HOOK_IDS)),
  tools: z.array(z.string()),
  skills: z.array(z.string()),
  agents: z.array(z.string()),
  mcpServers: z.array(z.string()),
  toolRules: z.array(z.string()),
  ruleOptions: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  memoryNote: z.string(),
  advanced: z.object({
    model: z.enum(["", "opus", "sonnet", "haiku"]),
    autoMemory: z.boolean(),
    outputStyle: z.enum(["", "Explanatory", "Learning"]),
    permissionMode: z.enum(["", "default", "acceptEdits", "plan"]),
    fallbackModel: z.enum(["", "opus", "sonnet", "haiku"]),
    responseLanguage: z.string(),
    attribution: z.enum(["", "none"]),
  }),
  workflow: z.object({
    defaultBehavior: z.enum(DEFAULT_BEHAVIORS),
    advisor: z.object({
      enabled: z.boolean(),
      model: z.enum(["", "opus", "sonnet", "haiku"]),
    }),
    orchestration: z.boolean(),
  }),
});

/** Texte localise FR/EN. */
export interface Localized {
  fr: string;
  en: string;
}

export function pick(text: Localized, lang: Language): string {
  return text[lang];
}
