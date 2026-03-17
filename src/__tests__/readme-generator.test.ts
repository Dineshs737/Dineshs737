import { describe, it, expect } from "vitest";
import { generateREADME } from "../generators/readme-generator";
import { GitHubStats } from "../interface/GitHubStats.interface";
import { ProfileConfig } from "../interface/ProfileConfig.interface";

const mockConfig: ProfileConfig = {
  defaults: {
    name: "TestUser",
    location: "Test City",
    bio: "Tester",
    company: "@Testing",
    blog: "test.dev",
  },
  techStack: [
    {
      name: "TypeScript",
      color: "#3178c6",
      iconType: "rect-text",
      iconData: "TS",
    },
  ],
  quote: "Test quote",
  socialLinks: [
    {
      platform: "GitHub",
      label: "testuser",
      url: "https://github.com/testuser",
      color: "181717",
      logo: "github",
    },
  ],
  svg: { width: 1400, height: 1050 },
  theme: "dark",
  skills: {
    languages: ["TypeScript"],
    frontend: ["React"],
    backend: ["Node.js"],
    databases: ["PostgreSQL"],
    tools: ["Git"],
    learning: ["Rust"],
  },
};

const mockStats: GitHubStats = {
  name: "TestUser",
  username: "testuser",
  location: "Test City",
  bio: "Tester",
  company: "@Testing",
  blog: "test.dev",
  repositories: 10,
  followers: 50,
  following: 20,
  commits: 500,
  pullRequests: 30,
  issues: 15,
  stars: 100,
  streak: 7,
  linesOfCode: 50000,
  languages: [],
  contributionCalendar: [],
  recentActivity: [],
  pinnedRepos: [],
};

describe("generateREADME", () => {
  it("generates valid markdown with profile banner", () => {
    const readme = generateREADME("testuser", mockConfig, mockStats);
    expect(readme).toContain("![Profile Banner](./profile.svg)");
  });

  it("includes social badges", () => {
    const readme = generateREADME("testuser", mockConfig, mockStats);
    expect(readme).toContain("img.shields.io/badge/GitHub");
    expect(readme).toContain("https://github.com/testuser");
  });

  it("includes skills block", () => {
    const readme = generateREADME("testuser", mockConfig, mockStats);
    expect(readme).toContain('"TypeScript"');
    expect(readme).toContain('"React"');
    expect(readme).toContain('"Rust"');
  });

  it("includes pinned repos when available", () => {
    const statsWithPinned = {
      ...mockStats,
      pinnedRepos: [
        {
          name: "cool-project",
          description: "A cool project",
          stars: 42,
          forks: 5,
          language: "TypeScript",
          languageColor: "#3178c6",
          url: "https://github.com/testuser/cool-project",
        },
      ],
    };
    const readme = generateREADME("testuser", mockConfig, statsWithPinned);
    expect(readme).toContain("cool-project");
    expect(readme).toContain("Pinned Repositories");
  });
});
