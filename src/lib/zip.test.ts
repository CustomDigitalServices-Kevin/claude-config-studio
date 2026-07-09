import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { buildZipBlob } from "./zip";
import { buildConfig } from "../generator/buildConfig";
import { defaultRulesForProfile } from "../data/profiles";
import type { Answers } from "../types";

const answers: Answers = {
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
};

function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

describe("buildZipBlob — pipeline ZIP", () => {
  it("produit un blob non vide contenant les fichiers generes", async () => {
    const files = buildConfig(answers);
    const blob = await buildZipBlob(files);
    expect(blob.size).toBeGreaterThan(0);

    const buffer = await blobToArrayBuffer(blob);
    const loaded = await JSZip.loadAsync(buffer);
    const names = Object.keys(loaded.files);

    expect(names).toContain(".claude/CLAUDE.md");
    expect(names).toContain(".claude/settings.json");
    expect(names).toContain("INSTALL.md");
    expect(names).toContain("README.md");

    const settings = await loaded.file(".claude/settings.json")?.async("string");
    expect(settings).toBeDefined();
    expect(() => JSON.parse(settings ?? "")).not.toThrow();
  });

  it("insere le manifeste config-studio.json a la racine quand il est fourni", async () => {
    const files = buildConfig(answers);
    const manifest = JSON.stringify({ version: 1, generator: "claude-config-studio", answers });
    const blob = await buildZipBlob(files, manifest);

    const buffer = await blobToArrayBuffer(blob);
    const loaded = await JSZip.loadAsync(buffer);
    expect(Object.keys(loaded.files)).toContain("config-studio.json");

    const roundtrip = await loaded.file("config-studio.json")?.async("string");
    expect(JSON.parse(roundtrip ?? "")).toEqual({
      version: 1,
      generator: "claude-config-studio",
      answers,
    });
  });

  it("sans manifeste : aucun config-studio.json dans le ZIP", async () => {
    const files = buildConfig(answers);
    const blob = await buildZipBlob(files);
    const loaded = await JSZip.loadAsync(await blobToArrayBuffer(blob));
    expect(Object.keys(loaded.files)).not.toContain("config-studio.json");
  });
});
