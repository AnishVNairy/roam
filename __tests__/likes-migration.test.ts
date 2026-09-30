import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("post likes migration", () => {
  const migrationsPath = resolve(process.cwd(), "supabase/migrations");
  const migrationName = readdirSync(migrationsPath).find((name) => name.endsWith("_post_likes.sql"));

  it("enforces unique likes and cascades them with post deletion", () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationsPath, migrationName!), "utf8");

    expect(sql).toMatch(/primary key\s*\(\s*post_id\s*,\s*user_id\s*\)/i);
    expect(sql).toMatch(/post_id\s+uuid[^,]*references\s+public\.posts\s*\(id\)\s+on delete cascade/i);
    expect(sql).toMatch(/create index likes_user_id_idx on public\.likes \(user_id\)/i);
  });

  it("restricts writes to authenticated owners while allowing authenticated reads", () => {
    expect(migrationName).toBeDefined();
    const sql = readFileSync(resolve(migrationsPath, migrationName!), "utf8");

    expect(sql).toMatch(/create policy[^;]*on public\.likes[^;]*for select\s+to authenticated[^;]*using\s*\(\s*true\s*\)/i);
    expect(sql).toMatch(/create policy[^;]*on public\.likes[^;]*for insert\s+to authenticated[^;]*with check[^;]*auth\.uid\(\)[^;]*user_id/i);
    expect(sql).toMatch(/create policy[^;]*on public\.likes[^;]*for delete\s+to authenticated[^;]*using[^;]*auth\.uid\(\)[^;]*user_id/i);
    expect(sql).toMatch(/grant select,\s*insert,\s*delete on table public\.likes to authenticated/i);
    expect(sql).toMatch(/with \(security_invoker\s*=\s*true\)/i);
  });
});
