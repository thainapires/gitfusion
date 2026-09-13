import { NextRequest, NextResponse } from "next/server";

import { isIntegrationProvider } from "@/lib/integrations/providers";
import { getAuthenticatedUser } from "@/server/auth/auth.service";
import {
  disconnectIntegration,
  getUserConnectedAccounts,
} from "@/server/modules/integrations/integration.service";
import { AppError } from "@/server/errors/app-error";

export async function GET(request: NextRequest) {
  try {
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

    const accounts = await getUserConnectedAccounts(
      user.id,
    );

    return NextResponse.json({
      accounts,
    });
  } catch (error) {
    console.error(
      "Unable to load connected accounts",
      error,
    );

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Unable to load connected accounts." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const provider =
      request.nextUrl.searchParams.get("provider");

    if (!provider || !isIntegrationProvider(provider)) {
      return NextResponse.json(
        {
          error: "Unsupported integration provider.",
        },
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

    await disconnectIntegration(
      user.id,
      provider,
    );

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "Unable to disconnect connected account",
      error,
    );

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Unable to disconnect connected account." },
      { status: 500 },
    );
  }
}