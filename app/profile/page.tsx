import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ProfileCard } from "@/components/profile-card";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) redirect("/login?next=%2Fprofile");
  const { data: profile, error: profileError } = await client.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (profileError) throw new Error("ROAM profile data is not available. Apply the Phase 1 Supabase migration and try again.");
  if (!profile) redirect("/onboarding");
  const [{ data: motorcycles, error: motorcycleError }, { data: followStatsRows, error: followStatsError }] = await Promise.all([
    client.from("motorcycles").select("*").eq("user_id", user.id).order("created_at"),
    client.rpc("get_profile_follow_stats", { p_profile_id: user.id }),
  ]);
  if (motorcycleError) throw new Error("ROAM motorcycle data is not available. Apply the Phase 1 Supabase migration and try again.");
  if (followStatsError || !followStatsRows?.[0]) throw new Error("ROAM follow data is not available. Apply the rider follows migration and try again.");
  return <main className="min-h-screen bg-paper"><AppHeader email={user.email} /><div className="mx-auto max-w-[900px] px-5 py-9 sm:px-8 sm:py-14"><div className="mb-7"><p className="font-mono text-[10px] tracking-[0.18em] text-signal">YOUR SPACE ON THE ROAD</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Rider profile</h1></div><ProfileCard profile={profile} motorcycles={motorcycles ?? []} currentUserId={user.id} followStats={followStatsRows[0]} /><p className="mt-6 text-center font-mono text-[9px] tracking-[0.15em] text-muted">ROAM / PHASE 01 / RIDER PROFILE</p></div></main>;
}
