import { GitHubStats } from "../interface/GitHubStats.interface";
import { ProfileConfig } from "../interface/ProfileConfig.interface";
import { Theme } from "../interface/Theme.interface";
import { TechItem } from "../interface/TechItem.interface";
import { formatNumber, escapeXml } from "../utils/formatting";

function renderTechIcon(item: TechItem, x: number, y: number): string {
  const iconGroup =
    item.iconType === "rect-text"
      ? `<rect x="8" y="8" width="26" height="26" rx="3" fill="${item.color}"/>
         <text x="21" y="28" fill="#ffffff" font-family="'Segoe UI', sans-serif" font-size="15" font-weight="bold" text-anchor="middle">${item.iconData}</text>`
      : `<g transform="translate(26, 26)">${item.iconData}</g>`;

  return `<g transform="translate(${x}, ${y})">
    ${iconGroup}
    <text x="65" y="32" fill="${item.color}" font-family="'Segoe UI', sans-serif" font-size="19" font-weight="600">${escapeXml(item.name)}</text>
  </g>`;
}

function renderTechStack(items: TechItem[]): string {
  // Layout: up to 3 columns per row
  // Row 1: items 0,1,2 at x = 0, 140, 310
  // Row 2: items 3,4 at x = 0, 160
  // Row 3: items 5,6,7 at x = 0, 150, 280
  const positions: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < items.length; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const rowHeight = 70;
    const y = row * rowHeight;

    let x: number;
    if (row === 0) {
      x = [0, 140, 310][col] ?? col * 150;
    } else if (row === 1) {
      x = [0, 160, 310][col] ?? col * 150;
    } else {
      x = [0, 150, 280][col] ?? col * 150;
    }

    positions.push({ x, y });
  }

  return items
    .map((item, i) => renderTechIcon(item, positions[i].x, positions[i].y))
    .join("\n");
}

export function generateSVG(
  stats: GitHubStats,
  config: ProfileConfig,
  theme: Theme,
): string {
  const width = 1400;
  const height = 900;
  const name = escapeXml(stats.name);
  const username = escapeXml(stats.username);
  const location = escapeXml(stats.location);
  const bio = escapeXml(stats.bio);
  const company = escapeXml(stats.company);
  const blog = escapeXml(stats.blog || `github.com/${stats.username}`);
  const quote = escapeXml(config.quote);

  const initials = stats.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const techStackSvg = renderTechStack(config.techStack);

  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${theme.background}"/>

  <!-- Main Card -->
  <rect x="50" y="50" width="1300" height="800" rx="20" fill="${theme.cardBackground}" stroke="${theme.cardBorder}" stroke-width="3"/>

  <!-- Vertical Divider -->
  <line x1="700" y1="50" x2="700" y2="600" stroke="${theme.cardBorder}" stroke-width="3"/>

  <!-- Left Section -->
  <g transform="translate(50, 0)">
    <!-- Profile Header -->
    <text x="250" y="120"
          fill="${theme.accent}"
          font-family="'Segoe UI', -apple-system, system-ui, sans-serif"
          font-size="32"
          font-weight="700"
          text-anchor="middle">
      ${name}
    </text>

    <text x="250" y="155"
          fill="${theme.secondaryText}"
          font-family="'Segoe UI', -apple-system, system-ui, sans-serif"
          font-size="20"
          text-anchor="middle">
      @${username}
    </text>

    <!-- Profile Info -->
    <g transform="translate(80, 200)">
      <text x="0" y="0" fill="${theme.secondaryText}" font-family="'Segoe UI', sans-serif" font-size="19">
        <tspan x="0" dy="0">📍 ${location}</tspan>
        <tspan x="0" dy="40">💼 ${bio}</tspan>
        <tspan x="0" dy="40">🏢 ${company}</tspan>
        <tspan x="0" dy="40">🔗 ${blog}</tspan>
      </text>
    </g>

    <!-- Stats Cards -->
    <g transform="translate(60, 800)">
      <g transform="translate(0, 0)">
        <rect width="100" height="65" rx="10" fill="${theme.background}" stroke="${theme.cardBorder}" stroke-width="2"/>
        <text x="50" y="30" fill="${theme.accent}" font-family="'Segoe UI', sans-serif" font-size="24" font-weight="700" text-anchor="middle">${stats.repositories}</text>
        <text x="50" y="50" fill="${theme.secondaryText}" font-family="'Segoe UI', sans-serif" font-size="12" text-anchor="middle">Repositories</text>
      </g>

      <g transform="translate(110, 0)">
        <rect width="100" height="65" rx="10" fill="${theme.background}" stroke="${theme.cardBorder}" stroke-width="2"/>
        <text x="50" y="30" fill="${theme.accent}" font-family="'Segoe UI', sans-serif" font-size="24" font-weight="700" text-anchor="middle">${formatNumber(stats.followers)}</text>
        <text x="50" y="50" fill="${theme.secondaryText}" font-family="'Segoe UI', sans-serif" font-size="12" text-anchor="middle">Followers</text>
      </g>

      <g transform="translate(220, 0)">
        <rect width="100" height="65" rx="10" fill="${theme.background}" stroke="${theme.cardBorder}" stroke-width="2"/>
        <text x="50" y="30" fill="${theme.accent}" font-family="'Segoe UI', sans-serif" font-size="24" font-weight="700" text-anchor="middle">${formatNumber(stats.following)}</text>
        <text x="50" y="50" fill="${theme.secondaryText}" font-family="'Segoe UI', sans-serif" font-size="12" text-anchor="middle">Following</text>
      </g>
    </g>

    <!-- Programming Languages & Technologies -->
    <text x="70" y="370"
          fill="${theme.primaryText}"
          font-family="'Segoe UI', sans-serif"
          font-size="20"
          font-weight="600">
      Tech Stack
    </text>

    <g transform="translate(70, 395)">
      ${techStackSvg}
    </g>

    <!-- Quote -->
    <text x="250" y="650"
          fill="${theme.secondaryText}"
          font-family="'Segoe UI', sans-serif"
          font-size="18"
          text-anchor="middle"
          font-style="italic">
      ☕ ${quote}
    </text>
  </g>

  <!-- Right Section - GitHub Activity -->
  <g transform="translate(750, 0)">
    <text x="300" y="120"
          fill="${theme.primaryText}"
          font-family="'Segoe UI', -apple-system, system-ui, sans-serif"
          font-size="32"
          font-weight="700"
          text-anchor="middle">
      GitHub Activity
    </text>

    <!-- Activity Stats -->
    <g transform="translate(80, 180)">
      <!-- Commits -->
      <g>
        <circle cx="15" cy="15" r="6" fill="${theme.statColors.commits}"/>
        <text x="35" y="22" fill="${theme.primaryText}" font-family="'Segoe UI', sans-serif" font-size="20" font-weight="700">${formatNumber(stats.commits)}</text>
        <text x="140" y="22" fill="${theme.secondaryText}" font-family="'Segoe UI', sans-serif" font-size="20">commits this year</text>
      </g>

      <!-- Pull Requests -->
      <g transform="translate(0, 60)">
        <circle cx="15" cy="15" r="8" fill="none" stroke="${theme.statColors.pullRequests}" stroke-width="2"/>
        <path d="M12 8 L12 22 M18 8 L18 22" stroke="${theme.statColors.pullRequests}" stroke-width="2"/>
        <text x="35" y="22" fill="${theme.primaryText}" font-family="'Segoe UI', sans-serif" font-size="20" font-weight="700">${stats.pullRequests}</text>
        <text x="140" y="22" fill="${theme.secondaryText}" font-family="'Segoe UI', sans-serif" font-size="20">pull requests merged</text>
      </g>

      <!-- Issues -->
      <g transform="translate(0, 120)">
        <circle cx="15" cy="15" r="8" fill="none" stroke="${theme.statColors.issues}" stroke-width="2"/>
        <circle cx="15" cy="15" r="2.5" fill="${theme.statColors.issues}"/>
        <text x="35" y="22" fill="${theme.primaryText}" font-family="'Segoe UI', sans-serif" font-size="20" font-weight="700">${stats.issues}</text>
        <text x="140" y="22" fill="${theme.secondaryText}" font-family="'Segoe UI', sans-serif" font-size="20">issues opened</text>
      </g>

      <!-- Stars -->
      <g transform="translate(0, 180)">
        <path d="M15 5 L17 12 L24 12 L18 17 L20 24 L15 19 L10 24 L12 17 L6 12 L13 12 Z" fill="${theme.statColors.stars}"/>
        <text x="35" y="22" fill="${theme.primaryText}" font-family="'Segoe UI', sans-serif" font-size="20" font-weight="700">${formatNumber(stats.stars)}</text>
        <text x="140" y="22" fill="${theme.secondaryText}" font-family="'Segoe UI', sans-serif" font-size="20">stars earned</text>
      </g>

      <!-- Contributions -->
      <g transform="translate(0, 240)">
        <rect x="8" y="8" width="14" height="14" rx="2" fill="${theme.statColors.streak}"/>
        <text x="35" y="22" fill="${theme.primaryText}" font-family="'Segoe UI', sans-serif" font-size="20" font-weight="700">${stats.streak} days</text>
        <text x="140" y="22" fill="${theme.secondaryText}" font-family="'Segoe UI', sans-serif" font-size="20">current streak</text>
      </g>

      <!-- Code Frequency -->
      <g transform="translate(0, 300)">
        <path d="M8 20 L12 15 L16 18 L20 12 L24 16" stroke="${theme.statColors.code}" stroke-width="2" fill="none"/>
        <text x="35" y="22" fill="${theme.primaryText}" font-family="'Segoe UI', sans-serif" font-size="20" font-weight="700">${formatNumber(stats.linesOfCode)}</text>
        <text x="140" y="22" fill="${theme.secondaryText}" font-family="'Segoe UI', sans-serif" font-size="20">lines of code</text>
      </g>
    </g>

  </g>

  <!-- Avatar Circle - Centered on Divider -->
  <g transform="translate(700, 500)">
    <circle cx="0" cy="0" r="45"
            fill="${theme.background}"
            stroke="${theme.accent}"
            stroke-width="3">
      <animate attributeName="stroke-width" values="3;5;3" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="1;0.8;1" dur="2s" repeatCount="indefinite"/>
    </circle>

    <circle cx="0" cy="0" r="40" fill="url(#avatarGradient)">
      <animate attributeName="r" values="40;42;40" dur="3s" repeatCount="indefinite"/>
    </circle>

    <text x="0" y="10"
          fill="#ffffff"
          font-family="'Segoe UI', sans-serif"
          font-size="32"
          font-weight="700"
          text-anchor="middle"
          dominant-baseline="middle">
      ${initials}
    </text>

    <!-- Rotating glow ring -->
    <circle cx="0" cy="0" r="50" fill="none" stroke="url(#glowGradient)" stroke-width="2" opacity="0.6">
      <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="4s" repeatCount="indefinite"/>
    </circle>
  </g>

  <!-- Decorative Corner Elements with animation -->
  <circle cx="50" cy="50" r="6" fill="${theme.accent}" opacity="0.8">
    <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="1350" cy="50" r="6" fill="${theme.accent}" opacity="0.8">
    <animate attributeName="r" values="6;8;6" dur="2s" begin="0.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="50" cy="850" r="6" fill="${theme.accent}" opacity="0.8">
    <animate attributeName="r" values="6;8;6" dur="2s" begin="1s" repeatCount="indefinite"/>
  </circle>
  <circle cx="1350" cy="850" r="6" fill="${theme.accent}" opacity="0.8">
    <animate attributeName="r" values="6;8;6" dur="2s" begin="1.5s" repeatCount="indefinite"/>
  </circle>

  <!-- Glow effect -->
  <circle cx="900" cy="600" r="100" fill="url(#glow)">
    <animate attributeName="r" values="100;120;100" dur="3s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.3;0.5;0.3" dur="3s" repeatCount="indefinite"/>
  </circle>

  <!-- Gradients -->
  <defs>
    <radialGradient id="avatarGradient">
      <stop offset="0%" stop-color="${theme.accent}"/>
      <stop offset="100%" stop-color="${theme.accentDark}"/>
    </radialGradient>
    <radialGradient id="glow">
      <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="${theme.accentDark}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0.8"/>
    </linearGradient>
  </defs>
</svg>`;
}
