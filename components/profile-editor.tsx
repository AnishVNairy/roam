"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateProfileAction } from "@/app/actions/profile";
import { TextAreaField, TextInput } from "@/components/form-field";
import { initialActionState } from "@/lib/forms";
import type { Motorcycle, Profile } from "@/lib/supabase/database.types";

export function ProfileEditor({ profile, motorcycle }: { profile: Profile; motorcycle?: Motorcycle }) {
  const [state, action, pending] = useActionState(updateProfileAction, initialActionState);
  const errors = state.fieldErrors ?? {};
  return <form action={action} className="space-y-5 rounded-panel border border-line bg-white p-5 shadow-panel sm:p-8">
    <div><p className="font-mono text-[10px] tracking-[0.16em] text-signal">YOUR RIDER CARD</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Edit your profile</h2><p className="mt-2 text-sm leading-6 text-muted">A little detail helps your riding community find you.</p></div>
    <TextInput id="username" name="username" label="Username" required maxLength={24} defaultValue={profile.username} error={errors.username} />
    <TextInput id="displayName" name="displayName" label="Display name" required maxLength={60} defaultValue={profile.display_name} error={errors.displayName} />
    <TextInput id="city" name="city" label="Home base" maxLength={80} defaultValue={profile.city ?? ""} error={errors.city} />
    <TextAreaField id="bio" name="bio" label="About you" rows={4} maxLength={280} defaultValue={profile.bio ?? ""} error={errors.bio} />
    <TextInput id="avatarUrl" name="avatarUrl" type="url" label="Avatar image URL" placeholder="https://…" defaultValue={profile.avatar_url ?? ""} hint="Paste a public image URL. Image uploads can be added when profile storage is configured." error={errors.avatarUrl} />
    <div className="border-t border-line pt-5"><h3 className="text-sm font-semibold text-ink">Motorcycle (optional)</h3><p className="mb-4 mt-1 text-xs leading-5 text-muted">Leave make and model blank to remove your motorcycle.</p>
      <div className="grid gap-4 sm:grid-cols-2"><TextInput id="make" name="make" label="Make" maxLength={60} defaultValue={motorcycle?.make ?? ""} error={errors.make} /><TextInput id="model" name="model" label="Model" maxLength={80} defaultValue={motorcycle?.model ?? ""} error={errors.model} /></div>
      <TextInput id="year" name="year" label="Model year" inputMode="numeric" defaultValue={motorcycle?.year?.toString() ?? ""} error={errors.year} />
    </div>
    {state.message ? <p role={state.status === "error" ? "alert" : "status"} className="text-sm leading-6 text-danger">{state.message}</p> : null}
    <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end"><Link href="/profile" className="inline-flex min-h-11 items-center justify-center rounded-control border border-line px-5 text-sm font-medium text-petrol hover:border-sage">Cancel</Link><button disabled={pending} className="min-h-11 rounded-control bg-petrol px-5 text-sm font-semibold text-white hover:bg-petrol/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:opacity-60">{pending ? "Saving…" : "Save changes"}</button></div>
  </form>;
}
