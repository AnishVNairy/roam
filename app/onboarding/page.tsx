import { redirect } from "next/navigation";
import { BrandPanel } from "@/components/brand";
import { OnboardingForm } from "@/components/onboarding-form";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) redirect("/login");
  const { data: profile } = await client.from("profiles").select("username, display_name").eq("id", user.id).maybeSingle();
  if (profile?.username && profile.display_name.trim()) redirect("/profile");
  return <main className="min-h-screen bg-paper lg:grid lg:grid-cols-[0.88fr_1.12fr]"><BrandPanel eyebrow="YOUR RIDER CARD" title={<>Make it yours.<br />Then find your road.</>} description="A couple of details help riders recognize you. Add your motorcycle now or whenever you're ready." /><section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12 lg:py-16"><div className="w-full max-w-xl rounded-panel border border-line bg-white p-5 shadow-panel sm:p-8"><p className="font-mono text-[10px] tracking-[0.17em] text-muted">SIGNED IN AS {user.email?.toUpperCase()}</p><OnboardingForm /></div></section></main>;
}
