import { NextRequest, NextResponse } from "next/server";

import { isIntegrationProvider } from "@/lib/integrations/providers";
import { getAuthenticatedUser } from "@/server/auth/auth.service";
import { startIntegration } from "@/server/modules/integrations/integration.service";
import { RouteContext } from "@/server/modules/integrations/integration.types";
import { AppError } from "@/server/errors/app-error";

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const { provider } = await context.params;

    if (!isIntegrationProvider(provider)) {
      return NextResponse.json(
        { error: "Unsupported integration provider." },
        { status: 400 },
      );
    }

    const accessToken = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing Supabase access token." },
        { status: 401 },
      );
    }

    const user = await getAuthenticatedUser(accessToken);

    const body = (await request
      .json()
      .catch(() => ({}))) as {
      redirectTo?: string;
    };

    const redirectTo = body.redirectTo?.startsWith("/")
      ? body.redirectTo
      : "/connect-accounts";

    const redirectUri =
      `${request.nextUrl.origin}/api/integrations/${provider}/callback`;

    const result = await startIntegration({
      provider,
      userId: user.id,
      redirectTo,
      redirectUri,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Unable to start OAuth flow", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Unable to start OAuth flow."},
      { status: 500 },
    );
  }
}