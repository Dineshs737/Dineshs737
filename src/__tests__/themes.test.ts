import { describe, it, expect } from "vitest";
import { getTheme } from "../themes";

describe("getTheme", () => {
  it("returns the dark theme", () => {
    const theme = getTheme("dark");
    expect(theme.background).toBeDefined();
    expect(theme.statColors.commits).toBeDefined();
  });

  it("returns the light theme", () => {
    const theme = getTheme("light");
    expect(theme.primaryText).toBeDefined();
  });

  it("returns dracula theme", () => {
    const theme = getTheme("dracula");
    expect(theme.accent).toBeDefined();
  });

  it("returns nord theme", () => {
    const theme = getTheme("nord");
    expect(theme.cardBackground).toBeDefined();
  });

  it("falls back to dark for unknown theme", () => {
    const dark = getTheme("dark");
    const unknown = getTheme("nonexistent");
    expect(unknown).toEqual(dark);
  });
});
