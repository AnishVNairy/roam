"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, signUpAction } from "@/app/actions/auth";
import { PasswordField, TextInput } from "@/components/form-field";
import { initialActionState } from "@/lib/forms";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const action = mode === "login" ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const isSignup = mode === "signup";
  const fields = state.fieldErrors ?? {};

  return (
    <div>
      <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-signal">{isSignup ? "YOUR NEXT CHAPTER" : "WELCOME BACK"}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-ink">{isSignup ? "Create your rider account" : "Pick up where you left off"}</h2>
      <p className="mt-3 text-sm leading-6 text-muted">{isSignup ? "One account for your profile, your bikes, and the rides ahead." : "Your people and the open road are right where you left them."}</p>
      <form action={formAction} className="mt-8 space-y-5" noValidate>
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <TextInput id="email" name="email" type="email" autoComplete="email" label="Email address" placeholder="you@example.com" required error={fields.email} />
        <PasswordField id="password" name="password" autoComplete={isSignup ? "new-password" : "current-password"} label="Password" placeholder={isSignup ? "At least 8 characters" : "Your password"} required minLength={isSignup ? 8 : undefined} error={fields.password} />
        {isSignup ? <PasswordField id="confirmPassword" name="confirmPassword" autoComplete="new-password" label="Confirm password" placeholder="Enter it once more" required error={fields.confirmPassword} /> : null}
        {state.message ? <p role={state.status === "error" ? "alert" : "status"} className={`rounded-control px-4 py-3 text-sm leading-6 ${state.status === "error" ? "bg-danger/8 text-danger" : "bg-sage/15 text-petrol"}`}>{state.message}</p> : null}
        <button type="submit" disabled={pending} className="inline-flex min-h-12 w-full items-center justify-center rounded-control bg-petrol px-5 text-sm font-semibold text-white transition hover:bg-petrol/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:cursor-wait disabled:opacity-65">
          {pending ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-muted">{isSignup ? "Already riding with us?" : "New to ROAM?"} {" "}
        <Link className="font-semibold text-petrol underline decoration-sage underline-offset-4 hover:decoration-signal" href={isSignup ? "/login" : "/signup"}>{isSignup ? "Sign in" : "Create an account"}</Link>
      </p>
    </div>
  );
}
