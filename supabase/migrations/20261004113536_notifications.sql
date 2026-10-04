create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create unique index comments_id_post_id_idx on public.comments (id, post_id);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  type text not null check (type in ('post_like', 'post_comment', 'new_follower')),
  post_id uuid references public.posts (id) on delete cascade,
  comment_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default pg_catalog.now(),
  constraint notifications_no_self_notification check (actor_id is null or actor_id <> recipient_id),
  constraint notifications_related_entities_match_type check (
    (type = 'post_like' and post_id is not null and comment_id is null)
    or (type = 'post_comment' and post_id is not null and comment_id is not null)
    or (type = 'new_follower' and post_id is null and comment_id is null)
  ),
  constraint notifications_comment_matches_post foreign key (comment_id, post_id)
    references public.comments (id, post_id) on delete cascade
);

create index notifications_recipient_created_at_idx
on public.notifications (recipient_id, created_at desc, id desc);

create index notifications_unread_recipient_idx
on public.notifications (recipient_id)
where read_at is null;

create index notifications_actor_id_idx on public.notifications (actor_id);
create index notifications_post_id_idx on public.notifications (post_id);
create index notifications_comment_id_idx on public.notifications (comment_id);

alter table public.notifications enable row level security;

revoke all privileges on table public.notifications from anon, authenticated, public;
grant select on table public.notifications to authenticated;
grant update (read_at) on table public.notifications to authenticated;

create policy "Riders can read their own notifications"
on public.notifications for select
to authenticated
using ((select auth.uid()) = recipient_id);

create policy "Riders can mark their own notifications read"
on public.notifications for update
to authenticated
using ((select auth.uid()) = recipient_id)
with check ((select auth.uid()) = recipient_id);

create function private.notify_post_like()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  notification_recipient uuid;
begin
  if auth.uid() is null or new.user_id <> auth.uid() then
    return new;
  end if;

  select posts.user_id into notification_recipient
  from public.posts as posts
  where posts.id = new.post_id;

  if notification_recipient is not null and notification_recipient <> new.user_id then
    insert into public.notifications (recipient_id, actor_id, type, post_id)
    values (notification_recipient, new.user_id, 'post_like', new.post_id);
  end if;

  return new;
end;
$$;

create function private.notify_post_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  notification_recipient uuid;
begin
  if auth.uid() is null or new.user_id <> auth.uid() then
    return new;
  end if;

  select posts.user_id into notification_recipient
  from public.posts as posts
  where posts.id = new.post_id;

  if notification_recipient is not null and notification_recipient <> new.user_id then
    insert into public.notifications (recipient_id, actor_id, type, post_id, comment_id)
    values (notification_recipient, new.user_id, 'post_comment', new.post_id, new.id);
  end if;

  return new;
end;
$$;

create function private.notify_new_follower()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or new.follower_id <> auth.uid() then
    return new;
  end if;

  if new.follower_id <> new.following_id then
    insert into public.notifications (recipient_id, actor_id, type)
    values (new.following_id, new.follower_id, 'new_follower');
  end if;

  return new;
end;
$$;

revoke all on function private.notify_post_like() from public, anon, authenticated;
revoke all on function private.notify_post_comment() from public, anon, authenticated;
revoke all on function private.notify_new_follower() from public, anon, authenticated;

create trigger likes_create_notification
after insert on public.likes
for each row execute function private.notify_post_like();

create trigger comments_create_notification
after insert on public.comments
for each row execute function private.notify_post_comment();

create trigger follows_create_notification
after insert on public.follows
for each row execute function private.notify_new_follower();
