import { ProfileConfig } from "../interface/ProfileConfig.interface";
import { PinnedRepo } from "../interface/PinnedRepo.interface";
import { GitHubStats } from "../interface/GitHubStats.interface";

function renderPinnedRepos(repos: PinnedRepo[]): string {
  if (repos.length === 0) return "";

  const cards = repos
    .map(
      (repo) =>
        `[![${repo.name}](https://github-readme-stats.vercel.app/api/pin/?username=${repo.url.split("/").slice(-2, -1)[0]}&repo=${repo.name}&theme=github_dark&hide_border=true&bg_color=0d1117)](${repo.url})`,
    )
    .join("\n");

  return `## Pinned Repositories

<div align="center">

${cards}

</div>`;
}

export function generateREADME(
  _username: string,
  config: ProfileConfig,
  stats: GitHubStats,
): string {
  const socialBadges = config.socialLinks
    .map(
      (link) =>
        `[![${link.platform}](https://img.shields.io/badge/${link.platform}-${link.label}-${link.color}?style=for-the-badge&logo=${link.logo})](${link.url})`,
    )
    .join("\n");

  const pinnedSection = renderPinnedRepos(stats.pinnedRepos);

  const skillsBlock = `\`\`\`typescript
const skills = {
  languages: ${JSON.stringify(config.skills.languages)},
  frontend: ${JSON.stringify(config.skills.frontend)},
  backend: ${JSON.stringify(config.skills.backend)},
  databases: ${JSON.stringify(config.skills.databases)},
  tools: ${JSON.stringify(config.skills.tools)},
  learning: ${JSON.stringify(config.skills.learning)}
};
\`\`\``;

  return `<div align="center">

![Profile Banner](./profile.svg)

</div>

---

<div align="center">

### Welcome to my GitHub Profile!

I'm a passionate developer who loves building amazing things with code. Currently exploring the world of **web development** and **cloud technologies**.

</div>

## About Me

-  I'm currently working on exciting web projects
-  Learning new technologies every day
-  Looking to collaborate on open source projects
-  Ask me about React, TypeScript, Node.js
-  Fun fact: I automate everything!

## GitHub Stats

${pinnedSection}

## Tech Stack

${skillsBlock}

## Connect With Me

<div align="center">

${socialBadges}

</div>

---

<div align="center">

**Last Updated:** ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}

*This README is automatically updated using GitHub Actions*

</div>`;
}
