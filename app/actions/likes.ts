"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { initialActionState, type ActionState } from "@/lib/forms";

function readPostId(data: FormData) {
  return String(data.get("postId") ?? "").trim();
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

export async function likePostAction(
  previousState: ActionState = initialActionState,
  data: FormData,
): Promise<ActionState> {
  void previousState;
  const postId = readPostId(data);
  if (!postId) return { status: "error", message: "Choose a post to like." };

  const context = await getAuthenticatedClient();
  if (!context) return { status: "error", message: "We couldn't connect to ROAM. Try again." };

  try {
    const { error } = await context.client.from("likes").insert({
      post_id: postId,
      user_id: context.user.id,
    });
    // The composite primary key makes repeated like requests idempotent.
    if (error && error.code !== "23505") {
      return { status: "error", message: "We couldn't like this post. Try again." };
    }
  } catch {
    return { status: "error", message: "We couldn't connect to ROAM. Try again." };
  }

  revalidatePath("/");
  return { status: "success", message: "Post liked." };
}

export async function unlikePostAction(
  previousState: ActionState = initialActionState,
  data: FormData,
): Promise<ActionState> {
  void previousState;
  const postId = readPostId(data);
  if (!postId) return { status: "error", message: "Choose a post to unlike." };

  const context = await getAuthenticatedClient();
  if (!context) return { status: "error", message: "We couldn't connect to ROAM. Try again." };

  try {
    const { error } = await context.client.from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", context.user.id);
    if (error) return { status: "error", message: "We couldn't remove this like. Try again." };
  } catch {
    return { status: "error", message: "We couldn't connect to ROAM. Try again." };
  }

  revalidatePath("/");
  return { status: "success", message: "Like removed." };
}
