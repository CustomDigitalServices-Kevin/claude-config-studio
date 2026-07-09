import { test, expect } from "@playwright/test";

/**
 * Smoke navigateur : parcourt les 10 sections du rail du generateur et les deux
 * onglets catalogue, en collectant les erreurs console / page. Un rendu qui casse
 * (erreur React, acces indefini) fait echouer le test. Selecteurs par role/nom
 * accessible, tolerants au layout (les labels FR par defaut restent stables).
 */

const RAIL_SECTIONS = [
  "Identité",
  "Profils & structure",
  "Langue, rigueur & stack",
  "Garde-fous",
  "Hooks",
  "Outils tiers",
  "Skills",
  "Agents",
  "Workflow",
  "Settings avancés",
];

test.describe("Smoke navigation", () => {
  test("les 10 sections du rail et les onglets se rendent sans erreur console", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Claude Config Studio" })).toBeVisible();

    // Rail du generateur : chaque section devient active (aria-current="step") au clic.
    const rail = page.getByRole("navigation", { name: "Sections" });
    for (const label of RAIL_SECTIONS) {
      const button = rail.getByRole("button", { name: label });
      await button.click();
      await expect(button).toHaveAttribute("aria-current", "step");
    }

    // Onglet Marketplaces : quitte le generateur (rail absent) et rend son titre.
    await page.locator("header").getByRole("button", { name: "Marketplaces" }).click();
    await expect(rail).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Marketplaces de plugins Claude Code" }),
    ).toBeVisible();

    // Onglet MCP Serveurs : rend son titre dedie.
    await page.locator("header").getByRole("button", { name: "MCP Serveurs" }).click();
    await expect(page.getByRole("heading", { name: "Connecter un serveur MCP" })).toBeVisible();

    expect(errors, `erreurs console: ${errors.join(" | ")}`).toEqual([]);
  });
});
