import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationsPath = resolve(process.cwd(), "supabase/migrations");
const migrationName = readdirSync(migrationsPath).find((name) => name.endsWith("_notifications.sql"));

describe("notifications migration", () => {
  it("constrains notification types and matching related entities", () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationsPath, migrationName!), "utf8");

    expect(sql).toMatch(/type\s+text\s+not null[^,]*check[^;]*post_like[^;]*post_comment[^;]*new_follower/i);
    expect(sql).toMatch(/check\s*\([\s\S]*type\s*=\s*'post_like'[\s\S]*post_id is not null[\s\S]*comment_id is null[\s\S]*type\s*=\s*'post_comment'[\s\S]*comment_id is not null[\s\S]*type\s*=\s*'new_follower'[\s\S]*post_id is null[\s\S]*comment_id is null/i);
    expect(sql).toMatch(/check\s*\(\s*actor_id\s+is\s+null\s+or\s+actor_id\s*<>\s*recipient_id\s*\)/i);
    expect(sql).toMatch(/post_id uuid references public\.posts\s*\(id\) on delete cascade/i);
    expect(sql).toMatch(/create unique index comments_id_post_id_idx on public\.comments\s*\(id, post_id\)/i);
    expect(sql).toMatch(/foreign key\s*\(comment_id, post_id\)[\s\S]*references public\.comments\s*\(id, post_id\) on delete cascade/i);
    expect(sql).toMatch(/actor_id uuid references auth\.users\s*\(id\) on delete set null/i);
    expect(sql).toMatch(/recipient_id uuid not null references auth\.users\s*\(id\) on delete cascade/i);
  });

  it("uses private actor-checked trigger functions to create notifications", () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationsPath, migrationName!), "utf8");

    expect(sql).toMatch(/create schema if not exists private/i);
    expect(sql).toMatch(/security definer[\s\S]*set search_path = ''/i);
    expect(sql.match(/auth\.uid\(\)/gi)?.length).toBeGreaterThanOrEqual(3);
    expect(sql).toMatch(/revoke all on function private\.notify_post_like\(\) from public, anon, authenticated/i);
    expect(sql).toMatch(/after insert on public\.likes[\s\S]*execute function private\.notify_post_like\(\)/i);
    expect(sql).toMatch(/after insert on public\.comments[\s\S]*execute function private\.notify_post_comment\(\)/i);
    expect(sql).toMatch(/after insert on public\.follows[\s\S]*execute function private\.notify_new_follower\(\)/i);
  });

  it("grants recipients read and read_at-only updates under ownership RLS", () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationsPath, migrationName!), "utf8");

    expect(sql).toMatch(/alter table public\.notifications enable row level security/i);
    expect(sql).toMatch(/revoke all privileges on table public\.notifications from anon, authenticated, public/i);
    expect(sql).toMatch(/grant select on table public\.notifications to authenticated/i);
    expect(sql).toMatch(/grant update\s*\(read_at\) on table public\.notifications to authenticated/i);
    expect(sql).toMatch(/for select\s+to authenticated\s+using\s*\(\s*\(select auth\.uid\(\)\)\s*=\s*recipient_id\s*\)/i);
    expect(sql).toMatch(/for update\s+to authenticated\s+using\s*\([\s\S]*auth\.uid\(\)[\s\S]*recipient_id[\s\S]*with check\s*\([\s\S]*auth\.uid\(\)[\s\S]*recipient_id/i);
    expect(sql).not.toMatch(/grant\s+insert[^;]*notifications\s+to\s+authenticated/i);
    expect(sql).not.toMatch(/for insert\s+to authenticated[\s\S]*on public\.notifications/i);
    expect(sql).toMatch(/notifications_recipient_created_at_idx[\s\S]*recipient_id, created_at desc/i);
    expect(sql).toMatch(/notifications_unread_recipient_idx[\s\S]*where read_at is null/i);
  });
});
