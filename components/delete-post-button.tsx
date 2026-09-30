"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { deletePostAction } from "@/app/actions/posts";
import { initialActionState } from "@/lib/forms";

export function DeletePostButton({ postId }: { postId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(deletePostAction, initialActionState);

  if (!confirming) {
    return <button type="button" onClick={() => setConfirming(true)} aria-label="Delete post" className="inline-flex min-h-10 items-center gap-2 rounded-control px-3 text-xs font-medium text-muted hover:bg-paper hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal">
      <Trash2 aria-hidden="true" size={15} /> Delete
    </button>;
  }

  return <form action={action} className="flex flex-wrap items-center justify-end gap-2">
    <input type="hidden" name="postId" value={postId} />
    <span className="mr-1 text-xs text-ink">Delete this post?</span>
    {state.message ? <span role={state.status === "error" ? "alert" : "status"} className="text-xs text-danger">{state.message}</span> : null}
    <button type="button" disabled={pending} onClick={() => setConfirming(false)} className="min-h-10 rounded-control border border-line px-3 text-xs font-medium text-petrol hover:border-sage disabled:opacity-60">Cancel</button>
    <button type="submit" disabled={pending} className="min-h-10 rounded-control bg-danger px-3 text-xs font-semibold text-white hover:bg-danger/90 disabled:cursor-wait disabled:opacity-60">{pending ? "Deleting…" : "Yes, delete"}</button>
  </form>;
}
