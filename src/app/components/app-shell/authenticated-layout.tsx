"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { FaCodeMerge } from "react-icons/fa6";
import { FiAward, FiBarChart2, FiGitPullRequest, FiGrid, FiLogOut, FiMenu, FiSettings, FiX } from "react-icons/fi";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "../../lib/supabase/client";
import { mockUser } from "../../mocks/user";
import { SidebarItem } from "../../types/mock-app";
import { ThemeToggle } from "../layout/theme-toggle";
import { Avatar } from "@heroui/react";

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: FiGrid },
  { label: "Repositories", disabled: true, icon: FiGitPullRequest },
  { label: "Analytics", disabled: true, icon: FiBarChart2 },
  { label: "Compare", disabled: true, icon: FiBarChart2 },
  { label: "Achievements", disabled: true, icon: FiAward },
  { label: "Settings", href: "/settings", icon: FiSettings },
];

type AuthenticatedLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
};

export function AuthenticatedLayout({ title, description, children, actions }: AuthenticatedLayoutProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(isSupabaseConfigured());

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/sign-in");
        return;
      }

      setIsCheckingSession(false);
    });
  }, [router]);

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-sm font-bold text-muted-foreground">
        Checking session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="lg:hidden">
        <MobileTopbar onOpen={() => setIsOpen(true)} />
        {isOpen && (
          <div className="fixed inset-0 z-50">
            <button className="absolute inset-0 bg-slate-950/50" aria-label="Close navigation" onClick={() => setIsOpen(false)} />
            <aside className="relative h-full w-[min(20rem,85vw)] bg-card shadow-xl">
              <Sidebar onNavigate={() => setIsOpen(false)} />
            </aside>
          </div>
        )}
      </div>

      <div className="flex w-full">
        <aside className="sticky left-0 top-0 hidden h-screen w-72 shrink-0 border-r border-gray-200 bg-card dark:border-gray-800 lg:block">
          <Sidebar />
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto ">
            <header className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-5 dark:border-gray-800 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Git Fusion</p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-normal">{title}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
              <div className="flex items-center gap-3">{actions}<ThemeToggle /></div>
            </header>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function MobileTopbar({ onOpen }: { onOpen: () => void }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-card px-4 dark:border-gray-800">
      <Link href="/dashboard" className="flex items-center gap-2 font-extrabold">
        <FaCodeMerge className="size-5 text-primary" aria-hidden />
        Git Fusion
      </Link>
      <button
        type="button"
        onClick={onOpen}
        className="grid size-10 place-items-center rounded-md border border-gray-200 text-muted-foreground dark:border-gray-800"
        aria-label="Open navigation"
      >
        <FiMenu className="size-5" aria-hidden />
      </button>
    </header>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(mockUser.name);
  const [displayUsername, setDisplayUsername] = useState(mockUser.username);
  const [displayAvatarUrl, setDisplayAvatarUrl] = useState<string | null>(mockUser.avatarUrl || null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const loadUser = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name,avatar_url")
        .eq("id", user.id)
        .maybeSingle<{ full_name: string | null; avatar_url: string | null }>();

      const metadataName = typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name : "";
      const metadataAvatarUrl = typeof user.user_metadata.avatar_url === "string" ? user.user_metadata.avatar_url : "";
      const fullName = profile?.full_name || metadataName || user.email;

      setDisplayName(fullName || mockUser.name);
      setDisplayUsername(user.email || mockUser.username);
      setDisplayAvatarUrl(profile?.avatar_url || metadataAvatarUrl || mockUser.avatarUrl || null);
    };

    loadUser();
    window.addEventListener("gitfusion:profile-updated", loadUser);
    return () => window.removeEventListener("gitfusion:profile-updated", loadUser);
  }, []);

  const handleSignOut = async () => {
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    }

    onNavigate?.();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-5 dark:border-gray-800">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-3 font-extrabold">
          <FaCodeMerge className="size-6 text-primary" aria-hidden />
          Git Fusion
        </Link>
        {onNavigate && (
          <button type="button" className="grid size-9 place-items-center rounded-md text-muted-foreground" onClick={onNavigate} aria-label="Close navigation">
            <FiX className="size-5" aria-hidden />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Dashboard navigation">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === pathname;
          const classes = `flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition ${
            isActive
              ? "bg-primary text-white"
              : item.disabled
                ? "cursor-not-allowed text-muted-foreground/55"
                : "text-muted-foreground hover:bg-gray-100 hover:text-foreground dark:hover:bg-gray-800"
          }`;

          if (!item.href || item.disabled) {
            return (
              <button key={item.label} type="button" className={classes} disabled title="Coming soon">
                <Icon className="size-4" aria-hidden />
                {item.label}
                <span className="ml-auto text-[0.65rem] font-extrabold uppercase">Soon</span>
              </button>
            );
          }

          return (
            <Link key={item.href} href={item.href} onClick={onNavigate} className={classes}>
              <Icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-gray-200 p-4 dark:border-gray-800">
        <div className="flex items-center gap-3 rounded-md bg-background p-3">
          <Avatar size="sm" className="size-8 shrink-0 overflow-hidden rounded-full">
            <Avatar.Image src={displayAvatarUrl || undefined} alt={displayName} />
            <Avatar.Fallback>
              {getInitials(displayName)}
            </Avatar.Fallback>
          </Avatar>

          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold">
              {displayName}
            </div>

            <div className="mt-1 truncate text-xs text-muted-foreground">
              {displayUsername}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-extrabold text-muted-foreground transition hover:border-primary hover:text-primary dark:border-gray-800"
        >
          <FiLogOut className="size-4" aria-hidden />
          Sign out
        </button>
      </div>
    </div>
  );
}


function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return "GF";
  }

  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "GF";
}
