import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { buildConfig } from "./generator/buildConfig";
import { buildZipBlob } from "./lib/zip";
import { defaultRulesForProfiles } from "./data/profiles";
import { MAX_CLAUDE_MD_LINES } from "./generator/buildConfig";
import { settingsSchema, type Answers } from "./types";

/**
 * Tests END TO END : traversent tout le pipeline du produit
 * (`Answers -> buildConfig -> buildZipBlob -> unzip -> assertions`).
 * Pour un generateur 100% client-side, le ZIP EST le livrable : ces tests valident
 * le produit final tel que l'utilisateur le telecharge, pas seulement les fonctions pures.
 *
 * Rendu navigateur (clic reel + download DOM) NON couvert ici : Playwright verrouille
 * (profil msedge en use). Couvert : integrite du contenu a travers le ZIP + invariants transverses.
 */

function makeAnswers(over: Partial<Answers> = {}): Answers {
  return {
    projectName: "acme",
    author: "",
    org: "",
    authorRole: "",
    companyId: "",
    responseStyle: "",
    language: "fr",
    profiles: ["dev"],
    depth: "n0",
    sectors: [],
    stacks: ["web-ts"],
    rules: defaultRulesForProfiles(["dev"]),
    rigor: "standard",
    hooks: [],
    tools: [],
    skills: [],
    agents: [],
    mcpServers: [],
    toolRules: [],
    ruleOptions: {},
    memoryNote: "",
    advanced: {
      model: "",
      autoMemory: true,
      outputStyle: "",
      permissionMode: "",
      fallbackModel: "",
      responseLanguage: "",
      attribution: "",
    },
    workflow: {
      defaultBehavior: "act",
      advisor: { enabled: false, model: "" },
      orchestration: false,
    },
    ...over,
  };
}

function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

/** Traverse tout le pipeline et retourne le contenu reel du ZIP (path -> contenu). */
async function generateZip(a: Answers): Promise<Map<string, string>> {
  const files = buildConfig(a);
  const blob = await buildZipBlob(files);
  expect(blob.size).toBeGreaterThan(0);
  const buffer = await blobToArrayBuffer(blob);
  const loaded = await JSZip.loadAsync(buffer);
  const out = new Map<string, string>();
  for (const name of Object.keys(loaded.files)) {
    const entry = loaded.files[name];
    if (entry && !entry.dir) {
      out.set(name, await entry.async("string"));
    }
  }
  return out;
}

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

/** Invariants transverses valides sur TOUT ZIP produit, quel que soit le scenario. */
function assertUniversalInvariants(zip: Map<string, string>): void {
  const everything = [...zip.entries()]
    .map(([p, c]) => `${p}\n${c}`)
    .join("\n")
    .toLowerCase();

  // 1. Zero fuite d'identite (de-personnalisation).
  for (const token of FORBIDDEN_TOKENS) {
    expect(everything.includes(token.toLowerCase()), `fuite identite "${token}"`).toBe(false);
  }

  // 2. Zero em dash dans la sortie generee (LOI : ni tiret long ni --).
  for (const [path, content] of zip) {
    expect(content.includes("—"), `em dash dans ${path}`).toBe(false);
  }

  // 3. Chaque CLAUDE.md sous le plafond 200 lignes.
  for (const [path, content] of zip) {
    if (path.endsWith("CLAUDE.md")) {
      const lines = content.split("\n").length;
      expect(lines, `${path}: ${lines} lignes`).toBeLessThanOrEqual(MAX_CLAUDE_MD_LINES);
    }
  }

  // 4. Chaque settings.json parse et respecte le schema officiel.
  for (const [path, content] of zip) {
    if (path.endsWith("settings.json")) {
      const parsed = JSON.parse(content) as unknown;
      expect(settingsSchema.safeParse(parsed).success, `settings invalide: ${path}`).toBe(true);
    }
  }

  // 5. Les docs racine sont toujours presentes.
  expect(zip.has("INSTALL.md")).toBe(true);
  expect(zip.has("README.md")).toBe(true);
}

describe("E2E — scenario dev simple (profondeur n0)", () => {
  it("racine seule, aucun secteur, aucun INITIALIZE", async () => {
    const zip = await generateZip(makeAnswers());
    assertUniversalInvariants(zip);

    expect(zip.has(".claude/CLAUDE.md")).toBe(true);
    expect(zip.has(".claude/settings.json")).toBe(true);
    // aucune sous-couche de secteur
    expect([...zip.keys()].some((p) => /^[^.][^/]*\/\.claude\//.test(p))).toBe(false);
    // rien a bootstrapper -> pas d'INITIALIZE ni de directive
    expect(zip.has("INITIALIZE.md")).toBe(false);
    expect(zip.get(".claude/CLAUDE.md")).not.toContain("INITIALIZE.md");
    expect(zip.get(".claude/CLAUDE.md")).not.toContain("## Hiérarchie");
  });
});

describe("E2E — scenario complet (n0n1 + secteurs + skills + agents + outils, multi-profils)", () => {
  it("racine + squelettes N1 + INITIALIZE porte les commandes sourcees + directive racine", async () => {
    const zip = await generateZip(
      makeAnswers({
        profiles: ["dev", "audit"],
        rules: defaultRulesForProfiles(["dev", "audit"]),
        depth: "n0n1",
        sectors: ["web", "power-platform"],
        skills: ["document-skills"],
        agents: ["cct-code-reviewer"],
        tools: ["obsidian"],
        toolRules: ["obsidian"],
        author: "Alex",
        org: "Acme",
      }),
    );
    assertUniversalInvariants(zip);

    // racine + un squelette par secteur (deterministe, sans settings)
    expect(zip.has(".claude/CLAUDE.md")).toBe(true);
    expect(zip.has("web/.claude/CLAUDE.md")).toBe(true);
    expect(zip.has("power-platform/.claude/CLAUDE.md")).toBe(true);
    expect(zip.has("web/.claude/settings.json")).toBe(false);
    expect(zip.get("web/.claude/CLAUDE.md")).toContain("(secteur)");

    // section Hierarchie + directive INITIALIZE dans la racine
    const root = zip.get(".claude/CLAUDE.md") ?? "";
    expect(root).toContain("## Hiérarchie");
    expect(root).toContain("web, power-platform");
    expect(root).toContain("INITIALIZE.md");
    expect(root.toLowerCase()).toContain("première interaction");

    // INITIALIZE.md : commandes sourcees + idempotence + auto-suppression finale
    const init = zip.get("INITIALIZE.md") ?? "";
    expect(init).toContain("/plugin install document-skills@anthropic-agent-skills");
    expect(init).toContain(
      "npx claude-code-templates@latest --agent development-tools/code-reviewer --yes",
    );
    expect(init.toLowerCase()).toContain("idempotence");
    expect(init.toLowerCase()).toContain("supprimer ce fichier");
    // reference l'outil coche via TOOLS.md (pas de .mcp.json genere depuis D12)
    expect(zip.has("TOOLS.md")).toBe(true);
    expect(zip.has(".mcp.json")).toBe(false);

    // les deux postures (dev + audit) presentes dans la racine
    expect(root).toContain("Profil développement");
    expect(root.toLowerCase()).toContain("lecture seule");
  });
});

describe("E2E — scenario arbre complet (n0n1n2)", () => {
  it("racine + secteurs + projet exemple sous le premier secteur", async () => {
    const zip = await generateZip(
      makeAnswers({
        depth: "n0n1n2",
        sectors: ["web", "data-ml", "infra"],
        projectName: "portail",
      }),
    );
    assertUniversalInvariants(zip);

    expect(zip.has(".claude/CLAUDE.md")).toBe(true);
    expect(zip.has("web/.claude/CLAUDE.md")).toBe(true);
    expect(zip.has("data-ml/.claude/CLAUDE.md")).toBe(true);
    expect(zip.has("infra/.claude/CLAUDE.md")).toBe(true);
    // projet exemple UNIQUEMENT sous le premier secteur
    expect(zip.has("web/portail/.claude/CLAUDE.md")).toBe(true);
    expect(zip.get("web/portail/.claude/CLAUDE.md")).toContain("(projet)");
    expect([...zip.keys()].some((p) => /^data-ml\/[^/]+\/\.claude\//.test(p))).toBe(false);
    expect([...zip.keys()].some((p) => /^infra\/[^/]+\/\.claude\//.test(p))).toBe(false);
  });

  it("edge case : n0n1n2 sans aucun secteur ne plante pas et n'emet que la racine", async () => {
    const zip = await generateZip(makeAnswers({ depth: "n0n1n2", sectors: [] }));
    assertUniversalInvariants(zip);
    expect(zip.has(".claude/CLAUDE.md")).toBe(true);
    // aucune sous-couche
    expect([...zip.keys()].some((p) => p.includes("/.claude/") && !p.startsWith(".claude/"))).toBe(
      false,
    );
  });
});

describe("E2E — langue EN sur tout le pipeline", () => {
  it("la sortie generee est en anglais, sans directive francaise", async () => {
    const zip = await generateZip(
      makeAnswers({ language: "en", depth: "n0n1", sectors: ["web"], skills: ["document-skills"] }),
    );
    assertUniversalInvariants(zip);

    const root = zip.get(".claude/CLAUDE.md") ?? "";
    expect(root).toContain("Respond in English");
    expect(root).not.toContain("Répondre en français");
    expect(root).toContain("## Hierarchy");
    const init = zip.get("INITIALIZE.md") ?? "";
    expect(init.toLowerCase()).toContain("delete this");
    const sector = zip.get("web/.claude/CLAUDE.md") ?? "";
    expect(sector).toContain("(sector)");
  });
});
