import { z } from "zod";

/**
 * Client lecture seule du Board communautaire (configs partagees). Le contrat est FIGE
 * cote Board ; on code contre ce contrat, valide par un schema Zod LOCAL. Toute reponse
 * non conforme, erreur HTTP, timeout ou rejet reseau retourne null : le Studio reste
 * 100% fonctionnel Board indisponible (l'appelant affiche un encart discret).
 *
 * Aucune donnee n'est envoyee (GET pur). Timeout dur a 8 s via AbortController.
 *
 * NOTE CSP : en production la CSP du Studio est connect-src 'self' ; ce fetch echoue
 * (rejet reseau) tant que le vhost n'a pas ete elargi. Le rejet est capture ici et
 * ramene a un null propre, avec un unique console.error.
 */

export const COMMUNITY_API_URL = "https://board.custom-digital-services.fr/api/public/configs";
export const COMMUNITY_PAGE_SIZE = 20;
const TIMEOUT_MS = 8000;

const sharedConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  locale: z.enum(["fr", "en"]),
  /** Payload base64url du permalien, SANS le prefixe #c= (a decoder via decodeAnswers). */
  permalink: z.string(),
  authorName: z.string(),
  /** Date de publication au format ISO 8601. */
  createdAt: z.string(),
});

const pageSchema = z.object({
  configs: z.array(sharedConfigSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
});

export type SharedConfig = z.infer<typeof sharedConfigSchema>;
export type SharedConfigsPage = z.infer<typeof pageSchema>;

/** Wrapper par defaut : appel global bare (binding de realm correct, pas d'illegal invocation). */
const defaultFetch: typeof fetch = (input, init) => fetch(input, init);

/**
 * Recupere une page de configs partagees. Retourne null sur toute anomalie
 * (HTTP != 2xx, JSON invalide, schema Zod invalide, timeout, rejet reseau).
 * `fetchImpl` est injectable pour les tests ; par defaut le fetch global.
 */
export async function fetchSharedConfigs(
  page: number,
  fetchImpl: typeof fetch = defaultFetch,
): Promise<SharedConfigsPage | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = `${COMMUNITY_API_URL}?page=${page}&pageSize=${COMMUNITY_PAGE_SIZE}`;
    const response = await fetchImpl(url, { signal: controller.signal });
    if (!response.ok) {
      console.error(`[community] fetch HTTP ${response.status}`);
      return null;
    }
    const json = (await response.json()) as unknown;
    const parsed = pageSchema.safeParse(json);
    if (!parsed.success) {
      console.error("[community] schema invalide", parsed.error);
      return null;
    }
    return parsed.data;
  } catch (err) {
    console.error("[community] fetchSharedConfigs failed", err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
