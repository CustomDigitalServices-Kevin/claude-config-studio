import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { GeneratorTab } from "./GeneratorTab";
import type { Answers, Language } from "../types";

const baseAnswers: Answers = {
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
  rules: ["zero-improvisation"],
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

/** Wrapper stateful : fournit un vrai setAnswers, comme App le fait en prod. */
function Harness({ lang = "fr" }: { lang?: Language } = {}) {
  const [answers, setAnswers] = useState<Answers>(baseAnswers);
  return <GeneratorTab answers={answers} setAnswers={setAnswers} lang={lang} />;
}

afterEach(cleanup);

describe("GeneratorTab navigation", () => {
  const NAV_LABELS = [
    "Identité",
    "Profils & structure",
    "Langue, rigueur & stack",
    "Garde-fous",
    "Hooks",
    "Outils tiers",
    "Skills",
    "Agents",
    "Workflow",
    "Settings avancés",
  ];

  it("affiche exactement les dix entrees du rail de navigation", () => {
    render(<Harness />);
    for (const label of NAV_LABELS) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    const rail = screen.getByRole("navigation", { name: "Sections" });
    expect(within(rail).getAllByRole("button")).toHaveLength(NAV_LABELS.length);
  });

  const NAV_LABELS_EN = [
    "Identity",
    "Profiles & structure",
    "Language, rigor & stack",
    "Guardrails",
    "Hooks",
    "Third-party tools",
    "Skills",
    "Agents",
    "Workflow",
    "Advanced settings",
  ];

  it("affiche les labels EN dans le rail quand lang=en (chrome pilote par le toggle header)", () => {
    render(<Harness lang="en" />);
    const rail = screen.getByRole("navigation", { name: "Sections" });
    for (const label of NAV_LABELS_EN) {
      expect(within(rail).getByText(label)).toBeInTheDocument();
    }
    // Le rail FR ne fuit pas : le libelle FR distinctif est absent en mode EN.
    expect(within(rail).queryByText("Identité")).toBeNull();
    expect(within(rail).queryByText("Settings avancés")).toBeNull();
  });

  it("ouvre la section Identite par defaut (champ Nom du projet)", () => {
    render(<Harness />);
    expect(screen.getByText("Nom du dossier de travail")).toBeInTheDocument();
  });

  it("change de section au clic et demonte la precedente", () => {
    render(<Harness />);
    expect(screen.getByText("Nom du dossier de travail")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Hooks"));
    expect(screen.getByText("Hooks (opt-in)")).toBeInTheDocument();
    expect(screen.queryByText("Nom du dossier de travail")).toBeNull();

    fireEvent.click(screen.getByText("Profils & structure"));
    expect(screen.getByText("Profils d'usage")).toBeInTheDocument();
    expect(screen.queryByText("Hooks (opt-in)")).toBeNull();
  });
});
