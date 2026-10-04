import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { NotificationList, type NotificationWithActor } from "@/components/notification-list";
import type { Notification, Profile } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export default async function NotificationsPage() {
  const client = await createClient();
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user) redirect("/login?next=%2Fnotifications");

  let unreadRows: { id: string }[] | null = null;
  let readError = false;
  try {
    const { data, error } = await client.from("notifications")
      .select("id")
      .eq("recipient_id", user.id)
      .is("read_at", null);
    unreadRows = data;
    readError = error !== null;
  } catch {
    readError = true;
  }

  const { data: rows, error } = await client.from("notifications")
    .select("id, recipient_id, actor_id, type, post_id, comment_id, read_at, created_at")
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(50);
  if (error) {
    return <main className="min-h-screen bg-paper"><AppHeader email={user.email} /><div className="mx-auto max-w-[760px] px-4 py-7 sm:px-8 sm:py-10"><p role="alert" className="rounded-panel border border-danger/20 bg-white p-6 text-sm leading-6 text-danger">We couldn&apos;t load your notifications. Refresh to try again.</p></div></main>;
  }

  const notifications = (rows ?? []) as Notification[];
  const actorIds = [...new Set(notifications.map((notification) => notification.actor_id).filter((id): id is string => id !== null))];
  let actors: Pick<Profile, "id" | "username" | "display_name">[] = [];
  if (actorIds.length) {
    const { data, error: actorError } = await client.from("profiles")
      .select("id, username, display_name")
      .in("id", actorIds);
    if (actorError) {
      return <main className="min-h-screen bg-paper"><AppHeader email={user.email} /><div className="mx-auto max-w-[760px] px-4 py-7 sm:px-8 sm:py-10"><p role="alert" className="rounded-panel border border-danger/20 bg-white p-6 text-sm leading-6 text-danger">We couldn&apos;t load rider details for your notifications. Refresh to try again.</p></div></main>;
    }
    actors = data ?? [];
  }

  const actorById = new Map(actors.map((actor) => [actor.id, actor]));
  const notificationsWithActors: NotificationWithActor[] = notifications.map((notification) => ({
    ...notification,
    actor: notification.actor_id ? actorById.get(notification.actor_id) ?? null : null,
  }));

  const unreadIds = readError ? [] : (unreadRows ?? []).map(({ id }) => id);
  const readAt = new Date().toISOString();
  if (unreadIds.length) {
    try {
      const { error: updateError } = await client.from("notifications")
        .update({ read_at: readAt })
        .eq("recipient_id", user.id)
        .in("id", unreadIds)
        .is("read_at", null);
      if (updateError) {
        readError = true;
      } else {
        const unreadIdSet = new Set(unreadIds);
        for (const notification of notificationsWithActors) {
          if (unreadIdSet.has(notification.id)) notification.read_at = readAt;
        }
      }
    } catch {
      readError = true;
    }
  }

  return <main className="min-h-screen bg-paper"><AppHeader email={user.email} /><div className="mx-auto max-w-[760px] px-4 py-7 sm:px-8 sm:py-10">
    <header className="mb-6">
      <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-signal">YOUR RIDER ACTIVITY</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-ink">Notifications</h1>
      <p className="mt-2 text-sm leading-6 text-muted">Recent activity from riders connecting with your posts and profile.</p>
    </header>
    {readError ? <p role="alert" className="mb-4 rounded-panel border border-danger/20 bg-white p-4 text-sm leading-6 text-danger">We couldn&apos;t mark notifications as read. Refresh to try again.</p> : null}
    <NotificationList notifications={notificationsWithActors} />
  </div></main>;
}
