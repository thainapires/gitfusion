import { AuthenticatedLayout } from "@/shared/app-shell/authenticated-layout";
import { SettingsForm } from "@/features/settings/components/settings-form";

export default function SettingsPage() {
  return (
    <AuthenticatedLayout title="Settings" description="Manage your profile preferences and connected account integrations.">
      <SettingsForm />
    </AuthenticatedLayout>
  );
}
