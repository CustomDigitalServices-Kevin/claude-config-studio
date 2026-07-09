import { describe, it, expect } from "vitest";
import { formatVerified } from "./chrome";

describe("formatVerified", () => {
  it("formate une date ISO valide en FR (JJ/MM/AAAA)", () => {
    expect(formatVerified("2026-07-09", "fr")).toBe("Vérifié le 09/07/2026");
  });

  it("formate une date ISO valide en EN (AAAA-MM-JJ)", () => {
    expect(formatVerified("2026-07-09", "en")).toBe("Verified 2026-07-09");
  });

  it("retourne une chaine vide quand la date est absente", () => {
    expect(formatVerified(undefined, "fr")).toBe("");
    expect(formatVerified("", "en")).toBe("");
  });

  it("retourne une chaine vide sur une date malformee", () => {
    expect(formatVerified("2026-07", "fr")).toBe("");
    expect(formatVerified("not-a-date", "en")).toBe("");
    expect(formatVerified("2026-07-", "fr")).toBe("");
    expect(formatVerified("2026-13-xx", "fr")).toBe("");
  });
});
