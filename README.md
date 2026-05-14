# KFC Sales Forecast Service

A full-stack service that predicts hourly sales per product per store for KFC restaurants, using a 14-day rolling average. Includes a REST API, a daily scheduler, and a React UI.

---

## Getting Started

**Prerequisites:** Docker and Docker Compose installed.

```bash
# 1. Clone the repository
git clone https://github.com/JonasZerbib/kfc-sales-forecast-service.git
cd kfc-sales-forecast-service

# 2. Create your environment file
cp .env.example .env
```

Open `.env` and set a value for `DB_PASSWORD` (any string works locally, e.g. `secret`).

```bash
# 3. Build and start everything (API + database)
docker-compose up --build
```

On first startup the database is seeded automatically with mock historical data and forecasts are generated for the past 14 days. No manual setup required.

```
http://localhost:3000
```

Select a store and a date — the forecast table populates instantly.

> To stop: `Ctrl+C`
> To wipe the database and start fresh: `docker-compose down -v && docker-compose up --build`

---

## Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Backend     | Node 22, TypeScript, Express 4.x    |
| Database    | PostgreSQL 16 (`pg`, no ORM)        |
| Scheduler   | `node-cron`                         |
| Frontend    | React 18, TypeScript, Vite          |
| Tests       | Vitest                              |
| Container   | Docker + Docker Compose             |

---

## Implementation — Phase by Phase

| Phase | Deliverable |
|-------|-------------|
| 1 | Project scaffold, typed config (`zod`), DB connection pool, `/health` endpoint, Docker setup |
| 2 | DB schema (`init.sql`), repository layer, deterministic seed data (13 440 rows) |
| 3 | Forecast service (AVG algorithm), `node-cron` scheduler, unit tests |
| 4 | REST API — `GET /api/stores` and `GET /api/forecasts`, `zod` input validation |
| 5 | React frontend — store selector, date picker, forecast table |
| 6 | Historical forecast generation on fresh seed, 3-stage Docker build, full verification |

---

## Key Design Decisions

**No ORM — direct SQL with `pg`.**
Four simple tables, straightforward queries. An ORM (TypeORM, Prisma) would add entity classes, migrations, and decorators for zero practical gain at this scale. All queries use `$1`-style parameterized values.

**960 DB queries → 5, in parallel.**
The naive approach (store × product × hour) generates 960 sequential queries per forecast run. Pushing the `AVG` calculation to SQL with `GROUP BY product_id, sale_hour` reduces this to one query per store. Running all stores concurrently via `Promise.all` brings the total to 5 parallel queries.

**Manual dependency injection — no DI framework.**
The dependency graph is flat and predictable: `pool → repositories → services → controllers`, wired in ~20 lines in `index.ts`. InversifyJS or tsyringe would add decorators, `reflect-metadata`, and configuration for no practical gain. Interfaces (`IForecastService`, `IForecastRepository`) are still defined so unit tests inject mocks freely.

**Single Docker image — Express serves the compiled React frontend.**
The Dockerfile has three stages: build backend, build frontend, combine into a lean runtime image. No separate frontend container, no CORS configuration, one port (`3000`).

**React built-in hooks only — no Redux.**
The app has three components sharing simple local state. `useState` and `useEffect` are the correct tool at this scale. Redux or Zustand are for applications with many components sharing complex, deeply nested state.
