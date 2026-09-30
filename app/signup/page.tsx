import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { AuthFrame } from "@/components/brand";
import { createClient } from "@/lib/supabase/server";

export default async function SignupPage() {
  try {
    const client = await createClient();
    const { data: { user } } = await client.auth.getUser();
    if (user) redirect("/onboarding");
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
  }
  return <AuthFrame><AuthForm mode="signup" /></AuthFrame>;
}
