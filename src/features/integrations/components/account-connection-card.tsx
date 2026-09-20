"use client";

import { FaGithub, FaGitlab } from "react-icons/fa";
import { FiChevronRight, FiLink2, FiLogOut } from "react-icons/fi";
import { ConnectedAccount } from "@/types/mock-app";

type AccountConnectionCardProps = {
  account: ConnectedAccount;
  onConnect: (provider: ConnectedAccount["provider"]) => void;
  onDisconnect?: (provider: ConnectedAccount["provider"]) => void;
  compact?: boolean;
  readOnly?: boolean;
};

export function AccountConnectionCard({ account, onConnect, onDisconnect, compact = false, readOnly = false }: AccountConnectionCardProps) {
  const isConnected = account.status === "connected";
  const isConnecting = account.status === "connecting";
  const Icon = account.provider === "github" ? FaGithub : FaGitlab;

  return (
    <article className="min-w-0 rounded-lg border border-border bg-background/65 p-3 transition hover:border-primary/25">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${account.provider === "github" ? "bg-slate-950 text-white" : "bg-orange-500/15 text-orange-400"}`}>
            <Icon className="size-5" aria-hidden />
          </span>
          <div className={`min-w-0`}>
            <h2 className="truncate text-sm font-extrabold">{account.name}</h2>
            <p className="mt-1 truncate text-xs font-semibold text-muted-foreground">
              {isConnected ? `@${account.username}` : "Connect your account"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isConnected ? (
            <>
              <span className={`rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-extrabold text-emerald-400`}>Connected</span>
              {!readOnly && <button
                type="button"
                onClick={() => onDisconnect?.(account.provider)}
                className={`grid size-8 place-items-center rounded-full text-muted-foreground transition hover:bg-rose-500/10 hover:text-rose-300`}
                aria-label={`Disconnect ${account.name}`}
                title={`Disconnect ${account.name}`}
              >
                <FiLogOut className="size-4" aria-hidden />
              </button>}
              <FiChevronRight className={`size-4 text-muted-foreground ${compact ? "hidden sm:block" : ""}`} aria-hidden />
            </>
          ) : (
            <button
              type="button"
              onClick={() => onConnect(account.provider)}
              disabled={isConnecting}
              className="inline-flex h-8 items-center gap-2 rounded-full bg-emerald-500/15 px-3 text-xs font-extrabold text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiLink2 className="size-3.5" aria-hidden />
              <span>{isConnecting ? "Connecting" : "Connect"}</span>
            </button>
          )}
        </div>
      </div>

      {isConnected && !compact && (
        <div className="mt-4 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-3">
          <AccountStat label="Repositories" value={account.repositories.toString()} />
          <AccountStat label="Contributions" value={account.contributions.toLocaleString("en-US")} />
          <AccountStat label="Last sync" value={account.lastSync} />
        </div>
      )}
    </article>
  );
}

function AccountStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 font-extrabold">{value}</div>
    </div>
  );
}
