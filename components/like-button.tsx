"use client";

import { useActionState } from "react";
import { Heart } from "lucide-react";
import { likePostAction, unlikePostAction } from "@/app/actions/likes";
import { initialActionState } from "@/lib/forms";

export function LikeButton({
  postId,
  likeCount,
  isLiked,
}: {
  postId: string;
  likeCount: number;
  isLiked: boolean;
}) {
  const action = isLiked ? unlikePostAction : likePostAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);

  return <div className="flex flex-col items-start gap-1">
    <form action={formAction}>
      <input type="hidden" name="postId" value={postId} />
      <button
        type="submit"
        disabled={pending}
        aria-label={pending ? (isLiked ? "Unliking post" : "Liking post") : (isLiked ? "Unlike post" : "Like post")}
        aria-pressed={isLiked}
        className={`inline-flex min-h-10 items-center gap-2 rounded-control px-3 text-xs font-medium hover:bg-paper hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:cursor-wait disabled:opacity-60 ${isLiked ? "text-signal" : "text-muted"}`}
      >
        <Heart aria-hidden="true" size={16} fill={isLiked ? "currentColor" : "none"} />
        <span>{likeCount}</span>
        {pending ? <span className="sr-only">Updating like</span> : null}
      </button>
    </form>
    {state.status === "error" && state.message ? <p role="alert" className="text-xs text-danger">{state.message}</p> : null}
  </div>;
}
