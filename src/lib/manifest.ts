import { answersSchema, type Answers } from "../types";

/**
 * Manifeste embarque a la racine du ZIP telecharge (config-studio.json). Il permet
 * de re-importer une configuration : le fichier porte les reponses exactes qui l'ont
 * genere. L'import accepte deux formes pour etre tolerant :
 *  - le manifeste enveloppe { version, generator, answers } (ce que le ZIP contient) ;
 *  - un objet Answers brut (si l'utilisateur exporte/edite les reponses seules).
 * Toute forme passe par answersSchema : une entree invalide retourne null.
 */

export const MANIFEST_FILENAME = "config-studio.json";
const MANIFEST_VERSION = 1;
const GENERATOR = "claude-config-studio";

/** Serialise les reponses dans le manifeste JSON insere a la racine du ZIP. */
export function buildManifest(answers: Answers): string {
  const manifest = { version: MANIFEST_VERSION, generator: GENERATOR, answers };
  return JSON.stringify(manifest, null, 2) + "\n";
}

/** Extrait des Answers valides d'un objet importe (manifeste enveloppe OU Answers brut). */
export function coerceAnswers(parsed: unknown): Answers | null {
  if (typeof parsed === "object" && parsed !== null && "answers" in parsed) {
    const wrapped = answersSchema.safeParse((parsed as { answers: unknown }).answers);
    if (wrapped.success) {
      return wrapped.data;
    }
  }
  const direct = answersSchema.safeParse(parsed);
  return direct.success ? direct.data : null;
}

/** Parse un fichier .json importe (manifeste ou Answers brut). Retourne null si invalide. */
export function parseManifestJson(text: string): Answers | null {
  try {
    return coerceAnswers(JSON.parse(text) as unknown);
  } catch (err) {
    console.error("[manifest] parseManifestJson failed", err);
    return null;
  }
}

/** Extrait config-studio.json d'un ZIP importe et en tire des Answers valides, ou null. */
export async function parseManifestZip(
  data: ArrayBuffer | Uint8Array | Blob,
): Promise<Answers | null> {
  try {
    const { default: JSZip } = await import("jszip");
    const zip = await JSZip.loadAsync(data);
    const entry = zip.file(MANIFEST_FILENAME);
    if (!entry) {
      return null;
    }
    return coerceAnswers(JSON.parse(await entry.async("string")) as unknown);
  } catch (err) {
    console.error("[manifest] parseManifestZip failed", err);
    return null;
  }
}
