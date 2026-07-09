import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { SnapshotsPanel } from "./SnapshotsPanel";
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

beforeEach(() => {
  localStorage.clear();
});

afterEach(cleanup);

describe("SnapshotsPanel — sauvegarde et liste (jsdom localStorage)", () => {
  it("affiche l'etat vide au depart", () => {
    render(
      <SnapshotsPanel
        lang="fr"
        answers={baseAnswers}
        onApply={() => true}
        onClose={() => undefined}
      />,
    );
    expect(screen.getByText("Aucun snapshot enregistré pour l'instant.")).toBeInTheDocument();
  });

  it("sauvegarde l'etat courant sous un nom puis l'affiche dans la liste", () => {
    render(
      <SnapshotsPanel
        lang="fr"
        answers={baseAnswers}
        onApply={() => true}
        onClose={() => undefined}
      />,
    );
    const input = screen.getByPlaceholderText("Nom du snapshot");
    fireEvent.change(input, { target: { value: "Ma config" } });
    fireEvent.click(screen.getByText("Sauvegarder l'état courant"));

    expect(screen.getByText("Ma config")).toBeInTheDocument();
    expect(screen.queryByText("Aucun snapshot enregistré pour l'instant.")).toBeNull();
    // Persistance reelle : une nouvelle instance relit le snapshot depuis localStorage.
    cleanup();
    render(
      <SnapshotsPanel
        lang="fr"
        answers={baseAnswers}
        onApply={() => true}
        onClose={() => undefined}
      />,
    );
    expect(screen.getByText("Ma config")).toBeInTheDocument();
  });

  it("refuse un nom vide avec un message d'erreur, sans creer de snapshot", () => {
    render(
      <SnapshotsPanel
        lang="fr"
        answers={baseAnswers}
        onApply={() => true}
        onClose={() => undefined}
      />,
    );
    fireEvent.click(screen.getByText("Sauvegarder l'état courant"));
    expect(screen.getByText("Le nom doit faire entre 1 et 60 caractères.")).toBeInTheDocument();
    expect(screen.getByText("Aucun snapshot enregistré pour l'instant.")).toBeInTheDocument();
  });

  it("applique un snapshot via onApply et ferme le panneau", () => {
    let applied: Answers | null = null;
    let closed = false;
    render(
      <SnapshotsPanel
        lang="fr"
        answers={baseAnswers}
        onApply={(next) => {
          applied = next;
          return true;
        }}
        onClose={() => {
          closed = true;
        }}
      />,
    );
    const input = screen.getByPlaceholderText("Nom du snapshot");
    fireEvent.change(input, { target: { value: "Snap A" } });
    fireEvent.click(screen.getByText("Sauvegarder l'état courant"));

    const row = screen.getByText("Snap A").closest("li");
    expect(row).not.toBeNull();
    if (row) {
      fireEvent.click(within(row).getByText("Appliquer"));
    }
    expect(applied).not.toBeNull();
    expect(closed).toBe(true);
  });
});
