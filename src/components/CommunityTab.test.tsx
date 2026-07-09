import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { CommunityTab } from "./CommunityTab";
import { defaultRulesForProfile } from "../data/profiles";
import type { Answers } from "../types";

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
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("CommunityTab — degradation Board indisponible", () => {
  it("affiche l'encart d'erreur proprement quand le fetch rejette (Studio reste fonctionnel)", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("network down"))),
    );

    render(<CommunityTab lang="fr" answers={baseAnswers} onApply={() => undefined} />);

    // L'encart discret apparait, sans crash : le composant reste monte et interactif.
    expect(await screen.findByText("Board indisponible")).toBeInTheDocument();
    // Le bouton de publication reste rendu (le Studio n'est pas bloque par le Board down).
    expect(screen.getAllByText("Publier ma config").length).toBeGreaterThan(0);
  });

  it("affiche l'etat de chargement (skeleton) tant que le fetch n'a pas repondu", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => undefined)),
    );
    const { container } = render(
      <CommunityTab lang="fr" answers={baseAnswers} onApply={() => undefined} />,
    );
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});
