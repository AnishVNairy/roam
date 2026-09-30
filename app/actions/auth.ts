"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { initialActionState, type ActionState } from "@/lib/forms";
import { getPostAuthPath } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";
import { validateLogin, validateSignup } from "@/lib/validation";

function readField(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

export async function signInAction(
  previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  void previousState;
  const email = readField(formData, "email").trim();
  const password = readField(formData, "password");
  const fieldErrors = validateLogin({ email, password });
  if (Object.keys(fieldErrors).length) {
    return { status: "error", message: "Check the highlighted fields.", fieldErrors };
  }

  let destination: string;
  try {
    const client = await createClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return { status: "error", message: "Email or password is incorrect." };
    }
    destination = await getPostAuthPath(client, data.user.id, readField(formData, "next"));
  } catch {
    return {
      status: "error",
      message: "We couldn't connect to ROAM. Check your connection and try again.",
    };
  }

  redirect(destination);
}

export async function signUpAction(
  previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  void previousState;
  const email = readField(formData, "email").trim();
  const password = readField(formData, "password");
  const confirmPassword = readField(formData, "confirmPassword");
  const fieldErrors = validateSignup({ email, password, confirmPassword });
  if (Object.keys(fieldErrors).length) {
    return { status: "error", message: "Check the highlighted fields.", fieldErrors };
  }

  let result: Awaited<ReturnType<Awaited<ReturnType<typeof createClient>>["auth"]["signUp"]>>;
  try {
    const client = await createClient();
    const origin = (await headers()).get("origin");
    const emailRedirectTo = origin
      ? new URL("/auth/callback?next=%2Fonboarding", origin).toString()
      : undefined;
    result = await client.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: emailRedirectTo ? { emailRedirectTo } : undefined,
    });
  } catch {
    return {
      status: "error",
      message: "We couldn't connect to ROAM. Check your connection and try again.",
    };
  }

  if (result.error) {
    const message = result.error.message.toLowerCase();
    if (message.includes("already registered") || message.includes("already exists")) {
      return {
        status: "error",
        message: "An account with this email may already exist. Try signing in.",
      };
    }
    if (message.includes("password")) {
      return {
        status: "error",
        message: "Choose a password that meets the account security requirements.",
      };
    }
    return { status: "error", message: "We couldn't create your account. Try again." };
  }

  if (!result.data.session) {
    return {
      status: "success",
      message: "Check your email to verify your address. Your rider profile is next.",
    };
  }

  redirect("/onboarding");
}

export async function signOutAction(
  previousState: ActionState = initialActionState,
  formData?: FormData,
): Promise<ActionState> {
  void previousState;
  void formData;
  try {
    const client = await createClient();
    const { error } = await client.auth.signOut();
    if (error) return { status: "error", message: "We couldn't sign you out. Try again." };
  } catch {
    return { status: "error", message: "We couldn't sign you out. Try again." };
  }

  redirect("/login");
}
