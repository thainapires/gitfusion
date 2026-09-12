"use client";

import { FaGithub, FaGitlab } from "react-icons/fa";
import { ConnectedAccount } from "../../types/mock-app";

type AccountConnectionCardProps = {
  account: ConnectedAccount;
  onConnect: (provider: ConnectedAccount["provider"]) => void;
  onDisconnect?: (provider: ConnectedAccount["provider"]) => void;
  compact?: boolean;
};

export function AccountConnectionCard({ account, onConnect, onDisconnect, compact = false }: AccountConnectionCardProps) {
  const isConnected = account.status === "connected";
  const isConnecting = account.status === "connecting";
  const Icon = account.provider === "github" ? FaGithub : FaGitlab;

  return (
    <article className="rounded-lg border border-gray-200 bg-card p-4 shadow-sm dark:border-gray-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className={`grid size-11 shrink-0 place-items-center rounded-md ${account.provider === "github" ? "bg-slate-900 text-white" : "bg-orange-100 text-orange-600 dark:bg-orange-950/40"}`}>
            <Icon className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="font-extrabold">{account.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isConnected ? `Connected as @${account.username}` : `Connect your ${account.name} account`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConnected && onDisconnect && (
            <button
              type="button"
              onClick={() => onDisconnect(account.provider)}
              className="h-10 rounded-md border border-gray-200 px-4 text-sm font-extrabold text-muted-foreground transition hover:border-red-400 hover:text-red-400 dark:border-gray-800"
            >
              Disconnect
            </button>
          )}
          <button
            type="button"
            onClick={() => onConnect(account.provider)}
            disabled={isConnected || isConnecting}
            className="h-10 rounded-md bg-primary px-4 text-sm font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-default disabled:bg-emerald-500"
          >
            {isConnecting ? "Connecting..." : isConnected ? "Connected" : "Connect"}
          </button>
        </div>
      </div>

      {isConnected && !compact && (
        <div className="mt-4 grid gap-3 border-t border-gray-200 pt-4 text-sm dark:border-gray-800 sm:grid-cols-3">
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
