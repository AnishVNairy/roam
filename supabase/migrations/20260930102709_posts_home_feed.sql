create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  caption text not null,
  media_url text,
  created_at timestamptz not null default pg_catalog.now(),
  constraint posts_caption_length check (
    pg_catalog.length(pg_catalog.btrim(caption)) between 1 and 2000
  ),
  constraint posts_media_url_protocol check (
    media_url is null or media_url ~* '^https?://'
  )
);

create index posts_created_at_id_idx on public.posts (created_at desc, id desc);

alter table public.posts enable row level security;

grant select, insert, update, delete on public.posts to authenticated;

create policy "Authenticated riders can read posts"
on public.posts for select
to authenticated
using (true);

create policy "Riders can create their own posts"
on public.posts for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Riders can update their own posts"
on public.posts for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Riders can delete their own posts"
on public.posts for delete
to authenticated
using ((select auth.uid()) = user_id);
