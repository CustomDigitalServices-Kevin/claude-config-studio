import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import JSZip from "jszip";
import { coerceAnswers } from "../src/lib/manifest";

/**
 * E2E artefact reel : on telecharge le ZIP produit par le navigateur, on le relit
 * cote Node et on verifie le livrable tel que l'utilisateur le recoit (plafond 200,
 * settings valide, manifeste re-importable, zero fuite d'identite).
 */

// Reference : FORBIDDEN_TOKENS de src/generator/buildConfig.test.ts (de-personnalisation).
// "Custom Digital Services" est l'exception marque (autorisee dans README / footer, jamais
// dans la sortie generee), c'est pourquoi le token teste ici est le fragment "Custom Digital".
const FORBIDDEN_TOKENS = [
  "903904795",
  "Custom Digital",
  "custom-digital-services",
  "Vault_Projets",
  "Memoire_projets",
  "Antigravity",
  "SIREN",
  "robzombi",
];

test.describe("Telechargement ZIP (artefact reel)", () => {
  test("le ZIP telecharge porte une config valide, un manifeste re-importable, zero fuite", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Claude Config Studio" })).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /Télécharger le \.zip/ }).click(),
    ]);

    const filePath = await download.path();
    const buffer = await readFile(filePath);
    const zip = await JSZip.loadAsync(buffer);
    const names = Object.keys(zip.files);

    // 1. CLAUDE.md present et sous le plafond 200 lignes
    const claudeMd = await zip.file(".claude/CLAUDE.md")?.async("string");
    expect(claudeMd, ".claude/CLAUDE.md absent du ZIP").toBeDefined();
    expect((claudeMd ?? "").split("\n").length).toBeLessThanOrEqual(200);

    // 2. settings.json present et JSON.parse-able
    const settings = await zip.file(".claude/settings.json")?.async("string");
    expect(settings, ".claude/settings.json absent du ZIP").toBeDefined();
    expect(() => JSON.parse(settings ?? "")).not.toThrow();

    // 3. manifeste present et re-importable via coerceAnswers
    expect(names).toContain("config-studio.json");
    const manifest = await zip.file("config-studio.json")?.async("string");
    expect(coerceAnswers(JSON.parse(manifest ?? ""))).not.toBeNull();

    // 4. zero fuite d'identite sur l'integralite du contenu du ZIP
    let everything = "";
    for (const name of names) {
      const entry = zip.files[name];
      if (entry && !entry.dir) {
        everything += await entry.async("string");
      }
    }
    const lower = everything.toLowerCase();
    for (const token of FORBIDDEN_TOKENS) {
      expect(lower.includes(token.toLowerCase()), `fuite d'identite "${token}"`).toBe(false);
    }
  });
});
