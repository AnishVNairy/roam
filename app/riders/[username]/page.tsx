import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ProfileCard } from "@/components/profile-card";
import { createClient } from "@/lib/supabase/server";

export default async function RiderProfilePage({ params }: PageProps<"/riders/[username]">) {
  const { username } = await params;
  const client = await createClient();
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user) redirect(`/login?next=${encodeURIComponent(`/riders/${username}`)}`);

  const { data: profile, error: profileError } = await client.from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .maybeSingle();
  if (profileError) throw new Error("ROAM profile data is not available. Apply the Phase 1 Supabase migration and try again.");
  if (!profile) notFound();

  const [{ data: motorcycles, error: motorcycleError }, { data: followStatsRows, error: followStatsError }] = await Promise.all([
    client.from("motorcycles").select("*").eq("user_id", profile.id).order("created_at"),
    client.rpc("get_profile_follow_stats", { p_profile_id: profile.id }),
  ]);
  if (motorcycleError) throw new Error("ROAM motorcycle data is not available. Apply the Phase 1 Supabase migration and try again.");
  if (followStatsError || !followStatsRows?.[0]) throw new Error("ROAM follow data is not available. Apply the rider follows migration and try again.");

  return <main className="min-h-screen bg-paper"><AppHeader email={user.email} /><div className="mx-auto max-w-[900px] px-5 py-9 sm:px-8 sm:py-14"><div className="mb-7"><p className="font-mono text-[10px] tracking-[0.18em] text-signal">RIDER PROFILE</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">On the road with</h1></div><ProfileCard profile={profile} motorcycles={motorcycles ?? []} currentUserId={user.id} followStats={followStatsRows[0]} /></div></main>;
}
