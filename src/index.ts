import * as fs from "fs";
import { loadConfig } from "./config/env";
import { collectStats } from "./services/stats-collector";
import { generateSVG } from "./generators/svg-generator";
import { generateREADME } from "./generators/readme-generator";
import { getTheme } from "./themes";
import profileConfig from "../profile.config";

async function main() {
  console.log("Starting GitHub Profile Generator...\n");

  const { token, username } = loadConfig();
  const theme = getTheme(profileConfig.theme);

  const stats = await collectStats(token, username, profileConfig);
  console.log("Stats collected successfully");

  const svg = generateSVG(stats, profileConfig, theme);
  console.log("SVG generated in memory");

  console.log("Writing profile.svg...");
  fs.writeFileSync("profile.svg", svg);
  console.log(`Profile SVG saved (${svg.length} bytes)`);

  console.log("Writing README.md...");
  const readme = generateREADME(username, profileConfig, stats);
  fs.writeFileSync("README.md", readme);
  console.log(`README.md saved (${readme.length} bytes)`);

  console.log("\nStats Summary:");
  console.log(`   Repositories: ${stats.repositories}`);
  console.log(`   Followers: ${stats.followers}`);
  console.log(`   Stars: ${stats.stars}`);
  console.log(`   Commits: ${stats.commits}`);
  console.log(`   Streak: ${stats.streak} days`);
  console.log(
    `   Languages: ${stats.languages
      .slice(0, 5)
      .map((l) => l.name)
      .join(", ")}`,
  );
  console.log(`   Recent Activity: ${stats.recentActivity.length} events`);
  console.log(`   Pinned Repos: ${stats.pinnedRepos.length}`);

  console.log("\nDone! Your profile is ready.");
}

main().catch((error) => {
  console.error("Error generating profile:", error);
  process.exit(1);
});
