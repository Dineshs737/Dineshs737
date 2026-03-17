import { Octokit } from "@octokit/rest";
import { ActivityEvent } from "../interface/ActivityEvent.interface";
import { LanguageStat } from "../interface/LanguageStat.interface";
import { getLanguageColor } from "../data/language-colors";

export async function fetchUserData(
  octokit: Octokit,
  username: string,
): Promise<any> {
  const { data } = await octokit.users.getByUsername({ username });
  return data;
}

export async function fetchRepositories(
  octokit: Octokit,
  username: string,
): Promise<any[]> {
  let allRepos: any[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const { data } = await octokit.repos.listForUser({
      username,
      per_page: 100,
      page,
      sort: "updated",
    });

    allRepos = allRepos.concat(data);
    hasMore = data.length === 100;
    page++;
  }

  return allRepos;
}

export async function fetchCommitCountFromRepos(
  octokit: Octokit,
  username: string,
  repos: any[],
): Promise<number> {
  try {
    console.log("Counting commits from repositories...");
    let totalCommits = 0;
    let processedRepos = 0;

    for (const repo of repos) {
      try {
        if (repo.fork) {
          console.log(`Skipping fork: ${repo.name}`);
          continue;
        }

        const response = await octokit.request(
          "GET /repos/{owner}/{repo}/commits",
          {
            owner: username,
            repo: repo.name,
            author: username,
            per_page: 1,
          },
        );

        const linkHeader = response.headers.link;
        let repoCommitCount = 1;

        if (linkHeader) {
          const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
          if (lastPageMatch) {
            repoCommitCount = parseInt(lastPageMatch[1]);
          }
        }

        totalCommits += repoCommitCount;
        processedRepos++;

        console.log(
          `${repo.name}: ${repoCommitCount} commits (Total: ${totalCommits})`,
        );

        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error: any) {
        if (error.status === 409 || error.status === 404) {
          console.log(`Skipping ${repo.name}: empty or inaccessible`);
          continue;
        }
        console.error(`Error processing ${repo.name}:`, error.message);
      }
    }

    console.log(
      `Processed ${processedRepos} repositories with ${totalCommits} total commits`,
    );
    return totalCommits;
  } catch (error) {
    console.error("Error fetching commits:", error);
    throw error;
  }
}

export async function fetchPullRequestCount(
  octokit: Octokit,
  username: string,
): Promise<number> {
  const { data } = await octokit.search.issuesAndPullRequests({
    q: `author:${username} type:pr`,
    per_page: 1,
  });
  return data.total_count;
}

export async function fetchIssueCount(
  octokit: Octokit,
  username: string,
): Promise<number> {
  const { data } = await octokit.search.issuesAndPullRequests({
    q: `author:${username} type:issue`,
    per_page: 1,
  });
  return data.total_count;
}

export async function fetchTotalStars(repos: any[]): Promise<number> {
  return repos.reduce(
    (acc: number, repo: any) => acc + repo.stargazers_count,
    0,
  );
}

export async function fetchLanguageStats(
  octokit: Octokit,
  username: string,
  repos: any[],
): Promise<LanguageStat[]> {
  const languageBytes: Record<string, number> = {};

  const nonForkRepos = repos.filter((r: any) => !r.fork);

  for (const repo of nonForkRepos) {
    try {
      const { data } = await octokit.repos.listLanguages({
        owner: username,
        repo: repo.name,
      });

      for (const [lang, bytes] of Object.entries(data)) {
        languageBytes[lang] = (languageBytes[lang] || 0) + (bytes as number);
      }
    } catch (error: any) {
      if (error.status !== 404 && error.status !== 409) {
        console.error(
          `Error fetching languages for ${repo.name}:`,
          error.message,
        );
      }
    }
  }

  const totalBytes = Object.values(languageBytes).reduce((a, b) => a + b, 0);
  if (totalBytes === 0) return [];

  const stats: LanguageStat[] = Object.entries(languageBytes)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: Math.round((bytes / totalBytes) * 1000) / 10,
      color: getLanguageColor(name),
    }))
    .sort((a, b) => b.bytes - a.bytes);

  return stats;
}

export async function fetchRecentEvents(
  octokit: Octokit,
  username: string,
  limit: number = 5,
): Promise<ActivityEvent[]> {
  try {
    const { data } = await octokit.activity.listPublicEventsForUser({
      username,
      per_page: 30,
    });

    const events: ActivityEvent[] = [];

    for (const event of data) {
      if (events.length >= limit) break;

      const repo = event.repo.name.replace(`${username}/`, "");
      const payload = event.payload as any;

      switch (event.type) {
        case "PushEvent":
          events.push({
            type: "push",
            repo,
            message: `Pushed ${payload.commits?.length || 1} commit(s)`,
            timestamp: event.created_at || new Date().toISOString(),
          });
          break;
        case "PullRequestEvent":
          events.push({
            type: "pr",
            repo,
            message: `${payload.action} PR #${payload.pull_request?.number}`,
            timestamp: event.created_at || new Date().toISOString(),
          });
          break;
        case "ReleaseEvent":
          events.push({
            type: "release",
            repo,
            message: `Released ${payload.release?.tag_name}`,
            timestamp: event.created_at || new Date().toISOString(),
          });
          break;
        case "IssuesEvent":
          events.push({
            type: "issue",
            repo,
            message: `${payload.action} issue #${payload.issue?.number}`,
            timestamp: event.created_at || new Date().toISOString(),
          });
          break;
        case "WatchEvent":
          events.push({
            type: "star",
            repo: event.repo.name,
            message: "Starred repository",
            timestamp: event.created_at || new Date().toISOString(),
          });
          break;
        case "ForkEvent":
          events.push({
            type: "fork",
            repo: event.repo.name,
            message: "Forked repository",
            timestamp: event.created_at || new Date().toISOString(),
          });
          break;
      }
    }

    return events;
  } catch (error) {
    console.error("Error fetching recent events:", error);
    return [];
  }
}
