# KFC Sales Forecast Service

## Project Overview

Full-stack service that generates daily sales forecasts for KFC stores.
- **Goal**: Predict hourly sales per product per store for the next day, using a 14-day rolling average.
- **Ticket**: `jira-ticket.md`

---

## Repository Layout

```
/backend            TypeScript REST API + scheduler
/frontend           UI (store selector + date picker + forecast table)
/deployments        Docker / docker-compose files
/documentation      Conventions and guides
.env.example        All configurable parameters (copy to .env)
```

### Backend Layout (`/backend/src/`)

```
/api
  /routes           Express route definitions
  /controllers      Request handling, input validation, response shaping
/services           Business logic (forecast generation, store management)
/repository         All DB queries (parameterized — no raw string concat)
/scheduler          node-cron job (runs daily forecast generation)
/models             TypeScript interfaces and types (no classes)
/db                 DB connection pool + schema init (runs on startup)
/config             Typed config loader from environment variables
```

---

## Stack

| Layer              | Technology                        |
|--------------------|-----------------------------------|
| Runtime            | Node 22, TypeScript 5.x           |
| Backend framework  | Express 4.x                       |
| Database           | PostgreSQL 16 (`pg`)              |
| Scheduler          | `node-cron`                       |
| Validation         | `zod`                             |
| Logging            | `console.log` via thin logger wrapper |
| Testing            | Vitest                            |
| Container          | Docker + docker-compose           |
| Frontend framework | React 18 + TypeScript             |
| Frontend build     | Vite                              |
| State management   | React built-in hooks (`useState`, `useEffect`, `useContext`) |

---

## Key Rules

- **No `any` types** — use explicit types or `unknown` with a type guard.
- **Explicit return types** on all exported functions.
- **Use the logger** in `src/config/logger.ts` for all output — not raw `console.log` scattered across the codebase.
- **No raw SQL string concatenation** — always use parameterized queries (`$1, $2, ...`).
- **All user input validated** with `zod` before reaching service or repository layer.
- **No hardcoded credentials or secrets** — all config from `.env` via the config module.
- **No disabling TLS verification** in any HTTP client.

---

## Naming Conventions

See `documentation/code-conventions.md` for the full reference. Quick summary:

| Thing                      | Convention              | Example                        |
|----------------------------|-------------------------|--------------------------------|
| Files                      | `kebab-case.ts`         | `forecast-service.ts`          |
| Service interface files    | `i-kebab-case.ts`       | `i-forecast-service.ts`        |
| Classes / Interfaces / Enums | `PascalCase`          | `ForecastService`, `IForecastService` |
| Interfaces                 | prefix with `I`         | `IForecastRepository`          |
| Simple value constants     | `UPPER_SNAKE_CASE`      | `MAX_LOOKBACK_DAYS`            |
| Variables / params / functions | `camelCase`         | `generateForecast()`           |
| DB columns                 | `snake_case`            |                                |

---

## Configuration

All tuneable parameters live in `.env` (copy from `.env.example`):

```
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
FORECAST_CRON_SCHEDULE   # cron expression, default: "0 2 * * *"
LOOKBACK_DAYS            # 1–14, default: 14
PORT                     # HTTP port, default: 3000
RUN_FORECAST_ON_STARTUP  # true | false
```

The `src/config/` module loads and validates these at startup; the rest of the code imports the typed config object — never `process.env` directly.

| Variable                | Default           | Description                              |
|-------------------------|-------------------|------------------------------------------|
| `PORT`                  | `3000`            | HTTP port                                |
| `DB_HOST`               | `localhost`       | Postgres host                            |
| `DB_PORT`               | `5432`            | Postgres port                            |
| `DB_USER`               | `admin`           | Postgres user                            |
| `DB_PASSWORD`           | —                 | Postgres password (**required**)         |
| `DB_NAME`               | `kfc_forecast`    | Database name                            |
| `FORECAST_CRON_SCHEDULE`| `0 2 * * *`       | Cron expression for daily forecast run   |
| `LOOKBACK_DAYS`         | `14`              | Days of history used for AVG calculation |
| `RUN_FORECAST_ON_STARTUP`| `true`           | Generate forecasts immediately on startup |

---

## Database

- Schema is initialized automatically on container startup via `src/db/init.sql`.
- No migration tool needed for this project (single schema file).
- All queries in `repository/` use the `pg` pool with `$1`-style parameters.

### Core Tables

```sql
stores        (id, name, location)
products      (id, name)
historical_sales (store_id, product_id, sale_date, sale_hour, quantity)
forecasts     (id, store_id, product_id, forecast_date, sale_hour, predicted_quantity, created_at)
```

---

## Testing

- Framework: **Vitest**
- Unit tests in `backend/tests/` mirroring `src/` structure.
- File naming: `<source-file>.spec.ts`
- No external connections in unit tests — mock repository/service dependencies with `vi.fn()`.
- Run: `npm test` from `backend/`

See `documentation/tests.md` for patterns and examples.

---

## Docker

```bash
# From project root — build and start everything (API + DB)
docker-compose up --build

# The DB initializes automatically; no manual setup needed.
```

`docker-compose.yml` and `Dockerfile` both live at the project root (next to `.env`) so variable interpolation works without extra flags and the build requires no extra path arguments.

---

## Frontend

See `documentation/frontend-conventions.md` for the full reference.

- React 18 + TypeScript, built with Vite.
- State management: **React hooks only** (`useState`, `useEffect`, `useContext`). No Redux or external state library — the app has 3 components and simple local state. The jira requirement of "known state management tools" is satisfied by React's built-in model.
- Communicates with the backend exclusively via the REST API (JSON over HTTP).
- In development: Vite proxy forwards `/api/*` to Express (`localhost:3000`) — no CORS issues.
- In production: Express serves the compiled Vite output as static files from `frontend/dist/`.

---

## Development Setup

See `documentation/getting-started.md`.

Quick start (without Docker) — two terminals:
```bash
# Terminal 1 — backend
cd backend && npm install && npm run dev

# Terminal 2 — frontend
cd frontend && npm install && npm run dev
```

Copy and fill `.env` before starting:
```bash
cp .env.example .env
```

### Root workspace scripts

```bash
npm run dev:backend    # backend tsx watch
npm run dev:frontend   # frontend Vite dev server
npm test               # backend unit tests
npm run build          # compile backend + build frontend
```
