import { NextRequest, NextResponse } from "next/server";
import { buildAuthorizationUrl, isIntegrationProvider } from "../../../../lib/integrations/providers";
import { createSupabaseAdminClient, createSupabaseUserServerClient, isSupabaseServerConfigured } from "../../../../lib/supabase/server";

type RouteContext = {
  params: Promise<{ provider: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { provider } = await context.params;

  if (!isIntegrationProvider(provider)) {
    return NextResponse.json({ error: "Unsupported integration provider." }, { status: 400 });
  }

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
    return NextResponse.json({ error: "You must be signed in to connect an account." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({})) as { redirectTo?: string };
  const redirectTo = body.redirectTo?.startsWith("/") ? body.redirectTo : "/connect-accounts";
  const redirectUri = `${request.nextUrl.origin}/api/integrations/${provider}/callback`;
  const state = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const adminSupabase = createSupabaseAdminClient();

  const { error: stateError } = await adminSupabase.from("oauth_states").insert({
    state,
    user_id: userData.user.id,
    provider,
    redirect_to: redirectTo,
    expires_at: expiresAt,
  });

  if (stateError) {
    return NextResponse.json({ error: stateError.message }, { status: 500 });
  }

  try {
    return NextResponse.json({
      authorizationUrl: buildAuthorizationUrl({ provider, state, redirectUri }),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to start OAuth flow." }, { status: 500 });
  }
}
