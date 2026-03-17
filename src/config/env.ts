export interface AppConfig {
  token: string;
  username: string;
}

export function loadConfig(): AppConfig {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME || "Dineshs737";

  if (!token) {
    console.error("Error: GITHUB_TOKEN environment variable is required");
    console.log("Please set it using: export GITHUB_TOKEN=your_token_here");
    process.exit(1);
  }

  return { token, username };
}
