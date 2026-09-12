import { AuthenticatedLayout } from "../components/app-shell/authenticated-layout";
import { SettingsForm } from "../components/settings/settings-form";

export default function SettingsPage() {
  return (
    <AuthenticatedLayout title="Settings" description="Manage your profile preferences and connected account integrations.">
      <SettingsForm />
    </AuthenticatedLayout>
  );
}
