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
    <article className="min-w-0 rounded-lg border border-gray-200 bg-background p-4 shadow-sm dark:border-gray-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className={`grid size-11 shrink-0 place-items-center rounded-md ${account.provider === "github" ? "bg-slate-900 text-white" : "bg-orange-100 text-orange-600 dark:bg-orange-950/40"}`}>
            <Icon className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="font-extrabold">{account.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isConnected ? `@${account.username}` : `Connect your account`}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() =>
              isConnected
                ? onDisconnect?.(account.provider)
                : onConnect(account.provider)
            }
            disabled={isConnecting}
            className={`w-full rounded-md px-3 py-2 text-sm font-extrabold text-white transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${
              isConnected
                ? "bg-red-500 hover:bg-red-600"
                : "bg-emerald-500 hover:bg-emerald-600"
            }`}
          >
            {isConnecting ? "Connecting..." : isConnected ? "Disconnect" : "Connect"}
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
