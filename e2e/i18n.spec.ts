import { test, expect } from "@playwright/test";

/**
 * E2E navigateur : bascule EN du chrome. Le toggle du header pilote TOUTE l'interface ;
 * answers.language (langue de la sortie generee) est un axe independant, non touche ici.
 */
test.describe("Chrome bilingue", () => {
  test("le toggle EN traduit le rail, les onglets et le bouton de telechargement", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/");

    // Etat initial FR.
    await expect(page.getByRole("button", { name: "Télécharger le .zip" })).toBeVisible();
    const rail = page.getByRole("navigation", { name: "Sections" });
    await expect(rail.getByText("Identité", { exact: true })).toBeVisible();

    // Bascule EN via le toggle du header.
    await page.getByRole("button", { name: "EN", exact: true }).click();

    // Chrome traduit : rail, bouton download, onglets, actions studio.
    await expect(rail.getByText("Identity", { exact: true })).toBeVisible();
    await expect(rail.getByText("Identité", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Download the .zip" })).toBeVisible();
    await expect(page.getByRole("button", { name: ".claude generator" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy link" })).toBeVisible();

    // Retour FR : reversible sans rechargement.
    await page.getByRole("button", { name: "FR", exact: true }).click();
    await expect(rail.getByText("Identité", { exact: true })).toBeVisible();

    expect(errors).toEqual([]);
  });
});
