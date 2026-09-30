"use client";

import { useActionState } from "react";
import { signOutAction } from "@/app/actions/auth";
import { initialActionState } from "@/lib/forms";

export function SignOutButton() {
  const [state, action, pending] = useActionState(signOutAction, initialActionState);
  return <form action={action} className="flex items-center gap-2">
    {state.message ? <span role="alert" className="text-xs text-danger">{state.message}</span> : null}
    <button disabled={pending} className="rounded-control border border-line px-3 py-2 text-xs font-medium text-petrol hover:border-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:opacity-60">{pending ? "Signing out…" : "Sign out"}</button>
  </form>;
}
