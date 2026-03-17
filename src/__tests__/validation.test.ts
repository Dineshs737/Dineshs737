import { describe, it, expect } from "vitest";
import { profileConfigSchema } from "../validation/config.schema";
import profileConfig from "../../profile.config";

describe("profileConfigSchema", () => {
  it("validates the actual profile config", () => {
    const result = profileConfigSchema.safeParse(profileConfig);
    expect(result.success).toBe(true);
  });

  it("rejects config with missing name", () => {
    const bad = {
      ...profileConfig,
      defaults: { ...profileConfig.defaults, name: "" },
    };
    const result = profileConfigSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it("rejects config with invalid theme", () => {
    const bad = { ...profileConfig, theme: "neon" };
    const result = profileConfigSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it("rejects config with invalid hex color in tech stack", () => {
    const bad = {
      ...profileConfig,
      techStack: [{ name: "Test", color: "red", iconType: "rect-text", iconData: "T" }],
    };
    const result = profileConfigSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it("rejects config with invalid social link URL", () => {
    const bad = {
      ...profileConfig,
      socialLinks: [
        { platform: "Test", label: "test", url: "not-a-url", color: "000", logo: "test" },
      ],
    };
    const result = profileConfigSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it("rejects config with empty tech stack", () => {
    const bad = { ...profileConfig, techStack: [] };
    const result = profileConfigSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });
});
