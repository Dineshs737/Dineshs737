import { Octokit } from "@octokit/rest";
import { GitHubStats } from "../interface/GitHubStats.interface";
import { ProfileConfig } from "../interface/ProfileConfig.interface";
import {
  fetchUserData,
  fetchRepositories,
  fetchPullRequestCount,
  fetchIssueCount,
  fetchTotalStars,
  fetchLanguageStats,
  fetchRecentEvents,
} from "../api/github-rest";
import {
  fetchCommitCountGraphQL,
  calculateStreakGraphQL,
  fetchPinnedRepos,
} from "../api/github-graphql";
import { fetchCommitCountFromRepos } from "../api/github-rest";
import * as cache from "../cache/file-cache";

const CACHE_TTL = 3 * 60 * 60 * 1000; // 3 hours

async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = cache.get<T>(key, CACHE_TTL);
  if (cached !== null) {
    console.log(`Using cached data for: ${key}`);
    return cached;
  }

  try {
    const data = await fetcher();
    cache.set(key, data);
    return data;
  } catch (error) {
    const stale = cache.getStale<T>(key);
    if (stale !== null) {
      console.warn(`API error for ${key}, using stale cache`);
      return stale;
    }
    throw error;
  }
}

export async function collectStats(
  token: string,
  username: string,
  config: ProfileConfig,
): Promise<GitHubStats> {
  const octokit = new Octokit({ auth: token });

  console.log("Starting profile generation...");

  const userData = await cachedFetch("user-data", () =>
    fetchUserData(octokit, username),
  );

  // Fetch repos ONCE, reuse everywhere
  const repos = await cachedFetch("repositories", () =>
    fetchRepositories(octokit, username),
  );

  console.log(`Found ${repos.length} repositories`);
  console.log("Fetching commits (this may take a while)...");

  // Use GraphQL first, fall back to REST
  let commits: number;
  try {
    commits = await cachedFetch("commits-graphql", () =>
      fetchCommitCountGraphQL(octokit, username),
    );
  } catch {
    commits = await cachedFetch("commits-rest", () =>
      fetchCommitCountFromRepos(octokit, username, repos),
    );
  }

  const [
    pullRequests,
    issues,
    stars,
    streakResult,
    languages,
    recentActivity,
    pinnedRepos,
  ] = await Promise.all([
    cachedFetch("pull-requests", () =>
      fetchPullRequestCount(octokit, username),
    ),
    cachedFetch("issues", () => fetchIssueCount(octokit, username)),
    cachedFetch("stars", () => fetchTotalStars(repos)),
    cachedFetch("streak", () => calculateStreakGraphQL(octokit, username)),
    cachedFetch("languages", () =>
      fetchLanguageStats(octokit, username, repos),
    ),
    cachedFetch("recent-events", () => fetchRecentEvents(octokit, username)),
    cachedFetch("pinned-repos", () => fetchPinnedRepos(octokit, username)),
  ]);

  // Use total bytes from language stats as a real LOC-like metric
  const totalBytes = languages.reduce((sum, l) => sum + l.bytes, 0);
  const linesOfCode = Math.round(totalBytes / 50); // Rough bytes-to-lines estimate

  return {
    name: userData.name || config.defaults.name || username,
    username,
    location: userData.location ?? config.defaults.location,
    bio: userData.bio ?? config.defaults.bio,
    company: userData.company ?? config.defaults.company,
    blog: userData.blog ?? config.defaults.blog,
    repositories: repos.length,
    followers: userData.followers,
    following: userData.following,
    commits,
    pullRequests,
    issues,
    stars,
    streak: streakResult.streak,
    linesOfCode,
    languages,
    contributionCalendar: streakResult.contributionCalendar,
    recentActivity,
    pinnedRepos,
  };
}
