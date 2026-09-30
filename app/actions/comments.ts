"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { initialActionState, type ActionState } from "@/lib/forms";
import { normalizeComment, validateComment } from "@/lib/comments/validation";

function readField(data: FormData, name: string) {
  return String(data.get(name) ?? "").trim();
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

export async function createCommentAction(
  previousState: ActionState = initialActionState,
  data: FormData,
): Promise<ActionState> {
  void previousState;
  const postId = readField(data, "postId");
  const content = normalizeComment(String(data.get("content") ?? ""));
  const contentError = validateComment(content);
  if (!postId) return { status: "error", message: "Choose a post to comment on." };
  if (contentError) return { status: "error", message: "Check your comment before sending.", fieldErrors: { content: contentError } };

  const context = await getAuthenticatedClient();
  if (!context) return { status: "error", message: "We couldn't connect to ROAM. Try again." };

  try {
    const { error } = await context.client.from("comments").insert({
      post_id: postId,
      user_id: context.user.id,
      content,
    });
    if (error) return { status: "error", message: "We couldn't add your comment. Try again." };
  } catch {
    return { status: "error", message: "We couldn't connect to ROAM. Try again." };
  }

  revalidatePath("/");
  return { status: "success", message: "Comment added." };
}

export async function deleteCommentAction(
  previousState: ActionState = initialActionState,
  data: FormData,
): Promise<ActionState> {
  void previousState;
  const commentId = readField(data, "commentId");
  if (!commentId) return { status: "error", message: "Choose a comment to delete." };

  const context = await getAuthenticatedClient();
  if (!context) return { status: "error", message: "We couldn't connect to ROAM. Try again." };

  try {
    const { data: comment, error: lookupError } = await context.client.from("comments")
      .select("user_id")
      .eq("id", commentId)
      .maybeSingle();
    if (lookupError) return { status: "error", message: "We couldn't check who owns that comment." };
    if (!comment) return { status: "error", message: "That comment is no longer available." };
    if (comment.user_id !== context.user.id) {
      return { status: "error", message: "You can only delete your own comments." };
    }

    const { error } = await context.client.from("comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", context.user.id);
    if (error) return { status: "error", message: "We couldn't delete your comment. Try again." };
  } catch {
    return { status: "error", message: "We couldn't connect to ROAM. Try again." };
  }

  revalidatePath("/");
  return { status: "success", message: "Comment deleted." };
}
