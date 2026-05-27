# Frontend Conventions

## Stack

| Layer            | Technology                  |
|------------------|-----------------------------|
| Framework        | React 18                    |
| Language         | TypeScript                  |
| Build tool       | Vite                        |
| State management | React hooks (`useState`, `useEffect`, `useContext`) |
| HTTP             | `fetch` (native browser API) |
| Styling          | Plain CSS (`App.css`)       |

---

## State Management

The jira ticket requires "known state management tools that fit the project's business requirements."

For this app, **React's built-in hooks are the correct choice**:

| Hook         | Role                                                      |
|--------------|-----------------------------------------------------------|
| `useState`   | Holds local component state (selected store, selected date, forecast data, loading flag, error) |
| `useEffect`  | Triggers API calls when selected store or date changes    |
| `useContext` | (if needed) shares state between components without prop drilling |

Redux, Zustand, or similar libraries are for large apps with many components sharing complex state. Using them here would be over-engineering.

---

## Folder Layout (`/frontend/src/`)

```
/components
  StoreSelector.tsx       dropdown to pick a store
  DatePicker.tsx          input to pick a forecast date
  ForecastTable.tsx       table displaying hourly predictions per product
/api
  stores.ts               fetchStores() — typed fetch wrapper
  forecasts.ts            fetchForecasts(storeId, date) — typed fetch wrapper
App.tsx                   root component, holds all state
App.css                   global styles
main.tsx                  React entry point (renders <App />)
```

---

## How Frontend Talks to Backend

The frontend never has direct DB access — it only calls the Express REST API.

```
Browser (React)
  └── fetch('/api/stores')                → Express GET /api/stores
  └── fetch('/api/forecasts?store=1&date=2024-01-15')  → Express GET /api/forecasts
```

In **development**, Vite's dev server proxies `/api/*` requests to the backend:

```typescript
// frontend/vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
```

This means in React you just write `fetch('/api/stores')` — no hardcoded ports or CORS configuration needed.

In **production**, Express serves the compiled frontend:

```typescript
// backend: after building frontend, Express serves dist/ as static files
app.use(express.static(path.join(__dirname, '../../frontend/dist')));
```

One Docker image, one port, frontend and backend together.

---

## Naming Conventions

Same kebab-case / PascalCase rules as the backend, with one addition:

| Thing             | Convention     | Example                    |
|-------------------|----------------|----------------------------|
| Component files   | `PascalCase.tsx` | `ForecastTable.tsx`      |
| Other files       | `kebab-case.ts`  | `forecast-api.ts`        |
| CSS Module files  | `PascalCase.module.css` | `ForecastTable.module.css` |
| Component functions | `PascalCase` | `function ForecastTable()` |
| Props interfaces  | `I<Name>Props` | `IForecastTableProps`    |

---

## Component Structure

Each component follows this pattern:

```typescript
// api/forecasts.ts — types co-located with the fetch function
export interface Forecast {
  id: number;
  storeId: number;
  productId: number;
  productName: string;
  forecastDate: string;
  saleHour: number;
  predictedQuantity: number;
  createdAt: string;
}

// components/ForecastTable.tsx
import type { Forecast } from '../api/forecasts';

interface ForecastTableProps {   // no "I" prefix on props interfaces
  forecasts: Forecast[];
  loading: boolean;
  error: string | null;
}

export function ForecastTable({ forecasts, loading, error }: ForecastTableProps): JSX.Element {
  if (loading) return <p className="status">Loading forecasts…</p>;
  // ...
}
```

---

## API Layer (`/api/`)

All `fetch` calls are centralized in `/api/` — no inline fetches in components.

```typescript
// api/stores.ts
export async function fetchStores(): Promise<Store[]> {
  const response = await fetch('/api/stores');
  if (!response.ok) throw new Error(`Failed to fetch stores: ${response.status}`);
  return response.json() as Promise<Store[]>;
}

// api/forecasts.ts
export async function fetchForecasts(storeId: number, date: string): Promise<Forecast[]> {
  const params = new URLSearchParams({ storeId: String(storeId), date });
  const response = await fetch(`/api/forecasts?${params.toString()}`);
  if (!response.ok) throw new Error(`Failed to fetch forecasts: ${response.status}`);
  return response.json() as Promise<Forecast[]>;
}
```

---

## Key Rules

- **No `any` types** — same rule as backend.
- **No direct `fetch` in components** — always go through `/api/` layer.
- **Types defined alongside fetch functions** in `/api/` — match the backend response shape exactly.
