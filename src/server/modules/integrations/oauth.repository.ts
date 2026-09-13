import { createSupabaseAdminClient } from "@/lib/supabase/server";

import { OAuthStateRow } from "./integration.types";

export async function createOAuthState({
  state,
  userId,
  provider,
  redirectTo,
  expiresAt,
}: {
  state: string;
  userId: string;
  provider: string;
  redirectTo: string;
  expiresAt: string;
}) {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("oauth_states")
    .insert({
      state,
      user_id: userId,
      provider,
      redirect_to: redirectTo,
      expires_at: expiresAt,
    });

  if (error) {
    throw new Error(error.message);
  }
}

export async function findOAuthState(
  state: string,
  provider: string,
) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("oauth_states")
    .select(
      "state,user_id,provider,redirect_to,expires_at",
    )
    .eq("state", state)
    .eq("provider", provider)
    .maybeSingle<OAuthStateRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteOAuthState(state: string) {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("oauth_states")
    .delete()
    .eq("state", state);

  if (error) {
    console.error("Unable to delete OAuth state", error);
  }
}