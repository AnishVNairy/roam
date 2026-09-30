"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { initialActionState, type ActionState } from "@/lib/forms";
import { validatePost } from "@/lib/posts/validation";

function readField(data: FormData, name: string) {
  return String(data.get(name) ?? "").trim();
}

export async function createPostAction(
  previousState: ActionState = initialActionState,
  data: FormData,
): Promise<ActionState> {
  void previousState;
  const caption = readField(data, "caption");
  const mediaUrl = readField(data, "mediaUrl");
  const fieldErrors = validatePost({ caption, mediaUrl });
  if (Object.keys(fieldErrors).length) {
    return { status: "error", message: "Check your post before publishing.", fieldErrors };
  }

  try {
    const client = await createClient();
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) {
      return { status: "error", message: "Sign in to publish a post." };
    }

    const { error } = await client.from("posts").insert({
      user_id: user.id,
      caption,
      media_url: mediaUrl || null,
    });
    if (error) return { status: "error", message: "We couldn't publish your post. Try again." };
  } catch {
    return { status: "error", message: "We couldn't connect to ROAM. Try again." };
  }

  revalidatePath("/");
  redirect("/");
}

export async function deletePostAction(
  previousState: ActionState = initialActionState,
  data: FormData,
): Promise<ActionState> {
  void previousState;
  const postId = readField(data, "postId");
  if (!postId) return { status: "error", message: "Choose a post to delete." };

  try {
    const client = await createClient();
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) return { status: "error", message: "Sign in to delete a post." };

    const { data: post, error: postError } = await client
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .maybeSingle();
    if (postError) return { status: "error", message: "We couldn't check who owns that post." };
    if (!post) return { status: "error", message: "That post is no longer available." };
    if (post.user_id !== user.id) {
      return { status: "error", message: "You can only delete your own posts." };
    }

    const { error: deleteError } = await client
      .from("posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", user.id);
    if (deleteError) return { status: "error", message: "We couldn't delete your post. Try again." };
  } catch {
    return { status: "error", message: "We couldn't connect to ROAM. Try again." };
  }

  revalidatePath("/");
  return { status: "success", message: "Post deleted." };
}
