import type { Metadata } from "next";
import { DashboardScreen } from "@/features/dashboard/components/dashboard-screen";
import { buildDemoDashboardOverview, demoSyncStatus } from "@/features/demo/demo-dashboard";

export const metadata: Metadata = {
  title: "Live demo · GitFusion",
  description: "Explore the GitFusion dashboard with sample GitHub and GitLab activity.",
};

export default function DemoPage() {
  return (
    <DashboardScreen
      demo
      initialOverview={buildDemoDashboardOverview()}
      initialSyncStatus={demoSyncStatus}
      initialViewerName="Alex"
    />
  );
}
