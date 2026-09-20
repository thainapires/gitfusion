"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import { FaGithub, FaGitlab } from "react-icons/fa";
import {
  FiAlertCircle,
  FiAward,
  FiBarChart2,
  FiBell,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiCompass,
  FiGitPullRequest,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiSearch,
  FiSettings,
  FiX,
} from "react-icons/fi";
import { Avatar } from "@heroui/react";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { AppLogo } from "@/shared/components/app-logo";
import { AccountProvider, SidebarItem } from "@/types/mock-app";
import { DashboardSyncStatus } from "@/types/dashboard";

const navItems: SidebarItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: FiGrid },
  { label: "Repositories", disabled: true, icon: FiGitPullRequest },
  { label: "Analytics", disabled: true, icon: FiBarChart2 },
  { label: "Compare", disabled: true, icon: FiBarChart2 },
  { label: "Achievements", disabled: true, icon: FiAward },
  { label: "Explore", disabled: true, icon: FiCompass },
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

type UserDisplay = {
  name: string;
  username: string;
  avatarUrl: string | null;
};

export function AuthenticatedLayout({
  children,
  actions,
  syncActions,
  syncStatus,
  syncProviders,
}: AuthenticatedLayoutProps) {
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
        setIsCheckingSession(false);
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
      <AuthenticatedHeader
        onOpenMobileMenu={() => setIsOpen(true)}
        syncActions={syncActions}
        syncStatus={syncStatus}
        syncProviders={syncProviders}
        actions={actions}
      />

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            aria-label="Close navigation"
            onClick={() => setIsOpen(false)}
          />
          <aside className="relative flex h-full w-[min(21rem,86vw)] flex-col border-r border-border bg-card shadow-2xl">
            <MobileMenu onNavigate={() => setIsOpen(false)} />
          </aside>
        </div>
      )}

      <main className="min-w-0 overflow-x-hidden px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1560px] min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}

function AuthenticatedHeader({
  onOpenMobileMenu,
  syncActions,
  syncStatus,
  syncProviders,
  actions,
}: {
  onOpenMobileMenu: () => void;
  syncActions?: ReactNode;
  syncStatus?: DashboardSyncStatus | null;
  syncProviders?: AccountProvider[];
  actions?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="grid size-10 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-primary/40 hover:text-foreground lg:hidden"
          aria-label="Open navigation"
        >
          <FiMenu className="size-5" aria-hidden />
        </button>

        <Link href="/dashboard" className="flex shrink-0 items-center gap-3 text-base font-extrabold" aria-label="GitFusion dashboard">
          <AppLogo className="size-7" />
          <span>GitFusion</span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center gap-1 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}
        </nav>

        <div className="ml-auto hidden min-w-0 items-center gap-3 xl:flex">
          <SearchControl />
          <button
            type="button"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-border bg-card/70 px-3 text-sm font-bold text-foreground"
            title="Dashboard data uses the current yearly activity window"
          >
            <span>Last year</span>
            <FiChevronDown className="size-4 text-muted-foreground" aria-hidden />
          </button>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 xl:ml-0">
          <div className="hidden 2xl:block">
            <SyncStatusPanel sync={syncStatus ?? null} providers={syncProviders ?? []} actions={syncActions} />
          </div>
          <div className="hidden xl:flex">{actions}</div>
          <IconButton label="Dark theme is active">
            <FiMoon className="size-4" aria-hidden />
          </IconButton>
          <IconButton label="Notifications">
            <FiBell className="size-4" aria-hidden />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-rose-400" />
          </IconButton>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

function NavItem({ item }: { item: SidebarItem }) {
  const pathname = usePathname();
  const Icon = item.icon;
  const isActive = item.href === pathname;
  const classes = `inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-bold transition ${
    isActive
      ? "bg-primary/18 text-primary ring-1 ring-primary/25"
      : item.disabled
        ? "cursor-not-allowed text-muted-foreground/60"
        : "text-muted-foreground hover:bg-card hover:text-foreground"
  }`;

  if (!item.href || item.disabled) {
    return (
      <button type="button" className={classes} disabled title="Coming soon">
        <Icon className="size-4" aria-hidden />
        {item.label}
      </button>
    );
  }

  return (
    <Link href={item.href} className={classes}>
      <Icon className="size-4" aria-hidden />
      {item.label}
    </Link>
  );
}

function SearchControl() {
  return (
    <div className="relative w-[min(24vw,22rem)] min-w-[18rem]">
      <FiSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input
        type="search"
        disabled
        placeholder="Search repositories, languages, insights..."
        className="h-10 w-full rounded-lg border border-border bg-card/70 pl-10 pr-14 text-sm font-semibold text-muted-foreground outline-none placeholder:text-muted-foreground/75"
        aria-label="Search repositories, languages, insights"
      />
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-border bg-background px-2 py-0.5 text-[0.68rem] font-extrabold text-muted-foreground">
        Ctrl K
      </span>
    </div>
  );
}

function IconButton({ label, children }: { label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      className="relative grid size-10 place-items-center rounded-full border border-border bg-card/70 text-muted-foreground transition hover:border-primary/35 hover:text-foreground"
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

function UserMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const user = useUserDisplay();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
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

  const handleSignOut = async () => {
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    }

    setIsOpen(false);
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-10 items-center gap-2 rounded-full border border-transparent pl-1 pr-2 transition hover:border-primary/30 hover:bg-card"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <UserAvatar user={user} />
        <FiChevronDown className="hidden size-4 text-muted-foreground sm:block" aria-hidden />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-3 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/30"
        >
          <div className="flex min-w-0 items-center gap-3 border-b border-border p-4">
            <UserAvatar user={user} />
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold">{user.name}</p>
              <p className="mt-0.5 truncate text-xs font-semibold text-muted-foreground">{user.username}</p>
            </div>
          </div>

          <Link
            href="/settings"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <FiSettings className="size-4" aria-hidden />
            Settings
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <FiLogOut className="size-4" aria-hidden />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function MobileMenu({ onNavigate }: { onNavigate: () => void }) {
  const user = useUserDisplay();

  return (
    <>
      <div className="flex h-16 items-center justify-between border-b border-border px-5">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-3 font-extrabold" aria-label="GitFusion dashboard">
          <AppLogo className="size-7" />
          GitFusion
        </Link>
        <button type="button" className="grid size-9 place-items-center rounded-lg text-muted-foreground" onClick={onNavigate} aria-label="Close navigation">
          <FiX className="size-5" aria-hidden />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-4" aria-label="Mobile navigation">
        {navItems.map((item) => (
          <MobileNavItem key={item.label} item={item} onNavigate={onNavigate} />
        ))}
        <MobileNavItem item={{ label: "Settings", href: "/settings", icon: FiSettings }} onNavigate={onNavigate} />
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex min-w-0 items-center gap-3 rounded-lg bg-background p-3">
          <UserAvatar user={user} />
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold">{user.name}</div>
            <div className="mt-1 truncate text-xs text-muted-foreground">{user.username}</div>
          </div>
        </div>
      </div>
    </>
  );
}

function MobileNavItem({ item, onNavigate }: { item: SidebarItem; onNavigate: () => void }) {
  const pathname = usePathname();
  const Icon = item.icon;
  const isActive = item.href === pathname;
  const classes = `flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition ${
    isActive
      ? "bg-primary/18 text-primary ring-1 ring-primary/25"
      : item.disabled
        ? "cursor-not-allowed text-muted-foreground/55"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
  }`;

  if (!item.href || item.disabled) {
    return (
      <button type="button" className={classes} disabled title="Coming soon">
        <Icon className="size-4" aria-hidden />
        {item.label}
        <span className="ml-auto text-[0.65rem] font-extrabold uppercase">Soon</span>
      </button>
    );
  }

  return (
    <Link href={item.href} onClick={onNavigate} className={classes}>
      <Icon className="size-4" aria-hidden />
      {item.label}
    </Link>
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
      <div className="flex h-10 shrink-0 overflow-hidden rounded-lg border border-border bg-card/70">
        {actions}
      </div>
    ) : null;
  }

  const summary = getSyncSummary(sync);
  const shownProviders = providers.length ? providers : (["github", "gitlab"] satisfies AccountProvider[]);

  return (
    <div ref={panelRef} className="relative min-w-0 shrink-0">
      <div className="flex h-10 overflow-hidden rounded-lg border border-border bg-card/70 transition focus-within:ring-2 focus-within:ring-primary/35">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="flex min-w-0 flex-1 items-center gap-2 px-3 text-left transition hover:bg-muted"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          <span className={"inline-flex size-6 shrink-0 items-center justify-center rounded-full " + summary.iconClassName}>
            <summary.Icon className={"size-3.5 " + (sync.status === "syncing" ? "animate-pulse" : "")} aria-hidden />
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate text-xs font-extrabold text-foreground">{summary.title}</span>
            <span className="block max-w-36 truncate text-[0.68rem] font-medium text-muted-foreground">{summary.detail}</span>
          </span>
          <FiChevronDown className={"size-4 shrink-0 text-muted-foreground transition-transform " + (isOpen ? "rotate-180" : "")} aria-hidden />
        </button>
        {actions && (
          <div className="flex shrink-0 border-l border-border">
            {actions}
          </div>
        )}
      </div>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Last sync details"
          className="absolute right-0 top-full z-40 mt-2 w-80 rounded-xl border border-border bg-card p-4 shadow-2xl shadow-black/30"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-extrabold text-foreground">Last sync</p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="grid size-8 place-items-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/35"
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

          <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-xs font-medium text-muted-foreground">
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
        <span className={"grid size-8 shrink-0 place-items-center rounded-md " + (provider === "github" ? "bg-slate-950 text-white" : "bg-orange-500/15 text-orange-400")}>
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

function UserAvatar({ user }: { user: UserDisplay }) {
  return (
    <Avatar className="size-9 shrink-0 overflow-hidden rounded-full ring-1 ring-border">
      <Avatar.Image src={user.avatarUrl || undefined} alt={user.name} className="size-full object-cover" />
      <Avatar.Fallback className="flex size-full items-center justify-center text-xs font-extrabold">
        {getInitials(user.name)}
      </Avatar.Fallback>
    </Avatar>
  );
}

function useUserDisplay() {
  const [display, setDisplay] = useState<UserDisplay>({
    name: "GitFusion user",
    username: "",
    avatarUrl: null,
  });

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
      const fullName = profile?.full_name || metadataName || user.email || "GitFusion user";

      setDisplay({
        name: fullName,
        username: user.email || "",
        avatarUrl: profile?.avatar_url || metadataAvatarUrl || null,
      });
    };

    loadUser();
    window.addEventListener("gitfusion:profile-updated", loadUser);
    return () => window.removeEventListener("gitfusion:profile-updated", loadUser);
  }, []);

  return display;
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
      ? "bg-blue-500/10 text-blue-400"
      : isSynced
        ? "bg-emerald-500/10 text-emerald-400"
        : "bg-rose-500/10 text-rose-400",
    statusClassName: isSyncing
      ? "text-blue-400"
      : isSynced
        ? "text-emerald-400"
        : "text-rose-400",
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

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return "GF";
  }

  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "GF";
}
