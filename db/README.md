# Database

The schema is owned by TypeORM migrations, not by anything in this folder — see
[`backend/src/database/migrations`](../backend/src/database/migrations). Every environment (dev, docker-compose,
production) runs pending migrations automatically on boot (`migrationsRun: true` in
[`backend/src/database/data-source.ts`](../backend/src/database/data-source.ts)); `synchronize` is never used.

## `schema.sql`

A schema-only `pg_dump` snapshot of the database **after** all current migrations have run, kept here purely
for quick reference/review (e.g. skimming the full table/index/constraint list without reading migration
diffs). It is not applied by anything — regenerate it after adding a migration with:

```bash
docker exec task_postgres pg_dump -U taskmanager -d taskmanager --schema-only --no-owner --no-privileges > db/schema.sql
```

## Working with migrations

Run these from `backend/`, against a reachable Postgres (e.g. `docker compose up -d postgres`):

```bash
npm run migration:run       # apply pending migrations
npm run migration:revert    # roll back the last migration
npm run migration:generate -- src/database/migrations/<Name>   # after changing an entity
```

## Seed data

Demo roles/users/projects/tasks are inserted by `SeedService` (`backend/src/database/seed.service.ts`) the
first time the app boots against an empty `user` table — not by a SQL script. See the root `README.md` for
the demo login.
