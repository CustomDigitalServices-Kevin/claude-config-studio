import { describe, it, expect } from "vitest";
import { buildConfig } from "./buildConfig";
import { type Answers } from "../types";
import { defaultRulesForProfile } from "../data/profiles";

/**
 * Garde adversarial sur les chemins d'archive : un projectName hostile ne doit jamais
 * produire de traversee de repertoire ni de chemin absolu. Les chemins sont derives via
 * slugify (src/generator/text.ts) ; ce test verrouille cette garantie de bout en bout.
 *
 * Charte des chemins reels : segments slugifies + noms de fichiers en MAJUSCULES
 * (CLAUDE.md, INSTALL.md, README.md, TOOLS.md, INITIALIZE.md) + point (.claude, .mcp.json).
 * D'ou la regex qui autorise les majuscules mais aucun caractere de traversee.
 */
function makeAnswers(over: Partial<Answers> = {}): Answers {
  return {
    projectName: "my-project",
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
    rules: defaultRulesForProfile("dev"),
    rigor: "standard",
    hooks: [],
    tools: [],
    skills: [],
    agents: [],
    mcpServers: [],
    toolRules: [],
    ruleOptions: {},
    rulesAsSkills: false,
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

const HOSTILE_NAMES = [
  "../../etc",
  "C:\\evil",
  "..",
  "",
  "🚀 mon projet",
  "/etc/passwd",
  "..\\..\\windows",
  "....//....//",
];

const SAFE_PATH = /^[A-Za-z0-9._/-]+$/;

describe("buildConfig — chemins d'archive surs (projectName adversarial)", () => {
  for (const name of HOSTILE_NAMES) {
    it(`projectName ${JSON.stringify(name)} : aucun chemin dangereux`, () => {
      // depth n0n1n2 + un secteur : force projectName dans un chemin (couche projet exemple).
      const files = buildConfig(
        makeAnswers({
          projectName: name,
          depth: "n0n1n2",
          sectors: ["web"],
          // rulesAsSkills + règles skillables : force l'émission de chemins .claude/skills/<id>/SKILL.md
          rules: ["memory-hygiene", "research-before-code", "audit-readonly", "zero-improvisation"],
          rulesAsSkills: true,
          skills: ["document-skills"],
          agents: ["cct-code-reviewer"],
          tools: ["obsidian"],
          mcpServers: ["github"],
        }),
      );
      expect(files.length).toBeGreaterThan(0);
      for (const f of files) {
        expect(f.path.includes(".."), `".." dans "${f.path}"`).toBe(false);
        expect(f.path.startsWith("/"), `slash initial dans "${f.path}"`).toBe(false);
        expect(/^[A-Za-z]:/.test(f.path), `lettre de lecteur dans "${f.path}"`).toBe(false);
        expect(f.path.includes("\\"), `backslash dans "${f.path}"`).toBe(false);
        expect(SAFE_PATH.test(f.path), `caractere hors charte dans "${f.path}"`).toBe(true);
      }
    });
  }
});
