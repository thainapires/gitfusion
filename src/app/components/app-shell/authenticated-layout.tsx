"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { FaCodeMerge } from "react-icons/fa6";
import { FiAward, FiBarChart2, FiChevronLeft, FiChevronRight, FiGitPullRequest, FiGrid, FiLogOut, FiMenu, FiSettings, FiX } from "react-icons/fi";
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
        <aside
          className={`sticky left-0 top-0 hidden h-screen shrink-0 border-r border-gray-200 bg-card transition-[width] duration-200 dark:border-gray-800 lg:block ${isSidebarCollapsed ? "w-20" : "w-62"}`}
        >
          <Sidebar collapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed((collapsed) => !collapsed)} />
        </aside>
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full min-w-0">
            <header className="flex flex-col gap-4 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">Dashboard</p>
                <h1 className="mt-1 text-2xl font-extrabold tracking-normal sm:text-3xl">{title}</h1>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}<ThemeToggle /></div>
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

function Sidebar({ onNavigate, collapsed = false, onToggleCollapse }: { onNavigate?: () => void; collapsed?: boolean; onToggleCollapse?: () => void }) {
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
      <div className={`flex h-16 items-center border-b border-gray-200 dark:border-gray-800 ${collapsed ? "justify-center px-2" : "justify-between px-5"}`}>
        <Link href="/dashboard" onClick={onNavigate} className={`flex items-center font-extrabold ${collapsed ? "justify-center" : "gap-3"}`} aria-label="Git Fusion dashboard" title={collapsed ? "Git Fusion" : undefined}>
          <FaCodeMerge className="size-6 text-primary" aria-hidden />
          {!collapsed && "Git Fusion"}
        </Link>
        {onNavigate ? (
          <button type="button" className="grid size-9 place-items-center rounded-md text-muted-foreground" onClick={onNavigate} aria-label="Close navigation">
            <FiX className="size-5" aria-hidden />
          </button>
        ) : onToggleCollapse ? (
          <button type="button" className="grid size-8 place-items-center rounded-md text-muted-foreground transition hover:bg-gray-100 hover:text-foreground dark:hover:bg-gray-800" onClick={onToggleCollapse} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} title={collapsed ? "Expand navigation" : "Collapse navigation"}>
            {collapsed ? <FiChevronRight className="size-4" aria-hidden /> : <FiChevronLeft className="size-4" aria-hidden />}
          </button>
        ) : null}
      </div>

      <nav className={`flex-1 space-y-1 py-4 ${collapsed ? "px-2" : "px-3"}`} aria-label="Dashboard navigation">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === pathname;
          const classes = `flex w-full items-center rounded-md py-2.5 text-sm font-bold transition ${collapsed ? "justify-center px-2" : "gap-3 px-3"} ${
            isActive
              ? "bg-primary text-white"
              : item.disabled
                ? "cursor-not-allowed text-muted-foreground/55"
                : "text-muted-foreground hover:bg-gray-100 hover:text-foreground dark:hover:bg-gray-800"
          }`;

          if (!item.href || item.disabled) {
            return (
              <button key={item.label} type="button" className={classes} disabled title="Coming soon">
                <Icon className={`shrink-0 ${collapsed ? "size-6" : "size-4"}`} aria-hidden />
                {!collapsed && item.label}
                {!collapsed && <span className="ml-auto text-[0.65rem] font-extrabold uppercase">Soon</span>}
              </button>
            );
          }

          return (
            <Link key={item.href} href={item.href} onClick={onNavigate} className={classes}>
              <Icon className={`shrink-0 ${collapsed ? "size-6" : "size-4"}`} strokeWidth={2} aria-hidden />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div
        className={`space-y-3 border-t border-gray-200 dark:border-gray-800 ${
          collapsed ? "p-2" : "p-4"
        }`}
      >
        <div
          className={`flex items-center rounded-md ${
            collapsed
              ? "justify-center p-2"
              : "gap-3 bg-background p-3"
          }`}
        >
          <Avatar className="size-8 shrink-0 overflow-hidden rounded-full">
            <Avatar.Image
              src={displayAvatarUrl || undefined}
              alt={displayName}
              className="size-full object-cover"
            />

            <Avatar.Fallback className="flex size-full items-center justify-center">
              {getInitials(displayName)}
            </Avatar.Fallback>
          </Avatar>

          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold">
                {displayName}
              </div>

              <div className="mt-1 truncate text-xs text-muted-foreground">
                {displayUsername}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className={`flex w-full items-center justify-center rounded-md border border-gray-200 py-2 text-sm font-extrabold text-muted-foreground transition hover:border-primary hover:text-primary dark:border-gray-800 ${
            collapsed ? "px-2" : "gap-2 px-3"
          }`}
          aria-label="Sign out"
          title={collapsed ? "Sign out" : undefined}
        >
          <FiLogOut className="size-4" aria-hidden />

          {!collapsed && "Sign out"}
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
