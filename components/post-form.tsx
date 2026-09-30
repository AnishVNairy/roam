"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createPostAction } from "@/app/actions/posts";
import { TextAreaField, TextInput } from "@/components/form-field";
import { initialActionState } from "@/lib/forms";
import { validatePost } from "@/lib/posts/validation";

export function PostForm() {
  const [state, action, pending] = useActionState(createPostAction, initialActionState);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const fieldErrors = { ...state.fieldErrors, ...localErrors };

  function validateBeforeSubmit(event: React.FormEvent<HTMLFormElement>) {
    const fields = new FormData(event.currentTarget);
    const errors = validatePost({ caption: String(fields.get("caption") ?? ""), mediaUrl: String(fields.get("mediaUrl") ?? "") });
    setLocalErrors(errors);
    if (Object.keys(errors).length) event.preventDefault();
  }

  return <form action={action} onSubmit={validateBeforeSubmit} noValidate className="space-y-6 rounded-panel border border-line bg-white p-5 shadow-panel sm:p-8">
    <div>
      <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-signal">ROAD NOTES / NEW POST</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-ink">Share a moment from the road</h1>
      <p className="mt-2 text-sm leading-6 text-muted">A first ride, a favorite stretch, or whatever stayed with you.</p>
    </div>
    <TextAreaField id="caption" name="caption" label="Caption" placeholder="Where did the road take you?" required maxLength={2000} rows={6} value={caption} onChange={(event) => { setCaption(event.currentTarget.value); setLocalErrors((current) => ({ ...current, caption: "" })); }} error={fieldErrors.caption} />
    <TextInput id="mediaUrl" name="mediaUrl" type="url" label="Image URL (optional)" placeholder="https://…" hint="Add one public image URL. Image uploads are not available yet." value={mediaUrl} onChange={(event) => { setMediaUrl(event.currentTarget.value); setLocalErrors((current) => ({ ...current, mediaUrl: "" })); }} error={fieldErrors.mediaUrl} />
    {state.message ? <p role={state.status === "error" ? "alert" : "status"} className="rounded-control bg-danger/8 px-4 py-3 text-sm leading-6 text-danger">{state.message}</p> : null}
    <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
      <Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-control border border-line px-5 text-sm font-medium text-petrol hover:border-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal">Cancel</Link>
      <button type="submit" disabled={pending} className="min-h-12 rounded-control bg-petrol px-6 text-sm font-semibold text-white transition hover:bg-petrol/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:cursor-wait disabled:opacity-60">
        {pending ? "Publishing…" : "Publish post"}
      </button>
    </div>
  </form>;
}
