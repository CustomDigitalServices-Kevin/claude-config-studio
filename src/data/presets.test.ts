import { describe, it, expect } from "vitest";
import { PRESETS, applyPreset } from "./presets";
import { initialAnswers } from "./defaults";
import { defaultRulesForProfiles } from "./profiles";
import {
  PROFILE_IDS,
  STACK_IDS,
  RULE_IDS,
  HOOK_IDS,
  answersSchema,
  type Answers,
} from "../types";

const profileSet = new Set<string>(PROFILE_IDS);
const stackSet = new Set<string>(STACK_IDS);
const ruleSet = new Set<string>(RULE_IDS);
const hookSet = new Set<string>(HOOK_IDS);

describe("presets", () => {
  it("ne reference que des ids existants dans les catalogues", () => {
    for (const preset of PRESETS) {
      for (const p of preset.answers.profiles ?? []) {
        expect(profileSet.has(p), `${preset.id}: profil ${p}`).toBe(true);
      }
      for (const s of preset.answers.stacks ?? []) {
        expect(stackSet.has(s), `${preset.id}: stack ${s}`).toBe(true);
      }
      for (const r of preset.answers.rules ?? []) {
        expect(ruleSet.has(r), `${preset.id}: regle ${r}`).toBe(true);
      }
      for (const h of preset.answers.hooks ?? []) {
        expect(hookSet.has(h), `${preset.id}: hook ${h}`).toBe(true);
      }
    }
  });

  it("produit un Answers valide (schema Zod) pour chaque preset", () => {
    for (const preset of PRESETS) {
      const result = applyPreset(initialAnswers(), preset);
      expect(() => answersSchema.parse(result), preset.id).not.toThrow();
    }
  });

  it("derive les regles des profils quand le preset ne les fixe pas", () => {
    for (const preset of PRESETS) {
      if (preset.answers.rules === undefined) {
        const result = applyPreset(initialAnswers(), preset);
        expect(result.rules, preset.id).toEqual(defaultRulesForProfiles(result.profiles));
      }
    }
  });

  it("preserve les champs d'identite deja saisis, applique le reste du preset", () => {
    const current: Answers = {
      ...initialAnswers(),
      projectName: "mon-app",
      author: "Alice",
      org: "Acme",
      companyId: "123456789",
      authorRole: "Lead dev",
    };
    const preset = PRESETS.find((p) => p.id === "data-scientist");
    if (!preset) {
      throw new Error("preset data-scientist introuvable");
    }
    const result = applyPreset(current, preset);

    // Identite preservee
    expect(result.projectName).toBe("mon-app");
    expect(result.author).toBe("Alice");
    expect(result.org).toBe("Acme");
    expect(result.companyId).toBe("123456789");
    expect(result.authorRole).toBe("Lead dev");

    // Preset applique
    expect(result.profiles).toEqual(["data-ml"]);
    expect(result.stacks).toEqual(["python"]);
    expect(result.rules).toEqual(defaultRulesForProfiles(["data-ml"]));
  });

  it("applique les hooks du preset debutant", () => {
    const preset = PRESETS.find((p) => p.id === "debutant");
    if (!preset) {
      throw new Error("preset debutant introuvable");
    }
    const result = applyPreset(initialAnswers(), preset);
    expect(result.rigor).toBe("light");
    expect(result.hooks).toEqual(["session-start-reminder", "session-end-reminder"]);
  });
});
