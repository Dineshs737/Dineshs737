import { describe, it, expect } from "vitest";
import { getLanguageColor, languageColors } from "../data/language-colors";

describe("getLanguageColor", () => {
  it("returns correct color for known languages", () => {
    expect(getLanguageColor("JavaScript")).toBe("#f1e05a");
    expect(getLanguageColor("TypeScript")).toBe("#3178c6");
    expect(getLanguageColor("Python")).toBe("#3572A5");
  });

  it("returns fallback color for unknown languages", () => {
    expect(getLanguageColor("UnknownLang")).toBe("#8b949e");
  });

  it("has entries for common languages", () => {
    const expected = ["JavaScript", "TypeScript", "Python", "Java", "Go", "Rust"];
    for (const lang of expected) {
      expect(languageColors[lang]).toBeDefined();
    }
  });
});
