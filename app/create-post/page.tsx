import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { PostForm } from "@/components/post-form";
import { createClient } from "@/lib/supabase/server";

export default async function CreatePostPage() {
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) redirect("/login?next=%2Fcreate-post");

  const { data: rider } = await client.from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!rider) redirect("/onboarding");

  return <main className="min-h-screen bg-paper">
    <AppHeader email={user.email} />
    <div className="mx-auto max-w-[720px] px-4 py-8 sm:px-8 sm:py-12">
      <PostForm />
    </div>
  </main>;
}
