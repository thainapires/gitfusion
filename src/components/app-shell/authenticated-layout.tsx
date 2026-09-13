"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import { FaGithub, FaGitlab } from "react-icons/fa";
import { FiAlertCircle, FiAward, FiBarChart2, FiCalendar, FiCheckCircle, FiChevronDown, FiChevronLeft, FiChevronRight, FiClock, FiGitPullRequest, FiGrid, FiLogOut, FiMenu, FiSettings, FiX } from "react-icons/fi";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "../../lib/supabase/client";
import { AccountProvider, SidebarItem } from "../../types/mock-app";
// import { ThemeToggle } from "../layout/theme-toggle";
import { Avatar } from "@heroui/react";
import { AppLogo } from "../ui/app-logo";
import { DashboardSyncStatus } from "@/types/dashboard";

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
  syncActions?: ReactNode;
  syncStatus?: DashboardSyncStatus | null;
  syncProviders?: AccountProvider[];
};

export function AuthenticatedLayout({ title, description, children, actions, syncActions, syncStatus, syncProviders }: AuthenticatedLayoutProps) {
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
        <main className="min-w-0 flex-1 overflow-x-hidden py-3 px-6 lg:px-8">
          <div className="mx-auto w-full min-w-0">
            <header className="flex flex-col gap-4 xl:pb-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <p className="hidden sm:block text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">Dashboard</p>
                <h1 className="mt-1 text-3xl font-semibold sm:font-extrabold tracking-normal sm:text-3xl">{title}</h1>
                <p className="mt-1 max-w-2xl text-lg sm:text-sm tracking-wide sm:tracking-normal leading-6 text-muted-foreground">{description}</p>
              </div>
              <div className="flex w-full min-w-0 flex-col gap-3 xl:w-auto xl:flex-row xl:items-center xl:justify-end">
                <SyncStatusPanel sync={syncStatus ?? null} providers={syncProviders ?? []} actions={syncActions} />
                <div className="hidden xl:flex shrink-0 flex-wrap items-center gap-3">
                  {actions}
                  {/* <ThemeToggle /> */}
                </div>
              </div>
            </header>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function SyncStatusPanel({ sync, providers, actions }: { sync: DashboardSyncStatus | null; providers: AccountProvider[]; actions?: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!sync || sync.status === "idle") {
    return actions ? (
      <div className="flex min-h-[52px] w-full shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-card shadow-sm dark:border-gray-800 xl:w-auto">
        {actions}
      </div>
    ) : null;
  }

  const summary = getSyncSummary(sync);
  const shownProviders = providers.length ? providers : (["github", "gitlab"] satisfies AccountProvider[]);

  return (
    <div ref={panelRef} className="relative w-full min-w-0 shrink-0 xl:w-auto">
      <div className="flex min-h-[52px] w-full overflow-hidden rounded-lg border border-gray-200 bg-card shadow-sm transition focus-within:ring-2 focus-within:ring-primary/35 dark:border-gray-800 xl:w-auto">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="flex min-w-0 flex-1 items-center gap-3 px-3 text-left transition hover:bg-gray-50 focus:outline-none dark:hover:bg-gray-900/70 min-[420px]:px-4 md:min-w-[15rem] xl:min-w-[15rem]"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
        <span className={"inline-flex size-8 shrink-0 items-center justify-center rounded-full " + summary.iconClassName}>
          <summary.Icon
            className={"size-4 " + (sync.status === "syncing" ? "animate-pulse" : "")}
            aria-hidden
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-extrabold text-foreground">{summary.title}</span>
          <span className="block truncate text-xs font-medium text-muted-foreground">{summary.detail}</span>
        </span>
        <FiChevronDown
          className={"size-4 shrink-0 text-muted-foreground transition-transform cursor-pointer " + (isOpen ? "rotate-180" : "")}
          aria-hidden
        />
        </button>
        {actions && (
          <div className="flex shrink-0 border-l border-gray-200 dark:border-gray-800">
            {actions}
          </div>
        )}
      </div>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Last sync details"
          className="absolute left-0 right-0 top-full z-40 mt-2 w-full rounded-lg border border-gray-200 bg-card p-4 shadow-xl dark:border-gray-800 xl:left-auto xl:w-80"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-extrabold text-foreground">Last sync</p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="grid size-8 place-items-center rounded-md text-muted-foreground transition hover:bg-gray-100 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/35 dark:hover:bg-gray-800"
              aria-label="Close sync details"
            >
              <FiX className="size-4" aria-hidden />
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {shownProviders.map((provider) => (
              <ProviderSyncRow key={provider} provider={provider} sync={sync} />
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 border-t border-gray-200 pt-3 text-xs font-medium text-muted-foreground dark:border-gray-800">
            <FiCalendar className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{summary.finishedDetail}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ProviderSyncRow({ provider, sync }: { provider: AccountProvider; sync: DashboardSyncStatus }) {
  const summary = getSyncSummary(sync);
  const Icon = provider === "github" ? FaGithub : FaGitlab;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className={"grid size-8 shrink-0 place-items-center rounded-md " + (provider === "github" ? "bg-slate-950 text-white" : "bg-orange-100 text-amber-600 dark:bg-amber-800/30")}>
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="truncate text-sm font-extrabold text-foreground">{formatProviderName(provider)}</span>
      </div>
      <span className={"inline-flex shrink-0 items-center gap-1 text-xs font-extrabold " + summary.statusClassName}>
        <summary.Icon className={"size-3.5 " + (sync.status === "syncing" ? "animate-pulse" : "")} aria-hidden />
        {summary.title}
      </span>
    </div>
  );
}

function getSyncSummary(sync: DashboardSyncStatus) {
  const isSyncing = sync.status === "syncing";
  const isSynced = sync.status === "synced";
  const Icon = isSyncing ? FiClock : isSynced ? FiCheckCircle : FiAlertCircle;
  const title = isSyncing ? "Syncing" : isSynced ? "Synced" : "Failed";
  const detail = isSyncing
    ? sync.startedAt
      ? "Started " + formatSyncDate(sync.startedAt)
      : "Sync in progress"
    : isSynced
      ? sync.finishedAt
        ? "Updated " + formatSyncDate(sync.finishedAt)
        : "Updated just now"
      : sync.errorMessage || "Last sync failed";
  const finishedDetail = isSyncing
    ? detail
    : sync.finishedAt
      ? "Finished " + formatSyncDate(sync.finishedAt)
      : detail;

  return {
    Icon,
    title,
    detail,
    finishedDetail,
    iconClassName: isSyncing
      ? "bg-blue-500/10 text-blue-500"
      : isSynced
        ? "bg-emerald-500/10 text-emerald-500"
        : "bg-rose-500/10 text-rose-500",
    statusClassName: isSyncing
      ? "text-blue-500"
      : isSynced
        ? "text-emerald-500"
        : "text-rose-500",
  };
}

function formatProviderName(provider: AccountProvider) {
  return provider === "github" ? "GitHub" : "GitLab";
}

function formatSyncDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function MobileTopbar({ onOpen }: { onOpen: () => void }) {
  const [displayAvatarUrl, setDisplayAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Git Fusion user");

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

      setDisplayName(fullName || "Git Fusion user");
      setDisplayAvatarUrl(profile?.avatar_url || metadataAvatarUrl || null);
    };

    loadUser();
    window.addEventListener("gitfusion:profile-updated", loadUser);
    return () => window.removeEventListener("gitfusion:profile-updated", loadUser);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between sm:border-b sm:border-gray-200 bg-background sm:bg-card px-5 dark:border-gray-800">
      <Link href="/dashboard" className="order-2 lg:order-1 flex items-center gap-2 text-lg sm:text-md font-extrabold">
        <AppLogo className="size-6 sm:size-5" aria-hidden/>
        Git Fusion
      </Link>
      <button
        type="button"
        onClick={onOpen}
        className="order-1 lg:order-2 grid size-10 place-items-center rounded-md border border-gray-200 text-muted-foreground dark:border-gray-800"
        aria-label="Open navigation"
      >
        <FiMenu className="size-5" aria-hidden />
      </button>
      <Avatar className="order-3 lg:hide size-8 shrink-0 overflow-hidden rounded-full">
        <Avatar.Image
          src={displayAvatarUrl || undefined}
          alt={displayName}
          className="size-full object-cover"
        />

        <Avatar.Fallback className="flex size-full items-center justify-center">
          {getInitials(displayName)}
        </Avatar.Fallback>
      </Avatar>
    </header>
  );
}

function Sidebar({ onNavigate, collapsed = false, onToggleCollapse }: { onNavigate?: () => void; collapsed?: boolean; onToggleCollapse?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("Git Fusion user");
  const [displayUsername, setDisplayUsername] = useState("");
  const [displayAvatarUrl, setDisplayAvatarUrl] = useState<string | null>(null);

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

      setDisplayName(fullName || "Git Fusion user");
      setDisplayUsername(user.email || "");
      setDisplayAvatarUrl(profile?.avatar_url || metadataAvatarUrl || null);
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
          <AppLogo className="size-6" />
          {!collapsed && "Git Fusion"}
        </Link>
        {onNavigate ? (
          <button type="button" className="grid size-9 place-items-center rounded-md text-muted-foreground" onClick={onNavigate} aria-label="Close navigation">
            <FiX className="size-5" aria-hidden />
          </button>
        ) : onToggleCollapse ? (
          <button type="button" className="grid size-8 place-items-center rounded-md text-muted-foreground transition hover:bg-gray-100 hover:text-foreground dark:hover:bg-gray-800 cursor-pointer" onClick={onToggleCollapse} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} title={collapsed ? "Expand navigation" : "Collapse navigation"}>
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
          className={`hidden sm:flex items-center rounded-md ${
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
          className={`flex w-full items-center justify-center rounded-md border border-gray-200 py-2 text-sm font-extrabold text-muted-foreground transition hover:border-primary hover:text-primary dark:border-gray-800 cursor-pointer ${
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
