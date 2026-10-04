import { Wordmark } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";
import { createClient } from "@/lib/supabase/server";
import { Bell } from "lucide-react";
import Link from "next/link";

export async function AppHeader({ email }: { email?: string | null }) {
  let unreadCount = 0;
  try {
    const client = await createClient();
    const { count, error } = await client.from("notifications")
      .select("id", { count: "exact", head: true })
      .is("read_at", null);
    if (!error) unreadCount = count ?? 0;
  } catch {
    // The rest of the navigation remains available if the badge query fails.
  }

  const notificationLabel = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications";
  return (
    <header className="border-b border-line bg-white/90">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3 md:flex-nowrap sm:px-8 sm:py-4">
        <div>
          <Wordmark />
          <p className="mt-1 hidden font-mono text-[9px] tracking-[0.17em] text-muted sm:block">
            ROAM / COMMUNITY
          </p>
        </div>
        <nav aria-label="Main navigation" className="order-3 flex w-full items-center justify-between gap-1 md:order-none md:w-auto md:gap-2">
          <Link href="/" className="inline-flex min-h-11 flex-1 items-center justify-center whitespace-nowrap rounded-control px-0 py-2 text-center text-[10px] font-semibold text-petrol hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal sm:flex-none sm:px-3 sm:text-xs">Home feed</Link>
          <Link href="/create-post" className="inline-flex min-h-11 flex-1 items-center justify-center whitespace-nowrap rounded-control bg-petrol px-0 py-2 text-center text-[10px] font-semibold text-white hover:bg-petrol/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal sm:flex-none sm:px-4 sm:text-xs">Create post</Link>
          <Link href="/notifications" aria-label={notificationLabel} className="inline-flex min-h-11 flex-1 items-center justify-center gap-0.5 whitespace-nowrap rounded-control px-0 py-2 text-center text-[10px] font-semibold text-petrol hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal sm:flex-none sm:gap-1 sm:px-3 sm:text-xs"><Bell size={14} aria-hidden="true" /><span className="sm:hidden">Alerts</span><span className="hidden sm:inline">Notifications</span>{unreadCount > 0 ? <span aria-hidden="true" className="min-w-4 rounded-full bg-signal px-1 text-[9px] leading-4 text-white">{unreadCount > 99 ? "99+" : unreadCount}</span> : null}</Link>
          <Link href="/profile" className="inline-flex min-h-11 flex-1 items-center justify-center whitespace-nowrap rounded-control px-0 py-2 text-center text-[10px] font-semibold text-petrol hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal sm:flex-none sm:px-3 sm:text-xs">Profile</Link>
        </nav>
        <div className="flex items-center gap-3">
          {email ? <span className="hidden max-w-48 truncate text-xs text-muted md:block">{email}</span> : null}
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
