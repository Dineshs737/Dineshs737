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
  const cols = 3;
  const colWidth = 160;
  const rowHeight = 70;

  return items
    .map((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      // Adjust x spacing per column
      const xOffsets = [0, 140, 280];
      const x = xOffsets[col] || col * colWidth;
      const y = row * rowHeight;
      return renderTechIcon(item, x, y);
    })
    .join("\n");
}

function renderLanguageBar(
  stats: GitHubStats,
  theme: Theme,
  yOffset: number,
): string {
  if (stats.languages.length === 0) return "";

  const barWidth = 560;
  const barHeight = 12;
  const topLangs = stats.languages.slice(0, 8);
  let currentX = 0;

  const segments = topLangs
    .map((lang) => {
      const width = Math.max((lang.percentage / 100) * barWidth, 2);
      const segment = `<rect x="${currentX}" y="0" width="${width}" height="${barHeight}" rx="${currentX === 0 ? 6 : 0}" fill="${lang.color}"/>`;
      currentX += width;
      return segment;
    })
    .join("\n");

  const labels = topLangs
    .slice(0, 6)
    .map((lang, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = col * 190;
      const y = barHeight + 25 + row * 22;
      return `<g transform="translate(${x}, ${y})">
      <circle cx="5" cy="-4" r="5" fill="${lang.color}"/>
      <text x="15" y="0" fill="${theme.secondaryText}" font-family="'Segoe UI', sans-serif" font-size="13">${escapeXml(lang.name)} ${lang.percentage}%</text>
    </g>`;
    })
    .join("\n");

  return `<g transform="translate(80, ${yOffset})">
    <text x="0" y="-15" fill="${theme.primaryText}" font-family="'Segoe UI', sans-serif" font-size="20" font-weight="600">Languages</text>
    <rect x="0" y="0" width="${barWidth}" height="${barHeight}" rx="6" fill="${theme.cardBorder}"/>
    ${segments}
    ${labels}
  </g>`;
}

function renderHeatmap(
  stats: GitHubStats,
  theme: Theme,
  yOffset: number,
): string {
  if (stats.contributionCalendar.length === 0) return "";

  const cellSize = 12;
  const cellGap = 3;
  const totalSize = cellSize + cellGap;

  // Color levels based on theme
  const levels = [
    theme.cardBorder,
    theme.statColors.streak + "44",
    theme.statColors.streak + "88",
    theme.statColors.streak + "cc",
    theme.statColors.streak,
  ];

  function getLevel(count: number): number {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  }

  // Take last 365 days, arrange in 52x7 grid
  const days = stats.contributionCalendar.slice(-365);

  // Pad start to align to week start (Sunday)
  const firstDate = new Date(days[0]?.date || new Date());
  const startDay = firstDate.getUTCDay(); // 0 = Sunday

  const cells: string[] = [];
  let week = 0;
  let dayOfWeek = startDay;

  for (const day of days) {
    const level = getLevel(day.count);
    const x = week * totalSize;
    const y = dayOfWeek * totalSize;

    cells.push(
      `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" fill="${levels[level]}"><title>${day.date}: ${day.count} contributions</title></rect>`,
    );

    dayOfWeek++;
    if (dayOfWeek > 6) {
      dayOfWeek = 0;
      week++;
    }
  }

  return `<g transform="translate(80, ${yOffset})">
    <text x="0" y="-15" fill="${theme.primaryText}" font-family="'Segoe UI', sans-serif" font-size="20" font-weight="600">Contribution Calendar</text>
    ${cells.join("\n")}
  </g>`;
}

function renderActivityFeed(
  stats: GitHubStats,
  theme: Theme,
  xOffset: number,
  yOffset: number,
): string {
  if (stats.recentActivity.length === 0) return "";

  const icons: Record<string, string> = {
    push: `<circle cx="8" cy="8" r="6" fill="${theme.statColors.commits}"/>`,
    pr: `<circle cx="8" cy="8" r="6" fill="none" stroke="${theme.statColors.pullRequests}" stroke-width="2"/>`,
    release: `<rect x="2" y="2" width="12" height="12" rx="2" fill="${theme.statColors.stars}"/>`,
    issue: `<circle cx="8" cy="8" r="6" fill="none" stroke="${theme.statColors.issues}" stroke-width="2"/><circle cx="8" cy="8" r="2" fill="${theme.statColors.issues}"/>`,
    star: `<path d="M8 2 L9.5 6 L14 6 L10.5 9 L11.5 13 L8 10.5 L4.5 13 L5.5 9 L2 6 L6.5 6 Z" fill="${theme.statColors.stars}"/>`,
    fork: `<path d="M5 2 L5 8 M11 2 L11 6 L8 8 L5 8 M8 8 L8 14" stroke="${theme.accent}" stroke-width="2" fill="none"/>`,
  };

  function timeAgo(timestamp: string): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  }

  const items = stats.recentActivity.slice(0, 5).map((event, i) => {
    const y = i * 40;
    const icon = icons[event.type] || icons.push;
    return `<g transform="translate(0, ${y})">
      ${icon}
      <text x="22" y="8" fill="${theme.primaryText}" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="600">${escapeXml(event.repo)}</text>
      <text x="22" y="24" fill="${theme.secondaryText}" font-family="'Segoe UI', sans-serif" font-size="12">${escapeXml(event.message)} · ${timeAgo(event.timestamp)}</text>
    </g>`;
  });

  return `<g transform="translate(${xOffset}, ${yOffset})">
    <text x="0" y="-15" fill="${theme.primaryText}" font-family="'Segoe UI', sans-serif" font-size="20" font-weight="600">Recent Activity</text>
    ${items.join("\n")}
  </g>`;
}

export function generateSVG(
  stats: GitHubStats,
  config: ProfileConfig,
  theme: Theme,
): string {
  const { width, height } = config.svg;
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
  const languageBarSvg = renderLanguageBar(stats, theme, 680);
  const heatmapSvg = renderHeatmap(stats, theme, 790);
  const activityFeedSvg = renderActivityFeed(stats, theme, 830, 560);

  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${theme.background}"/>

  <!-- Main Card -->
  <rect x="50" y="50" width="${width - 100}" height="${height - 100}" rx="20" fill="${theme.cardBackground}" stroke="${theme.cardBorder}" stroke-width="3"/>

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

    <!-- Recent Activity Feed -->
    ${activityFeedSvg}
  </g>

  <!-- Avatar Circle - Centered Bottom -->
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
  <circle cx="${width - 50}" cy="50" r="6" fill="${theme.accent}" opacity="0.8">
    <animate attributeName="r" values="6;8;6" dur="2s" begin="0.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="50" cy="${height - 100}" r="6" fill="${theme.accent}" opacity="0.8">
    <animate attributeName="r" values="6;8;6" dur="2s" begin="1s" repeatCount="indefinite"/>
  </circle>
  <circle cx="${width - 50}" cy="${height - 100}" r="6" fill="${theme.accent}" opacity="0.8">
    <animate attributeName="r" values="6;8;6" dur="2s" begin="1.5s" repeatCount="indefinite"/>
  </circle>

  <!-- Glow effect -->
  <circle cx="900" cy="600" r="100" fill="url(#glow)">
    <animate attributeName="r" values="100;120;100" dur="3s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.3;0.5;0.3" dur="3s" repeatCount="indefinite"/>
  </circle>

  <!-- Language Bar -->
  ${languageBarSvg}

  <!-- Contribution Heatmap -->
  ${heatmapSvg}

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
