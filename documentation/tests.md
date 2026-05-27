# Tests

Framework: **Vitest** — https://vitest.dev/api/

---

## Types of Tests

1. **Unit tests** (`backend/tests/`) — no external connections, all dependencies mocked.
2. **Integration tests** (`backend/integration-tests/`) — may connect to a real DB or spawn the server.

---

## File Structure

Mirror `src/` under `tests/`:

```
backend/
  src/
    services/forecast-service.ts
  tests/
    services/forecast-service.spec.ts
```

One `describe` block per spec file. File name: `<source-file>.spec.ts`.

---

## Running Tests

```bash
cd backend
npm test     # unit tests
```

---

## Test Structure

```typescript
import { describe, it, expect, beforeAll, vi } from 'vitest';

describe('ForecastService', () => {
  beforeAll(() => {
    // initialize once
  });

  it('should compute average from historical data', async () => {
    // Arrange
    const mockRepo = { getHistorical: vi.fn().mockResolvedValue([...]) };

    // Act
    const result = await service.generateForStore('store-1', new Date());

    // Assert
    expect(result).toHaveLength(24);
  });
});
```

---

## Mocking

Use `vi.fn()` to mock repository/service dependencies.

```typescript
const forecastRepo: IForecastRepository = {
  getAverageSales:            vi.fn().mockResolvedValue([]),
  upsertForecasts:            vi.fn().mockResolvedValue(undefined),
  getForecastsByStoreAndDate: vi.fn().mockResolvedValue([]),
};
```

Check call arguments:
```typescript
expect(forecastRepo.upsertForecasts).toHaveBeenCalledWith(
  expect.arrayContaining([
    expect.objectContaining({ storeId: 1 }),
  ])
);
```
