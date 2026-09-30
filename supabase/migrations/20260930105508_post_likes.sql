create table public.likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default pg_catalog.now(),
  primary key (post_id, user_id)
);

create index likes_user_id_idx on public.likes (user_id);

alter table public.likes enable row level security;

grant select, insert, delete on table public.likes to authenticated;

create policy "Authenticated riders can read likes"
on public.likes for select
to authenticated
using (true);

create policy "Riders can like posts as themselves"
on public.likes for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Riders can remove their own likes"
on public.likes for delete
to authenticated
using ((select auth.uid()) = user_id);

create view public.post_likes_summary
with (security_invoker = true)
as
select
  posts.id as post_id,
  count(likes.user_id)::integer as like_count,
  coalesce(bool_or(likes.user_id = (select auth.uid())), false) as liked_by_current_user
from public.posts
left join public.likes on likes.post_id = posts.id
group by posts.id;

grant select on table public.post_likes_summary to authenticated;
