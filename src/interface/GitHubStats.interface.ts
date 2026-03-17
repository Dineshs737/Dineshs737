import { LanguageStat } from "./LanguageStat.interface";
import { ActivityEvent } from "./ActivityEvent.interface";
import { PinnedRepo } from "./PinnedRepo.interface";

export interface ContributionDay {
  date: string;
  count: number;
}

export interface GitHubStats {
  name: string;
  username: string;
  location: string;
  bio: string;
  company: string;
  blog: string;
  repositories: number;
  followers: number;
  following: number;
  commits: number;
  pullRequests: number;
  issues: number;
  stars: number;
  streak: number;
  linesOfCode: number;
  languages: LanguageStat[];
  contributionCalendar: ContributionDay[];
  recentActivity: ActivityEvent[];
  pinnedRepos: PinnedRepo[];
}
