import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("rider follows migration", () => {
  const migrationsPath = resolve(process.cwd(), "supabase/migrations");
  const migrationName = readdirSync(migrationsPath).find((name) => name.endsWith("_rider_follows.sql"));

  it("enforces unique, non-self follows and indexes both lookup directions", () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationsPath, migrationName!), "utf8");

    expect(sql).toMatch(/primary key\s*\(\s*follower_id\s*,\s*following_id\s*\)/i);
    expect(sql).toMatch(/check\s*\(\s*follower_id\s*<>\s*following_id\s*\)/i);
    expect(sql).toMatch(/create index follows_following_id_idx[^;]*\(following_id\)/i);
  });

  it("limits relationship reads to outgoing follows and protects writes with RLS", () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationsPath, migrationName!), "utf8");

    expect(sql).toMatch(/alter table public\.follows enable row level security/i);
    expect(sql).toMatch(/create policy[^;]*on public\.follows[^;]*for select\s+to authenticated[^;]*auth\.uid\(\)[^;]*follower_id/i);
    expect(sql).toMatch(/create policy[^;]*on public\.follows[^;]*for insert\s+to authenticated[^;]*auth\.uid\(\)[^;]*follower_id/i);
    expect(sql).toMatch(/create policy[^;]*on public\.follows[^;]*for delete\s+to authenticated[^;]*auth\.uid\(\)[^;]*follower_id/i);
    expect(sql).toMatch(/revoke all privileges on table public\.follows from anon, authenticated, public/i);
    expect(sql).toMatch(/grant select, insert, delete on table public\.follows to authenticated/i);
    expect(sql).toMatch(/security definer[\s\S]*set search_path = ''/i);
    expect(sql).toMatch(/revoke all on function public\.get_profile_follow_stats\(uuid\) from public, anon, authenticated/i);
    expect(sql).toMatch(/grant execute on function public\.get_profile_follow_stats\(uuid\) to authenticated/i);
  });
});
