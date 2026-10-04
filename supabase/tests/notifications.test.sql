begin;

create extension if not exists pgtap with schema extensions;
select plan(33);

insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-111111111111', 'notifications-owner@test.local'),
  ('22222222-2222-4222-8222-222222222222', 'notifications-actor@test.local'),
  ('33333333-3333-4333-8333-333333333333', 'notifications-other@test.local');

insert into public.profiles (id, username, display_name) values
  ('11111111-1111-4111-8111-111111111111', 'notifications_owner', 'Notifications Owner'),
  ('22222222-2222-4222-8222-222222222222', 'notifications_actor', 'Notifications Actor'),
  ('33333333-3333-4333-8333-333333333333', 'notifications_other', 'Notifications Other');

insert into public.posts (id, user_id, caption) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'Owner post'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'Actor post');

set local role authenticated;
set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

select lives_ok(
  $$insert into public.likes (post_id, user_id) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '22222222-2222-4222-8222-222222222222')$$,
  'a like creates its owner notification'
);
select is(
  (select count(*) from public.notifications where recipient_id = '11111111-1111-4111-8111-111111111111' and type = 'post_like' and actor_id = '22222222-2222-4222-8222-222222222222' and post_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  1::bigint,
  'like notification recipient and related post come from the database'
);
select throws_ok(
  $$insert into public.likes (post_id, user_id) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '22222222-2222-4222-8222-222222222222')$$,
  '23505', null, 'duplicate likes remain blocked at the source table'
);
select is(
  (select count(*) from public.notifications where recipient_id = '11111111-1111-4111-8111-111111111111' and type = 'post_like'),
  1::bigint,
  'a duplicate like creates no second notification'
);
select lives_ok(
  $$insert into public.likes (post_id, user_id) values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222')$$,
  'a rider can like their own post without a self-notification'
);
select is(
  (select count(*) from public.notifications where recipient_id = '22222222-2222-4222-8222-222222222222' and type = 'post_like'),
  0::bigint,
  'self-likes create no notifications'
);

select lives_ok(
  $$insert into public.comments (id, post_id, user_id, content) values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '22222222-2222-4222-8222-222222222222', 'Nice road')$$,
  'a comment creates its owner notification'
);
select is(
  (select count(*) from public.notifications where recipient_id = '11111111-1111-4111-8111-111111111111' and type = 'post_comment' and comment_id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
  1::bigint,
  'comment notification identifies both the post and comment'
);
select lives_ok(
  $$insert into public.comments (id, post_id, user_id, content) values ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'My own note')$$,
  'a rider can comment on their own post without a self-notification'
);
select is(
  (select count(*) from public.notifications where recipient_id = '22222222-2222-4222-8222-222222222222' and type = 'post_comment'),
  0::bigint,
  'self-comments create no notifications'
);

select lives_ok(
  $$insert into public.follows (follower_id, following_id) values ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111')$$,
  'a follow creates its target rider notification'
);
select is(
  (select count(*) from public.notifications where recipient_id = '11111111-1111-4111-8111-111111111111' and type = 'new_follower' and actor_id = '22222222-2222-4222-8222-222222222222'),
  1::bigint,
  'follow notification identifies the follower and recipient'
);
select throws_ok(
  $$insert into public.follows (follower_id, following_id) values ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111')$$,
  '23505', null, 'duplicate follows remain blocked at the source table'
);
select is(
  (select count(*) from public.notifications where recipient_id = '11111111-1111-4111-8111-111111111111' and type = 'new_follower'),
  1::bigint,
  'a duplicate follow creates no second notification'
);
select throws_ok(
  $$insert into public.follows (follower_id, following_id) values ('22222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222')$$,
  '23514', null, 'self-follows remain blocked by the follows constraint'
);
select throws_ok(
  $$insert into public.notifications (recipient_id, actor_id, type, post_id) values ('33333333-3333-4333-8333-333333333333', '22222222-2222-4222-8222-222222222222', 'post_like', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')$$,
  '42501', null, 'authenticated riders cannot create arbitrary notifications'
);

reset role;
select throws_ok(
  $$insert into public.notifications (recipient_id, actor_id, type, post_id, comment_id) values ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'post_comment', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc')$$,
  '23503', null, 'comment notifications cannot reference a different post'
);
insert into public.notifications (id, recipient_id, actor_id, type)
values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', '33333333-3333-4333-8333-333333333333', '22222222-2222-4222-8222-222222222222', 'new_follower');

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
select is(
  (select count(*) from public.notifications where recipient_id = '11111111-1111-4111-8111-111111111111'),
  3::bigint,
  'a rider can read their own notifications'
);
select is(
  (select count(*) from public.notifications where recipient_id = '33333333-3333-4333-8333-333333333333'),
  0::bigint,
  'a rider cannot read another recipient’s notifications'
);
select lives_ok(
  $$update public.notifications set read_at = pg_catalog.now() where recipient_id = '11111111-1111-4111-8111-111111111111' and type = 'post_like'$$,
  'a recipient can mark their own notification read'
);
select is(
  (select count(*) from public.notifications where recipient_id = '11111111-1111-4111-8111-111111111111' and type = 'post_like' and read_at is not null),
  1::bigint,
  'read state is persisted'
);
select is(
  (select count(*) from public.notifications where recipient_id = '11111111-1111-4111-8111-111111111111' and read_at is null),
  2::bigint,
  'unread count excludes notifications already marked read'
);
select lives_ok(
  $$update public.notifications set read_at = pg_catalog.now() where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'$$,
  'updating another recipient row is filtered by RLS'
);
select throws_ok(
  $$update public.notifications set type = 'new_follower' where recipient_id = '11111111-1111-4111-8111-111111111111'$$,
  '42501', null, 'recipients cannot update notification content'
);
select throws_ok(
  $$delete from public.notifications where recipient_id = '11111111-1111-4111-8111-111111111111'$$,
  '42501', null, 'recipients cannot delete notification rows'
);

reset role;
select is(
  (select read_at is null from public.notifications where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'),
  true,
  'a recipient cannot mark another rider’s notification read'
);

set local role authenticated;
set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
select lives_ok(
  $$delete from public.comments where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'$$,
  'a rider can delete their own comment'
);
select is(
  (select count(*) from public.notifications where recipient_id = '11111111-1111-4111-8111-111111111111' and type = 'post_comment'),
  0::bigint,
  'deleting a comment removes its notification'
);

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
select lives_ok(
  $$delete from public.posts where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  'a post owner can delete their post'
);
select is(
  (select count(*) from public.notifications where recipient_id = '11111111-1111-4111-8111-111111111111' and type in ('post_like', 'post_comment')),
  0::bigint,
  'deleting a post safely removes notifications referencing it'
);
select is(
  (select count(*) from public.notifications where recipient_id = '11111111-1111-4111-8111-111111111111' and type = 'new_follower'),
  1::bigint,
  'unrelated follow notification survives post deletion'
);

reset role;
delete from auth.users where id = '22222222-2222-4222-8222-222222222222';
select is(
  (select count(*) from public.notifications where recipient_id = '11111111-1111-4111-8111-111111111111' and type = 'new_follower' and actor_id is null),
  1::bigint,
  'deleting an actor account preserves recipient notifications with a null actor'
);

set local role anon;
select throws_ok(
  $$select * from public.notifications$$,
  '42501', null, 'anonymous role cannot read notifications'
);
reset role;

select * from finish();
rollback;
