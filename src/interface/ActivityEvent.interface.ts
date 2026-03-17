export interface ActivityEvent {
  type: "push" | "pr" | "release" | "issue" | "star" | "fork";
  repo: string;
  message: string;
  timestamp: string;
}
