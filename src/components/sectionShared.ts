import type { Dispatch, SetStateAction } from "react";
import type { Answers, Language } from "../types";

/** Signature commune a toutes les sections du generateur (etat remonte dans App). */
export interface SectionProps {
  answers: Answers;
  setAnswers: Dispatch<SetStateAction<Answers>>;
  /** Langue du CHROME (toggle header). Distincte de answers.language (langue de sortie). */
  lang: Language;
}

/** Bascule l'appartenance d'une valeur a une liste (ajoute si absente, retire sinon). */
export function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** Construit le setter de parametres de regles/outils (cle = `${ownerId}.${optionId}`). */
export function makeSetOption(setAnswers: Dispatch<SetStateAction<Answers>>) {
  return (key: string, value: string | number | boolean): void =>
    setAnswers((prev) => ({ ...prev, ruleOptions: { ...prev.ruleOptions, [key]: value } }));
}
