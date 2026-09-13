"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { IntegrationAccountsPanel } from "../accounts/integration-accounts-panel";
import { notify } from "../../lib/notifications/toast";
import { uploadUserAvatar } from "../../lib/supabase/avatar";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "../../lib/supabase/client";

type ProfileFormState = {
  name: string;
  username: string;
  email: string;
  role: string;
  avatarUrl: string | null;
};

export function SettingsForm() {
  const [profile, setProfile] = useState<ProfileFormState>({
    name: "",
    username: "",
    email: "",
    role: "",
    avatarUrl: null,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const avatarDisplayUrl = avatarPreview || profile.avatarUrl;
  const initials = useMemo(() => getInitials(profile.name || profile.email), [profile.name, profile.email]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!isSupabaseConfigured()) {
          setIsLoading(false);
          return;
        }

        const supabase = createSupabaseBrowserClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        const user = userData.user;

        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name,avatar_url")
          .eq("id", user.id)
          .maybeSingle<{ full_name: string | null; avatar_url: string | null }>();

        if (profileError) {
          throw profileError;
        }

        setProfile({
          name: profileData?.full_name || getStringMetadata(user.user_metadata.full_name) || user.email?.split("@")[0] || "",
          username: getStringMetadata(user.user_metadata.username) || user.email?.split("@")[0] || "",
          email: user.email || "",
          role: getStringMetadata(user.user_metadata.role),
          avatarUrl: profileData?.avatar_url || getStringMetadata(user.user_metadata.avatar_url) || null,
        });
      } catch (error) {
        notify({ type: "error", title: "Unable to load profile", message: error instanceof Error ? error.message : "Profile could not be loaded." });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleFieldChange = (field: keyof ProfileFormState, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSaving(true);

      if (!isSupabaseConfigured()) {
        throw new Error("Supabase is not configured.");
      }

      const supabase = createSupabaseBrowserClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!userData.user) {
        throw new Error("You must be signed in to save settings.");
      }

      let avatarUrl = profile.avatarUrl;

      if (avatarFile) {
        avatarUrl = await uploadUserAvatar({ supabase, user: userData.user, file: avatarFile });
      }

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userData.user.id,
        full_name: profile.name,
        avatar_url: avatarUrl,
      });

      if (profileError) {
        throw profileError;
      }

      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: profile.name,
          avatar_url: avatarUrl,
          role: profile.role,
          username: profile.username,
          weekly_digest: weeklyDigest,
          public_profile: publicProfile,
        },
      });

      if (metadataError) {
        throw metadataError;
      }

      setProfile((current) => ({ ...current, avatarUrl }));
      setAvatarFile(null);

      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
      }

      notify({ type: "success", title: "Settings saved", message: "Your profile changes were saved." });
      window.dispatchEvent(new CustomEvent("gitfusion:profile-updated"));
    } catch (error) {
      notify({ type: "error", title: "Unable to save settings", message: error instanceof Error ? error.message : "Settings could not be saved." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-lg border border-gray-200 bg-card p-5 shadow-sm dark:border-gray-800">
          <h2 className="text-lg font-extrabold">Profile</h2>
          <div className="mt-5 grid gap-6 lg:grid-cols-[10rem_minmax(0,1fr)] lg:items-start">
            <AvatarPicker previewUrl={avatarDisplayUrl} initials={initials} onChange={handleAvatarChange} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Name" value={profile.name} disabled={isLoading} onChange={(value) => handleFieldChange("name", value)} />
              <Field id="username" label="Username" value={profile.username} disabled={isLoading} onChange={(value) => handleFieldChange("username", value)} />
              <Field id="email" label="Email" type="email" value={profile.email} disabled onChange={(value) => handleFieldChange("email", value)} />
              <Field id="role" label="Role" value={profile.role} disabled={isLoading} onChange={(value) => handleFieldChange("role", value)} />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-card p-5 shadow-sm dark:border-gray-800">
          <h2 className="text-lg font-extrabold">Preferences</h2>
          <div className="mt-5 space-y-4">
            <Toggle label="Weekly digest" description="Send a summary of activity each week." checked={weeklyDigest} onChange={setWeeklyDigest} />
            <Toggle label="Public profile" description="Show unified contribution totals on your profile." checked={publicProfile} onChange={setPublicProfile} />
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="submit" disabled={isSaving || isLoading} className="h-11 rounded-md bg-primary px-5 text-sm font-extrabold text-white transition hover:bg-primary-dark cursor-pointer disabled:cursor-not-allowed disabled:opacity-60">
            {isSaving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </form>

      <aside className="space-y-4">
        <h2 className="text-lg font-extrabold">Integrations</h2>
        <IntegrationAccountsPanel redirectTo="/settings" />
      </aside>
    </div>
  );
}

function AvatarPicker({ previewUrl, initials, onChange }: { previewUrl: string | null; initials: string; onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="flex items-center gap-4 lg:block">
      <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-full border border-gray-200 bg-background text-2xl font-extrabold text-primary dark:border-gray-800 sm:size-28">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Selected profile avatar preview" className="h-full w-full object-cover" />
        ) : (
          <span aria-hidden>{initials}</span>
        )}
      </div>
      <div className="mt-0 lg:mt-4">
        <label htmlFor="avatar" className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-gray-200 px-4 text-sm font-extrabold transition hover:border-primary hover:text-primary dark:border-gray-800">
          Change avatar
        </label>
        <input id="avatar" name="avatar" type="file" accept="image/*" className="sr-only" onChange={onChange} />
        <p className="mt-2 max-w-36 text-xs leading-5 text-muted-foreground">Saved to your profile after you click save.</p>
      </div>
    </div>
  );
}

function Field({ id, label, value, onChange, type = "text", disabled = false }: { id: string; label: string; value: string; onChange: (value: string) => void; type?: string; disabled?: boolean }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold">{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 block h-11 w-full rounded-md border border-gray-200 bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-800"
      />
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-md border border-gray-200 p-4 dark:border-gray-800">
      <span>
        <span className="block font-bold">{label}</span>
        <span className="mt-1 block text-sm text-muted-foreground">{description}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-5 accent-primary" />
    </label>
  );
}

function getInitials(value: string) {
  const fallback = "GF";
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return fallback;
  }

  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || fallback;
}

function getStringMetadata(value: unknown) {
  return typeof value === "string" ? value : "";
}
