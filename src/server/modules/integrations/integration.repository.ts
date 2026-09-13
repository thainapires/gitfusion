import { AccountProvider } from "@/types/mock-app";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type SaveConnectedAccountParams = {
  userId: string;
  provider: AccountProvider;
  providerUserId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  accessTokenEncrypted: string;
  refreshTokenEncrypted: string | null;
  tokenType: string | null;
  scopes: string[];
  expiresAt: string | null;
};

export async function getConnectedAccounts(userId: string) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("connected_accounts")
    .select(
      "provider,provider_user_id,username,display_name,avatar_url,scopes,connected_at,updated_at",
    )
    .eq("user_id", userId)
    .order("provider", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function saveConnectedAccount({
  userId,
  provider,
  providerUserId,
  username,
  displayName,
  avatarUrl,
  accessTokenEncrypted,
  refreshTokenEncrypted,
  tokenType,
  scopes,
  expiresAt,
}: SaveConnectedAccountParams) {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("connected_accounts")
    .upsert(
      {
        user_id: userId,
        provider,
        provider_user_id: providerUserId,
        username,
        display_name: displayName,
        avatar_url: avatarUrl,
        access_token_encrypted: accessTokenEncrypted,
        refresh_token_encrypted: refreshTokenEncrypted,
        token_type: tokenType,
        scopes,
        expires_at: expiresAt,
        connected_at: now,
        updated_at: now,
      },
      {
        onConflict: "user_id,provider",
      },
    );

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteConnectedAccount(
  userId: string,
  provider: AccountProvider,
) {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("connected_accounts")
    .delete()
    .eq("user_id", userId)
    .eq("provider", provider);

  if (error) {
    throw new Error(error.message);
  }
}

//TODO: move this to dashboard module, because technically it belongs there, not the integration
export async function invalidateDashboardCache(userId: string) {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("dashboard_overview_cache")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error(
      "Unable to invalidate dashboard cache",
      error,
    );
  }
}