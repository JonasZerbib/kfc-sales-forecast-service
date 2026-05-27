# Code Conventions

## Naming

1. **Files**: `kebab-case.ts`
   - `forecast-service.ts`, `store-repository.ts`
2. **Service interface files**: `i-kebab-case.ts`
   - `i-forecast-service.ts`
   - Model/DTO interfaces do **not** need the `i-` prefix on the filename
3. **Classes, Interfaces, Enums**: `PascalCase`
   - `class ForecastService {}`
   - `interface IForecastService {}`
   - `enum StoreStatus {}`
   - Interfaces are **always** prefixed with `I`
4. **Simple value constants**: `UPPER_SNAKE_CASE`
   - `const MAX_LOOKBACK_DAYS = 14;`
5. **Everything else** (variables, params, functions): `camelCase`
   - `const generatedAt = new Date();`
   - `function generateForecast(storeId: string): Promise<Forecast[]> {}`
6. **DB columns**: `snake_case`
   - `forecast_date`, `store_id`, `predicted_quantity`

---

## Imports (order within a file)

```typescript
// 1. Node built-ins
import path from 'node:path';

// 2. External packages (alphabetical)
import express from 'express';
import { z } from 'zod';

// 3. In-project imports (alphabetical)
import { createLogger } from '../config/logger';
import { pool } from '../db/pool';

const logger = createLogger('my-module');
```

---

## TypeScript

- **No `any`** — use `unknown` + type guard, or define a proper type.
- **Explicit return types** on all exported functions and class methods.
- **Explicit member accessibility** (`public` / `private` / `protected`) on class members.
- Enable `strict: true` in `tsconfig.json`.

```typescript
// Bad
export async function getForecasts(storeId: any) { ... }

// Good
export async function getForecasts(storeId: string): Promise<Forecast[]> { ... }
```

---

## Services and Interfaces

Every service class must implement a corresponding interface stored in `i-<service-name>.ts`.  
Consumers depend on the interface, not the implementation — this makes unit testing straightforward.

```typescript
// i-forecast-service.ts
export interface IForecastService {
  generateForStore(storeId: string, forecastDate: Date): Promise<void>;
}

// forecast-service.ts
export class ForecastService implements IForecastService {
  async generateForStore(storeId: string, forecastDate: Date): Promise<void> { ... }
}
```

---

## Repository Layer

- All DB access goes through `repository/` — no SQL in services or controllers.
- Always use parameterized queries:

```typescript
// Bad
await pool.query(`SELECT * FROM forecasts WHERE store_id = '${storeId}'`);

// Good
await pool.query('SELECT * FROM forecasts WHERE store_id = $1', [storeId]);
```

---

## Validation

Validate all incoming HTTP request data with `zod` in the controller **before** calling any service:

```typescript
const schema = z.object({
  storeId: z.coerce.number().int().positive(), // query params are strings — coerce converts "1" → 1
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const parsed = schema.safeParse(req.query);
if (!parsed.success) {
  return res.status(400).json({ error: parsed.error.flatten() });
}
```

---

## Logging

Use the `logger` from `src/config/logger.ts` — a thin wrapper over `console.log/warn/error` that adds a consistent `[INFO]`/`[WARN]`/`[ERROR]` prefix. Do not scatter raw `console.log` calls across the codebase.

```typescript
import { createLogger } from '../config/logger';

const logger = createLogger('ForecastService');

logger.info({ storeId }, 'Forecast generation started');
logger.error({ err }, 'Failed to generate forecast');
```

For a heavier production service with log aggregation (Datadog, Grafana Loki, etc.), replace this wrapper with `pino` — the call sites remain identical.

---

## Error Handling

- Services throw typed errors; controllers catch and map to HTTP status codes.
- Never leak internal error messages or stack traces to API responses.

---

## Comments

Write comments only when the **why** is non-obvious. Do not describe what the code does.

```typescript
// Bad: generates a forecast for the store
// Good: AVG is computed over at most LOOKBACK_DAYS; if fewer days exist, use what's available
```

---

## `package.json` scripts (backend)

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc --build && mkdir -p dist/db && cp src/db/init.sql dist/db/",
    "start": "node dist/index.js",
    "test": "vitest run"
  }
}
```
