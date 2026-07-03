import type { Language, Localized, Rigor } from "../types";
import { pick } from "../types";

/**
 * Paramètres déclaratifs d'une règle (garde-fou ou règle d'outil).
 * Chaque option contribue une ou plusieurs lignes au corps de la règle générée,
 * via des templates `{value}` / `{unit}` (aucune fonction stockée dans la data).
 */
export type RuleOptionType = "toggle" | "select" | "number" | "text";

export interface RuleOptionChoice {
  value: string;
  label: Localized;
  /** Ligne injectée quand ce choix est sélectionné. */
  line?: Localized;
}

export interface RuleOption {
  id: string;
  label: Localized;
  hint?: Localized;
  type: RuleOptionType;
  default: string | number | boolean;
  /**
   * Défaut effectif selon la rigueur globale (macro Rigueur). Ne concerne que les garde-fous.
   * Résolution : un override manuel (présent dans `values`) prime toujours ; sinon on prend
   * rigorDefault[rigor] s'il existe ; sinon `default`. "standard" = `default` (zéro régression).
   */
  rigorDefault?: Partial<Record<Rigor, string | number | boolean>>;
  /** number : unité affichée et substituée dans {unit}. */
  unit?: Localized;
  min?: number;
  max?: number;
  step?: number;
  /** select : choix possibles. */
  choices?: RuleOptionChoice[];
  /** toggle=true OU number : template ({value},{unit}). */
  lineOn?: Localized;
  /** toggle=false : template. */
  lineOff?: Localized;
}

export function optionKey(ownerId: string, optionId: string): string {
  return `${ownerId}.${optionId}`;
}

export function optionValue(
  values: Record<string, string | number | boolean>,
  ownerId: string,
  opt: RuleOption,
  rigor: Rigor = "standard",
): string | number | boolean {
  const k = optionKey(ownerId, opt.id);
  const provided = values[k];
  if (provided !== undefined) {
    return provided;
  }
  const rd = opt.rigorDefault?.[rigor];
  return rd !== undefined ? rd : opt.default;
}

function fill(template: string, value: string | number | boolean, unit: string): string {
  return template.replace(/\{value\}/g, String(value)).replace(/\{unit\}/g, unit);
}

/** Ligne markdown injectée pour une option selon sa valeur (ou null si rien à ajouter). */
export function renderOptionLine(
  opt: RuleOption,
  value: string | number | boolean,
  lang: Language,
): string | null {
  const unit = opt.unit ? pick(opt.unit, lang) : "";
  if (opt.type === "toggle") {
    if (value === true && opt.lineOn) {
      return fill(pick(opt.lineOn, lang), value, unit);
    }
    if (value === false && opt.lineOff) {
      return fill(pick(opt.lineOff, lang), value, unit);
    }
    return null;
  }
  if (opt.type === "number" || opt.type === "text") {
    // text : valeur string libre substituée dans {value}. Sans lineOn (ex icon/headerText du green-flag,
    // lus directement par le générateur), rien n'est ajouté au corps de la règle.
    return opt.lineOn ? fill(pick(opt.lineOn, lang), value, unit) : null;
  }
  const choice = opt.choices?.find((c) => c.value === value);
  return choice?.line ? fill(pick(choice.line, lang), value, unit) : null;
}

/** Applique toutes les options d'un owner à un corps de règle (ajoute les lignes actives). */
export function applyOptions(
  ownerId: string,
  baseBody: string,
  options: RuleOption[] | undefined,
  values: Record<string, string | number | boolean>,
  lang: Language,
  rigor: Rigor = "standard",
): string {
  if (!options || options.length === 0) {
    return baseBody;
  }
  const extra = options
    .map((opt) => renderOptionLine(opt, optionValue(values, ownerId, opt, rigor), lang))
    .filter((l): l is string => Boolean(l));
  return extra.length > 0 ? `${baseBody}\n${extra.join("\n")}` : baseBody;
}
