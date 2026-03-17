export interface ThemeStatColors {
  commits: string;
  pullRequests: string;
  issues: string;
  stars: string;
  streak: string;
  code: string;
}

export interface Theme {
  background: string;
  cardBackground: string;
  cardBorder: string;
  primaryText: string;
  secondaryText: string;
  accent: string;
  accentDark: string;
  statColors: ThemeStatColors;
}
