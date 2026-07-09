import { z } from "zod";
import { answersSchema, type Answers } from "../types";

/**
 * Snapshots nommes des reponses du wizard, persistes en localStorage.
 * Format stocke : { version, snapshots: [{ id, name, savedAt, answers }] }.
 * Toute lecture valide chaque entree via answersSchema (lecture seule depuis types.ts) :
 * une entree corrompue est ignoree (console.error), jamais de crash. La liste est
 * ordonnee du plus recent au plus ancien (prepend a l'ecriture).
 *
 * crypto.randomUUID est un global Baseline (navigateurs) et natif Node >= 20, comme
 * CompressionStream l'est pour permalink.ts.
 */

export const SNAPSHOTS_KEY = "ccs:snapshots:v1";
const SNAPSHOTS_VERSION = 1;

/** Nombre maximal de snapshots conserves. Au-dela, saveSnapshot leve une erreur explicite. */
export const MAX_SNAPSHOTS = 20;
/** Bornes de longueur du nom d'un snapshot (caracteres apres trim). */
export const MIN_NAME_LENGTH = 1;
export const MAX_NAME_LENGTH = 60;

export interface Snapshot {
  id: string;
  name: string;
  /** Date de sauvegarde au format ISO 8601 (new Date().toISOString()). */
  savedAt: string;
  answers: Answers;
}

interface StoredSnapshots {
  version: number;
  snapshots: Snapshot[];
}

const snapshotSchema = z.object({
  id: z.string(),
  name: z.string(),
  savedAt: z.string(),
  answers: answersSchema,
});

function writeSnapshots(list: Snapshot[], storage: Storage): void {
  const payload: StoredSnapshots = { version: SNAPSHOTS_VERSION, snapshots: list };
  storage.setItem(SNAPSHOTS_KEY, JSON.stringify(payload));
}

/**
 * Relit les snapshots valides. Retourne [] si absent, corrompu ou version inconnue.
 * Chaque entree invalide (answers hors schema) est ecartee sans faire echouer les autres.
 */
export function listSnapshots(storage: Storage = localStorage): Snapshot[] {
  try {
    const raw = storage.getItem(SNAPSHOTS_KEY);
    if (raw === null) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) {
      return [];
    }
    const record = parsed as Record<string, unknown>;
    if (record.version !== SNAPSHOTS_VERSION || !Array.isArray(record.snapshots)) {
      return [];
    }
    const valid: Snapshot[] = [];
    for (const entry of record.snapshots) {
      const result = snapshotSchema.safeParse(entry);
      if (result.success) {
        valid.push(result.data);
      } else {
        console.error("[snapshots] entree invalide ignoree", result.error);
      }
    }
    return valid;
  } catch (err) {
    console.error("[snapshots] listSnapshots failed", err);
    return [];
  }
}

/**
 * Sauvegarde l'etat courant sous un nom. Leve une erreur explicite si le nom est
 * hors bornes ou si la limite MAX_SNAPSHOTS est atteinte. Retourne le snapshot cree.
 */
export function saveSnapshot(
  name: string,
  answers: Answers,
  storage: Storage = localStorage,
): Snapshot {
  const trimmed = name.trim();
  if (trimmed.length < MIN_NAME_LENGTH || trimmed.length > MAX_NAME_LENGTH) {
    throw new Error(`snapshot name must be ${MIN_NAME_LENGTH}-${MAX_NAME_LENGTH} characters`);
  }
  const current = listSnapshots(storage);
  if (current.length >= MAX_SNAPSHOTS) {
    throw new Error(`snapshot limit reached (max ${MAX_SNAPSHOTS})`);
  }
  const snapshot: Snapshot = {
    id: crypto.randomUUID(),
    name: trimmed,
    savedAt: new Date().toISOString(),
    answers,
  };
  writeSnapshots([snapshot, ...current], storage);
  return snapshot;
}

/** Supprime le snapshot d'id donne. No-op silencieux si l'id est inconnu. */
export function deleteSnapshot(id: string, storage: Storage = localStorage): void {
  const next = listSnapshots(storage).filter((s) => s.id !== id);
  writeSnapshots(next, storage);
}

/** Retourne le snapshot d'id donne, ou null s'il n'existe pas / n'est plus valide. */
export function getSnapshot(id: string, storage: Storage = localStorage): Snapshot | null {
  return listSnapshots(storage).find((s) => s.id === id) ?? null;
}
