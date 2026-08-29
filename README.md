# Task & Project Management System

A production-oriented task/project management system for an organization: projects, tasks (with a
Kanban board), comments with @mentions, file attachments, dashboards, reports, notifications, and a
configurable role/permission system. Built with **NestJS + PostgreSQL** on the backend and
**Next.js (App Router) + React Query** on the frontend, per the SNEC Full Stack Developer technical
assessment.

## Contents

- [Tech stack](#tech-stack)
- [Quick start (Docker Compose)](#quick-start-docker-compose)
- [Local development (without Docker)](#local-development-without-docker)
- [Demo login](#demo-login)
- [Environment variables](#environment-variables)
- [API documentation](#api-documentation)
- [Testing](#testing)
- [Database migrations](#database-migrations)
- [Deliverables map](#deliverables-map)
- [Assumptions](#assumptions)
- [Known limitations](#known-limitations)

## Tech stack

| Layer | Choices |
|---|---|
| Backend | NestJS 10, TypeScript, TypeORM 0.3, PostgreSQL 13, Passport JWT, Swagger, Helmet, `@nestjs/throttler`, nodemailer (mock transport) |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, TanStack React Query, Zustand, React Hook Form + Zod, `@dnd-kit`, `next-themes` |
| Database | PostgreSQL, schema owned entirely by TypeORM migrations |
| DevOps | Docker, Docker Compose (frontend / backend / postgres) |
| Testing | Jest (backend unit + e2e against a real Postgres), Jest + React Testing Library (frontend) |

See [`docs/architecture.md`](docs/architecture.md) for a diagram and request-lifecycle walkthrough, and
[`docs/er-diagram.md`](docs/er-diagram.md) for the database schema.

## Quick start (Docker Compose)

Requires Docker + Docker Compose. This is the path a reviewer on a clean machine should use.

```bash
git clone <this-repo-url>
cd Task-Management-App
docker compose up --build
```

This builds and starts three containers:

- **postgres** — Postgres 13, healthchecked before the backend starts.
- **backend** — NestJS API on **http://localhost:5000**. Runs pending migrations automatically on
  boot, then seeds demo data ([see below](#demo-login)) the first time it finds an empty `user` table.
- **frontend** — Next.js app on **http://localhost:3000**.

Once all three are healthy, open **http://localhost:3000** and sign in with the pre-filled demo
credentials.

> The backend container uses `backend/.env.production` (already committed with local-only placeholder
> secrets — see [Environment variables](#environment-variables)). The frontend bakes
> `NEXT_PUBLIC_API_BASE_URL` in at build time from `frontend/.env.production`.

## Local development (without Docker)

Requires Node 18+ and a reachable Postgres (the `postgres` service from `docker-compose.yml` works
fine for this too: `docker compose up -d postgres`).

```bash
# Backend
cd backend
cp .env.example .env.development   # adjust DATABASE_* / JWT_* as needed
npm install
npm run start:dev                  # http://localhost:5000, runs migrations + seed automatically

# Frontend (separate terminal)
cd frontend
cp .env.example .env.development   # NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
npm install
npm run dev                        # http://localhost:3000
```

## Demo login

The backend seeds demo roles/users/projects/tasks the first time it boots against an empty database
(see `backend/src/database/seed.service.ts`). All seeded users share the same password.

| Email | Role |
|---|---|
| `aflahgraphy@gmail.com` | Project Manager (pre-filled on the login page) |
| `admin@example.com` | Admin |
| `sarah.khan@example.com`, `hisham.ali@example.com`, `ramees.p@example.com`, `navas.k@example.com` | Developer |
| `fathima.noor@example.com`, `layla.s@example.com` | Designer |
| `aneesha.f@example.com` | QA |
| `yusuf.rahman@example.com` | Super Admin |
| `zainab.kutty@example.com` | Team Lead |

**Password (all seeded users): `Demo@12345`**

## Environment variables

Each app has a committed `.env.example` documenting every variable
([`backend/.env.example`](backend/.env.example), [`frontend/.env.example`](frontend/.env.example)).
The `.env.development` / `.env.production` files used by `npm run start:dev`/`docker compose` are
gitignored placeholders with local-only secrets — replace `JWT_SECRET`, `JWT_REFRESH_SECRET`, and the
database password before deploying anywhere real.

Key backend variables: `DATABASE_*` (Postgres connection), `JWT_SECRET`/`JWT_EXPIRES_IN` (access
token, 15m default), `JWT_REFRESH_SECRET`/`JWT_REFRESH_EXPIRES_IN` (refresh token, 7d default),
`FRONTEND_URL` (CORS allow-origin), `MAX_UPLOAD_SIZE_BYTES` (file upload limit, 10MB default).

## API documentation

- **Interactive Swagger UI**: `http://localhost:5000/api/docs` once the backend is running.
- **Raw OpenAPI spec**: [`docs/openapi.json`](docs/openapi.json) (exported from a running instance;
  regenerate with `curl http://localhost:5000/api/docs-json > docs/openapi.json`).
- **Postman collection**: [`backend/postman_collection.json`](backend/postman_collection.json) —
  generated from the OpenAPI spec above, one folder per resource. Import it, then run **Auth → Log in
  with email and password** first — its test script captures the returned access/refresh tokens into
  collection variables (`accessToken`/`refreshToken`) that every other request's Bearer auth reads
  automatically. Public endpoints (login, refresh, forgot/reset password, health) are marked "No Auth"
  and don't need a token.

All routes are versioned under `/api/v1/...`; every response is wrapped as
`{ success, statusCode, data, timestamp }` (or `{ success: false, error, message, path, timestamp }`
for errors) by a global interceptor/exception filter.

## Testing

```bash
# Backend unit tests (mocked repositories, no DB needed)
cd backend && npm test

# Backend e2e/integration tests (needs a reachable Postgres — see below)
cd backend && npm run test:e2e

# Frontend unit/component/hook tests
cd frontend && npm test
```

`npm run test:e2e` reads `backend/.env.test` (copy `.env.example` and set `DATABASE_NAME` to something
disposable, e.g. `taskmanager_test`) and, on every run, **drops and recreates that database**, runs all
migrations, then lets the seed service populate it fresh — so e2e tests never depend on leftover state.
Point it at the `postgres` service from `docker-compose.yml` (`docker compose up -d postgres`) if you
don't have a local Postgres.

## Database migrations

Schema is owned entirely by TypeORM migrations (`backend/src/database/migrations`) — `synchronize` is
never used, in any environment. They run automatically on boot (`migrationsRun: true`), so normal
`docker compose up` / `npm run start:dev` needs no manual step. To manage them directly:

```bash
cd backend
npm run migration:run                                     # apply pending migrations
npm run migration:revert                                  # roll back the last one
npm run migration:generate -- src/database/migrations/<Name>   # after changing an entity
```

See [`db/README.md`](db/README.md) for more, and [`db/schema.sql`](db/schema.sql) for a plain-SQL
snapshot of the resulting schema.

## Deliverables map

| # | Deliverable | Location |
|---|---|---|
| 1 | Backend source code | [`backend/`](backend) |
| 2 | Frontend source code | [`frontend/`](frontend) |
| 3 | SQL / migration files | [`backend/src/database/migrations`](backend/src/database/migrations), [`db/schema.sql`](db/schema.sql) |
| 4 | README | this file |
| 5 | Postman collection | [`backend/postman_collection.json`](backend/postman_collection.json) |
| 6 | Docker configuration | [`docker-compose.yml`](docker-compose.yml), [`dockerfiles/`](dockerfiles) |
| 7 | Architecture diagram | [`docs/architecture.md`](docs/architecture.md) |
| 8 | ER diagram | [`docs/er-diagram.md`](docs/er-diagram.md) |
| 9 | API documentation | Swagger UI (`/api/docs`) + [`docs/openapi.json`](docs/openapi.json) |

## Assumptions

Documented here as they were made, per the assessment's request to record reasoned assumptions rather
than silently guess:

- **Profile Picture** = the existing `avatarUrl` field; no separate column was added.
- **@mentions** are captured as explicit `mentionedUserIds` chosen through the comment composer's
  `@`-autocomplete, not parsed from free text server-side — more robust than name-matching against
  arbitrary text, at the cost of requiring the frontend's mention picker specifically (a hand-typed
  `@Name` with no selection won't notify anyone).
- **Refresh tokens** are returned in the login/refresh response body and kept in `localStorage`
  alongside the access token, matching the existing (pre-existing, not introduced by this rework)
  pattern of also mirroring the access token into a cookie for `middleware.ts`. A stricter
  httpOnly-cookie-only refresh flow is more secure but would have required reworking that mechanism
  end-to-end; called out here rather than silently done partially.
- **"Filter users by status"** etc. use a real `status` enum column (`ACTIVE`/`INACTIVE`) rather than
  the previous boolean `isActive`, since the brief lists Status as its own field.
- **File soft-delete** removes the DB row from listings but intentionally leaves the physical file on
  disk (recoverable), rather than deleting bytes immediately — consistent with "soft delete" elsewhere,
  at the cost of uploads/ growing unbounded without a separate purge job.
- Bonus items (§17 of the brief) were treated as optional and not pursued as a block, except
  role-based **dynamic menu generation**, which fell out for free once permission-based UI gating was
  built (the sidebar now hides Users/Roles/Reports from roles lacking the matching permission).

## Known limitations

- **Dark mode** covers the shared app shell (layout, sidebar, topbar, cards, dropdowns, dashboard,
  tasks, settings) but hasn't been swept across every remaining page pixel-by-pixel; a few
  less-visited pages may show light-mode-only styling in dark mode.
- **Kanban drag-and-drop** (`dnd-kit`) was verified interactively — drag activation and column
  rendering both confirmed working — but couldn't be conclusively exercised end-to-end through
  automated browser tooling (synthetic pointer events don't fully replicate real pointer-capture
  semantics that `dnd-kit` relies on); the implementation follows `dnd-kit`'s documented reference
  pattern and was reviewed at the code level. Worth a manual click-through before relying on it in a
  demo.
- **File upload validation** allowlists common image/PDF/Office/text MIME types and enforces a 10MB
  default limit, but does not sniff file contents (a renamed file could claim an allowed MIME type).
- **Reports/dashboard aggregation queries** use per-row `count()`/`find()` calls rather than a single
  grouped SQL query in a few places (`reports.service.ts`, `dashboard.service.ts`) — fine at seed-data
  scale, worth revisiting for a much larger dataset.
- **Multer** is pinned to its current major version rather than upgraded to address known advisories,
  to avoid an unreviewed breaking change to the upload pipeline this late in the build; noted as a
  follow-up rather than silently left unmentioned.
- Bonus items not implemented: CQRS, event-driven architecture/queues, WebSocket notifications, a
  dedicated caching layer, infinite scroll, offline support, multi-tenancy, CI/CD pipeline, AI-assisted
  features. All are reasonable follow-ups, out of scope for this pass.

## Git history

Commits are feature-scoped (one module/concern per commit) rather than one large final commit, per the
brief's git practices section — see `git log` for the full progression.
