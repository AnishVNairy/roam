import { Wordmark } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";
import Link from "next/link";

export function AppHeader({ email }: { email?: string | null }) {
  return (
    <header className="border-b border-line bg-white/90">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div>
          <Wordmark />
          <p className="mt-1 hidden font-mono text-[9px] tracking-[0.17em] text-muted sm:block">
            ROAM / COMMUNITY
          </p>
        </div>
        <nav aria-label="Main navigation" className="flex items-center gap-1 sm:gap-2">
          <Link href="/" className="rounded-control px-3 py-2 text-xs font-semibold text-petrol hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal">Home feed</Link>
          <Link href="/create-post" className="rounded-control bg-petrol px-3 py-2 text-xs font-semibold text-white hover:bg-petrol/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal sm:px-4">Create post</Link>
        </nav>
        <div className="flex items-center gap-3">
          {email ? <span className="hidden max-w-48 truncate text-xs text-muted sm:block">{email}</span> : null}
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
