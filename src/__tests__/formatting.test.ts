import { describe, it, expect } from "vitest";
import { formatNumber, escapeXml } from "../utils/formatting";

describe("formatNumber", () => {
  it("returns plain number below 1000", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(999)).toBe("999");
  });

  it("formats thousands with k suffix", () => {
    expect(formatNumber(1000)).toBe("1.0k");
    expect(formatNumber(1500)).toBe("1.5k");
    expect(formatNumber(12345)).toBe("12.3k");
  });
});

describe("escapeXml", () => {
  it("escapes all XML special characters", () => {
    expect(escapeXml('Hello & "World" <test>')).toBe(
      "Hello &amp; &quot;World&quot; &lt;test&gt;",
    );
  });

  it("escapes apostrophes", () => {
    expect(escapeXml("it's")).toBe("it&apos;s");
  });

  it("returns plain string unchanged", () => {
    expect(escapeXml("hello world")).toBe("hello world");
  });
});
