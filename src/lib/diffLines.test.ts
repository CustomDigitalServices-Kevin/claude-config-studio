import { describe, it, expect } from "vitest";
import { diffLines, type DiffLine } from "./diffLines";

/** Reconstruit `a` (same + removed) et `b` (same + added) depuis le diff : invariant global. */
function reconstruct(diff: DiffLine[]): { a: string[]; b: string[] } {
  const a: string[] = [];
  const b: string[] = [];
  for (const d of diff) {
    if (d.type === "same") {
      a.push(d.line);
      b.push(d.line);
    } else if (d.type === "removed") {
      a.push(d.line);
    } else {
      b.push(d.line);
    }
  }
  return { a, b };
}

describe("diffLines — LCS pure", () => {
  it("deux chaines vides : aucun changement", () => {
    expect(diffLines("", "")).toEqual([]);
  });

  it("fichiers identiques : tout en same", () => {
    const diff = diffLines("a\nb\nc", "a\nb\nc");
    expect(diff).toEqual([
      { type: "same", line: "a" },
      { type: "same", line: "b" },
      { type: "same", line: "c" },
    ]);
  });

  it("ajout pur depuis une chaine vide : tout en added", () => {
    expect(diffLines("", "x\ny")).toEqual([
      { type: "added", line: "x" },
      { type: "added", line: "y" },
    ]);
  });

  it("suppression pure vers une chaine vide : tout en removed", () => {
    expect(diffLines("x\ny", "")).toEqual([
      { type: "removed", line: "x" },
      { type: "removed", line: "y" },
    ]);
  });

  it("ajout d'une ligne a la fin", () => {
    expect(diffLines("a\nb", "a\nb\nc")).toEqual([
      { type: "same", line: "a" },
      { type: "same", line: "b" },
      { type: "added", line: "c" },
    ]);
  });

  it("suppression d'une ligne au milieu", () => {
    expect(diffLines("a\nb\nc", "a\nc")).toEqual([
      { type: "same", line: "a" },
      { type: "removed", line: "b" },
      { type: "same", line: "c" },
    ]);
  });

  it("modification au milieu (une ligne remplacee)", () => {
    const diff = diffLines("a\nb\nc", "a\nB\nc");
    // La ligne du milieu differe : b retire, B ajoute, bornes conservees.
    expect(diff).toContainEqual({ type: "removed", line: "b" });
    expect(diff).toContainEqual({ type: "added", line: "B" });
    expect(diff[0]).toEqual({ type: "same", line: "a" });
    expect(diff[diff.length - 1]).toEqual({ type: "same", line: "c" });
    const { a, b } = reconstruct(diff);
    expect(a).toEqual(["a", "b", "c"]);
    expect(b).toEqual(["a", "B", "c"]);
  });

  it("cas reel : deux CLAUDE.md avec des regles differentes", () => {
    const md1 = [
      "# Standards du projet",
      "",
      "## Regle 1 - Zero improvisation",
      "Toujours sourcer avant de coder.",
      "",
      "## Regle 2 - Tests",
      "Chaque bug devient un test.",
    ].join("\n");
    const md2 = [
      "# Standards du projet",
      "",
      "## Regle 1 - Zero improvisation",
      "Toujours sourcer avant de coder.",
      "",
      "## Regle 2 - Securite OWASP",
      "Valider chaque entree externe.",
    ].join("\n");

    const diff = diffLines(md1, md2);
    // Les 5 premieres lignes (titre + regle 1) sont communes.
    expect(diff.slice(0, 5).every((d) => d.type === "same")).toBe(true);
    expect(diff).toContainEqual({ type: "removed", line: "## Regle 2 - Tests" });
    expect(diff).toContainEqual({ type: "added", line: "## Regle 2 - Securite OWASP" });

    const { a, b } = reconstruct(diff);
    expect(a.join("\n")).toBe(md1);
    expect(b.join("\n")).toBe(md2);
  });
});
