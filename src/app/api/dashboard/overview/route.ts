import { NextRequest, NextResponse } from "next/server";

import { getDashboardOverview } from "@/server/modules/dashboard/dashboard.service";
import { AppError } from "@/server/errors/app-error";

export const maxDuration = 60;

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

    const forceRefresh =
      request.nextUrl.searchParams.get("refresh") === "1";

    const result = await getDashboardOverview({
      accessToken,
      forceRefresh,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Unable to load dashboard overview", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Unable to load dashboard overview." },
      { status: 500 },
    );
  }
}