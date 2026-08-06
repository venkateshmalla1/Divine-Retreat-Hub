# Vizag Divine Retreat Centre

An inviting retreat-centre platform for discovering spiritual retreats, registering for programs, sharing prayer requests, supporting the centre, and coordinating participant and staff operations.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/vizag-divine-retreat-centre/src/App.tsx` — public, participant, and staff routes
- `artifacts/vizag-divine-retreat-centre/src/index.css` — shared coastal editorial visual system
- `lib/api-spec/openapi.yaml` — source of truth for retreat-centre API contracts
- `artifacts/api-server/src/routes/retreatCentre.ts` — retreat-centre API handlers
- `artifacts/api-server/src/lib/retreatCentreStore.ts` — seeded persistent MVP record store
- `lib/db/src/schema/retreatCentreRecords.ts` — database schema for persistent records

## Architecture decisions

- The MVP uses a single typed records table for the retreat-centre domain so new centre modules can evolve without an early migration maze.
- The OpenAPI contract is generated into shared React Query and Zod clients; frontend and backend use the same schemas.
- Public, participant, and staff workspaces share the same visual language but use distinct navigation and density.
- Seeded records keep the first experience populated while all create and update flows persist to PostgreSQL.

## Product

The MVP includes public retreat discovery and registration, prayer requests, donations, gallery and events, a participant dashboard with accommodation and certificates, and a staff workspace for retreats, registrations, prayers, donations, announcements, and summary metrics.

## User preferences

No explicit user preferences recorded.

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after OpenAPI changes.
- Run Vite builds with workflow-provided `PORT` and `BASE_PATH`; the app config intentionally rejects bare shell builds without them.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
