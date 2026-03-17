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

  const barWidth = 1160;
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
      const x = col * 220;
      const y = barHeight + 25 + row * 22;
      return `<g transform="translate(${x}, ${y})">
      <circle cx="5" cy="-4" r="5" fill="${lang.color}"/>
      <text x="15" y="0" fill="${theme.secondaryText}" font-family="'Segoe UI', sans-serif" font-size="13">${escapeXml(lang.name)} ${lang.percentage}%</text>
    </g>`;
    })
    .join("\n");

  return `<g transform="translate(120, ${yOffset})">
    <text x="0" y="-15" fill="${theme.primaryText}" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="600">Languages</text>
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

  return `<g transform="translate(120, ${yOffset})">
    <text x="0" y="-15" fill="${theme.primaryText}" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="600">Contribution Calendar</text>
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

  // Layout constants
  // Top half (y=50..620): two-column layout
  // Bottom half (y=640..1000): full-width language bar + heatmap
  const dividerY = 630;

  const languageBarSvg = renderLanguageBar(stats, theme, 670);
  const heatmapSvg = renderHeatmap(stats, theme, 760);
  const activityFeedSvg = renderActivityFeed(stats, theme, 60, 530);

  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${theme.background}"/>

  <!-- Gradients (defined first for reference) -->
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

  <!-- Main Card -->
  <rect x="50" y="50" width="${width - 100}" height="${height - 100}" rx="20" fill="${theme.cardBackground}" stroke="${theme.cardBorder}" stroke-width="3"/>

  <!-- Vertical Divider (top half only) -->
  <line x1="700" y1="70" x2="700" y2="${dividerY}" stroke="${theme.cardBorder}" stroke-width="2"/>

  <!-- Horizontal Divider (separates top columns from bottom full-width) -->
  <line x1="70" y1="${dividerY}" x2="${width - 70}" y2="${dividerY}" stroke="${theme.cardBorder}" stroke-width="2"/>

  <!-- ==================== LEFT SECTION ==================== -->
  <g transform="translate(75, 0)">
    <!-- Avatar Circle -->
    <g transform="translate(300, 120)">
      <circle cx="0" cy="0" r="40"
              fill="${theme.background}"
              stroke="${theme.accent}"
              stroke-width="3">
        <animate attributeName="stroke-width" values="3;4;3" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="0" cy="0" r="35" fill="url(#avatarGradient)">
        <animate attributeName="r" values="35;37;35" dur="3s" repeatCount="indefinite"/>
      </circle>
      <text x="0" y="0"
            fill="#ffffff"
            font-family="'Segoe UI', sans-serif"
            font-size="28"
            font-weight="700"
            text-anchor="middle"
            dominant-baseline="central">
        ${initials}
      </text>
      <circle cx="0" cy="0" r="45" fill="none" stroke="url(#glowGradient)" stroke-width="2" opacity="0.5">
        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="4s" repeatCount="indefinite"/>
      </circle>
    </g>

    <!-- Name & Username -->
    <text x="300" y="190"
          fill="${theme.accent}"
          font-family="'Segoe UI', -apple-system, system-ui, sans-serif"
          font-size="28"
          font-weight="700"
          text-anchor="middle">
      ${name}
    </text>
    <text x="300" y="215"
          fill="${theme.secondaryText}"
          font-family="'Segoe UI', -apple-system, system-ui, sans-serif"
          font-size="16"
          text-anchor="middle">
      @${username}
    </text>

    <!-- Profile Info -->
    <g transform="translate(80, 250)">
      <text x="0" y="0" fill="${theme.secondaryText}" font-family="'Segoe UI', sans-serif" font-size="16">
        <tspan x="0" dy="0">📍 ${location}</tspan>
        <tspan x="0" dy="30">💼 ${bio}</tspan>
        <tspan x="0" dy="30">🏢 ${company}</tspan>
        <tspan x="0" dy="30">🔗 ${blog}</tspan>
      </text>
    </g>

    <!-- Tech Stack -->
    <text x="80" y="400"
          fill="${theme.primaryText}"
          font-family="'Segoe UI', sans-serif"
          font-size="18"
          font-weight="600">
      Tech Stack
    </text>
    <g transform="translate(80, 420)">
      ${techStackSvg}
    </g>

    <!-- Quote -->
    <text x="300" y="${dividerY - 15}"
          fill="${theme.secondaryText}"
          font-family="'Segoe UI', sans-serif"
          font-size="16"
          text-anchor="middle"
          font-style="italic">
      ☕ ${quote}
    </text>
  </g>

  <!-- ==================== RIGHT SECTION ==================== -->
  <g transform="translate(720, 0)">
    <text x="290" y="100"
          fill="${theme.primaryText}"
          font-family="'Segoe UI', -apple-system, system-ui, sans-serif"
          font-size="26"
          font-weight="700"
          text-anchor="middle">
      GitHub Activity
    </text>

    <!-- Stats Cards Row -->
    <g transform="translate(60, 130)">
      <g transform="translate(0, 0)">
        <rect width="100" height="55" rx="10" fill="${theme.background}" stroke="${theme.cardBorder}" stroke-width="2"/>
        <text x="50" y="25" fill="${theme.accent}" font-family="'Segoe UI', sans-serif" font-size="22" font-weight="700" text-anchor="middle">${stats.repositories}</text>
        <text x="50" y="44" fill="${theme.secondaryText}" font-family="'Segoe UI', sans-serif" font-size="11" text-anchor="middle">Repos</text>
      </g>
      <g transform="translate(110, 0)">
        <rect width="100" height="55" rx="10" fill="${theme.background}" stroke="${theme.cardBorder}" stroke-width="2"/>
        <text x="50" y="25" fill="${theme.accent}" font-family="'Segoe UI', sans-serif" font-size="22" font-weight="700" text-anchor="middle">${formatNumber(stats.followers)}</text>
        <text x="50" y="44" fill="${theme.secondaryText}" font-family="'Segoe UI', sans-serif" font-size="11" text-anchor="middle">Followers</text>
      </g>
      <g transform="translate(220, 0)">
        <rect width="100" height="55" rx="10" fill="${theme.background}" stroke="${theme.cardBorder}" stroke-width="2"/>
        <text x="50" y="25" fill="${theme.accent}" font-family="'Segoe UI', sans-serif" font-size="22" font-weight="700" text-anchor="middle">${formatNumber(stats.following)}</text>
        <text x="50" y="44" fill="${theme.secondaryText}" font-family="'Segoe UI', sans-serif" font-size="11" text-anchor="middle">Following</text>
      </g>
      <g transform="translate(330, 0)">
        <rect width="100" height="55" rx="10" fill="${theme.background}" stroke="${theme.cardBorder}" stroke-width="2"/>
        <text x="50" y="25" fill="${theme.statColors.stars}" font-family="'Segoe UI', sans-serif" font-size="22" font-weight="700" text-anchor="middle">${formatNumber(stats.stars)}</text>
        <text x="50" y="44" fill="${theme.secondaryText}" font-family="'Segoe UI', sans-serif" font-size="11" text-anchor="middle">Stars</text>
      </g>
    </g>

    <!-- Activity Stats -->
    <g transform="translate(60, 220)">
      <!-- Commits -->
      <g>
        <circle cx="12" cy="12" r="5" fill="${theme.statColors.commits}"/>
        <text x="30" y="18" fill="${theme.primaryText}" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="700">${formatNumber(stats.commits)}</text>
        <text x="120" y="18" fill="${theme.secondaryText}" font-family="'Segoe UI', sans-serif" font-size="16">commits this year</text>
      </g>

      <!-- Pull Requests -->
      <g transform="translate(0, 45)">
        <circle cx="12" cy="12" r="6" fill="none" stroke="${theme.statColors.pullRequests}" stroke-width="2"/>
        <text x="30" y="18" fill="${theme.primaryText}" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="700">${stats.pullRequests}</text>
        <text x="120" y="18" fill="${theme.secondaryText}" font-family="'Segoe UI', sans-serif" font-size="16">pull requests merged</text>
      </g>

      <!-- Issues -->
      <g transform="translate(0, 90)">
        <circle cx="12" cy="12" r="6" fill="none" stroke="${theme.statColors.issues}" stroke-width="2"/>
        <circle cx="12" cy="12" r="2" fill="${theme.statColors.issues}"/>
        <text x="30" y="18" fill="${theme.primaryText}" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="700">${stats.issues}</text>
        <text x="120" y="18" fill="${theme.secondaryText}" font-family="'Segoe UI', sans-serif" font-size="16">issues opened</text>
      </g>

      <!-- Streak -->
      <g transform="translate(0, 135)">
        <rect x="6" y="6" width="12" height="12" rx="2" fill="${theme.statColors.streak}"/>
        <text x="30" y="18" fill="${theme.primaryText}" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="700">${stats.streak} days</text>
        <text x="120" y="18" fill="${theme.secondaryText}" font-family="'Segoe UI', sans-serif" font-size="16">current streak</text>
      </g>

      <!-- Lines of Code -->
      <g transform="translate(0, 180)">
        <path d="M6 16 L10 11 L14 14 L18 8 L22 12" stroke="${theme.statColors.code}" stroke-width="2" fill="none"/>
        <text x="30" y="18" fill="${theme.primaryText}" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="700">${formatNumber(stats.linesOfCode)}</text>
        <text x="120" y="18" fill="${theme.secondaryText}" font-family="'Segoe UI', sans-serif" font-size="16">lines of code</text>
      </g>
    </g>

    <!-- Recent Activity Feed -->
    ${activityFeedSvg}
  </g>

  <!-- ==================== BOTTOM SECTION (full width) ==================== -->

  <!-- Language Bar -->
  ${languageBarSvg}

  <!-- Contribution Heatmap -->
  ${heatmapSvg}

  <!-- Decorative Corner Elements -->
  <circle cx="60" cy="60" r="5" fill="${theme.accent}" opacity="0.7">
    <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="${width - 60}" cy="60" r="5" fill="${theme.accent}" opacity="0.7">
    <animate attributeName="r" values="5;7;5" dur="2s" begin="0.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="60" cy="${height - 60}" r="5" fill="${theme.accent}" opacity="0.7">
    <animate attributeName="r" values="5;7;5" dur="2s" begin="1s" repeatCount="indefinite"/>
  </circle>
  <circle cx="${width - 60}" cy="${height - 60}" r="5" fill="${theme.accent}" opacity="0.7">
    <animate attributeName="r" values="5;7;5" dur="2s" begin="1.5s" repeatCount="indefinite"/>
  </circle>

  <!-- Glow effect -->
  <circle cx="700" cy="${dividerY}" r="80" fill="url(#glow)">
    <animate attributeName="r" values="80;100;80" dur="3s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.2;0.4;0.2" dur="3s" repeatCount="indefinite"/>
  </circle>
</svg>`;
}
