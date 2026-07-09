import { describe, it, expect } from "vitest";

/**
 * Garde em dash ETENDU aux fichiers RACINE du repo (README.md, index.html), hors src/.
 * Verifie l'absence de tiret cadratin U+2014 ET de tiret demi-cadratin U+2013 (LOI Kevin :
 * aucun em/en dash dans les textes livres). Complete src/no-em-dash.test.ts (limite a src/).
 *
 * `import.meta.glob(..., '?raw')` charge le contenu brut ; le pattern `../` remonte a la racine
 * du repo (README.md et index.html vivent au-dessus de src/).
 */
const rootFiles = import.meta.glob("../{README.md,index.html}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const EM_DASH = "—";
const EN_DASH = "–";

describe("garde em/en dash — fichiers racine (README, index.html)", () => {
  const paths = Object.keys(rootFiles);

  it("les deux fichiers racine sont bien chargés", () => {
    expect(
      paths.some((p) => p.endsWith("README.md")),
      "README.md introuvable",
    ).toBe(true);
    expect(
      paths.some((p) => p.endsWith("index.html")),
      "index.html introuvable",
    ).toBe(true);
  });

  for (const [path, content] of Object.entries(rootFiles)) {
    it(`${path} ne contient ni em dash ni en dash`, () => {
      expect(content.includes(EM_DASH), `em dash (U+2014) dans ${path}`).toBe(false);
      expect(content.includes(EN_DASH), `en dash (U+2013) dans ${path}`).toBe(false);
    });
  }
});
