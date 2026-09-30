import Link from "next/link";
import { redirect } from "next/navigation";
import { Wordmark } from "@/components/brand";
import { getPostAuthPath } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  try {
    const client = await createClient();
    const { data: { user } } = await client.auth.getUser();
    if (user) redirect(await getPostAuthPath(client, user.id));
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
  }

  return <main className="relative min-h-screen overflow-hidden bg-paper">
    <div className="absolute inset-y-0 right-0 hidden w-[48%] bg-[radial-gradient(circle_at_75%_48%,rgba(196,95,59,0.28),transparent_15%),radial-gradient(circle_at_75%_48%,transparent_24%,rgba(255,255,255,0.12)_24.2%,transparent_24.7%),radial-gradient(circle_at_75%_48%,transparent_38%,rgba(255,255,255,0.1)_38.2%,transparent_38.6%),linear-gradient(145deg,#142c30,#29494a_62%,#82968a)] lg:block" aria-hidden="true" />
    <header className="relative z-10 mx-auto flex max-w-[1200px] items-center justify-between px-5 py-6 sm:px-8"><Wordmark /><nav className="flex items-center gap-3"><Link href="/login" className="rounded-control px-4 py-2.5 text-sm font-semibold text-petrol hover:bg-white">Sign in</Link><Link href="/signup" className="rounded-control bg-petrol px-4 py-2.5 text-sm font-semibold text-white hover:bg-petrol/90">Join ROAM</Link></nav></header>
    <section className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] max-w-[1200px] items-center px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[1fr_0.8fr] lg:py-20">
      <div className="max-w-2xl"><p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-signal">A RIDING COMMUNITY, BUILT FOR THE ROAD</p><h1 className="mt-6 max-w-[12ch] text-5xl font-semibold leading-[0.99] tracking-[-0.055em] text-ink sm:text-6xl lg:text-7xl">Good roads are better <span className="text-signal">together.</span></h1><p className="mt-7 max-w-lg text-base leading-8 text-muted sm:text-lg">Meet riders, share the bike you ride, and find your next reason to take the long way home.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/signup" className="inline-flex min-h-12 items-center justify-center rounded-control bg-petrol px-6 text-sm font-semibold text-white hover:bg-petrol/90">Build your rider card</Link><Link href="/login" className="inline-flex min-h-12 items-center justify-center rounded-control border border-line bg-white/70 px-6 text-sm font-semibold text-petrol hover:border-sage">I already have an account</Link></div><p className="mt-8 font-mono text-[10px] tracking-[0.15em] text-muted">RIDER FIRST&nbsp; · &nbsp;OPEN ROAD&nbsp; · &nbsp;YOUR PACE</p></div>
      <div className="relative mt-16 aspect-[4/3] max-w-xl rounded-panel border border-white/30 bg-[radial-gradient(circle_at_70%_50%,rgba(196,95,59,0.75),transparent_3%),radial-gradient(ellipse_at_70%_50%,transparent_31%,rgba(242,243,241,0.65)_31.3%,transparent_32%),radial-gradient(ellipse_at_70%_50%,transparent_42%,rgba(242,243,241,0.45)_42.3%,transparent_42.6%),linear-gradient(135deg,#29494a,#142c30_54%,#82968a)] shadow-[0_24px_60px_rgba(20,44,48,0.2)] lg:hidden" aria-hidden="true"><div className="absolute bottom-5 left-5 rounded-control border border-white/15 bg-petrol/70 px-4 py-3 font-mono text-[10px] tracking-[0.15em] text-white">THE ROAD IS BETTER SHARED</div></div>
    </section>
  </main>;
}
