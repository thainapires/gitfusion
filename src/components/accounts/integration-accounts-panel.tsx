"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { readApiJson } from "../../lib/api/response";
import { notify } from "../../lib/notifications/toast";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "../../lib/supabase/client";
import { mockAccounts } from "../../mocks/accounts";
import { AccountProvider, ConnectedAccount } from "../../types/mock-app";
import { AccountConnectionCard } from "./account-connection-card";
import { TbLayoutDashboard } from "react-icons/tb";

type ConnectedAccountResponse = {
  provider: AccountProvider;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  connected_at: string;
  updated_at: string;
};

type IntegrationAccountsPanelProps = {
  compact?: boolean;
  showContinue?: boolean;
  redirectTo?: string;
};

export function IntegrationAccountsPanel({ compact = false, showContinue = false, redirectTo = "/connect-accounts" }: IntegrationAccountsPanelProps) {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>(mockAccounts);

  const loadAccounts = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      notify({ type: "warning", title: "Supabase not configured", message: "Configure Supabase to connect provider accounts." });
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      notify({ type: "warning", title: "Sign in required", message: "Sign in before connecting provider accounts." });
      return;
    }

    const response = await fetch("/api/integrations/accounts", {
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
      },
    });

    const result = await readApiJson<{ accounts?: ConnectedAccountResponse[]; error?: string }>(response);

    if (!response.ok) {
      notify({ type: "error", title: "Unable to load integrations", message: result.error || "Unable to load connected accounts." });
      return;
    }

    setAccounts(buildAccounts(result.accounts || []));
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const connected = searchParams.get("connected");
    const integrationError = searchParams.get("integration_error");

    if (connected) {
      notify({ type: "success", title: "Account connected", message: `${formatProviderName(connected)} connected successfully.` });
      window.dispatchEvent(new CustomEvent("gitfusion:integrations-changed"));
      window.history.replaceState({}, "", window.location.pathname);
    } else if (integrationError) {
      notify({ type: "error", title: "Connection failed", message: integrationError });
      window.history.replaceState({}, "", window.location.pathname);
    }

    loadAccounts();
  }, [loadAccounts]);

  const connectAccount = async (provider: AccountProvider) => {
    setAccounts((current) => current.map((account) => account.provider === provider ? { ...account, status: "connecting" } : account));

    try {
      if (!isSupabaseConfigured()) {
        throw new Error("Configure Supabase before connecting accounts.");
      }

      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        throw new Error("Sign in before connecting provider accounts.");
      }

      const response = await fetch(`/api/integrations/${provider}/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ redirectTo }),
      });

      const result = await readApiJson<{ authorizationUrl?: string; error?: string }>(response);

      if (!response.ok || !result.authorizationUrl) {
        throw new Error(result.error || `Unable to start ${provider} connection.`);
      }

      window.location.href = result.authorizationUrl;
    } catch (error) {
      notify({ type: "error", title: "Unable to connect account", message: error instanceof Error ? error.message : "Unable to connect account." });
      setAccounts((current) => current.map((account) => account.provider === provider ? { ...account, status: "not-connected" } : account));
    }
  };

  const disconnectAccount = async (provider: AccountProvider) => {
    try {
      if (!isSupabaseConfigured()) {
        throw new Error("Configure Supabase before disconnecting accounts.");
      }

      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        throw new Error("Sign in before disconnecting provider accounts.");
      }

      const response = await fetch(`/api/integrations/accounts?provider=${provider}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
        },
      });

      const result = await readApiJson<{ error?: string }>(response);

      if (!response.ok) {
        throw new Error(result.error || `Unable to disconnect ${provider}.`);
      }

      setAccounts((current) => current.map((account) => account.provider === provider ? { ...account, status: "not-connected", username: "", repositories: 0, contributions: 0, lastSync: "Not synced yet" } : account));
      notify({ type: "success", title: "Account disconnected", message: `${formatProviderName(provider)} was disconnected.` });
      window.dispatchEvent(new CustomEvent("gitfusion:integrations-changed"));
    } catch (error) {
      notify({ type: "error", title: "Unable to disconnect account", message: error instanceof Error ? error.message : "Unable to disconnect account." });
    }
  };

  const connectedCount = accounts.filter((account) => account.status === "connected").length;

  return (
    <div className="min-w-0 space-y-4">
      <div className="space-y-4 rounded-lg border border-gray-200 bg-card p-4 shadow-sm dark:border-gray-800">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <TbLayoutDashboard className="shrink-0 text-primary dark:text-primary-dark" size={24}/>
              <h2 className="min-w-0 text-base font-extrabold sm:text-lg">Connected Accounts</h2>
            </div>
            <h3 className="shrink-0 text-sm font-semibold text-muted-foreground">
              {connectedCount}/{accounts.length} connected
            </h3>
        </div>
        {accounts.map((account) => (
          <AccountConnectionCard key={account.provider} account={account} onConnect={connectAccount} onDisconnect={disconnectAccount} compact={compact} />
        ))}
      </div>

      {showContinue && (
        <div className="mt-8 flex flex-col gap-3 border-t border-gray-200 pt-6 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-muted-foreground">{connectedCount} of {accounts.length} accounts connected</p>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-extrabold text-white transition hover:bg-primary-dark"
          >
            Continue to dashboard
          </Link>
        </div>
      )}
    </div>
  );
}

function buildAccounts(connectedAccounts: ConnectedAccountResponse[]): ConnectedAccount[] {
  return mockAccounts.map((account) => {
    const connectedAccount = connectedAccounts.find((item) => item.provider === account.provider);

    if (!connectedAccount) {
      return { ...account, status: "not-connected" };
    }

    return {
      ...account,
      username: connectedAccount.username,
      status: "connected",
      repositories: 0,
      contributions: 0,
      lastSync: "Not synced yet",
    };
  });
}

function formatProviderName(provider: string) {
  return provider === "github" ? "GitHub" : provider === "gitlab" ? "GitLab" : provider;
}
