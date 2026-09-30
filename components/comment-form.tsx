"use client";

import { useActionState, useState } from "react";
import { Send } from "lucide-react";
import { createCommentAction } from "@/app/actions/comments";
import { fieldControlClass } from "@/components/form-field";
import { initialActionState, type ActionState } from "@/lib/forms";
import { MAX_COMMENT_LENGTH, validateComment } from "@/lib/comments/validation";

export function CommentForm({ postId }: { postId: string }) {
  const [content, setContent] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  async function submitComment(previousState: ActionState, formData: FormData) {
    const result = await createCommentAction(previousState, formData);
    if (result.status === "success") {
      setContent("");
      setLocalError(null);
    }
    return result;
  }

  const [state, action, pending] = useActionState(submitComment, initialActionState);
  const error = localError ?? (state.fieldErrors?.content && validateComment(content) ? state.fieldErrors.content : null);

  function validateBeforeSubmit(event: React.FormEvent<HTMLFormElement>) {
    const validationError = validateComment(content);
    setLocalError(validationError);
    if (validationError) event.preventDefault();
  }

  return <form action={action} onSubmit={validateBeforeSubmit} noValidate aria-busy={pending} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
    <input type="hidden" name="postId" value={postId} />
    <div className="min-w-0 flex-1 space-y-2">
      <label htmlFor={`comment-${postId}`} className="block text-xs font-medium text-ink">Write a comment</label>
      <textarea
        id={`comment-${postId}`}
        name="content"
        rows={2}
        maxLength={MAX_COMMENT_LENGTH}
        value={content}
        onChange={(event) => { setContent(event.currentTarget.value); setLocalError(null); }}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `comment-${postId}-error` : undefined}
        className={`${fieldControlClass} min-h-11 resize-y px-3 py-2.5`}
        placeholder="Add something to the conversation…"
      />
      {error ? <p id={`comment-${postId}-error`} role="alert" className="text-xs leading-5 text-danger">{error}</p> : null}
    </div>
    {state.message && !state.fieldErrors?.content ? <p role={state.status === "error" ? "alert" : "status"} className={`text-xs leading-5 sm:max-w-44 ${state.status === "error" ? "text-danger" : "text-petrol"}`}>{state.message}</p> : null}
    <button type="submit" disabled={pending} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-control bg-petrol px-4 text-xs font-semibold text-white hover:bg-petrol/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:cursor-wait disabled:opacity-60">
      {pending ? "Commenting…" : "Comment"}<Send size={14} aria-hidden="true" />
    </button>
  </form>;
}
