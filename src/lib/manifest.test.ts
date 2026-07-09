import { describe, it, expect } from "vitest";
import { buildManifest, coerceAnswers, parseManifestJson, parseManifestZip } from "./manifest";
import { buildZipBlob } from "./zip";
import { buildConfig } from "../generator/buildConfig";
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

function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

describe("manifest — coerceAnswers", () => {
  it("accepte le manifeste enveloppe { version, generator, answers }", () => {
    const answers = makeAnswers({ author: "Alex" });
    const parsed = JSON.parse(buildManifest(answers)) as unknown;
    expect(coerceAnswers(parsed)).toEqual(answers);
  });

  it("accepte un objet Answers brut", () => {
    const answers = makeAnswers({ projectName: "raw" });
    expect(coerceAnswers(answers)).toEqual(answers);
  });

  it("rejette un objet invalide", () => {
    expect(coerceAnswers({ nope: true })).toBeNull();
    expect(coerceAnswers("string")).toBeNull();
    expect(coerceAnswers(null)).toBeNull();
  });
});

describe("manifest — parseManifestJson", () => {
  it("parse un manifeste JSON valide", () => {
    const answers = makeAnswers({ stacks: ["python"] });
    expect(parseManifestJson(buildManifest(answers))).toEqual(answers);
  });

  it("retourne null sur JSON invalide", () => {
    expect(parseManifestJson("{ not json")).toBeNull();
  });

  it("retourne null sur JSON valide mais hors schema", () => {
    expect(parseManifestJson(JSON.stringify({ answers: { projectName: 42 } }))).toBeNull();
  });
});

describe("manifest — ZIP roundtrip complet", () => {
  it("le manifeste est present dans le ZIP et se re-importe a l'identique", async () => {
    const answers = makeAnswers({
      author: "Alex",
      profiles: ["dev", "audit"],
      depth: "n0n1",
      sectors: ["web"],
      skills: ["document-skills"],
    });
    const files = buildConfig(answers);
    const blob = await buildZipBlob(files, buildManifest(answers));
    const buffer = await blobToArrayBuffer(blob);
    const reimported = await parseManifestZip(buffer);
    expect(reimported).toEqual(answers);
  });

  it("ZIP sans manifeste : parseManifestZip retourne null", async () => {
    const files = buildConfig(makeAnswers());
    const blob = await buildZipBlob(files);
    const buffer = await blobToArrayBuffer(blob);
    expect(await parseManifestZip(buffer)).toBeNull();
  });
});
