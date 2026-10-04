"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { initialActionState, type ActionState } from "@/lib/forms";

function readProfileId(data: FormData) {
  return String(data.get("profileId") ?? "").trim().toLowerCase();
}

async function getAuthenticatedClient() {
  let client;
  let user;
  let authError;
  try {
    client = await createClient();
    const result = await client.auth.getUser();
    user = result.data.user;
    authError = result.error;
  } catch {
    return null;
  }

  if (authError || !user) redirect("/login");
  return { client, user };
}

function revalidateProfiles() {
  revalidatePath("/profile");
  revalidatePath("/riders/[username]", "page");
}

export async function followRiderAction(
  previousState: ActionState = initialActionState,
  data: FormData,
): Promise<ActionState> {
  void previousState;
  const profileId = readProfileId(data);
  if (!profileId) return { status: "error", message: "Choose a rider to follow." };

  const context = await getAuthenticatedClient();
  if (!context) return { status: "error", message: "We couldn't connect to ROAM. Try again." };
  if (profileId === context.user.id) return { status: "error", message: "You can't follow yourself." };

  try {
    const { error } = await context.client.from("follows").insert({
      follower_id: context.user.id,
      following_id: profileId,
    });
    if (error && error.code !== "23505") {
      return { status: "error", message: "We couldn't follow this rider. Try again." };
    }
  } catch {
    return { status: "error", message: "We couldn't connect to ROAM. Try again." };
  }

  revalidateProfiles();
  return { status: "success", message: "Following rider." };
}

export async function unfollowRiderAction(
  previousState: ActionState = initialActionState,
  data: FormData,
): Promise<ActionState> {
  void previousState;
  const profileId = readProfileId(data);
  if (!profileId) return { status: "error", message: "Choose a rider to unfollow." };

  const context = await getAuthenticatedClient();
  if (!context) return { status: "error", message: "We couldn't connect to ROAM. Try again." };
  if (profileId === context.user.id) return { status: "error", message: "You can't unfollow yourself." };

  try {
    const { error } = await context.client.from("follows")
      .delete()
      .eq("following_id", profileId)
      .eq("follower_id", context.user.id);
    if (error) return { status: "error", message: "We couldn't unfollow this rider. Try again." };
  } catch {
    return { status: "error", message: "We couldn't connect to ROAM. Try again." };
  }

  revalidateProfiles();
  return { status: "success", message: "Rider unfollowed." };
}
