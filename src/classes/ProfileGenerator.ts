import * as fs from "fs";
import { ProfileConfig } from "../interface/ProfileConfig.interface";
import { GitHubStats } from "../interface/GitHubStats.interface";
import { Theme } from "../interface/Theme.interface";
import { collectStats } from "../services/stats-collector";
import { generateSVG } from "../generators/svg-generator";
import { generateREADME } from "../generators/readme-generator";
import { getTheme } from "../themes";
import { validateConfig } from "../validation/config.schema";

export class ProfileGenerator {
  private config: ProfileConfig;
  private theme: Theme;
  private token: string;
  private username: string;
  private stats: GitHubStats | null = null;

  constructor(token: string, username: string, config: ProfileConfig) {
    validateConfig(config);
    this.token = token;
    this.username = username;
    this.config = config;
    this.theme = getTheme(config.theme);
  }

  async fetchStats(): Promise<GitHubStats> {
    this.stats = await collectStats(this.token, this.username, this.config);
    return this.stats;
  }

  generateSVG(): string {
    if (!this.stats) {
      throw new Error("Stats not fetched yet. Call fetchStats() first.");
    }
    return generateSVG(this.stats, this.config, this.theme);
  }

  generateREADME(): string {
    if (!this.stats) {
      throw new Error("Stats not fetched yet. Call fetchStats() first.");
    }
    return generateREADME(this.username, this.config, this.stats);
  }

  async generate(outputDir: string = "."): Promise<{ svgSize: number; readmeSize: number }> {
    await this.fetchStats();

    const svg = this.generateSVG();
    const svgPath = `${outputDir}/profile.svg`;
    fs.writeFileSync(svgPath, svg);

    const readme = this.generateREADME();
    const readmePath = `${outputDir}/README.md`;
    fs.writeFileSync(readmePath, readme);

    return { svgSize: svg.length, readmeSize: readme.length };
  }

  getStats(): GitHubStats | null {
    return this.stats;
  }

  getTheme(): Theme {
    return this.theme;
  }

  setTheme(themeName: string): void {
    this.theme = getTheme(themeName);
  }
}
