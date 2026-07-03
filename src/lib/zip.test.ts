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
  toolRules: [],
  ruleOptions: {},
  memoryNote: "",
  advanced: { model: "", autoMemory: true, outputStyle: "", permissionMode: "" },
  workflow: { defaultBehavior: "act", advisor: { enabled: false, model: "" }, orchestration: false },
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
});
