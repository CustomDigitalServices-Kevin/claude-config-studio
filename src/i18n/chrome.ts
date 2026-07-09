import type { Language, Localized } from "../types";

/**
 * Dictionnaire du CHROME de l'interface (labels, titres, encarts, boutons).
 *
 * Distinction d'architecture (decision lead, validee advisor) :
 *  - le toggle FR/EN du header (App, useState) pilote TOUT le chrome via ce dictionnaire ;
 *  - `answers.language` reste EXCLUSIVEMENT la langue de la sortie generee (fichiers .claude).
 *
 * Chaque feuille est un `Localized` ({ fr, en }). `pick(x, lang)` enforce les deux cles.
 */
type LocalizedTree = { [k: string]: Localized | LocalizedTree };

export const CHROME = {
  common: {
    learnMore: { fr: "En savoir plus", en: "Learn more" },
    hide: { fr: "Masquer", en: "Hide" },
    required: { fr: "Requis", en: "Required" },
    optional: { fr: "Optionnel", en: "Optional" },
    selected: { fr: "sélectionné(s)", en: "selected" },
    official: { fr: "officiel", en: "official" },
  },
  sections: {
    identity: {
      label: { fr: "Identité", en: "Identity" },
      title: { fr: "Identité du projet", en: "Project identity" },
      subtitle: {
        fr: "Les informations de base de votre projet.",
        en: "The basic information about your project.",
      },
    },
    profiles: {
      label: { fr: "Profils & structure", en: "Profiles & structure" },
      title: { fr: "Profils & structure", en: "Profiles & structure" },
      subtitle: {
        fr: "Choisissez les usages, la profondeur de l'arborescence et les secteurs.",
        en: "Choose the usages, the tree depth and the sectors.",
      },
    },
    preferences: {
      label: { fr: "Langue, rigueur & stack", en: "Language, rigor & stack" },
      title: { fr: "Langue, rigueur & stack", en: "Language, rigor & stack" },
      subtitle: {
        fr: "Langue des fichiers, niveau d'exigence et technologies.",
        en: "Files language, strictness level and technologies.",
      },
    },
    guardrails: {
      label: { fr: "Garde-fous", en: "Guardrails" },
      title: { fr: "Garde-fous (règles 0)", en: "Guardrails (rule zero)" },
      subtitle: {
        fr: "Les non-négociables. Chaque règle a un détail et des paramètres ajustables.",
        en: "The non-negotiables. Each rule has a detail and adjustable parameters.",
      },
    },
    hooks: {
      label: { fr: "Hooks", en: "Hooks" },
      title: { fr: "Hooks (opt-in)", en: "Hooks (opt-in)" },
      subtitle: {
        fr: "Sensibles à l'OS et au shell. Limités aux hooks cross-platform sûrs.",
        en: "OS- and shell-sensitive. Limited to safe cross-platform hooks.",
      },
    },
    tools: {
      label: { fr: "Outils tiers", en: "Third-party tools" },
      title: { fr: "Outils tiers à connecter", en: "Third-party tools to connect" },
      subtitle: {
        fr: "Boostez Claude Code. Le détail de chaque outil va dans TOOLS.md ; les serveurs MCP ont leur onglet dédié.",
        en: "Boost Claude Code. Each tool's detail goes into TOOLS.md; MCP servers have their own tab.",
      },
    },
    skills: {
      label: { fr: "Skills", en: "Skills" },
      title: { fr: "Skills à installer", en: "Skills to install" },
      subtitle: {
        fr: "Catalogue sourcé. La sélection ajoute la commande d'install dans INSTALL.md, sans générer de fichier.",
        en: "Sourced catalog. Selecting one adds the install command to INSTALL.md, without generating a file.",
      },
    },
    agents: {
      label: { fr: "Agents", en: "Agents" },
      title: { fr: "Agents à installer", en: "Agents to install" },
      subtitle: {
        fr: "Catalogue sourcé de subagents. La sélection ajoute la commande d'install dans INSTALL.md, sans générer de fichier d'agent.",
        en: "Sourced subagent catalog. Selecting one adds the install command to INSTALL.md, without generating an agent file.",
      },
    },
    workflow: {
      label: { fr: "Workflow", en: "Workflow" },
      title: { fr: "Workflow (posture de travail)", en: "Workflow (working posture)" },
      subtitle: {
        fr: "Comportement par défaut face à une demande, sous-agent advisor et orchestration.",
        en: "Default behavior facing a request, advisor subagent and orchestration.",
      },
    },
    settings: {
      label: { fr: "Settings avancés", en: "Advanced settings" },
      title: { fr: "Settings avancés (settings.json)", en: "Advanced settings (settings.json)" },
      subtitle: {
        fr: "Réglages écrits dans settings.json, validés contre le schema officiel.",
        en: "Settings written to settings.json, validated against the official schema.",
      },
    },
  },
  preview: {
    files: { fr: "fichiers", en: "files" },
    download: { fr: "Télécharger le .zip", en: "Download the .zip" },
    generating: { fr: "Génération...", en: "Generating..." },
    lines: { fr: "lignes", en: "lines" },
    errorTitle: { fr: "Erreur interne du générateur", en: "Internal generator error" },
    errorBody: {
      fr: "Une erreur interne du générateur s'est produite. La preview et le téléchargement sont indisponibles jusqu'à correction.",
      en: "An internal generator error occurred. The preview and download are unavailable until it is fixed.",
    },
    errorDetails: { fr: "Détail technique", en: "Technical details" },
  },
  studio: {
    import: { fr: "Importer", en: "Import" },
    copyLink: { fr: "Copier le lien", en: "Copy link" },
    linkCopied: { fr: "Lien copié", en: "Link copied" },
    reset: { fr: "Réinitialiser", en: "Reset" },
    resetConfirm: {
      fr: "Réinitialiser toutes les réponses ? Cette action est irréversible.",
      en: "Reset all answers? This action cannot be undone.",
    },
    importInvalid: { fr: "Import invalide", en: "Invalid import" },
  },
  identity: {
    projectName: { fr: "Nom du dossier de travail", en: "Working folder name" },
    projectNamePlaceholder: { fr: "mon-dossier", en: "my-folder" },
    projectHint: {
      fr: "Le nom du dossier de travail (celui qui contient le dossier .claude). Sert d'identité projet dans les fichiers générés.",
      en: "The name of the working folder (the one containing the .claude folder). Used as project identity in generated files.",
    },
    author: { fr: "Auteur", en: "Author" },
    authorPlaceholder: { fr: "Votre nom", en: "Your name" },
    org: { fr: "Organisation", en: "Organization" },
    orgPlaceholder: { fr: "Votre organisation", en: "Your organization" },
    advanced: { fr: "Options avancées", en: "Advanced options" },
    role: { fr: "Rôle / métier", en: "Role / job" },
    rolePlaceholder: { fr: "Ex : Freelance, Data engineer", en: "E.g. Freelance, Data engineer" },
    companyId: { fr: "Numéro d'entreprise", en: "Company number" },
    companyIdPlaceholder: { fr: "SIREN, TVA, EIN...", en: "Reg. no, VAT, EIN..." },
    styleTitle: { fr: "Style de réponses", en: "Response style" },
    styleHint: {
      fr: "Ton et longueur, injecté dans la posture du CLAUDE.md. Distinct du « Style de sortie » des Settings (Explanatory/Learning).",
      en: 'Tone and length, injected into the CLAUDE.md posture. Distinct from the Settings "Output style" (Explanatory/Learning).',
    },
    styleDefault: { fr: "Par défaut", en: "Default" },
    styleDefaultSub: { fr: "Aucune directive de ton", en: "No tone directive" },
    styleConcise: { fr: "Concis", en: "Concise" },
    styleConciseSub: { fr: "Court et direct", en: "Short and direct" },
    styleDetailed: { fr: "Détaillé", en: "Detailed" },
    styleDetailedSub: { fr: "Explique le raisonnement", en: "Explains the reasoning" },
  },
  profiles: {
    profilesTitle: { fr: "Profils d'usage", en: "Usage profiles" },
    profilesHint: {
      fr: "Choisissez un ou plusieurs profils. Les garde-fous et postures se cumulent.",
      en: "Choose one or more profiles. Guardrails and postures stack.",
    },
    depthTitle: { fr: "Profondeur", en: "Depth" },
    depthHint: {
      fr: "Jusqu'où descend l'arborescence : racine seule, + secteurs, + projets.",
      en: "How deep the tree goes: root only, + sectors, + projects.",
    },
    sectorsTitle: { fr: "Secteurs", en: "Sectors" },
    sectorsHint: {
      fr: "Un dossier .claude (Niveau 1) est généré pour chaque secteur coché.",
      en: "A .claude folder (Level 1) is generated for each checked sector.",
    },
    sectorsEmpty: {
      fr: "Aucun secteur coché : seule la racine sera générée.",
      en: "No sector checked: only the root will be generated.",
    },
    schemaTitle: { fr: "Schema", en: "Schema" },
    schemaHint: {
      fr: "Rappel visuel de ce que signifie la profondeur d'un .claude.",
      en: "Visual reminder of what a .claude's depth means.",
    },
  },
  preferences: {
    langTitle: { fr: "Langue des fichiers générés", en: "Generated files language" },
    langHint: {
      fr: "Langue de la prose dans les fichiers .claude générés. Le bouton FR/EN en haut pilote la langue de cette interface, pas celle des fichiers.",
      en: "Language of the prose in the generated .claude files. The FR/EN toggle at the top drives this interface's language, not the files'.",
    },
    langFrSub: { fr: "Fichiers générés en français", en: "Files generated in French" },
    langEnSub: { fr: "Fichiers générés en anglais", en: "Files generated in English" },
    rigorTitle: { fr: "Rigueur", en: "Rigor" },
    rigorHint: {
      fr: "Pilote les défauts des paramètres des garde-fous.",
      en: "Drives the default guardrail parameters.",
    },
    stackTitle: { fr: "Stack", en: "Stack" },
    stackHint: {
      fr: "Définit les permissions allow et les libs à vérifier (context7).",
      en: "Sets the allow permissions and the libs to verify (context7).",
    },
    rigorStrict: { fr: "Strict", en: "Strict" },
    rigorStrictSub: {
      fr: "Exigence maximale, seuils durcis",
      en: "Maximum strictness, tightened thresholds",
    },
    rigorStandard: { fr: "Standard", en: "Standard" },
    rigorStandardSub: { fr: "Équilibre par défaut", en: "Default balance" },
    rigorLight: { fr: "Light", en: "Light" },
    rigorLightSub: { fr: "Souple, contraintes relâchées", en: "Loose, relaxed constraints" },
  },
  hooks: {
    note: {
      fr: "Liste volontairement limitée à des hooks sûrs et vérifiés. Un hook shell livré à un utilisateur Windows peut casser silencieusement : le deny déclaratif des permissions couvre déjà les commandes destructrices, sans dépendance à un shell.",
      en: "Deliberately limited to safe, verified hooks. A shell hook shipped to a Windows user can break silently: the declarative permissions deny already covers destructive commands, without depending on a shell.",
    },
  },
  hierarchy: {
    eyebrow: { fr: "Arborescence · 3 niveaux de profondeur", en: "Tree · 3 depth levels" },
    title: {
      fr: "Comprendre la profondeur d'un .claude",
      en: "Understanding a .claude's depth",
    },
    intro: {
      fr: "Chaque niveau descend d'un cran : le contenant global, puis le secteur, puis le projet précis. Plus on descend, plus l'objet devient spécifique et hérite des niveaux au-dessus.",
      en: "Each level goes one step deeper: the global container, then the sector, then the specific project. The deeper you go, the more specific the object and the more it inherits from the levels above.",
    },
    rootTitle: { fr: "Configuration racine", en: "Root configuration" },
    rootDesc: {
      fr: "Le contenant global : règles transverses à tous les projets",
      en: "The global container: rules shared across all projects",
    },
    sectorDesc: {
      fr: "Un secteur : regroupe les projets du même domaine",
      en: "A sector: groups projects of the same domain",
    },
    level0: { fr: "Niveau 0", en: "Level 0" },
    level1: { fr: "Niveau 1", en: "Level 1" },
    level2: { fr: "Niveau 2", en: "Level 2" },
    legendTitle: { fr: "Le rôle de chaque niveau", en: "The role of each level" },
    legend0Title: { fr: "Niveau 0 - Racine", en: "Level 0 - Root" },
    legend0Desc: {
      fr: "Le contenant global : un seul .claude qui porte les règles transverses.",
      en: "The global container: a single .claude carrying the shared rules.",
    },
    legend1Title: { fr: "Niveau 1 - Secteur", en: "Level 1 - Sector" },
    legend1Desc: {
      fr: "Le domaine : il regroupe les projets qui se ressemblent (Web, Data...).",
      en: "The domain: it groups similar projects (Web, Data...).",
    },
    legend2Title: { fr: "Niveau 2 - Projet", en: "Level 2 - Project" },
    legend2Desc: {
      fr: "Le .claude précis d'un projet, au bout du chemin. Hérite de tout au-dessus.",
      en: "A project's specific .claude, at the end of the path. Inherits everything above.",
    },
  },
  settings: {
    intro: {
      fr: "Réglages écrits dans settings.json. Chaque clé est validée contre le schéma officiel ; une valeur laissée au défaut n'est pas écrite (fichier minimal). Visibles en direct dans l'aperçu.",
      en: "Settings written to settings.json. Each key is validated against the official schema; a value left at its default is not written (minimal file). Shown live in the preview.",
    },
    modelTitle: { fr: "Modèle principal", en: "Main model" },
    modelHint: {
      fr: "Alias écrit dans settings.json. Par défaut, Claude Code garde son modèle courant.",
      en: "Alias written to settings.json. By default, Claude Code keeps its current model.",
    },
    modelDefault: { fr: "Par défaut", en: "Default" },
    modelDefaultSub: { fr: "Modèle courant de Claude Code", en: "Claude Code's current model" },
    modelOpusSub: { fr: "Le plus capable", en: "The most capable" },
    modelSonnetSub: { fr: "Équilibre capacité/vitesse", en: "Capability/speed balance" },
    modelHaikuSub: { fr: "Le plus rapide", en: "The fastest" },
    permTitle: { fr: "Mode de permission par défaut", en: "Default permission mode" },
    permHint: {
      fr: "Limité aux valeurs sûres. plan = lecture seule ; acceptEdits = auto-accepte les éditions ; default = demande à la première utilisation.",
      en: "Limited to safe values. plan = read-only; acceptEdits = auto-accepts edits; default = asks on first use.",
    },
    permNone: { fr: "Ne pas fixer", en: "Do not set" },
    permNoneSub: { fr: "Comportement par défaut", en: "Default behavior" },
    permDefaultSub: { fr: "Demande à la 1re utilisation", en: "Asks on first use" },
    permAcceptSub: { fr: "Auto-accepte les éditions", en: "Auto-accepts edits" },
    permPlanSub: { fr: "Lecture seule stricte", en: "Strict read-only" },
    styleTitle: { fr: "Style de sortie", en: "Output style" },
    styleHint: {
      fr: "Explanatory ajoute des explications pédagogiques ; Learning propose des exercices. Par défaut, style standard.",
      en: "Explanatory adds teaching explanations; Learning offers exercises. Default is the standard style.",
    },
    styleDefault: { fr: "Par défaut", en: "Default" },
    styleDefaultSub: { fr: "Style standard", en: "Standard style" },
    styleExplanatorySub: { fr: "Explications pédagogiques", en: "Teaching explanations" },
    styleLearningSub: { fr: "Exercices proposés", en: "Offered exercises" },
    memoryTitle: { fr: "Mémoire automatique", en: "Automatic memory" },
    memoryHint: {
      fr: "Mémoire inter-sessions (activée par défaut chez Claude Code). La désactiver écrit autoMemoryEnabled:false.",
      en: "Cross-session memory (on by default in Claude Code). Turning it off writes autoMemoryEnabled:false.",
    },
    memoryOn: { fr: "Activée", en: "Enabled" },
    memoryOnSub: { fr: "Mémoire inter-sessions (défaut)", en: "Cross-session memory (default)" },
    memoryOff: { fr: "Désactivée", en: "Disabled" },
    memoryOffSub: { fr: "Écrit autoMemoryEnabled: false", en: "Writes autoMemoryEnabled: false" },
  },
  workflow: {
    intro: {
      fr: "La posture pilote le comportement de Claude Code face à une demande. L'advisor et l'orchestration génèrent des fichiers dédiés",
      en: "The posture drives Claude Code's behavior when facing a request. The advisor and orchestration generate dedicated files",
    },
    behaviorTitle: { fr: "Comportement par défaut", en: "Default behavior" },
    behaviorHint: {
      fr: "Face à une demande : agir tout de suite, chercher la doc d'abord, ou brainstormer pour qualifier avant de commencer.",
      en: "Facing a request: act right away, look up the docs first, or brainstorm to qualify before starting.",
    },
    advisorTitle: { fr: "Sous-agent advisor", en: "Advisor subagent" },
    advisorHint: {
      fr: "Génère un sous-agent de validation (go/no-go sourcé) + une directive : l'invoquer avant toute décision structurante.",
      en: "Generates a validation subagent (sourced go/no-go) + a directive: invoke it before any structuring decision.",
    },
    advisorOn: { fr: "Activé", en: "Enabled" },
    advisorOnSub: {
      fr: "Génère .claude/agents/advisor.md",
      en: "Generates .claude/agents/advisor.md",
    },
    advisorOff: { fr: "Désactivé", en: "Disabled" },
    advisorOffSub: { fr: "Aucun sous-agent généré", en: "No subagent generated" },
    advisorModelTitle: { fr: "Modèle de l'advisor", en: "Advisor model" },
    advisorModelHint: {
      fr: "Écrit dans le frontmatter de l'agent (clé model). Hériter = pas de clé, l'advisor prend le modèle courant.",
      en: "Written in the agent frontmatter (model key). Inherit = no key, the advisor takes the current model.",
    },
    orchestrationTitle: { fr: "Orchestration", en: "Orchestration" },
    orchestrationHint: {
      fr: "Génère la commande /orchestrate : décompose une tâche complexe et délègue à des sous-agents parallèles.",
      en: "Generates the /orchestrate command: decomposes a complex task and delegates to parallel subagents.",
    },
    orchestrationOn: { fr: "Activée", en: "Enabled" },
    orchestrationOnSub: {
      fr: "Génère la commande /orchestrate",
      en: "Generates the /orchestrate command",
    },
    orchestrationOff: { fr: "Désactivée", en: "Disabled" },
    orchestrationOffSub: { fr: "Pas de commande générée", en: "No command generated" },
  },
  tools: {
    memoryNoteLabel: {
      fr: "Autre base de connaissances (optionnel)",
      en: "Other knowledge base (optional)",
    },
    memoryNotePlaceholder: {
      fr: "ex : ./docs/knowledge ou chemin d'un vault",
      en: "e.g. ./docs/knowledge or a vault path",
    },
  },
  presets: {
    title: { fr: "Départ rapide", en: "Quick start" },
    subtitle: {
      fr: "Applique un preset métier cohérent. Vos champs d'identité déjà saisis sont préservés.",
      en: "Applies a coherent role preset. Your already-filled identity fields are preserved.",
    },
    applied: { fr: "Appliqué", en: "Applied" },
  },
  mcp: {
    optinTitle: { fr: "Émettre un .mcp.json (opt-in)", en: "Emit a .mcp.json (opt-in)" },
    optinBody: {
      fr: "Les serveurs cochés sont écrits dans un .mcp.json inclus au ZIP. Claude Code propose de les approuver à la première ouverture. Les serveurs nécessitant un secret restent documentés dans TOOLS.md.",
      en: "Checked servers are written to a .mcp.json included in the ZIP. Claude Code prompts to approve them at first launch. Servers needing a secret stay documented in TOOLS.md.",
    },
    add: { fr: "Ajouter au .mcp.json", en: "Add to .mcp.json" },
    selected: { fr: "sélectionné(s)", en: "selected" },
  },
} satisfies LocalizedTree;

/**
 * Formate une date ISO (AAAA-MM-JJ) sans dépendance : FR "Vérifié le JJ/MM/AAAA",
 * EN "Verified AAAA-MM-JJ". Défensif : retourne "" si l'entrée est absente ou malformée.
 */
export function formatVerified(iso: string | undefined, lang: Language): string {
  if (!iso) {
    return "";
  }
  const parts = iso.split("-");
  if (parts.length !== 3 || parts.some((p) => p.length === 0 || !/^\d+$/.test(p))) {
    return "";
  }
  const [year, month, day] = parts;
  if (lang === "fr") {
    return `Vérifié le ${day}/${month}/${year}`;
  }
  return `Verified ${year}-${month}-${day}`;
}
