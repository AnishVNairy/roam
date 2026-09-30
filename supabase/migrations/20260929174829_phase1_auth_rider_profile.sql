create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  display_name text not null,
  avatar_url text,
  bio text,
  city text,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint profiles_username_key unique (username),
  constraint profiles_username_format check (
    username = pg_catalog.lower(username)
    and username ~ '^[a-z0-9_]{3,24}$'
  ),
  constraint profiles_display_name_length check (
    pg_catalog.length(pg_catalog.btrim(display_name)) between 1 and 60
  ),
  constraint profiles_bio_length check (bio is null or pg_catalog.length(bio) <= 280),
  constraint profiles_city_length check (city is null or pg_catalog.length(city) <= 80),
  constraint profiles_avatar_url_protocol check (
    avatar_url is null or avatar_url ~* '^https?://'
  )
);

create table public.motorcycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  make text not null,
  model text not null,
  year smallint,
  image_url text,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint motorcycles_make_not_blank check (pg_catalog.length(pg_catalog.btrim(make)) > 0),
  constraint motorcycles_model_not_blank check (pg_catalog.length(pg_catalog.btrim(model)) > 0),
  constraint motorcycles_make_length check (pg_catalog.length(make) <= 60),
  constraint motorcycles_model_length check (pg_catalog.length(model) <= 80),
  constraint motorcycles_year_range check (year is null or year between 1885 and 2100),
  constraint motorcycles_image_url_protocol check (
    image_url is null or image_url ~* '^https?://'
  )
);

create index motorcycles_user_id_idx on public.motorcycles (user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger motorcycles_set_updated_at
before update on public.motorcycles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.motorcycles enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.motorcycles to authenticated;

create policy "Public rider profiles are readable"
on public.profiles for select
to anon, authenticated
using (true);

create policy "Riders can create their own profile"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Riders can update their own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Riders can read their own motorcycles"
on public.motorcycles for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Riders can add their own motorcycles"
on public.motorcycles for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Riders can update their own motorcycles"
on public.motorcycles for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Riders can delete their own motorcycles"
on public.motorcycles for delete
to authenticated
using ((select auth.uid()) = user_id);
