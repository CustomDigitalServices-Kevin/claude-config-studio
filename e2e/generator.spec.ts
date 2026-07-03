import { test, expect } from "@playwright/test";

/**
 * E2E navigateur : couvre le click-through que les tests pipeline (Vitest) ne voient pas :
 * etat React -> buildConfig -> preview live -> download DOM. Complementaire de `src/e2e.test.ts`
 * (qui valide l'artefact ZIP), pas redondant.
 */
test.describe("Claude Config Studio", () => {
  test("genere en direct selon profondeur + secteurs et telecharge le ZIP", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Claude Config Studio" })).toBeVisible();

    // Preview par defaut (profondeur n0) : racine + docs, aucune couche de secteur.
    await expect(page.getByText(".claude/CLAUDE.md", { exact: true })).toBeVisible();
    await expect(page.getByText("INSTALL.md", { exact: true })).toBeVisible();

    // Aller a la section "Profils & structure" via le rail.
    await page
      .getByRole("navigation", { name: "Sections" })
      .getByText("Profils & structure")
      .click();

    // Profondeur 0+1 : la couche secteurs apparait (carte identifiee par son sous-titre unique).
    await page.getByRole("button", { name: /un dossier par secteur/ }).click();

    // Cocher deux secteurs sans collision de nom avec les profils (Web, Mobile ne sont pas des profils).
    await page.getByRole("button", { name: /^Web\b/ }).click();
    await page.getByRole("button", { name: /^Mobile\b/ }).click();

    // La preview reflete EN DIRECT les squelettes N1 (chemin complet React -> buildConfig -> preview).
    await expect(page.getByText("web/.claude/CLAUDE.md", { exact: true })).toBeVisible();
    await expect(page.getByText("mobile/.claude/CLAUDE.md", { exact: true })).toBeVisible();

    // Telechargement reel du ZIP (blob JSZip -> ancre DOM -> download).
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /Télécharger le \.zip/ }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/-claude-config\.zip$/);

    // Aucune erreur console / page sur tout le parcours.
    expect(errors, `erreurs console: ${errors.join(" | ")}`).toEqual([]);
  });
});
