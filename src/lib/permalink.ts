import { answersSchema, type Answers } from "../types";

/**
 * Permalien partageable : les reponses sont serialisees en JSON, compressees via
 * CompressionStream("deflate-raw") puis encodees en base64url pour tenir dans un
 * fragment d'URL (#c=...). Le decodage valide toujours via answersSchema : un hash
 * corrompu retourne null. CompressionStream / DecompressionStream sont Baseline 2023
 * (navigateurs) et natifs Node >= 20.
 */

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.length % 4 === 0 ? base64 : base64 + "=".repeat(4 - (base64.length % 4));
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function pipeThrough(input: Uint8Array, stream: GenericTransformStream): Promise<Uint8Array> {
  // Lecture et ecriture CONCURRENTES obligatoirement : dans Chromium, close() attend
  // le drainage du cote lisible (backpressure), donc un write -> close -> read
  // sequentiel se bloque sans erreur (verifie en prod 2026-07-09). L'environnement
  // Node des tests unitaires ne reproduit pas ce deadlock : seul un navigateur reel
  // l'exerce (spec e2e permalink.spec.ts).
  const writer = stream.writable.getWriter();
  const writeDone = writer.write(input).then(() => writer.close());
  // Marque la rejection comme geree : sur un input corrompu la LECTURE rejette la
  // premiere, et sans ce handler la rejection d'ecriture reste orpheline (Node 22
  // transforme une unhandled rejection en echec de suite ; Node 24 est plus laxiste).
  writeDone.catch(() => undefined);
  const buffer = await new Response(stream.readable).arrayBuffer();
  await writeDone;
  return new Uint8Array(buffer);
}

/** Compresse et encode les reponses en chaine base64url (sans le prefixe #c=). */
export async function encodeAnswers(answers: Answers): Promise<string> {
  const json = JSON.stringify(answers);
  const input = new TextEncoder().encode(json);
  const compressed = await pipeThrough(input, new CompressionStream("deflate-raw"));
  return bytesToBase64Url(compressed);
}

/** Decode, decompresse et valide un hash. Retourne null si corrompu ou schema invalide. */
export async function decodeAnswers(hash: string): Promise<Answers | null> {
  try {
    const bytes = base64UrlToBytes(hash);
    const decompressed = await pipeThrough(bytes, new DecompressionStream("deflate-raw"));
    const json = new TextDecoder().decode(decompressed);
    const parsed = JSON.parse(json) as unknown;
    const result = answersSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch (err) {
    console.error("[permalink] decodeAnswers failed", err);
    return null;
  }
}
