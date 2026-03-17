import { Octokit } from "@octokit/rest";
import { ContributionDay } from "../interface/GitHubStats.interface";
import { PinnedRepo } from "../interface/PinnedRepo.interface";
import { getLanguageColor } from "../data/language-colors";

export interface StreakResult {
  streak: number;
  contributionCalendar: ContributionDay[];
}

export async function fetchCommitCountGraphQL(
  octokit: Octokit,
  username: string,
): Promise<number> {
  try {
    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            totalCommitContributions
            restrictedContributionsCount
          }
          repositoriesContributedTo(first: 1, contributionTypes: [COMMIT]) {
            totalCount
          }
        }
      }
    `;

    const result: any = await octokit.graphql(query, { username });

    const totalCommits =
      result.user.contributionsCollection.totalCommitContributions +
      result.user.contributionsCollection.restrictedContributionsCount;

    console.log(`GraphQL found ${totalCommits} commits this year`);
    return totalCommits;
  } catch (error) {
    console.error("GraphQL commit count error:", error);
    throw error;
  }
}

export async function calculateStreakGraphQL(
  octokit: Octokit,
  username: string,
): Promise<StreakResult> {
  try {
    const query = `
      query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
        }
      }
    `;

    const to = new Date();
    const from = new Date();
    from.setFullYear(from.getFullYear() - 1);

    const result: any = await octokit.graphql(query, {
      username,
      from: from.toISOString(),
      to: to.toISOString(),
    });

    const weeks =
      result?.user?.contributionsCollection?.contributionCalendar?.weeks;
    if (!weeks) return { streak: 0, contributionCalendar: [] };

    // Flatten all contribution days
    const allDays: ContributionDay[] = weeks.flatMap((w: any) =>
      w.contributionDays.map((d: any) => ({
        date: d.date,
        count: d.contributionCount,
      })),
    );

    // Calculate streak from days with contributions
    const contributionDays = allDays
      .filter((d) => d.count > 0)
      .map((d) => new Date(d.date))
      .sort((a, b) => b.getTime() - a.getTime());

    if (contributionDays.length === 0)
      return { streak: 0, contributionCalendar: allDays };

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayTime = yesterday.getTime();

    const firstContribution = contributionDays[0];
    firstContribution.setUTCHours(0, 0, 0, 0);
    const firstTime = firstContribution.getTime();

    if (firstTime !== todayTime && firstTime !== yesterdayTime) {
      return { streak: 0, contributionCalendar: allDays };
    }

    let streak = 1;
    let expectedDate = new Date(firstContribution);
    expectedDate.setUTCDate(expectedDate.getUTCDate() - 1);

    for (let i = 1; i < contributionDays.length; i++) {
      const currentDay = contributionDays[i];
      currentDay.setUTCHours(0, 0, 0, 0);

      if (currentDay.getTime() === expectedDate.getTime()) {
        streak++;
        expectedDate.setUTCDate(expectedDate.getUTCDate() - 1);
      } else {
        break;
      }
    }

    console.log(`Current streak: ${streak} days`);
    return { streak, contributionCalendar: allDays };
  } catch (error) {
    console.error("Error calculating streak with GraphQL:", error);
    throw error;
  }
}

export async function fetchPinnedRepos(
  octokit: Octokit,
  username: string,
): Promise<PinnedRepo[]> {
  try {
    const query = `
      query($username: String!) {
        user(login: $username) {
          pinnedItems(first: 6, types: REPOSITORY) {
            nodes {
              ... on Repository {
                name
                description
                stargazerCount
                forkCount
                primaryLanguage {
                  name
                  color
                }
                url
              }
            }
          }
        }
      }
    `;

    const result: any = await octokit.graphql(query, { username });

    return result.user.pinnedItems.nodes.map((repo: any) => ({
      name: repo.name,
      description: repo.description || "",
      stars: repo.stargazerCount,
      forks: repo.forkCount,
      language: repo.primaryLanguage?.name || "",
      languageColor:
        repo.primaryLanguage?.color ||
        getLanguageColor(repo.primaryLanguage?.name || ""),
      url: repo.url,
    }));
  } catch (error) {
    console.error("Error fetching pinned repos:", error);
    return [];
  }
}
