create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default pg_catalog.now(),
  constraint follows_no_self_follow check (follower_id <> following_id),
  primary key (follower_id, following_id)
);

create index follows_following_id_idx on public.follows (following_id);

alter table public.follows enable row level security;

revoke all privileges on table public.follows from anon, authenticated, public;
grant select, insert, delete on table public.follows to authenticated;

create policy "Riders can read their outgoing follows"
on public.follows for select
to authenticated
using ((select auth.uid()) = follower_id);

create policy "Riders can follow as themselves"
on public.follows for insert
to authenticated
with check ((select auth.uid()) = follower_id);

create policy "Riders can remove their own follows"
on public.follows for delete
to authenticated
using ((select auth.uid()) = follower_id);

create or replace function public.get_profile_follow_stats(p_profile_id uuid)
returns table (followers_count integer, following_count integer, is_following boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select count(*)::integer from public.follows where following_id = p_profile_id),
    (select count(*)::integer from public.follows where follower_id = p_profile_id),
    exists (
      select 1
      from public.follows
      where follower_id = (select auth.uid())
        and following_id = p_profile_id
    );
$$;

revoke all on function public.get_profile_follow_stats(uuid) from public, anon, authenticated;
grant execute on function public.get_profile_follow_stats(uuid) to authenticated;
