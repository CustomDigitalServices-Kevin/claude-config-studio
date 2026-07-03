import type { Localized } from "../types";

/**
 * Contenus "en savoir plus" des sections Préférences et Settings.
 * Règle (advisor) : chaque texte va PLUS LOIN que le hint de la SectionLabel en nommant
 * l'effet concret sur les fichiers générés. Prose FR accentuée (orthographe complète, cf skills/agents).
 */
export const FIELD_HELP: Record<string, Localized> = {
  language: {
    fr: "Pilote la langue de TOUTE la prose des fichiers générés : la posture (\"Répondre en français\" vs \"Respond in English\"), les 16 garde-fous, la section Stack, les Notes, INSTALL.md, README.md et TOOLS.md. C'est la langue de sortie du .claude. Indépendant du bouton FR/EN en haut à droite, qui ne change que l'affichage des catalogues de cette app.",
    en: "Drives the language of ALL generated prose: posture (\"Respond in English\" vs \"Repondre en francais\"), the 16 guardrails, the Stack section, Notes, INSTALL.md, README.md and TOOLS.md. This is the .claude output language. Independent of the FR/EN switch top-right, which only changes this app's catalog display.",
  },
  rigor: {
    fr: "Macro qui pré-règle les paramètres des Garde-fous. strict : incertitude stricte (s'arrêter sans source), seuil d'alerte contexte à 85%. standard : les défauts actuels (aucun changement). light : URL de source non exigée, TDD non imposé, couverture happy path, retour placeholder toléré, seuil à 95%. Un réglage manuel d'un paramètre dans les Garde-fous PRIME toujours sur la macro. Apparaît aussi comme ligne dans README.md.",
    en: "Macro that pre-sets the Guardrails parameters. strict: strict uncertainty (stop without a source), context alert threshold at 85%. standard: current defaults (no change). light: source URL not required, TDD not enforced, happy-path coverage, placeholder returns tolerated, threshold at 95%. A manual parameter set in Guardrails ALWAYS overrides the macro. Also shown as a line in README.md.",
  },
  stack: {
    fr: "Chaque stack cochée agit sur 3 fichiers : (1) settings.json ajoute les permissions.allow Bash (ex npm/npx/vitest pour Web/TS, pytest/ruff pour Python) ; (2) CLAUDE.md section Stack reçoit une ligne par stack + la liste des libs à vérifier via context7 SI la règle \"Recherche avant code\" est cochée ; (3) la règle \"Tests obligatoires\" hérite du framework de test de la stack (Vitest, pytest, cargo test, go test).",
    en: "Each selected stack affects 3 files: (1) settings.json adds the Bash permissions.allow (e.g. npm/npx/vitest for Web/TS, pytest/ruff for Python); (2) CLAUDE.md Stack section gets one line per stack + the libs to verify via context7 IF the \"Research before code\" rule is checked; (3) the \"Tests required\" rule inherits the stack's test framework (Vitest, pytest, cargo test, go test).",
  },
  settingsModel: {
    fr: "Écrit la clé \"model\" dans settings.json (alias opus/sonnet/haiku, plus durable qu'un ID daté). Sur \"Par défaut\" la clé n'est pas écrite : Claude Code garde le modèle courant de la session. Le schéma officiel accepte l'alias comme l'ID complet ; on préfère l'alias.",
    en: "Writes the \"model\" key in settings.json (alias opus/sonnet/haiku, more durable than a dated ID). On \"Default\" the key is omitted: Claude Code keeps the session's current model. The official schema accepts alias or full ID; we prefer the alias.",
  },
  settingsPermissionMode: {
    fr: "Écrit \"permissions.defaultMode\" dans settings.json. plan = lecture seule stricte (aucune édition ni commande sans plan approuvé) ; acceptEdits = accepte automatiquement les éditions de fichiers ; default = demande à la première utilisation. Capé aux 3 valeurs sûres (jamais bypassPermissions ni acceptAll).",
    en: "Writes \"permissions.defaultMode\" in settings.json. plan = strict read-only (no edit or command without an approved plan); acceptEdits = auto-accepts file edits; default = asks on first use. Capped to these 3 safe values (never bypassPermissions or acceptAll).",
  },
  settingsOutputStyle: {
    fr: "Écrit la clé \"outputStyle\". Explanatory = Claude ajoute des explications pédagogiques sur ses choix ; Learning = mode collaboratif avec des exercices. \"Par défaut\" n'écrit pas la clé. À ne pas confondre avec le champ \"Style de réponses\" de l'Identité, qui produit une directive de ton/longueur en prose dans le CLAUDE.md (pas une clé settings).",
    en: "Writes the \"outputStyle\" key. Explanatory = Claude adds teaching explanations for its choices; Learning = collaborative mode with exercises. \"Default\" omits the key. Not to be confused with the \"Response style\" field in Identity, which produces a prose tone/length directive in CLAUDE.md (not a settings key).",
  },
  settingsAutoMemory: {
    fr: "Mémoire automatique inter-sessions de Claude Code (activée par défaut). La désactiver écrit \"autoMemoryEnabled\": false dans settings.json. Activée = la clé n'est pas écrite (on respecte le défaut, fichier minimal).",
    en: "Claude Code's automatic cross-session memory (on by default). Turning it off writes \"autoMemoryEnabled\": false in settings.json. On = the key is omitted (default respected, minimal file).",
  },
};
