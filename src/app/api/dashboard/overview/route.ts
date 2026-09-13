import { NextRequest, NextResponse } from "next/server";
import { buildDashboardOverview } from "../../../lib/dashboard/overview";
import { createSupabaseAdminClient, createSupabaseUserServerClient, isSupabaseServerConfigured } from "../../../lib/supabase/server";

type ConnectedAccountRow = {
  provider: "github" | "gitlab";
  username: string;
  provider_user_id: string;
  access_token: string;
  updated_at?: string;
};

const cacheTtlMs = 24 * 60 * 60 * 1000;
const cacheSchemaVersion = "overview-v2";

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseServerConfigured()) {
      return NextResponse.json({ error: "Supabase server configuration is missing." }, { status: 500 });
    }

    const accessToken = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json({ error: "Missing Supabase access token." }, { status: 401 });
    }

    const userSupabase = createSupabaseUserServerClient(accessToken);
    const { data: userData, error: userError } = await userSupabase.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json({ error: userError?.message || "You must be signed in." }, { status: 401 });
    }

    const adminSupabase = createSupabaseAdminClient();
    const { data, error } = await adminSupabase
      .from("connected_accounts")
      .select("provider,username,provider_user_id,access_token,updated_at")
      .eq("user_id", userData.user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const accounts = (data || []) as ConnectedAccountRow[];
    const forceRefresh = request.nextUrl.searchParams.get("refresh") === "1";
    const cacheKey = buildCacheKey(accounts);

    if (!forceRefresh) {
      const { data: cachedOverview, error: cacheReadError } = await adminSupabase
        .from("dashboard_overview_cache")
        .select("overview,expires_at")
        .eq("user_id", userData.user.id)
        .eq("cache_key", cacheKey)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle<{ overview: unknown; expires_at: string }>();

      if (cacheReadError) {
        console.error("Unable to read dashboard overview cache", cacheReadError);
      }

      if (cachedOverview?.overview) {
        return NextResponse.json({ overview: cachedOverview.overview, cache: { hit: true, expiresAt: cachedOverview.expires_at } });
      }
    }

    const overview = await buildDashboardOverview(accounts);
    const expiresAt = new Date(Date.now() + cacheTtlMs).toISOString();

    const { error: cacheError } = await adminSupabase.from("dashboard_overview_cache").upsert({
      user_id: userData.user.id,
      cache_key: cacheKey,
      overview,
      generated_at: overview.generatedAt,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    });

    if (cacheError) {
      console.error("Unable to save dashboard overview cache", cacheError);
    }

    return NextResponse.json({ overview, cache: { hit: false, expiresAt } });
  } catch (error) {
    console.error("Unable to load dashboard overview", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load dashboard overview." }, { status: 500 });
  }
}

function buildCacheKey(accounts: ConnectedAccountRow[]) {
  if (!accounts.length) {
    return `${cacheSchemaVersion}:no-connections`;
  }

  const accountsKey = accounts
    .map((account) => `${account.provider}:${account.provider_user_id}:${account.updated_at || ""}`)
    .sort()
    .join("|");

  return `${cacheSchemaVersion}:${accountsKey}`;
}
