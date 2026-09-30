import Link from "next/link";
import { MapPin, MoveUpRight } from "lucide-react";
import type { Motorcycle, Profile } from "@/lib/supabase/database.types";

export function ProfileCard({ profile, motorcycles }: { profile: Profile; motorcycles: Motorcycle[] }) {
  const initials = profile.display_name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <article className="overflow-hidden rounded-panel border border-line bg-white shadow-panel">
    <div className="h-28 bg-[radial-gradient(circle_at_78%_40%,rgba(196,95,59,0.5),transparent_14%),linear-gradient(120deg,#142c30,#29494a_58%,#82968a)]" aria-hidden="true" />
    <div className="px-5 pb-7 sm:px-9 sm:pb-9">
      <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
        {profile.avatar_url ? <div role="img" aria-label={`${profile.display_name}'s avatar`} className="size-24 rounded-full border-4 border-white bg-paper bg-cover bg-center shadow-panel" style={{ backgroundImage: `url("${profile.avatar_url.replaceAll('"', "%22")}")` }} /> : <div aria-label={`${profile.display_name}'s initials`} className="grid size-24 place-items-center rounded-full border-4 border-white bg-sage text-2xl font-semibold text-petrol shadow-panel">{initials}</div>}
        <Link href="/profile/edit" className="mb-1 inline-flex min-h-10 items-center gap-2 rounded-control border border-line bg-white px-4 text-sm font-semibold text-petrol hover:border-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal">Edit profile <MoveUpRight size={15} aria-hidden="true" /></Link>
      </div>
      <p className="mt-5 font-mono text-[10px] tracking-[0.16em] text-signal">RIDER CARD / {profile.username.toUpperCase()}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-ink">{profile.display_name}</h1>
      <p className="mt-1 text-sm text-muted">@{profile.username}</p>
      {profile.city ? <p className="mt-4 flex items-center gap-2 text-sm text-muted"><MapPin size={15} aria-hidden="true" />{profile.city}</p> : null}
      {profile.bio ? <p className="mt-5 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-ink/85">{profile.bio}</p> : null}
      <div className="mt-8 border-t border-line pt-6"><p className="font-mono text-[10px] tracking-[0.16em] text-muted">IN THE GARAGE</p>
        {motorcycles.length ? <ul className="mt-4 space-y-3">{motorcycles.map((bike) => <li key={bike.id} className="flex items-start gap-3"><span className="mt-1.5 size-2 rounded-full bg-signal" aria-hidden="true" /><div><p className="text-sm font-semibold text-ink">{bike.year ? `${bike.year} ` : ""}{bike.make} {bike.model}</p><p className="mt-1 text-xs text-muted">Ready for the next road</p></div></li>)}</ul> : <p className="mt-3 text-sm text-muted">No motorcycle added yet. Add yours from Edit profile.</p>}
      </div>
    </div>
  </article>;
}
