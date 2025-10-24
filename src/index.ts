import GitHubProfileGenerator from "./classes/GitHubProfileGenerator.class";


// Main execution
async function main() {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "Dineshs737";

  if (!GITHUB_TOKEN) {
    console.error("❌ Error: GITHUB_TOKEN environment variable is required");
    console.log("Please set it using: export GITHUB_TOKEN=your_token_here");
    process.exit(1);
  }

  console.log("🚀 Starting GitHub Profile Generator...\n");

  const generator = new GitHubProfileGenerator(GITHUB_TOKEN, GITHUB_USERNAME);
  await generator.generate();

  console.log("\n✨ Done! Your profile is ready.");
  console.log("📝 Files generated:");
  console.log("   - profile.svg");
  console.log("   - README.md");
}

main().catch(console.error);
