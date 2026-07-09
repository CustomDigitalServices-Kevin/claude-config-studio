// @vitest-environment node
// Environnement node : CompressionStream / DecompressionStream sont des globals
// Node >= 20 (jsdom ne les expose pas forcement). En navigateur ils sont Baseline 2023.
import { describe, it, expect } from "vitest";
import { encodeAnswers, decodeAnswers } from "./permalink";
import { defaultRulesForProfile } from "../data/profiles";
import type { Answers } from "../types";

function makeAnswers(over: Partial<Answers> = {}): Answers {
  return {
    projectName: "demo",
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

describe("permalink — encode/decode roundtrip", () => {
  it("restitue les memes reponses apres un cycle complet", async () => {
    const answers = makeAnswers({
      projectName: "acme",
      author: "Alex",
      profiles: ["dev", "audit"],
      depth: "n0n1",
      sectors: ["web", "infra"],
      stacks: ["python", "rust"],
      ruleOptions: { "context-alert.threshold": 70 },
    });
    const hash = await encodeAnswers(answers);
    expect(hash).not.toContain("+");
    expect(hash).not.toContain("/");
    expect(hash).not.toContain("=");
    expect(await decodeAnswers(hash)).toEqual(answers);
  });

  it("hash corrompu : decode retourne null", async () => {
    expect(await decodeAnswers("!!!not-base64!!!")).toBeNull();
  });

  it("base64url valide mais donnees non deflate : decode retourne null", async () => {
    expect(await decodeAnswers("aGVsbG8")).toBeNull();
  });
});
