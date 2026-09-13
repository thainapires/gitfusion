"use client";

import { useEffect, useState } from "react";
import { HeroContent } from "./hero-content";
import { HeroHighlights } from "./hero-highlights";
import { HeroIllustration } from "./hero-illustration";
import { LandingNavbar } from "./landing-navbar";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "../../lib/supabase/client";

export type LandingSessionUser = {
  name: string;
  email: string;
  avatarUrl: string | null;
};

export function LandingPage() {
  const [user, setUser] = useState<LandingSessionUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(isSupabaseConfigured());

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsCheckingSession(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        setUser(null);
        setIsCheckingSession(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name,avatar_url")
        .eq("id", data.user.id)
        .maybeSingle<{ full_name: string | null; avatar_url: string | null }>();

      const metadataName = typeof data.user.user_metadata.full_name === "string" ? data.user.user_metadata.full_name : "";
      const metadataAvatarUrl = typeof data.user.user_metadata.avatar_url === "string" ? data.user.user_metadata.avatar_url : "";
      const email = data.user.email || "";

      setUser({
        name: profile?.full_name || metadataName || email || "Git Fusion user",
        email,
        avatarUrl: profile?.avatar_url || metadataAvatarUrl || null,
      });
      setIsCheckingSession(false);
    };

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    }

    setUser(null);
  };

  return (
    <main className="relative min-h-screen w-screen overflow-hidden bg-background text-white">
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[90rem] flex-col">
        <LandingNavbar user={user} isCheckingSession={isCheckingSession} onSignOut={handleSignOut} />

        <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-8 pt-8 sm:px-8 lg:px-10 lg:pb-24">
          <div className="grid flex-1 items-center gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:gap-14">
            <HeroContent isAuthenticated={Boolean(user)} isCheckingSession={isCheckingSession} />
            <HeroIllustration />
          </div>

          <HeroHighlights />
        </section>
      </div>
    </main>
  );
}
