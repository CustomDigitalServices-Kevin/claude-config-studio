import { describe, it, expect, beforeEach } from "vitest";
import { saveAnswers, loadAnswers, clearAnswers, STORAGE_KEY } from "./persist";
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

describe("persist — localStorage roundtrip", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("save puis load restitue les memes reponses", () => {
    const answers = makeAnswers({
      projectName: "acme",
      author: "Alex",
      stacks: ["python", "rust"],
    });
    saveAnswers(answers);
    expect(loadAnswers()).toEqual(answers);
  });

  it("aucune donnee stockee : load retourne null", () => {
    expect(loadAnswers()).toBeNull();
  });

  it("payload corrompu (JSON invalide) : load retourne null", () => {
    localStorage.setItem(STORAGE_KEY, "{ not json");
    expect(loadAnswers()).toBeNull();
  });

  it("version inconnue : load retourne null", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 99, answers: makeAnswers() }));
    expect(loadAnswers()).toBeNull();
  });

  it("schema invalide (champ manquant) : load retourne null", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, answers: { projectName: 1 } }));
    expect(loadAnswers()).toBeNull();
  });

  it("clear efface les reponses persistees", () => {
    saveAnswers(makeAnswers());
    clearAnswers();
    expect(loadAnswers()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
