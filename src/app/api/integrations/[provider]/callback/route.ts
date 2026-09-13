import { NextRequest, NextResponse } from "next/server";

import { isIntegrationProvider } from "@/lib/integrations/providers";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";
import { completeIntegration } from "@/server/modules/integrations/integration.service";
import { RouteContext } from "@/server/modules/integrations/integration.types";

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  const { provider } = await context.params;

  const fallbackRedirect = new URL(
    "/connect-accounts",
    request.nextUrl.origin,
  );

  if (!isIntegrationProvider(provider)) {
    fallbackRedirect.searchParams.set(
      "integration_error",
      "Unsupported provider",
    );

    return NextResponse.redirect(fallbackRedirect);
  }

  if (!isSupabaseServerConfigured()) {
    fallbackRedirect.searchParams.set(
      "integration_error",
      "Supabase server configuration is missing",
    );

    return NextResponse.redirect(fallbackRedirect);
  }

  const providerError =
    request.nextUrl.searchParams.get("error_description") ||
    request.nextUrl.searchParams.get("error");

  if (providerError) {
    fallbackRedirect.searchParams.set(
      "integration_error",
      providerError,
    );

    return NextResponse.redirect(fallbackRedirect);
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!code || !state) {
    fallbackRedirect.searchParams.set(
      "integration_error",
      "Missing OAuth callback parameters",
    );

    return NextResponse.redirect(fallbackRedirect);
  }

  try {
    const redirectUri =
      `${request.nextUrl.origin}/api/integrations/${provider}/callback`;

    const result = await completeIntegration({
      provider,
      code,
      state,
      redirectUri,
    });

    const redirectTo = new URL(
      result.redirectTo,
      request.nextUrl.origin,
    );

    redirectTo.searchParams.set(
      "connected",
      result.provider,
    );

    return NextResponse.redirect(redirectTo);
  } catch (error) {
    console.error(
      `Unable to complete ${provider} integration`,
      error,
    );

    fallbackRedirect.searchParams.set(
      "integration_error",
      error instanceof Error
        ? error.message
        : "Unable to connect account",
    );

    return NextResponse.redirect(fallbackRedirect);
  }
}