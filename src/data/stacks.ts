import type { Localized, StackId } from "../types";

export interface StackPreset {
  id: StackId;
  label: Localized;
  summary: Localized;
  /** Entrées permissions.allow (Bash) injectées dans settings.json. */
  allow: string[];
  /** Framework de test cité par la règle tests-required. */
  testFramework?: string;
  /** Librairies versionnées à vérifier via context7 (règle research-before-code). */
  context7Libs?: string[];
  /** Note spécifique injectée dans CLAUDE.md. */
  note?: Localized;
}

export const STACK_PRESETS: readonly StackPreset[] = [
  {
    id: "web-ts",
    label: { fr: "Web / TypeScript", en: "Web / TypeScript" },
    summary: {
      fr: "Node, React/Next/Astro, Vite, Vitest, Playwright.",
      en: "Node, React/Next/Astro, Vite, Vitest, Playwright.",
    },
    allow: [
      "Bash(npm:*)",
      "Bash(npx:*)",
      "Bash(pnpm:*)",
      "Bash(yarn:*)",
      "Bash(bun:*)",
      "Bash(vite:*)",
      "Bash(tsc:*)",
      "Bash(eslint:*)",
      "Bash(prettier:*)",
      "Bash(vitest:*)",
      "Bash(playwright:*)",
      "Bash(node:*)",
    ],
    testFramework: "Vitest",
    context7Libs: ["Next.js", "React", "Tailwind CSS", "Drizzle ORM", "Zod"],
  },
  {
    id: "python",
    label: { fr: "Python", en: "Python" },
    summary: {
      fr: "uv/poetry, pytest, ruff, mypy, jupyter.",
      en: "uv/poetry, pytest, ruff, mypy, jupyter.",
    },
    allow: [
      "Bash(python:*)",
      "Bash(python3:*)",
      "Bash(pip:*)",
      "Bash(uv:*)",
      "Bash(poetry:*)",
      "Bash(pytest:*)",
      "Bash(ruff:*)",
      "Bash(mypy:*)",
      "Bash(jupyter:*)",
    ],
    testFramework: "pytest",
    note: {
      fr: "Environnement isolé obligatoire (uv ou venv). Conventions PEP 8.",
      en: "Isolated environment required (uv or venv). PEP 8 conventions.",
    },
  },
  {
    id: "rust",
    label: { fr: "Rust", en: "Rust" },
    summary: { fr: "cargo, rustc, clippy.", en: "cargo, rustc, clippy." },
    allow: ["Bash(cargo:*)", "Bash(rustc:*)", "Bash(rustup:*)"],
    testFramework: "cargo test",
  },
  {
    id: "go",
    label: { fr: "Go", en: "Go" },
    summary: { fr: "go build/test/vet, gofmt.", en: "go build/test/vet, gofmt." },
    allow: ["Bash(go:*)", "Bash(gofmt:*)"],
    testFramework: "go test",
  },
  {
    id: "docker-infra",
    label: { fr: "Docker / Infra", en: "Docker / Infra" },
    summary: {
      fr: "Docker, Compose, gh, terraform, kubectl.",
      en: "Docker, Compose, gh, terraform, kubectl.",
    },
    allow: [
      "Bash(docker:*)",
      "Bash(docker compose:*)",
      "Bash(gh:*)",
      "Bash(terraform:*)",
      "Bash(kubectl:*)",
      "Bash(ansible:*)",
    ],
    note: {
      fr: "Opérations destructives (docker rm, terraform destroy) derrière confirmation explicite.",
      en: "Destructive operations (docker rm, terraform destroy) behind explicit confirmation.",
    },
  },
  {
    id: "power-platform",
    label: { fr: "Power Platform", en: "Power Platform" },
    summary: {
      fr: "pac CLI, dotnet, MSAPP / Power Fx.",
      en: "pac CLI, dotnet, MSAPP / Power Fx.",
    },
    allow: ["Bash(pac:*)", "Bash(dotnet:*)", "Bash(msbuild:*)"],
    note: {
      fr: "Vérifier la syntaxe Power Fx / DAX sur la doc Microsoft officielle (learn.microsoft.com) AVANT génération. Locale FR vs US à confirmer.",
      en: "Verify Power Fx / DAX syntax against official Microsoft docs (learn.microsoft.com) BEFORE generating. FR vs US locale to confirm.",
    },
  },
  {
    id: "none",
    label: { fr: "Aucune / autre", en: "None / other" },
    summary: {
      fr: "Pas de stack imposée, permissions minimales.",
      en: "No imposed stack, minimal permissions.",
    },
    allow: [],
  },
];

export function stackById(id: StackId): StackPreset {
  const found = STACK_PRESETS.find((s) => s.id === id);
  if (!found) {
    throw new Error(`Stack inconnue: ${id}`);
  }
  return found;
}
