import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, fetchProviderProfile, isIntegrationProvider } from "../../../../lib/integrations/providers";
import { encryptProviderToken } from "../../../../lib/security/tokens";
import { createSupabaseAdminClient, isSupabaseServerConfigured } from "../../../../lib/supabase/server";

type RouteContext = {
  params: Promise<{ provider: string }>;
};

type OAuthStateRow = {
  state: string;
  user_id: string;
  provider: string;
  redirect_to: string | null;
  expires_at: string;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { provider } = await context.params;
  const fallbackRedirect = new URL("/connect-accounts", request.nextUrl.origin);

  if (!isIntegrationProvider(provider)) {
    fallbackRedirect.searchParams.set("integration_error", "Unsupported provider");
    return NextResponse.redirect(fallbackRedirect);
  }

  if (!isSupabaseServerConfigured()) {
    fallbackRedirect.searchParams.set("integration_error", "Supabase server configuration is missing");
    return NextResponse.redirect(fallbackRedirect);
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const providerError = request.nextUrl.searchParams.get("error_description") || request.nextUrl.searchParams.get("error");

  if (providerError) {
    fallbackRedirect.searchParams.set("integration_error", providerError);
    return NextResponse.redirect(fallbackRedirect);
  }

  if (!code || !state) {
    fallbackRedirect.searchParams.set("integration_error", "Missing OAuth callback parameters");
    return NextResponse.redirect(fallbackRedirect);
  }

  const adminSupabase = createSupabaseAdminClient();
  const { data: stateRow, error: stateError } = await adminSupabase
    .from("oauth_states")
    .select("state,user_id,provider,redirect_to,expires_at")
    .eq("state", state)
    .eq("provider", provider)
    .maybeSingle<OAuthStateRow>();

  if (stateError || !stateRow) {
    fallbackRedirect.searchParams.set("integration_error", stateError?.message || "Invalid OAuth state");
    return NextResponse.redirect(fallbackRedirect);
  }

  await adminSupabase.from("oauth_states").delete().eq("state", state);

  const redirectTo = new URL(stateRow.redirect_to || "/connect-accounts", request.nextUrl.origin);

  if (new Date(stateRow.expires_at).getTime() < Date.now()) {
    redirectTo.searchParams.set("integration_error", "OAuth state expired. Try connecting again.");
    return NextResponse.redirect(redirectTo);
  }

  try {
    const redirectUri = `${request.nextUrl.origin}/api/integrations/${provider}/callback`;
    const tokenData = await exchangeCodeForToken({ provider, code, redirectUri });
    const profile = await fetchProviderProfile(provider, tokenData.access_token as string);
    const expiresAt = tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null;

    const { error: upsertError } = await adminSupabase.from("connected_accounts").upsert({
      user_id: stateRow.user_id,
      provider,
      provider_user_id: profile.providerUserId,
      username: profile.username,
      display_name: profile.displayName,
      avatar_url: profile.avatarUrl,
      access_token_encrypted: encryptProviderToken(tokenData.access_token),
      refresh_token_encrypted: encryptProviderToken(tokenData.refresh_token),
      token_type: tokenData.token_type || null,
      scopes: tokenData.scope ? tokenData.scope.split(/[ ,]+/).filter(Boolean) : [],
      expires_at: expiresAt,
      connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id,provider",
    });

    if (upsertError) {
      throw upsertError;
    }

    await adminSupabase.from("dashboard_overview_cache").delete().eq("user_id", stateRow.user_id);

    redirectTo.searchParams.set("connected", provider);
    return NextResponse.redirect(redirectTo);
  } catch (error) {
    redirectTo.searchParams.set("integration_error", error instanceof Error ? error.message : "Unable to connect account");
    return NextResponse.redirect(redirectTo);
  }
}
