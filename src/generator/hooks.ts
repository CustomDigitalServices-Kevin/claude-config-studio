import type { Answers, HookId, Language, Localized } from "../types";

export interface HookEntry {
  matcher?: string;
  hooks: Array<{ type: "command"; command: string } | { type: "prompt"; prompt: string }>;
}

export interface HookDescriptor {
  id: HookId;
  label: Localized;
  summary: Localized;
  /** Avertissement OS / shell (le piège des hooks). */
  caveat: Localized;
  /** Détail "en savoir plus" : ce que fait le hook, quand il se déclenche. */
  detail: Localized;
}

/**
 * Catalogue des hooks proposés. Tous opt-in : un hook shell livré à un user
 * sur le mauvais OS casse silencieusement (advisor). On documente le contrat.
 */
export const HOOK_DESCRIPTORS: readonly HookDescriptor[] = [
  {
    id: "session-start-reminder",
    label: { fr: "Rappel au démarrage", en: "Session start reminder" },
    summary: {
      fr: "Affiche les garde-fous à chaque ouverture de session.",
      en: "Prints the guardrails at each session start.",
    },
    caveat: {
      fr: "Simple echo. Sur cmd Windows, les guillemets peuvent s'afficher (sans danger).",
      en: "Plain echo. On Windows cmd the quotes may show (harmless).",
    },
    detail: {
      fr: "Hook SessionStart : à chaque ouverture de session, affiche un rappel des garde-fous actifs (zéro impro, anti vibe coding, factuel) dans la sortie. Sert d'amorce de contexte.",
      en: "SessionStart hook: on each session open, prints a reminder of the active guardrails (zero improv, anti vibe coding, factual) to the output. Acts as a context primer.",
    },
  },
  {
    id: "stop-checklist",
    label: { fr: "Checklist de fin", en: "Stop checklist" },
    summary: {
      fr: "Rappelle la checklist (tests, doc) avant de terminer.",
      en: "Reminds the checklist (tests, docs) before finishing.",
    },
    caveat: {
      fr: "Simple echo, même remarque cmd Windows.",
      en: "Plain echo, same Windows cmd note.",
    },
    detail: {
      fr: "Hook Stop : quand Claude termine sa réponse, rappelle la checklist de fin (tests passés, doc à jour, rien d'incomplet). Limite les livraisons bâclées.",
      en: "Stop hook: when Claude finishes its answer, reminds the closing checklist (tests pass, docs updated, nothing incomplete). Limits sloppy deliveries.",
    },
  },
  {
    id: "prompt-guardrail",
    label: { fr: "Rappel des règles à chaque prompt", en: "Guardrail reminder on each prompt" },
    summary: {
      fr: "Réinjecte les garde-fous dans le contexte à chaque message.",
      en: "Re-injects the guardrails into context on each message.",
    },
    caveat: {
      fr: "Simple echo (UserPromptSubmit) : le stdout est ajouté au contexte du prompt. Sur cmd Windows, les guillemets peuvent s'afficher (sans danger).",
      en: "Plain echo (UserPromptSubmit): stdout is added to the prompt context. On Windows cmd the quotes may show (harmless).",
    },
    detail: {
      fr: "Hook UserPromptSubmit : à chaque message envoyé, le stdout du hook est ajouté au contexte (additionalContext). Sert à re-rappeler les garde-fous quand la session s'allonge et que le CLAUDE.md perd du poids.",
      en: "UserPromptSubmit hook: on each message sent, the hook stdout is added to context (additionalContext). Re-reminds the guardrails as the session grows and CLAUDE.md loses weight.",
    },
  },
  {
    id: "session-end-reminder",
    label: { fr: "Rappel de fin de session", en: "Session end reminder" },
    summary: {
      fr: "Rappelle de mettre à jour doc, mémoire et tests en fin de session.",
      en: "Reminds to update docs, memory and tests at session end.",
    },
    caveat: {
      fr: "Simple echo (SessionEnd), non bloquant. Même remarque cmd Windows.",
      en: "Plain echo (SessionEnd), non-blocking. Same Windows cmd note.",
    },
    detail: {
      fr: "Hook SessionEnd : quand la session se termine, affiche un rappel de clôture (mettre à jour la doc, la mémoire, vérifier les tests). Utile pour ne rien laisser en suspens.",
      en: "SessionEnd hook: when the session ends, prints a closing reminder (update docs, memory, check tests). Useful to leave nothing pending.",
    },
  },
  {
    id: "precompact-note",
    label: { fr: "Note avant compaction", en: "Pre-compaction note" },
    summary: {
      fr: "Rappelle de préserver le contexte clé avant un /compact.",
      en: "Reminds to preserve key context before a /compact.",
    },
    caveat: {
      fr: "Simple echo (PreCompact). Même remarque cmd Windows.",
      en: "Plain echo (PreCompact). Same Windows cmd note.",
    },
    detail: {
      fr: "Hook PreCompact : juste avant une compaction (manuelle ou auto), affiche un rappel de préserver le contexte clé (décisions, état en cours) pour éviter de le perdre.",
      en: "PreCompact hook: right before a compaction (manual or auto), prints a reminder to preserve key context (decisions, current state) to avoid losing it.",
    },
  },
  {
    id: "block-dangerous-bash",
    label: { fr: "Blocage commandes dangereuses", en: "Block dangerous Bash" },
    summary: {
      fr: "Hook PreToolUse qui bloque rm -rf /, mkfs, dd, fork bomb (exit 2).",
      en: "PreToolUse hook blocking rm -rf /, mkfs, dd, fork bomb (exit 2).",
    },
    caveat: {
      fr: "REQUIERT un shell POSIX (macOS/Linux/WSL/Git Bash). Redondant avec permissions.deny (lui cross-platform). À activer seulement si bash est disponible.",
      en: "REQUIRES a POSIX shell (macOS/Linux/WSL/Git Bash). Redundant with permissions.deny (which is cross-platform). Enable only if bash is available.",
    },
    detail: {
      fr: "Hook PreToolUse (matcher Bash) : lit la commande sur stdin et bloque (exit 2) si elle contient un pattern destructif (rm -rf /, mkfs, dd, fork bomb, chmod 777). Filet de sécurité en plus du deny déclaratif.",
      en: "PreToolUse hook (Bash matcher): reads the command on stdin and blocks (exit 2) if it contains a destructive pattern (rm -rf /, mkfs, dd, fork bomb, chmod 777). A safety net on top of the declarative deny.",
    },
  },
  {
    id: "prompt-destructive-guard",
    label: {
      fr: "Garde anti-commandes destructives (modèle)",
      en: "Destructive command guard (model)",
    },
    summary: {
      fr: "Hook PreToolUse qui demande à un modèle rapide d'évaluer et de refuser les commandes Bash destructives.",
      en: "PreToolUse hook that asks a fast model to evaluate and refuse destructive Bash commands.",
    },
    caveat: {
      fr: "Aucun shell requis (évaluation par un modèle) : contrairement au blocage bash, il fonctionne sur Windows. Ajoute une latence (un appel modèle par commande Bash), délai d'expiration 30 s par défaut.",
      en: "No shell required (model evaluation): unlike the bash block, it works on Windows. Adds latency (one model call per Bash command), 30s default timeout.",
    },
    detail: {
      fr: "Hook PreToolUse (matcher Bash) de type prompt : la commande est envoyée à un modèle rapide qui renvoie une décision JSON. Si la commande est jugée destructive (rm -rf, DROP de base, git push --force, mkfs, dd...), elle est refusée (decision deny) avec le motif affiché. Fonctionne sans shell, donc y compris sur Windows.",
      en: "PreToolUse hook (Bash matcher) of type prompt: the command is sent to a fast model that returns a JSON decision. If the command is deemed destructive (rm -rf, database DROP, git push --force, mkfs, dd...), it is denied (decision deny) with the reason shown. Works without a shell, including on Windows.",
    },
  },
];

/**
 * Hook de blocage : lit le JSON du tool sur stdin (contrat documenté),
 * cherche des patterns destructifs, exit 2 = blocage avec message vers Claude.
 */
function blockDangerousCommand(fr: boolean): string {
  const msg = fr
    ? "BLOQUÉ: commande destructive détectée"
    : "BLOCKED: destructive command detected";
  const patterns = ["rm -rf /", "rm -rf ~", "mkfs", "dd if=", ":(){ :|:& };:", "chmod 777"];
  const loop = patterns.map((p) => `"${p}"`).join(" ");
  return `bash -c 'IN=$(cat); for P in ${loop}; do if printf "%s" "$IN" | grep -qF "$P"; then echo "${msg} ($P)" >&2; exit 2; fi; done; exit 0'`;
}

/**
 * Hook prompt (type "prompt", sans shell) : envoie la commande Bash a un modele rapide qui
 * renvoie une decision JSON. Contrat officiel (code.claude.com/docs/en/hooks#prompt-based-hooks,
 * verifie 2026-07-09) : la reponse doit contenir un champ "decision" valant "allow" ou "deny" ;
 * "deny" bloque l'appel outil. $ARGUMENTS est remplace par le JSON d'entree du hook.
 */
function destructiveGuardPrompt(fr: boolean): string {
  return fr
    ? 'Tu es un garde-fou de sécurité pour un agent de code. Analyse la commande Bash ci-dessous et détermine si elle est destructive ou dangereuse (rm -rf, suppression massive, mkfs, dd sur un disque, DROP/TRUNCATE de base de données, git push --force, chmod 777 récursif, fork bomb, curl|bash). Réponds UNIQUEMENT par un objet JSON : {"decision": "deny"} si la commande est destructive, sinon {"decision": "allow"}. Commande :\n\n$ARGUMENTS'
    : 'You are a safety guardrail for a coding agent. Analyze the Bash command below and decide whether it is destructive or dangerous (rm -rf, mass deletion, mkfs, dd to a disk, database DROP/TRUNCATE, git push --force, recursive chmod 777, fork bomb, curl|bash). Reply ONLY with a JSON object: {"decision": "deny"} if the command is destructive, otherwise {"decision": "allow"}. Command:\n\n$ARGUMENTS';
}

/** Construit l'objet hooks pour settings.json, ou undefined si aucun hook choisi. */
export function buildHooks(a: Answers): Record<string, HookEntry[]> | undefined {
  if (a.hooks.length === 0) {
    return undefined;
  }
  const fr = a.language === "fr";
  const out: Record<string, HookEntry[]> = {};

  if (a.hooks.includes("session-start-reminder")) {
    const msg = fr
      ? "=== Garde-fous actifs : zéro improvisation (source obligatoire), zéro vibe coding, factuel ==="
      : "=== Active guardrails: zero improvisation (source required), zero vibe coding, factual ===";
    out["SessionStart"] = [{ hooks: [{ type: "command", command: `echo "${msg}"` }] }];
  }

  if (a.hooks.includes("stop-checklist")) {
    const msg = fr
      ? "=== Avant de terminer : tests passés ? doc à jour ? rien d incomplet laissé ? ==="
      : "=== Before finishing: tests pass? docs updated? nothing left incomplete? ===";
    out["Stop"] = [{ hooks: [{ type: "command", command: `echo "${msg}"` }] }];
  }

  // PreToolUse (matcher Bash) accumule le blocage declaratif (command) et la garde par modele (prompt).
  const preToolUse: HookEntry[] = [];
  if (a.hooks.includes("block-dangerous-bash")) {
    preToolUse.push({
      matcher: "Bash",
      hooks: [{ type: "command", command: blockDangerousCommand(fr) }],
    });
  }
  if (a.hooks.includes("prompt-destructive-guard")) {
    preToolUse.push({
      matcher: "Bash",
      hooks: [{ type: "prompt", prompt: destructiveGuardPrompt(fr) }],
    });
  }
  if (preToolUse.length > 0) {
    out["PreToolUse"] = preToolUse;
  }

  if (a.hooks.includes("prompt-guardrail")) {
    const msg = fr
      ? "=== Garde-fous : source obligatoire, zéro vibe coding, factuel. Vérifier la source avant toute affirmation. ==="
      : "=== Guardrails: source required, zero vibe coding, factual. Verify the source before any claim. ===";
    out["UserPromptSubmit"] = [{ hooks: [{ type: "command", command: `echo "${msg}"` }] }];
  }

  if (a.hooks.includes("session-end-reminder")) {
    const msg = fr
      ? "=== Fin de session : doc à jour ? mémoire à jour ? tests verts ? ==="
      : "=== Session end: docs updated? memory updated? tests green? ===";
    out["SessionEnd"] = [{ hooks: [{ type: "command", command: `echo "${msg}"` }] }];
  }

  if (a.hooks.includes("precompact-note")) {
    const msg = fr
      ? "=== Avant compaction : préserver les décisions et l état en cours du contexte ==="
      : "=== Before compaction: preserve decisions and current context state ===";
    out["PreCompact"] = [{ hooks: [{ type: "command", command: `echo "${msg}"` }] }];
  }

  return out;
}

export function selectedHookCaveats(hooks: HookId[], lang: Language): string[] {
  return HOOK_DESCRIPTORS.filter((h) => hooks.includes(h.id)).map(
    (h) => `${h.label[lang]} : ${h.caveat[lang]}`,
  );
}
