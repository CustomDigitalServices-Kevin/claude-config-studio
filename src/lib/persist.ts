import { answersSchema, type Answers } from "../types";

/**
 * Persistance locale des reponses du wizard (autosave + rechargement).
 * Format stocke : { version, answers }. La version permet d'invalider un ancien
 * schema. Toute lecture passe par answersSchema : un payload corrompu ou d'une
 * version inconnue retourne null (aucune exception ne remonte a l'UI).
 */

export const STORAGE_KEY = "ccs:answers:v1";
const STORAGE_VERSION = 1;

interface StoredAnswers {
  version: number;
  answers: Answers;
}

/** Ecrit les reponses dans le Storage. Echec silencieux (quota, mode prive) logue en console. */
export function saveAnswers(answers: Answers, storage: Storage = localStorage): void {
  try {
    const payload: StoredAnswers = { version: STORAGE_VERSION, answers };
    storage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error("[persist] saveAnswers failed", err);
  }
}

/** Relit les reponses. Retourne null si absent, corrompu, version inconnue, ou schema invalide. */
export function loadAnswers(storage: Storage = localStorage): Answers | null {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) {
      return null;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }
    const record = parsed as Record<string, unknown>;
    if (record.version !== STORAGE_VERSION) {
      return null;
    }
    const result = answersSchema.safeParse(record.answers);
    return result.success ? result.data : null;
  } catch (err) {
    console.error("[persist] loadAnswers failed", err);
    return null;
  }
}

/** Efface les reponses persistees. Echec silencieux logue en console. */
export function clearAnswers(storage: Storage = localStorage): void {
  try {
    storage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("[persist] clearAnswers failed", err);
  }
}
