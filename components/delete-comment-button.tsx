"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteCommentAction } from "@/app/actions/comments";
import { initialActionState } from "@/lib/forms";

export function DeleteCommentButton({ commentId }: { commentId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(deleteCommentAction, initialActionState);

  if (!confirming) {
    return <button type="button" onClick={() => setConfirming(true)} aria-label="Delete comment" className="inline-flex min-h-9 items-center gap-1.5 rounded-control px-2 text-[11px] font-medium text-muted hover:bg-paper hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal">
      <Trash2 aria-hidden="true" size={13} />Delete
    </button>;
  }

  return <form action={action} className="mt-2 flex flex-wrap items-center gap-2">
    <input type="hidden" name="commentId" value={commentId} />
    <span className="text-xs text-ink">Delete this comment?</span>
    {state.message && state.status === "error" ? <span role="alert" className="text-xs text-danger">{state.message}</span> : null}
    <button type="button" disabled={pending} onClick={() => setConfirming(false)} className="min-h-9 rounded-control border border-line px-2.5 text-xs font-medium text-petrol hover:border-sage disabled:opacity-60">Cancel</button>
    <button type="submit" disabled={pending} className="min-h-9 rounded-control bg-danger px-2.5 text-xs font-semibold text-white hover:bg-danger/90 disabled:cursor-wait disabled:opacity-60">{pending ? "Deleting…" : "Yes, delete"}</button>
  </form>;
}
