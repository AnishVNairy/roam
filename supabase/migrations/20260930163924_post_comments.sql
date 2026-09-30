create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default pg_catalog.now(),
  constraint comments_content_length check (
    content ~ '[^[:space:]]' and pg_catalog.char_length(content) between 1 and 1000
  )
);

create index comments_post_id_created_at_id_idx
on public.comments (post_id, created_at, id);

alter table public.comments enable row level security;

revoke all privileges on table public.comments from anon, authenticated, public;
grant select, insert, delete on table public.comments to authenticated;

create policy "Authenticated riders can read comments"
on public.comments for select
to authenticated
using (true);

create policy "Riders can create comments as themselves"
on public.comments for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Riders can delete their own comments"
on public.comments for delete
to authenticated
using ((select auth.uid()) = user_id);

create view public.post_comment_counts
with (security_invoker = true)
as
select
  posts.id as post_id,
  count(comments.id)::integer as comment_count
from public.posts
left join public.comments on comments.post_id = posts.id
group by posts.id;

revoke all privileges on table public.post_comment_counts from anon, authenticated, public;
grant select on table public.post_comment_counts to authenticated;
