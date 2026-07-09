import { describe, it, expect } from "vitest";
import Ajv, { type AnySchema } from "ajv";
import { generateSettings } from "./generator/settings";
import { HOOK_IDS, type Answers } from "./types";
// Schema vendore (offline, deterministe). resolveJsonModule permet l'import direct.
import schemaJson from "./test/claude-code-settings.schema.json";

const schema = schemaJson as AnySchema;

/**
 * Conformite de la sortie generateSettings au schema OFFICIEL Claude Code.
 *
 * Le schema (json.schemastore.org/claude-code-settings.json) est VENDORE dans
 * src/test/claude-code-settings.schema.json : le test est deterministe et offline
 * (aucun fetch reseau). Re-telecharger le fichier pour le rafraichir.
 *
 * Le schema est en JSON Schema draft-07 ; Ajv v8 le compile nativement. On passe
 * `strict: false` pour ignorer les mots-cles/formats non geres (ex `format: "uri"`,
 * documente : https://ajv.js.org/options.html#strict-mode) et `logger: false` pour
 * taire les avertissements "unknown format" a la compilation.
 */
const ajv = new Ajv({ strict: false, allErrors: true, logger: false });
const validate = ajv.compile(schema);

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
    rules: [],
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

const panels: Array<[string, Answers]> = [
  ["defauts", makeAnswers()],
  [
    "tout regle (advanced complet, attribution none, fallbackModel sonnet)",
    makeAnswers({
      profiles: ["dev", "audit"],
      stacks: ["web-ts", "python", "docker-infra"],
      advanced: {
        model: "sonnet",
        autoMemory: false,
        outputStyle: "Explanatory",
        permissionMode: "plan",
        fallbackModel: "sonnet",
        responseLanguage: "french",
        attribution: "none",
      },
    }),
  ],
  ["tous les hooks coches", makeAnswers({ hooks: [...HOOK_IDS] })],
];

describe("generateSettings — conformite au schema officiel schemastore (vendored, ajv)", () => {
  for (const [label, answers] of panels) {
    it(`panel "${label}" valide contre le schema officiel`, () => {
      const settings = generateSettings(answers);
      const ok = validate(settings);
      expect(ok, JSON.stringify(validate.errors, null, 2)).toBe(true);
    });
  }
});
