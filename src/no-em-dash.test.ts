import { describe, it, expect } from "vitest";

/**
 * Garde automatise de la LOI Kevin : ZERO em dash (tiret long) dans le code source
 * (UI + generateur + data). Ferme la boucle sur une regression reelle (un em dash s'etait
 * glisse dans HierarchySchema.tsx, non couvert par les tests de sortie generee).
 *
 * `import.meta.glob(..., '?raw')` charge le contenu brut de chaque fichier (feature Vite).
 * Les fichiers de test sont exclus : leurs `describe("... — ...")` utilisent le tiret long
 * comme separateur d'infra, hors perimetre de la LOI (texte non livre, non-UI).
 */
const sources = import.meta.glob("./**/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

describe("LOI Kevin — zero em dash dans le code source", () => {
  for (const [path, content] of Object.entries(sources)) {
    if (path.includes(".test.")) {
      continue;
    }
    it(`${path} ne contient pas d'em dash`, () => {
      expect(content.includes("—"), `em dash (U+2014) dans ${path}`).toBe(false);
    });
  }
});
