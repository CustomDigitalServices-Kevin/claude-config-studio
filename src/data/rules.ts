import type { Localized, ProfileId, RuleId } from "../types";
import type { RuleOption } from "./options";
import { SOURCES } from "./sources";

export interface RuleModule {
  id: RuleId;
  label: Localized;
  summary: Localized;
  /** core = injecté dans CLAUDE.md ; scoped = fichier rules/<id>.md avec frontmatter paths. */
  kind: "core" | "scoped";
  /** Globs pour kind === "scoped" (chargement lazy ciblé). */
  scopedPaths?: string[];
  title: Localized;
  body: Localized;
  defaultForProfiles: ProfileId[];
  source: string;
  /** Les "règles 0" non négociables : toujours proposées, jamais déplacées en overflow. */
  core0: boolean;
}

export const RULE_MODULES: readonly RuleModule[] = [
  {
    id: "zero-improvisation",
    core0: true,
    kind: "core",
    label: { fr: "Zéro improvisation", en: "Zero improvisation" },
    summary: {
      fr: "Toujours une source vérifiable, jamais de guess.",
      en: "Always a verifiable source, never a guess.",
    },
    title: { fr: "Zéro improvisation", en: "Zero improvisation" },
    body: {
      fr: `- Avant toute affirmation technique : vérifier la source (doc officielle, code du repo, base de connaissances). Jamais de "je pense que".
- Si l'info n'est pas dans le contexte : recherche web sur la doc officielle AVANT de répondre, puis citer l'URL exacte.
- Si aucune source fiable n'est trouvée : le dire explicitement et étiqueter toute hypothèse comme telle.`,
      en: `- Before any technical claim: verify the source (official docs, repo code, knowledge base). Never "I think that".
- If the info is not in context: search the official docs on the web BEFORE answering, then cite the exact URL.
- If no reliable source is found: say so explicitly and label any hypothesis as such.`,
    },
    defaultForProfiles: [
      "dev",
      "audit",
      "business",
      "data-ml",
      "power-platform",
      "agents",
      "infra",
      "generic",
    ],
    source: SOURCES.bestPractices,
  },
  {
    id: "anti-vibe-coding",
    core0: true,
    kind: "core",
    label: { fr: "Anti vibe coding", en: "Anti vibe coding" },
    summary: {
      fr: "Code fonctionnel de bout en bout, zéro stub ni TODO.",
      en: "Working code end to end, zero stubs or TODOs.",
    },
    title: { fr: "Anti vibe coding", en: "Anti vibe coding" },
    body: {
      fr: `- Interdits dans tout code livré : \`// TODO\` / \`// FIXME\` laissés en place, fonctions stub (\`throw new Error("not implemented")\`), valeurs placeholder non justifiées, mocks non demandés, imports de packages non installés, variables d'environnement inventées.
- Chaque fonction fait réellement ce que son nom annonce. Relire le code ligne par ligne avant de livrer.
- Si un élément reste incomplet : le signaler explicitement, ne jamais le masquer.`,
      en: `- Forbidden in any shipped code: leftover \`// TODO\` / \`// FIXME\`, stub functions (\`throw new Error("not implemented")\`), unjustified placeholder returns, undocumented mocks, imports of uninstalled packages, invented environment variables.
- Every function actually does what its name says. Re-read the code line by line before shipping.
- If something stays incomplete: flag it explicitly, never hide it.`,
    },
    defaultForProfiles: ["dev", "data-ml", "power-platform", "agents", "infra"],
    source: SOURCES.bestPractices,
  },
  {
    id: "end-to-end",
    core0: true,
    kind: "core",
    label: { fr: "Livraison end to end", en: "End-to-end delivery" },
    summary: {
      fr: "Implémentation + tests + vérification que ça tourne.",
      en: "Implementation + tests + verification it runs.",
    },
    title: { fr: "Livraison end to end", en: "End-to-end delivery" },
    body: {
      fr: `- Toute fonctionnalité livrée inclut : implémentation complète, tests, et vérification manuelle que ça tourne.
- Pas de "à moitié fait" silencieux : un livrable partiel est annoncé comme tel, avec ce qui reste.`,
      en: `- Every shipped feature includes: complete implementation, tests, and a manual check that it runs.
- No silent "half done": a partial deliverable is announced as such, with what remains.`,
    },
    defaultForProfiles: ["dev", "data-ml", "agents", "infra"],
    source: SOURCES.bestPractices,
  },
  {
    id: "factual-no-flattery",
    core0: true,
    kind: "core",
    label: { fr: "Factuel, zéro flatterie", en: "Factual, zero flattery" },
    summary: {
      fr: "Information d'abord, dire quand c'est faux.",
      en: "Information first, say when it is wrong.",
    },
    title: { fr: "Factuel, zéro flatterie", en: "Factual, zero flattery" },
    body: {
      fr: `- Commencer les réponses par l'information, la correction ou l'action. Pas d'accusé-réception émotionnel.
- Interdits : "tu as raison", "parfait", "excellent", "bonne question". Pas de validation gratuite.
- Dire quand une direction est fausse, immédiatement, avec la raison factuelle. Soulever les trade-offs sans les adoucir.`,
      en: `- Start answers with the information, the correction or the action. No emotional acknowledgement.
- Forbidden: "you are right", "perfect", "excellent", "great question". No free validation.
- Say when a direction is wrong, immediately, with the factual reason. Surface trade-offs without softening them.`,
    },
    defaultForProfiles: ["dev", "audit", "business", "data-ml", "agents", "infra", "generic"],
    source: SOURCES.bestPractices,
  },
  {
    id: "green-flag",
    core0: false,
    kind: "core",
    label: { fr: "Green Flag (fraîcheur de contexte)", en: "Green flag (context freshness)" },
    summary: {
      fr: "En-tête daté en début de réponse, signal de contexte sain.",
      en: "Dated header at reply start, healthy-context signal.",
    },
    title: { fr: "Green Flag (fraîcheur de contexte)", en: "Green flag (context freshness)" },
    body: {
      fr: `- Commencer CHAQUE réponse par cet en-tête de fraîcheur de contexte : \`{header}\`.
- Cet en-tête est un Green Flag : sa présence atteste un contexte sain. S'il disparaît (préfixe oublié), c'est le Red Flag d'un contexte dégradé -> repartir sur une session fraîche (\`/clear\` ou nouvelle session).
- En-tête informatif, PAS une formule de validation : l'information utile suit immédiatement (compatible avec la règle factuelle, sans accusé-réception émotionnel).`,
      en: `- Begin EVERY reply with this context-freshness header: \`{header}\`.
- This header is a green flag: its presence attests a healthy context. If it disappears (prefix forgotten), it is the red flag of a degraded context -> start a fresh session (\`/clear\` or a new session).
- Informational header, NOT a validation phrase: the useful information follows right after (compatible with the factual rule, no emotional acknowledgement).`,
    },
    defaultForProfiles: [],
    source: SOURCES.contextWindow,
  },
  {
    id: "context-alert",
    core0: true,
    kind: "core",
    label: { fr: "Alerte fenêtre de contexte", en: "Context window alert" },
    summary: {
      fr: "Alerter à la saturation, proposer /compact ou /clear.",
      en: "Alert near saturation, suggest /compact or /clear.",
    },
    title: { fr: "Alerte fenêtre de contexte", en: "Context window alert" },
    body: {
      fr: `- Alerter dès que la fenêtre de contexte approche la saturation et proposer un \`/compact\` ciblé avant de continuer.
- Entre deux tâches sans rapport : \`/clear\`. Pendant une tâche longue qui dérive : \`/compact "garde X"\`.`,
      en: `- Alert as soon as the context window approaches saturation and suggest a targeted \`/compact\` before continuing.
- Between unrelated tasks: \`/clear\`. During a long drifting task: \`/compact "keep X"\`.`,
    },
    defaultForProfiles: ["dev", "audit", "business", "data-ml", "power-platform", "agents", "infra", "generic"],
    source: SOURCES.contextWindow,
  },
  {
    id: "memory-hygiene",
    core0: false,
    kind: "core",
    label: { fr: "Hygiène des fichiers mémoire", en: "Memory file hygiene" },
    summary: {
      fr: "MEMORY.md concis, horodatage absolu, éléments clés.",
      en: "Concise MEMORY.md, absolute timestamps, key facts.",
    },
    title: { fr: "Hygiène des fichiers mémoire", en: "Memory file hygiene" },
    body: {
      fr: `- MEMORY.md (auto-mémoire) : seules les 200 premières lignes ou 25 Ko sont chargées à chaque session ; au-delà, non chargé. Le garder comme INDEX concis et déporter le détail vers des fichiers thématiques (\`<sujet>.md\`).
- CLAUDE.md : viser moins de 200 lignes (au-delà, moins d'adhérence). Déporter le procédural vers \`rules/\` (path-scoped) ou des skills.
- Horodater chaque entrée en ABSOLU, jamais en relatif ("hier", "la semaine dernière") : une session future ne peut pas résoudre une référence relative.
- Ne garder que les éléments CLES et non évidents (utiles à une session future). Un fait = une entrée concise ; supprimer ce qui est obsolète.`,
      en: `- MEMORY.md (auto memory): only the first 200 lines or 25 KB are loaded each session; beyond that, not loaded. Keep it a concise INDEX and move detail into topic files (\`<topic>.md\`).
- CLAUDE.md: target under 200 lines (beyond that, lower adherence). Move procedural content into \`rules/\` (path-scoped) or skills.
- Timestamp every entry in ABSOLUTE form, never relative ("yesterday", "last week"): a future session cannot resolve a relative reference.
- Keep only KEY, non-obvious facts (useful to a future session). One fact = one concise entry; delete what is stale.`,
    },
    defaultForProfiles: [
      "dev",
      "audit",
      "business",
      "data-ml",
      "power-platform",
      "agents",
      "infra",
      "generic",
    ],
    source: SOURCES.memory,
  },
  {
    id: "tests-required",
    core0: false,
    kind: "core",
    label: { fr: "Tests obligatoires", en: "Tests required" },
    summary: {
      fr: "Bug = test qui échoue avant le fix.",
      en: "Bug = a failing test before the fix.",
    },
    title: { fr: "Tests obligatoires", en: "Tests required" },
    body: {
      fr: `- Tout correctif de bug commence par un test qui échoue AVANT le fix.
- Minimum par fonctionnalité : happy path + cas d'erreur + edge case.
- Les tests passent avant de considérer la tâche terminée.`,
      en: `- Every bug fix starts with a test that fails BEFORE the fix.
- Minimum per feature: happy path + error case + edge case.
- Tests pass before a task is considered done.`,
    },
    defaultForProfiles: ["dev", "data-ml", "agents"],
    source: SOURCES.bestPractices,
  },
  {
    id: "research-before-code",
    core0: false,
    kind: "core",
    label: { fr: "Recherche avant code", en: "Research before code" },
    summary: {
      fr: "Vérifier la doc/MCP avant de toucher une API versionnée.",
      en: "Check docs/MCP before touching a versioned API.",
    },
    title: { fr: "Recherche avant code", en: "Research before code" },
    body: {
      fr: `- Nouveau framework / lib / version : vérifier la doc officielle (ou un MCP de doc type context7) AVANT d'écrire le code qui touche son API.
- Ne pas supposer une API ou un comportement de version : vérifier les breaking changes récents.`,
      en: `- New framework / lib / version: check the official docs (or a docs MCP like context7) BEFORE writing code that touches its API.
- Do not assume an API or a version behaviour: verify recent breaking changes.`,
    },
    defaultForProfiles: ["dev", "agents"],
    source: SOURCES.mcp,
  },
  {
    id: "git-conventions",
    core0: false,
    kind: "core",
    label: { fr: "Conventions Git", en: "Git conventions" },
    summary: {
      fr: "Commits atomiques, lint+typecheck avant commit.",
      en: "Atomic commits, lint+typecheck before commit.",
    },
    title: { fr: "Git", en: "Git" },
    body: {
      fr: `- Commits atomiques : 1 commit = 1 changement logique. Convention : \`feat\` / \`fix\` / \`refactor\` / \`test\` / \`docs\` / \`chore\`.
- Lint + type-check + tests passent avant commit.
- Ne jamais committer : secrets (\`.env\`), \`node_modules\`, artefacts de build, données utilisateur.`,
      en: `- Atomic commits: 1 commit = 1 logical change. Convention: \`feat\` / \`fix\` / \`refactor\` / \`test\` / \`docs\` / \`chore\`.
- Lint + type-check + tests pass before commit.
- Never commit: secrets (\`.env\`), \`node_modules\`, build artifacts, user data.`,
    },
    defaultForProfiles: ["dev", "data-ml", "agents", "infra"],
    source: SOURCES.bestPractices,
  },
  {
    id: "kiss-architecture",
    core0: false,
    kind: "core",
    label: { fr: "Architecture KISS", en: "KISS architecture" },
    summary: {
      fr: "La solution la plus simple qui marche.",
      en: "The simplest solution that works.",
    },
    title: { fr: "Architecture", en: "Architecture" },
    body: {
      fr: `- Séparation des responsabilités : UI / logique métier / accès données.
- KISS : la solution la plus simple qui fonctionne. Pas de sur-abstraction prématurée.
- Fichier > 300 lignes -> découper. Fonction > 50 lignes -> refactorer.`,
      en: `- Separation of concerns: UI / business logic / data access.
- KISS: the simplest solution that works. No premature over-abstraction.
- File > 300 lines -> split. Function > 50 lines -> refactor.`,
    },
    defaultForProfiles: ["dev", "agents"],
    source: SOURCES.bestPractices,
  },
  {
    id: "owasp-security",
    core0: false,
    kind: "scoped",
    scopedPaths: [
      "**/*.ts",
      "**/*.tsx",
      "**/*.js",
      "**/*.jsx",
      "**/*.astro",
      "**/*.php",
      "**/api/**",
      "**/route.ts",
    ],
    label: { fr: "Sécurité OWASP (web)", en: "OWASP security (web)" },
    summary: {
      fr: "Chargé uniquement sur les fichiers web (path-scoped).",
      en: "Loaded only on web files (path-scoped).",
    },
    title: { fr: "Sécurité OWASP", en: "OWASP security" },
    body: {
      fr: `- Injection : inputs validés (Zod ou équivalent), requêtes ORM paramétrées.
- Auth : session vérifiée sur chaque endpoint protégé ; vérification rôle + propriété de la ressource.
- Données : ne jamais retourner password, tokens, secrets. XSS : sanitize le contenu user-generated. CSRF : cookies SameSite + vérification Origin.
- SSRF : whitelister les URLs de tout fetch externe. Rate limit sur les endpoints sensibles.
- Secrets : tout dans \`.env\`, jamais dans le code. \`npm audit\` régulier.`,
      en: `- Injection: validated inputs (Zod or equivalent), parameterized ORM queries.
- Auth: session verified on every protected endpoint; role + resource-ownership check.
- Data: never return password, tokens, secrets. XSS: sanitize user-generated content. CSRF: SameSite cookies + Origin check.
- SSRF: whitelist URLs for any external fetch. Rate limit on sensitive endpoints.
- Secrets: all in \`.env\`, never in code. Regular \`npm audit\`.`,
    },
    defaultForProfiles: ["dev"],
    source: SOURCES.bestPractices,
  },
  {
    id: "reproducibility",
    core0: false,
    kind: "core",
    label: { fr: "Reproductibilité (data/ML)", en: "Reproducibility (data/ML)" },
    summary: {
      fr: "Seed fixe, env isolé, datasets hors git.",
      en: "Fixed seed, isolated env, datasets out of git.",
    },
    title: { fr: "Reproductibilité (data / ML)", en: "Reproducibility (data / ML)" },
    body: {
      fr: `- Seed fixe pour toute expérience aléatoire. Versionner données, paramètres et métriques.
- Environnement isolé (uv / venv / conda). Ne pas committer les datasets : \`gitignore data/\`.`,
      en: `- Fixed seed for any random experiment. Version data, parameters and metrics.
- Isolated environment (uv / venv / conda). Do not commit datasets: \`gitignore data/\`.`,
    },
    defaultForProfiles: ["data-ml"],
    source: SOURCES.bestPractices,
  },
  {
    id: "idempotence",
    core0: false,
    kind: "core",
    label: { fr: "Idempotence (infra)", en: "Idempotence (infra)" },
    summary: {
      fr: "Scripts rejouables, destructif derrière flag.",
      en: "Replayable scripts, destructive behind a flag.",
    },
    title: { fr: "Idempotence (infra / scripts)", en: "Idempotence (infra / scripts)" },
    body: {
      fr: `- Tout script de provisioning / déploiement est rejouable sans effet de bord : vérifier l'état avant d'agir.
- Opérations destructives derrière un flag explicite + confirmation.`,
      en: `- Every provisioning / deployment script is replayable without side effects: check state before acting.
- Destructive operations behind an explicit flag + confirmation.`,
    },
    defaultForProfiles: ["infra"],
    source: SOURCES.bestPractices,
  },
  {
    id: "osi-licenses",
    core0: false,
    kind: "core",
    label: { fr: "Licences OSI uniquement", en: "OSI licenses only" },
    summary: {
      fr: "Vérifier la licence avant tout ajout de dep.",
      en: "Check the license before adding any dep.",
    },
    title: { fr: "Licences", en: "Licenses" },
    body: {
      fr: `- N'intégrer que des dépendances sous licence OSI (MIT / Apache-2.0 / BSD). Vérifier la licence avant tout ajout.
- Signaler toute licence restrictive (copyleft fort, non-commercial) AVANT intégration.`,
      en: `- Only integrate dependencies under an OSI license (MIT / Apache-2.0 / BSD). Check the license before any addition.
- Flag any restrictive license (strong copyleft, non-commercial) BEFORE integration.`,
    },
    defaultForProfiles: ["agents"],
    source: SOURCES.bestPractices,
  },
  {
    id: "secret-safety",
    core0: false,
    kind: "core",
    label: { fr: "Gestion des secrets", en: "Secret safety" },
    summary: {
      fr: "Rien dans le code, .env.example sans valeur.",
      en: "Nothing in code, .env.example without values.",
    },
    title: { fr: "Secrets", en: "Secrets" },
    body: {
      fr: `- Aucun secret dans le code ni les commits. Tout en variables d'environnement, documenté dans \`.env.example\` sans valeur réelle.
- Ne jamais logger un token, mot de passe ou clé. Rédaction des sorties sensibles.`,
      en: `- No secret in code or commits. Everything in environment variables, documented in \`.env.example\` without real values.
- Never log a token, password or key. Redact sensitive output.`,
    },
    defaultForProfiles: ["infra", "agents"],
    source: SOURCES.bestPractices,
  },
  {
    id: "audit-readonly",
    core0: false,
    kind: "core",
    label: { fr: "Posture audit (lecture seule)", en: "Audit posture (read-only)" },
    summary: {
      fr: "Lecture par défaut, modif sur GO, livrable = rapport.",
      en: "Read by default, change on GO, deliverable = report.",
    },
    title: { fr: "Posture audit (lecture seule par défaut)", en: "Audit posture (read-only by default)" },
    body: {
      fr: `- Par défaut : lecture et analyse uniquement. Toute modification de fichier ou commande mutative exige un GO explicite de l'utilisateur.
- Livrable = rapport de findings priorisés (sévérité + emplacement + correction proposée), pas des changements silencieux.
- Ne jamais "corriger en passant" : séparer le constat de la remédiation.`,
      en: `- By default: read and analyze only. Any file modification or mutating command requires an explicit GO from the user.
- Deliverable = prioritized findings report (severity + location + proposed fix), not silent changes.
- Never "fix in passing": separate the finding from the remediation.`,
    },
    defaultForProfiles: ["audit"],
    source: SOURCES.permissions,
  },
];

export function ruleById(id: RuleId): RuleModule {
  const found = RULE_MODULES.find((r) => r.id === id);
  if (!found) {
    throw new Error(`Module de règle inconnu: ${id}`);
  }
  return found;
}

/** Détail "en savoir plus" par règle (à quoi elle sert, ce qu'elle fait). */
export const RULE_DETAILS: Record<RuleId, Localized> = {
  "zero-improvisation": {
    fr: "Force à vérifier chaque affirmation technique sur une source (doc officielle, code, base de connaissances) avant de répondre. Réduit fortement les hallucinations et les fausses pistes.",
    en: "Forces verifying each technical claim against a source (official docs, code, knowledge base) before answering. Strongly reduces hallucinations and dead ends.",
  },
  "anti-vibe-coding": {
    fr: "Interdit le code non terminé : stubs, TODO, valeurs placeholder, mocks non documentés, imports de packages absents. Garantit un livrable réellement fonctionnel.",
    en: "Forbids unfinished code: stubs, TODOs, placeholder returns, undocumented mocks, imports of missing packages. Guarantees a truly working deliverable.",
  },
  "end-to-end": {
    fr: "Impose que chaque feature soit complète : implémentation + tests + vérification d'exécution. Pas de demi-livraison silencieuse.",
    en: "Requires every feature to be complete: implementation + tests + run verification. No silent half-delivery.",
  },
  "factual-no-flattery": {
    fr: "Réponses qui commencent par l'information ou la correction, sans validation gratuite. Dire quand une direction est fausse, avec la raison.",
    en: "Answers that start with the information or correction, no free validation. Say when a direction is wrong, with the reason.",
  },
  "green-flag": {
    fr: "Ajoute un préfixe d'en-tête daté au début de chaque réponse. Sa présence atteste un contexte sain ; sa disparition signale un contexte dégradé (repartir sur une session fraîche). En-tête informatif, pas une validation, donc compatible avec la règle factuelle. Le nom utilise le champ Auteur s'il est renseigné.",
    en: "Adds a dated header prefix at the start of each reply. Its presence attests a healthy context; its disappearance signals a degraded context (start a fresh session). Informational header, not a validation, so compatible with the factual rule. The name uses the Author field if set.",
  },
  "context-alert": {
    fr: "Surveille la fenêtre de contexte et propose un /compact ciblé ou un /clear avant saturation, pour éviter la perte de qualité sur les sessions longues.",
    en: "Watches the context window and suggests a targeted /compact or /clear before saturation, to avoid quality loss on long sessions.",
  },
  "memory-hygiene": {
    fr: "Garde les fichiers mémoire efficaces : MEMORY.md reste un index concis (seules les 200 premières lignes ou 25 Ko sont chargées par session, le reste va dans des fichiers thématiques), horodatage ABSOLU jamais relatif (une session future ne peut pas résoudre \"hier\"), et uniquement les faits clés et non évidents. Chiffres issus de la doc officielle memory (code.claude.com/docs/en/memory).",
    en: "Keeps memory files effective: MEMORY.md stays a concise index (only the first 200 lines or 25 KB are loaded per session, the rest goes into topic files), ABSOLUTE timestamps never relative (a future session cannot resolve \"yesterday\"), and only key non-obvious facts. Numbers from the official memory docs (code.claude.com/docs/en/memory).",
  },
  "tests-required": {
    fr: "Tout bug commence par un test qui échoue ; chaque feature couvre happy path + cas d'erreur + edge cases avant d'être considérée terminée.",
    en: "Every bug starts with a failing test; each feature covers happy path + error cases + edge cases before being considered done.",
  },
  "research-before-code": {
    fr: "Vérifie la doc officielle (ou un MCP de doc type context7) avant d'écrire du code touchant une API versionnée. Évite les breaking changes silencieux entre versions.",
    en: "Checks official docs (or a docs MCP like context7) before writing code that touches a versioned API. Avoids silent breaking changes between versions.",
  },
  "git-conventions": {
    fr: "Commits atomiques conventionnels (feat/fix/...), lint + type-check + tests verts avant commit, jamais de secrets ni d'artefacts committés.",
    en: "Conventional atomic commits (feat/fix/...), lint + type-check + tests green before commit, never commit secrets or artifacts.",
  },
  "kiss-architecture": {
    fr: "La solution la plus simple qui fonctionne, séparation des responsabilités, découpe au-delà d'un seuil de taille. Pas de sur-abstraction prématurée.",
    en: "The simplest solution that works, separation of concerns, split beyond a size threshold. No premature over-abstraction.",
  },
  "owasp-security": {
    fr: "Checklist OWASP (injection, auth, XSS, CSRF, SSRF, secrets, rate limit) appliquée sur les fichiers web. Chargée en path-scoped pour ne pas polluer les projets non-web.",
    en: "OWASP checklist (injection, auth, XSS, CSRF, SSRF, secrets, rate limit) applied to web files. Path-scoped so it doesn't pollute non-web projects.",
  },
  reproducibility: {
    fr: "Seed fixe, environnement isolé, datasets hors git : les expériences sont rejouables à l'identique.",
    en: "Fixed seed, isolated environment, datasets out of git: experiments are reproducible identically.",
  },
  idempotence: {
    fr: "Les scripts d'infra/déploiement sont rejouables sans effet de bord ; toute opération destructive est derrière un flag explicite.",
    en: "Infra/deployment scripts are replayable without side effects; any destructive operation is behind an explicit flag.",
  },
  "osi-licenses": {
    fr: "Seules les dépendances sous licence OSI (MIT / Apache-2.0 / BSD) sont intégrées ; les licences restrictives sont signalées AVANT tout ajout.",
    en: "Only OSI-licensed dependencies (MIT / Apache-2.0 / BSD) are integrated; restrictive licenses are flagged BEFORE any addition.",
  },
  "secret-safety": {
    fr: "Aucun secret dans le code ; tout en variables d'environnement documentées dans .env.example sans valeur réelle. Jamais de token loggé.",
    en: "No secret in code; everything in environment variables documented in .env.example without real values. Never log a token.",
  },
  "audit-readonly": {
    fr: "Posture lecture seule : analyse et rapport de findings priorisés, aucune modification de fichier sans GO explicite de l'utilisateur.",
    en: "Read-only posture: analysis and prioritized findings report, no file modification without an explicit user GO.",
  },
};

/** Paramètres configurables par règle (sous-ensemble ; les autres règles n'ont pas d'option). */
export const RULE_OPTIONS: Partial<Record<RuleId, RuleOption[]>> = {
  "green-flag": [
    {
      id: "icon",
      type: "select",
      default: "check",
      label: { fr: "Icône de tête", en: "Leading icon" },
      hint: {
        fr: "Icône placée en tête de l'en-tête, pour le repérer d'un coup d'oeil.",
        en: "Icon placed at the start of the header, to spot it at a glance.",
      },
      choices: [
        { value: "check", label: { fr: "✅ Coche verte", en: "✅ Green check" } },
        { value: "dot", label: { fr: "🟢 Rond vert", en: "🟢 Green dot" } },
        { value: "arrow", label: { fr: "▶ Flèche", en: "▶ Arrow" } },
        { value: "star", label: { fr: "⭐ Étoile", en: "⭐ Star" } },
        { value: "none", label: { fr: "(aucune)", en: "(none)" } },
      ],
    },
    {
      id: "headerText",
      type: "text",
      default: "{name} - {date} :",
      label: { fr: "Gabarit de l'en-tête", en: "Header template" },
      hint: {
        fr: "Variables : {name} (auteur), {project} (dossier), {date} et {time} (remplis a l'execution).",
        en: "Variables: {name} (author), {project} (folder), {date} and {time} (filled at runtime).",
      },
    },
  ],
  "zero-improvisation": [
    {
      id: "uncertainty",
      type: "select",
      default: "standard",
      rigorDefault: { strict: "strict" },
      label: { fr: "Gestion de l'incertitude", en: "Uncertainty handling" },
      choices: [
        {
          value: "strict",
          label: { fr: "Stricte", en: "Strict" },
          line: {
            fr: "- Aucune hypothèse : si aucune source fiable, dire \"je n'ai pas trouvé de source\" et s'arrêter.",
            en: "- No hypothesis: if no reliable source, say \"I found no source\" and stop.",
          },
        },
        {
          value: "standard",
          label: { fr: "Standard", en: "Standard" },
          line: {
            fr: "- Hypothèse autorisée uniquement si clairement étiquetée comme telle.",
            en: "- Hypothesis allowed only if clearly labeled as such.",
          },
        },
      ],
    },
    {
      id: "requireUrl",
      type: "toggle",
      default: true,
      rigorDefault: { light: false },
      label: { fr: "Exiger l'URL exacte de la source", en: "Require the exact source URL" },
      lineOn: {
        fr: "- Citer l'URL exacte de la source pour toute affirmation issue d'une recherche.",
        en: "- Cite the exact source URL for any claim coming from a search.",
      },
    },
  ],
  "context-alert": [
    {
      id: "threshold",
      type: "number",
      default: 90,
      rigorDefault: { strict: 85, light: 95 },
      unit: { fr: "%", en: "%" },
      min: 50,
      max: 95,
      step: 5,
      label: { fr: "Seuil d'alerte", en: "Alert threshold" },
      lineOn: {
        fr: "- Alerter dès que la fenêtre de contexte atteint ~{value}{unit} d'occupation.",
        en: "- Alert as soon as the context window reaches ~{value}{unit} usage.",
      },
    },
  ],
  "memory-hygiene": [
    {
      id: "datetime",
      type: "toggle",
      default: true,
      label: { fr: "Horodatage avec l'heure (pas seulement la date)", en: "Timestamp with time (not just the date)" },
      lineOn: {
        fr: "- Horodatage complet : date + heure (ex 2026-07-01 14:30), pour tracer l'ordre des événements.",
        en: "- Full timestamp: date + time (e.g. 2026-07-01 14:30), to trace the order of events.",
      },
      lineOff: {
        fr: "- Horodatage à la date seule (ex 2026-07-01).",
        en: "- Date-only timestamp (e.g. 2026-07-01).",
      },
    },
  ],
  "tests-required": [
    {
      id: "tddStrict",
      type: "toggle",
      default: true,
      rigorDefault: { light: false },
      label: { fr: "TDD strict (test rouge avant le fix)", en: "Strict TDD (red test before fix)" },
      lineOn: {
        fr: "- TDD strict : écrire le test qui échoue AVANT le code de correction.",
        en: "- Strict TDD: write the failing test BEFORE the fix code.",
      },
      lineOff: {
        fr: "- Tests après implémentation acceptés (pas de TDD imposé).",
        en: "- Tests after implementation accepted (no enforced TDD).",
      },
    },
    {
      id: "coverage",
      type: "select",
      default: "edge",
      rigorDefault: { light: "happy" },
      label: { fr: "Couverture minimale", en: "Minimum coverage" },
      choices: [
        { value: "happy", label: { fr: "Happy path", en: "Happy path" }, line: { fr: "- Couverture minimale : happy path.", en: "- Minimum coverage: happy path." } },
        { value: "errors", label: { fr: "+ cas d'erreur", en: "+ error cases" }, line: { fr: "- Couverture : happy path + cas d'erreur.", en: "- Coverage: happy path + error cases." } },
        { value: "edge", label: { fr: "+ edge cases", en: "+ edge cases" }, line: { fr: "- Couverture : happy path + cas d'erreur + edge cases.", en: "- Coverage: happy path + error cases + edge cases." } },
      ],
    },
  ],
  "anti-vibe-coding": [
    {
      id: "noPlaceholder",
      type: "toggle",
      default: true,
      rigorDefault: { light: false },
      label: { fr: "Interdire tout retour placeholder", en: "Forbid any placeholder return" },
      lineOn: {
        fr: "- Aucun retour placeholder (null, {} vide) non justifié ; signaler tout élément incomplet.",
        en: "- No unjustified placeholder return (null, empty {}); flag any incomplete element.",
      },
    },
  ],
  "audit-readonly": [
    {
      id: "mode",
      type: "select",
      default: "strict",
      label: { fr: "Niveau de la posture", en: "Posture level" },
      choices: [
        {
          value: "strict",
          label: { fr: "Strict (aucune modif)", en: "Strict (no change)" },
          line: { fr: "- Mode strict : aucune modification de fichier, même avec GO ; uniquement un rapport.", en: "- Strict mode: no file modification, even with a GO; report only." },
        },
        {
          value: "onGo",
          label: { fr: "Modif sur GO explicite", en: "Change on explicit GO" },
          line: { fr: "- Modification autorisée uniquement après GO explicite, fichier par fichier.", en: "- Modification allowed only after an explicit GO, file by file." },
        },
      ],
    },
  ],
};

export function ruleDetail(id: RuleId): Localized {
  return RULE_DETAILS[id];
}

export function ruleOptionsFor(id: RuleId): RuleOption[] {
  return RULE_OPTIONS[id] ?? [];
}
