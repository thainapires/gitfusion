import { SupabaseClient, User } from "@supabase/supabase-js";

const avatarsBucket = "avatars";

export async function uploadUserAvatar({ supabase, user, file }: { supabase: SupabaseClient; user: User; file: File }) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${user.id}/avatar-${Date.now()}.${extension}`;

  const { error } = await supabase.storage.from(avatarsBucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(avatarsBucket).getPublicUrl(path);

  return data.publicUrl;
}
