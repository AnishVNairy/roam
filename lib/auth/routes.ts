import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export function safeReturnTo(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return null;
  }

  const path = value.split("?", 1)[0];
  return path === "/profile" || path === "/profile/edit" ? value : null;
}

export async function getPostAuthPath(
  client: SupabaseClient<Database>,
  userId: string,
  returnTo?: string | null,
) {
  const { data, error } = await client
    .from("profiles")
    .select("username, display_name")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;

  const profileIsComplete = Boolean(data?.username && data.display_name.trim());
  if (!profileIsComplete) return "/onboarding";

  return safeReturnTo(returnTo) ?? "/profile";
}
