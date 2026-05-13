# Getting Started

## Prerequisites

- [nvm](https://github.com/nvm-sh/nvm) — Node version manager
- [Docker + docker-compose](https://docs.docker.com/get-docker/)

---

## Running with Docker (recommended)

```bash
cp .env.example .env          # adjust values if needed
docker-compose up --build
```

The API will be available at `http://localhost:3000`.  
The DB is initialized automatically — no manual setup required.

---

## Running locally (without Docker)

### 1. Install Node

```bash
nvm install 22
nvm use 22
```

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env: set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
```

Start a local Postgres instance (Docker):

```bash
docker run --rm \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=kfc_forecast \
  -p 5432:5432 \
  postgres:16
```

### 4. Start in dev mode

```bash
npm run dev   # tsx watch mode — auto-restarts on file changes
```

---

## Environment Variables Reference

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

## Running the frontend in development

In a second terminal:

```bash
cd frontend
npm install
npm run dev      # Vite dev server at http://localhost:5173
```

Vite proxies `/api/*` to `http://localhost:3000` automatically — the backend must be running.

---

## Useful Commands

Backend — run from `backend/`:

```bash
npm run dev       # Start with hot reload (tsx watch)
npm run build     # Compile TypeScript → dist/
npm start         # Run compiled output (production)
npm test          # Run unit tests (Vitest)
```

Frontend — run from `frontend/`:

```bash
npm run dev       # Vite dev server (http://localhost:5173)
npm run build     # Production build → frontend/dist/
```

Root workspace — run from project root:

```bash
npm run dev:backend    # Same as cd backend && npm run dev
npm run dev:frontend   # Same as cd frontend && npm run dev
npm test               # Run backend unit tests
```
