import {
  createSupabaseUserServerClient,
  isSupabaseServerConfigured,
} from "@/lib/supabase/server";
import { AppError } from "@/server/errors/app-error";

import { AuthenticatedUser } from "./auth.types";

export async function getAuthenticatedUser(
  accessToken: string,
): Promise<AuthenticatedUser> {
  if (!isSupabaseServerConfigured()) {
    throw new AppError(
      "Supabase server configuration is missing.",
      500,
    );
  }

  const supabase =
    createSupabaseUserServerClient(accessToken);

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new AppError(
      error?.message || "You must be signed in.",
      401,
    );
  }

  return {
    id: data.user.id,
    email: data.user.email ?? null,
  };
}