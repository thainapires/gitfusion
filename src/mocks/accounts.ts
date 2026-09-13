import { ConnectedAccount } from "../types/mock-app";

export const mockAccounts: ConnectedAccount[] = [
  {
    provider: "github",
    name: "GitHub",
    username: "mockhub",
    email: "mockhub@example.com",
    status: "not-connected",
    repositories: 18,
    contributions: 1240,
    lastSync: "2 minutes ago",
  },
  {
    provider: "gitlab",
    name: "GitLab",
    username: "mocklab",
    email: "mocklab@example.com",
    status: "not-connected",
    repositories: 12,
    contributions: 842,
    lastSync: "8 minutes ago",
  },
];

export const connectedMockAccounts: ConnectedAccount[] = mockAccounts.map((account) => ({
  ...account,
  status: "connected",
}));
