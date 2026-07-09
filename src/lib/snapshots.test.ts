import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  listSnapshots,
  saveSnapshot,
  deleteSnapshot,
  getSnapshot,
  SNAPSHOTS_KEY,
  MAX_SNAPSHOTS,
  MAX_NAME_LENGTH,
} from "./snapshots";
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

describe("snapshots — persistance localStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("aucun snapshot : liste vide", () => {
    expect(listSnapshots()).toEqual([]);
  });

  it("save puis list restitue le snapshot (roundtrip)", () => {
    const answers = makeAnswers({ projectName: "acme", stacks: ["python"] });
    const snap = saveSnapshot("Config Acme", answers);
    expect(snap.name).toBe("Config Acme");
    expect(snap.id).toMatch(/.+/);
    expect(typeof snap.savedAt).toBe("string");

    const list = listSnapshots();
    expect(list).toHaveLength(1);
    expect(list[0]?.answers).toEqual(answers);
    expect(list[0]?.id).toBe(snap.id);
  });

  it("le plus recent est en tete de liste", () => {
    saveSnapshot("premier", makeAnswers());
    const second = saveSnapshot("second", makeAnswers());
    expect(listSnapshots()[0]?.id).toBe(second.id);
  });

  it("trim et bornes du nom : vide et trop long refuses", () => {
    expect(() => saveSnapshot("   ", makeAnswers())).toThrow();
    expect(() => saveSnapshot("x".repeat(MAX_NAME_LENGTH + 1), makeAnswers())).toThrow();
    // Une longueur limite exacte passe.
    expect(() => saveSnapshot("x".repeat(MAX_NAME_LENGTH), makeAnswers())).not.toThrow();
  });

  it("borne MAX_SNAPSHOTS : le 21e refuse avec erreur explicite", () => {
    for (let i = 0; i < MAX_SNAPSHOTS; i++) {
      saveSnapshot(`snap ${i}`, makeAnswers());
    }
    expect(listSnapshots()).toHaveLength(MAX_SNAPSHOTS);
    expect(() => saveSnapshot("de trop", makeAnswers())).toThrow();
  });

  it("entree invalide ignoree sans crash (les valides survivent)", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const valid = saveSnapshot("valide", makeAnswers());
    // Injection manuelle d'une entree corrompue a cote de la valide.
    const raw = JSON.parse(localStorage.getItem(SNAPSHOTS_KEY) ?? "{}") as {
      version: number;
      snapshots: unknown[];
    };
    raw.snapshots.push({ id: "bad", name: "corrompu", savedAt: "x", answers: { projectName: 1 } });
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(raw));

    const list = listSnapshots();
    expect(list).toHaveLength(1);
    expect(list[0]?.id).toBe(valid.id);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("version inconnue : liste vide", () => {
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify({ version: 99, snapshots: [] }));
    expect(listSnapshots()).toEqual([]);
  });

  it("payload corrompu (JSON invalide) : liste vide", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    localStorage.setItem(SNAPSHOTS_KEY, "{ not json");
    expect(listSnapshots()).toEqual([]);
    spy.mockRestore();
  });

  it("getSnapshot retourne l'entree ou null", () => {
    const snap = saveSnapshot("cible", makeAnswers({ projectName: "cible" }));
    expect(getSnapshot(snap.id)?.answers.projectName).toBe("cible");
    expect(getSnapshot("inexistant")).toBeNull();
  });

  it("deleteSnapshot retire l'entree, no-op sur id inconnu", () => {
    const a = saveSnapshot("a", makeAnswers());
    const b = saveSnapshot("b", makeAnswers());
    deleteSnapshot(a.id);
    expect(listSnapshots().map((s) => s.id)).toEqual([b.id]);
    // Id inconnu : ne jette pas, ne change rien.
    deleteSnapshot("inexistant");
    expect(listSnapshots()).toHaveLength(1);
  });
});
