import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseUserServerClient, isSupabaseServerConfigured } from "../../../lib/supabase/server";

export async function GET(request: NextRequest) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ accounts: [] });
  }

  const accessToken = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!accessToken) {
    return NextResponse.json({ error: "Missing Supabase access token." }, { status: 401 });
  }

  const userSupabase = createSupabaseUserServerClient(accessToken);
  const { data: userData, error: userError } = await userSupabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const adminSupabase = createSupabaseAdminClient();
  const { data, error } = await adminSupabase
    .from("connected_accounts")
    .select("provider,provider_user_id,username,display_name,avatar_url,scopes,connected_at,updated_at")
    .eq("user_id", userData.user.id)
    .order("provider", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ accounts: data });
}


export async function DELETE(request: NextRequest) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase server configuration is missing." }, { status: 500 });
  }

  const provider = request.nextUrl.searchParams.get("provider");

  if (provider !== "github" && provider !== "gitlab") {
    return NextResponse.json({ error: "Unsupported integration provider." }, { status: 400 });
  }

  const accessToken = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!accessToken) {
    return NextResponse.json({ error: "Missing Supabase access token." }, { status: 401 });
  }

  const userSupabase = createSupabaseUserServerClient(accessToken);
  const { data: userData, error: userError } = await userSupabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const adminSupabase = createSupabaseAdminClient();
  const { error } = await adminSupabase
    .from("connected_accounts")
    .delete()
    .eq("user_id", userData.user.id)
    .eq("provider", provider);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await adminSupabase.from("dashboard_overview_cache").delete().eq("user_id", userData.user.id);

  return NextResponse.json({ ok: true });
}
