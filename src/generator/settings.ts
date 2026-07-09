import type { Answers, ClaudeSettings } from "../types";
import { effectiveProfiles, profileById } from "../data/profiles";
import { stackById } from "../data/stacks";
import { buildHooks } from "./hooks";

/** Garde-fous destructifs de base (cross-platform, aucun shell requis). */
export const BASE_DENY: readonly string[] = [
  "Bash(rm -rf /)",
  "Bash(rm -rf ~)",
  "Bash(sudo *)",
  "Bash(shutdown *)",
  "Bash(reboot *)",
  "Bash(mkfs *)",
  "Bash(dd if=*)",
  "Bash(chmod 777 *)",
  "Bash(curl * | bash)",
  "Bash(curl * | sh)",
  "Bash(wget * | bash)",
  // Variantes compactes (sans espaces autour du pipe) : contournent les patterns espaces ci-dessus.
  "Bash(curl *|bash)",
  "Bash(curl *|sh)",
  "Bash(wget -O- *)",
  "Bash(wget *|bash)",
  "Bash(wget *|sh)",
  "Bash(eval *)",
];

/** Operations a confirmer (ask) de base. */
export const BASE_ASK: readonly string[] = [
  "Bash(git push *)",
  "Bash(git reset --hard *)",
  "Bash(git clean *)",
  "Bash(rm -rf *)",
];

function dedup(items: string[]): string[] {
  return [...new Set(items)];
}

/**
 * Genere l'objet settings.json. Structure derivee des fichiers reels sur disque :
 * $schema + permissions.{allow,ask,deny} (arrays) + hooks (event -> [{matcher?, hooks}]).
 */
export function generateSettings(a: Answers): ClaudeSettings {
  const profiles = effectiveProfiles(a.profiles).map(profileById);

  const allow = dedup(a.stacks.flatMap((id) => stackById(id).allow));
  const deny = dedup([...BASE_DENY, ...profiles.flatMap((p) => p.extraDeny)]);
  const ask = dedup([...BASE_ASK, ...profiles.flatMap((p) => p.extraAsk)]);

  const permissions: NonNullable<ClaudeSettings["permissions"]> = { ask, deny };
  if (allow.length > 0) {
    permissions.allow = allow;
  }

  // Reglages avances : on n'ecrit une cle que si elle devie du defaut Claude (settings.json minimal).
  const adv = a.advanced;
  if (adv.permissionMode) {
    permissions.defaultMode = adv.permissionMode;
  }

  const settings: ClaudeSettings = {
    $schema: "https://json.schemastore.org/claude-code-settings.json",
    permissions,
  };

  if (adv.model) {
    settings.model = adv.model;
  }
  if (adv.outputStyle) {
    settings.outputStyle = adv.outputStyle;
  }
  if (!adv.autoMemory) {
    settings.autoMemoryEnabled = false;
  }
  // Chaine de repli modele : schema officiel = array de strings (schemastore, verifie 2026-07-09).
  // L'UI n'expose qu'un choix unique, on emet donc un array a un element.
  if (adv.fallbackModel) {
    settings.fallbackModel = [adv.fallbackModel];
  }
  // Langue preferee des reponses (cle settings "language", string libre ex "french").
  if (adv.responseLanguage) {
    settings.language = adv.responseLanguage;
  }
  // Attribution "none" : retire la mention Claude des commits et PRs via chaines vides (forme officielle).
  if (adv.attribution === "none") {
    settings.attribution = { commit: "", pr: "" };
  }

  const hooks = buildHooks(a);
  if (hooks) {
    settings.hooks = hooks;
  }

  return settings;
}

export function settingsToJson(settings: ClaudeSettings): string {
  return JSON.stringify(settings, null, 2) + "\n";
}
