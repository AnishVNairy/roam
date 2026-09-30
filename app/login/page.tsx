import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { AuthFrame } from "@/components/brand";
import { getPostAuthPath, safeReturnTo } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeReturnTo(Array.isArray(params.next) ? params.next[0] : params.next);
  try {
    const client = await createClient();
    const { data: { user } } = await client.auth.getUser();
    if (user) redirect(await getPostAuthPath(client, user.id, next));
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
  }
  return <AuthFrame><AuthForm mode="login" next={next ?? undefined} />{params.error === "verification" ? <p className="mt-5 text-center text-sm text-danger" role="alert">That verification link expired or could not be used. Try signing in or request a new one.</p> : null}</AuthFrame>;
}
