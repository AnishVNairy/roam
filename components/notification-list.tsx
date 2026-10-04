import Link from "next/link";
import type { Notification, Profile } from "@/lib/supabase/database.types";

export type NotificationWithActor = Notification & {
  actor: Pick<Profile, "username" | "display_name"> | null;
};

function notificationMessage(notification: NotificationWithActor) {
  const actor = notification.actor?.display_name ?? "A rider";
  switch (notification.type) {
    case "post_like":
      return `${actor} liked your post`;
    case "post_comment":
      return `${actor} commented on your post`;
    case "new_follower":
      return `${actor} started following you`;
  }
}

function notificationHref(notification: NotificationWithActor) {
  if (notification.type === "new_follower") {
    return notification.actor?.username
      ? `/riders/${encodeURIComponent(notification.actor.username)}`
      : null;
  }
  return notification.post_id ? `/?post=${encodeURIComponent(notification.post_id)}#post-${notification.post_id}` : null;
}

function NotificationItem({ notification }: { notification: NotificationWithActor }) {
  const message = notificationMessage(notification);
  const href = notificationHref(notification);
  const isRead = notification.read_at !== null;

  return <li className="flex items-start gap-3 border-b border-line px-4 py-4 last:border-b-0 sm:px-5">
    <span aria-hidden="true" className={`mt-2 size-2 shrink-0 rounded-full ${isRead ? "bg-sage-light" : "bg-signal"}`} />
    <div className="min-w-0 flex-1">
      {href ? <Link href={href} className="rounded-control text-sm font-medium leading-6 text-ink hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal">{message}</Link> : <p className="text-sm font-medium leading-6 text-ink">{message}</p>}
      <time dateTime={notification.created_at} className="mt-1 block font-mono text-[10px] tracking-wide text-muted">{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(notification.created_at))}</time>
    </div>
  </li>;
}

export function NotificationList({ notifications }: { notifications: NotificationWithActor[] }) {
  if (!notifications.length) {
    return <section className="rounded-panel border border-dashed border-sage/70 bg-white/70 px-6 py-12 text-center">
      <h2 className="text-lg font-semibold tracking-tight text-ink">No notifications yet.</h2>
      <p className="mt-2 text-sm leading-6 text-muted">When riders connect with your posts or profile, you&apos;ll see it here.</p>
    </section>;
  }

  return <ul aria-label="Recent notifications" className="overflow-hidden rounded-panel border border-line bg-white shadow-panel">
    {notifications.map((notification) => <NotificationItem key={notification.id} notification={notification} />)}
  </ul>;
}
