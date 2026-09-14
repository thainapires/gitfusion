"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { uploadUserAvatar } from "@/lib/supabase/avatar";

type AuthMode = "sign-in" | "sign-up";

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const isSignUp = mode === "sign-up";

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!isSupabaseConfigured()) {
      setMessage("Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const name = String(formData.get("name") || "").trim();
    const confirmPassword = String(formData.get("confirm-password") || "");

    if (!email || !password || (isSignUp && !name)) {
      setMessage("Fill in the required fields to continue.");
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setMessage("Password confirmation does not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      const supabase = createSupabaseBrowserClient();

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (error) {
          throw error;
        }

        let avatarUrl: string | null = null;

        if (avatarFile && data.user && data.session) {
          avatarUrl = await uploadUserAvatar({ supabase, user: data.user, file: avatarFile });

          const { error: updateUserError } = await supabase.auth.updateUser({
            data: {
              full_name: name,
              avatar_url: avatarUrl,
            },
          });

          if (updateUserError) {
            throw updateUserError;
          }
        }

        if (data.user && data.session) {
          const { error: profileError } = await supabase.from("profiles").upsert({
            id: data.user.id,
            full_name: name,
            avatar_url: avatarUrl,
          });

          if (profileError) {
            throw profileError;
          }

          router.push("/connect-accounts");
          router.refresh();
          return;
        }

        setMessage("Account created. Confirm your email before signing in. Avatar upload will be available after confirmation.");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        throw error;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {isSignUp && (
        <>
          <AvatarField previewUrl={avatarPreview} onChange={handleAvatarChange} />
          <Field id="name" label="Name" type="text" autoComplete="name" placeholder="Your name" />
        </>
      )}
      <Field id="email" label="Email" type="email" autoComplete="email" placeholder="email@example.com" />
      <Field id="password" label="Password" type="password" autoComplete={isSignUp ? "new-password" : "current-password"} placeholder="••••••••" />
      {isSignUp && (
        <Field id="confirm-password" label="Confirm password" type="password" autoComplete="new-password" placeholder="••••••••" />
      )}

      {!isSignUp && (
        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="flex items-center gap-2 text-muted-foreground">
            <input type="checkbox" className="size-4 rounded border-gray-300 accent-primary" />
            Remember me
          </label>
          <button type="button" className="font-semibold text-primary hover:text-primary-dark">
            Forgot password?
          </button>
        </div>
      )}

      {message && (
        <div className="rounded-md border border-gray-200 bg-background px-3 py-2 text-sm font-semibold text-muted-foreground dark:border-gray-800">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-11 w-full items-center justify-center cursor-pointer rounded-md bg-primary px-4 text-sm font-extrabold text-white transition hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Processing..." : isSignUp ? "Create account" : "Sign in"}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <Link className="font-bold text-primary hover:text-primary-dark" href={isSignUp ? "/sign-in" : "/sign-up"}>
          {isSignUp ? "Sign in" : "Create one"}
        </Link>
      </p>
    </form>
  );
}

type FieldProps = {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  autoComplete: string;
};

function Field({ id, label, type, placeholder, autoComplete }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="mt-2 block h-11 w-full rounded-md border border-gray-200 bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-800"
      />
    </div>
  );
}

function AvatarField({ previewUrl, onChange }: { previewUrl: string | null; onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-background p-4 dark:border-gray-800">
      <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border border-gray-200 text-lg font-extrabold text-primary dark:border-gray-800">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Profile avatar preview" className="h-full w-full object-cover" />
        ) : (
          <span aria-hidden>GF</span>
        )}
      </div>
      <div>
        <label htmlFor="avatar" className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-gray-200 px-4 text-sm font-extrabold transition hover:border-primary hover:text-primary dark:border-gray-800">
          Add profile photo
        </label>
        <input id="avatar" name="avatar" type="file" accept="image/*" className="sr-only" onChange={onChange} />
        <p className="mt-2 text-xs leading-5 text-muted-foreground">Uploaded to Supabase Storage after account creation.</p>
      </div>
    </div>
  );
}
