import { test, expect } from "@playwright/test";

/**
 * E2E navigateur : encode + decode du permalien dans un VRAI Chromium.
 * Regression pour le deadlock CompressionStream (write -> close -> read sequentiel
 * se bloque en Chromium par backpressure alors qu'il passe en environnement Node) :
 * les tests unitaires Vitest ne peuvent PAS attraper ce bug, seul un navigateur reel
 * exerce le vrai comportement des streams.
 */
test.describe("Permalien (navigateur reel)", () => {
  test("Copier le lien produit un hash #c= puis un rechargement restaure les reponses", async ({
    page,
    context,
    baseURL,
  }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto("/");

    // Personnaliser une reponse pour rendre la restauration observable.
    const projectField = page.getByPlaceholder("mon-dossier");
    await projectField.fill("permalink-e2e");

    // Encode (CompressionStream) : doit aboutir en moins de 10 s (le deadlock ne
    // produit AUCUNE erreur, juste une promesse gelee, d'ou le timeout explicite).
    await page.getByRole("button", { name: "Copier le lien" }).click();
    await expect(page.getByRole("button", { name: "Lien copié" })).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/#c=.+/, { timeout: 10000 });

    const hash = new URL(page.url()).hash;
    expect(hash.startsWith("#c=")).toBe(true);

    // Decode (DecompressionStream) : un chargement a froid avec ce hash restaure l'etat.
    const fresh = await context.newPage();
    const freshErrors: string[] = [];
    fresh.on("console", (m) => {
      if (m.type() === "error") freshErrors.push(m.text());
    });
    fresh.on("pageerror", (e) => freshErrors.push(e.message));
    await fresh.goto(`${baseURL}/${hash}`);
    await expect(fresh.getByPlaceholder("mon-dossier")).toHaveValue("permalink-e2e", {
      timeout: 10000,
    });
    await fresh.close();

    expect(errors).toEqual([]);
    expect(freshErrors).toEqual([]);
  });
});
