<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ROAM Engineering Instructions

## Product scope

- ROAM is a social platform for motorcycle riders.
- MVP scope: rider profiles, motorcycle profiles, social feed, posts, likes, comments, following, ride discovery, ride creation, joining rides, ride participants, ride chat, notifications, and external navigation.
- Do not add product features outside the defined MVP without explicit approval.

## Engineering principles

- Use only free-tier services and open-source software unless explicitly approved otherwise.
- Do not introduce paid APIs or services.
- Supabase is the backend: PostgreSQL, Auth, Storage, and Realtime.
- Use OpenStreetMap + Leaflet for maps; do not use paid map APIs.
- Use TypeScript and follow the existing project conventions.
- Keep components reusable and avoid unnecessary complexity.
- Do not install dependencies unless they are necessary for an approved feature.
- Before implementing Supabase functionality, consult the current Supabase documentation/available project tooling rather than relying on outdated assumptions.

## Security and data access

- Never expose Supabase service-role/secret keys to client-side code.
- Use appropriate Supabase Row Level Security for user-data tables.
- Prefer database constraints and server-side authorization over frontend-only authorization checks.
- Do not commit `.env.local`, secrets, API keys, or credentials.

## Testing and completion

- Write tests for new application behavior using the repository's testing setup.
- Run lint, tests, and build after implementation and fix failures before declaring work complete.
