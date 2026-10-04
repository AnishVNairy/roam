begin;

create extension if not exists pgtap with schema extensions;
select plan(12);

insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-111111111111', 'follows-one@test.local'),
  ('22222222-2222-4222-8222-222222222222', 'follows-two@test.local'),
  ('33333333-3333-4333-8333-333333333333', 'follows-three@test.local');

insert into public.profiles (id, username, display_name) values
  ('11111111-1111-4111-8111-111111111111', 'follows_one', 'Follows One'),
  ('22222222-2222-4222-8222-222222222222', 'follows_two', 'Follows Two'),
  ('33333333-3333-4333-8333-333333333333', 'follows_three', 'Follows Three');

insert into public.follows (follower_id, following_id)
values ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111');

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select lives_ok(
  $$insert into public.follows (follower_id, following_id) values ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222')$$,
  'authenticated rider can follow another rider as themselves'
);

select throws_ok(
  $$insert into public.follows (follower_id, following_id) values ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222')$$,
  '23505', null, 'duplicate follows are rejected by the primary key'
);

select throws_ok(
  $$insert into public.follows (follower_id, following_id) values ('11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111')$$,
  '23514', null, 'self-follows are rejected by the check constraint'
);

select throws_ok(
  $$insert into public.follows (follower_id, following_id) values ('22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333333')$$,
  '42501', null, 'rider cannot create a follow for another follower'
);

select is((select count(*) from public.follows), 1::bigint, 'rider can read only their outgoing follow rows');

select results_eq(
  $$select * from public.get_profile_follow_stats('11111111-1111-4111-8111-111111111111')$$,
  $$values (1, 1, false)$$,
  'follow stats return counts and the viewer-specific relationship without exposing edges'
);

select lives_ok(
  $$delete from public.follows where follower_id = '22222222-2222-4222-8222-222222222222' and following_id = '11111111-1111-4111-8111-111111111111'$$,
  'delete request against another rider follow does not error'
);

select is(
  (select followers_count from public.get_profile_follow_stats('11111111-1111-4111-8111-111111111111')),
  1,
  'rider cannot remove another rider follow'
);

select lives_ok(
  $$delete from public.follows where follower_id = '11111111-1111-4111-8111-111111111111' and following_id = '22222222-2222-4222-8222-222222222222'$$,
  'rider can unfollow their own relationship'
);

select is(
  (select following_count from public.get_profile_follow_stats('11111111-1111-4111-8111-111111111111')),
  0,
  'unfollow removes the rider relationship'
);

set local role anon;

select throws_ok(
  $$insert into public.follows (follower_id, following_id) values ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222')$$,
  '42501', null, 'unauthenticated role cannot follow riders'
);

select throws_ok(
  $$select * from public.get_profile_follow_stats('11111111-1111-4111-8111-111111111111')$$,
  '42501', null, 'unauthenticated role cannot read follow stats'
);

reset role;

select * from finish();
rollback;
