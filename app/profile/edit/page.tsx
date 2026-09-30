import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ProfileEditor } from "@/components/profile-editor";
import { createClient } from "@/lib/supabase/server";

export default async function EditProfilePage() {
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) redirect("/login?next=%2Fprofile%2Fedit");
  const { data: profile, error: profileError } = await client.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (profileError) throw new Error("ROAM profile data is not available. Apply the Phase 1 Supabase migration and try again.");
  if (!profile) redirect("/onboarding");
  const { data: bikes, error: bikeError } = await client.from("motorcycles").select("*").eq("user_id", user.id).order("created_at").limit(1);
  if (bikeError) throw new Error("ROAM motorcycle data is not available. Apply the Phase 1 Supabase migration and try again.");
  return <main className="min-h-screen bg-paper"><AppHeader email={user.email} /><div className="mx-auto max-w-[760px] px-5 py-9 sm:px-8 sm:py-14"><ProfileEditor profile={profile} motorcycle={bikes?.[0]} /></div></main>;
}
