import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("post comments migration", () => {
  const migrationsPath = resolve(process.cwd(), "supabase/migrations");
  const migrationName = readdirSync(migrationsPath).find((name) => name.endsWith("_post_comments.sql"));

  it("enforces non-empty bounded content, chronological lookup, and post-delete cascade", () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationsPath, migrationName!), "utf8");

    expect(sql).toMatch(/id uuid primary key/i);
    expect(sql).toMatch(/post_id uuid not null references public\.posts \(id\) on delete cascade/i);
    expect(sql).toMatch(/user_id uuid not null references auth\.users \(id\) on delete cascade/i);
    expect(sql).toMatch(/content ~ '\[\^\[:space:\]\]'[\s\S]*char_length\(content\) between 1 and 1000/i);
    expect(sql).toMatch(/comments_post_id_created_at_id_idx[\s\S]*\(post_id, created_at, id\)/i);
  });

  it("grants only authenticated reads and owner writes, and summarizes counts as an invoker", () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationsPath, migrationName!), "utf8");

    expect(sql).toMatch(/alter table public\.comments enable row level security/i);
    expect(sql).toMatch(/revoke all privileges on table public\.comments from anon, authenticated, public/i);
    expect(sql).toMatch(/grant select, insert, delete on table public\.comments to authenticated/i);
    expect(sql).toMatch(/create policy[^;]*on public\.comments[^;]*for select\s+to authenticated[^;]*using\s*\(\s*true\s*\)/i);
    expect(sql).toMatch(/create policy[^;]*on public\.comments[^;]*for insert\s+to authenticated[^;]*with check[^;]*auth\.uid\(\)[^;]*user_id/i);
    expect(sql).toMatch(/create policy[^;]*on public\.comments[^;]*for delete\s+to authenticated[^;]*using[^;]*auth\.uid\(\)[^;]*user_id/i);
    expect(sql).toMatch(/create view public\.post_comment_counts[\s\S]*with \(security_invoker\s*=\s*true\)/i);
    expect(sql).toMatch(/grant select on table public\.post_comment_counts to authenticated/i);
    expect(sql).toMatch(/revoke all privileges on table public\.post_comment_counts from anon, authenticated, public/i);
  });
});
