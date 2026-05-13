import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Pool, QueryResult } from 'pg';

import { ForecastRepository } from '../../src/repository/forecast-repository';
import type { ForecastRow } from '../../src/models/forecast';

// ── Mock pool factory ────────────────────────────────────────────────────────

function makePool(rows: unknown[] = []): Pool {
  return {
    query: vi.fn().mockResolvedValue({ rows } as unknown as QueryResult),
  } as unknown as Pool;
}

// ── getAverageSales ──────────────────────────────────────────────────────────

describe('ForecastRepository.getAverageSales', () => {
  it('passes correct SQL and parameters to the pool', async () => {
    const pool = makePool([]);
    const repo = new ForecastRepository(pool);

    const from = new Date('2026-04-29T00:00:00.000Z');
    const to   = new Date('2026-05-13T00:00:00.000Z');

    await repo.getAverageSales(1, from, to);

    const [sql, params] = (pool.query as ReturnType<typeof vi.fn>).mock.calls[0] as [string, unknown[]];

    expect(sql).toMatch(/AVG\(quantity\)/i);
    expect(sql).toMatch(/GROUP BY product_id, sale_hour/i);
    expect(params).toEqual([1, from, to]);
  });

  it('maps snake_case DB columns to camelCase model fields', async () => {
    const pool = makePool([
      { product_id: 3, sale_hour: 12, avg_quantity: '25.5' },
    ]);
    const repo   = new ForecastRepository(pool);
    const result = await repo.getAverageSales(1, new Date(), new Date());

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ productId: 3, saleHour: 12, avgQuantity: 25.5 });
  });

  it('parses avg_quantity as a float (pg returns numeric as string)', async () => {
    const pool = makePool([
      { product_id: 1, sale_hour: 0, avg_quantity: '14.285714' },
    ]);
    const repo   = new ForecastRepository(pool);
    const result = await repo.getAverageSales(1, new Date(), new Date());

    expect(typeof result[0].avgQuantity).toBe('number');
    expect(result[0].avgQuantity).toBeCloseTo(14.285714);
  });

  it('returns an empty array when there is no historical data', async () => {
    const pool   = makePool([]);
    const repo   = new ForecastRepository(pool);
    const result = await repo.getAverageSales(99, new Date(), new Date());

    expect(result).toEqual([]);
  });
});

// ── upsertForecasts ──────────────────────────────────────────────────────────

describe('ForecastRepository.upsertForecasts', () => {
  it('does not call the pool when given an empty array', async () => {
    const pool = makePool();
    const repo = new ForecastRepository(pool);

    await repo.upsertForecasts([]);

    expect(pool.query).not.toHaveBeenCalled();
  });

  it('builds one INSERT statement with the correct number of placeholders', async () => {
    const pool = makePool();
    const repo = new ForecastRepository(pool);

    const rows: ForecastRow[] = [
      { storeId: 1, productId: 1, forecastDate: '2026-05-13', saleHour: 0,  predictedQuantity: 20 },
      { storeId: 1, productId: 1, forecastDate: '2026-05-13', saleHour: 1,  predictedQuantity: 15 },
    ];

    await repo.upsertForecasts(rows);

    expect(pool.query).toHaveBeenCalledTimes(1);

    const [sql, params] = (pool.query as ReturnType<typeof vi.fn>).mock.calls[0] as [string, unknown[]];

    // 2 rows × 5 columns = 10 params
    expect(params).toHaveLength(10);
    expect(sql).toMatch(/ON CONFLICT ON CONSTRAINT forecasts_unique/i);
    expect(sql).toMatch(/DO UPDATE SET predicted_quantity/i);
  });

  it('passes the correct param values to the pool', async () => {
    const pool = makePool();
    const repo = new ForecastRepository(pool);

    const row: ForecastRow = {
      storeId: 2, productId: 5, forecastDate: '2026-05-14', saleHour: 8, predictedQuantity: 42,
    };

    await repo.upsertForecasts([row]);

    const [, params] = (pool.query as ReturnType<typeof vi.fn>).mock.calls[0] as [string, unknown[]];

    expect(params).toEqual([2, 5, '2026-05-14', 8, 42]);
  });
});

// ── getForecastsByStoreAndDate ───────────────────────────────────────────────

describe('ForecastRepository.getForecastsByStoreAndDate', () => {
  it('passes correct storeId and date parameters', async () => {
    const pool = makePool([]);
    const repo = new ForecastRepository(pool);

    await repo.getForecastsByStoreAndDate(3, '2026-05-14');

    const [, params] = (pool.query as ReturnType<typeof vi.fn>).mock.calls[0] as [string, unknown[]];
    expect(params).toEqual([3, '2026-05-14']);
  });

  it('maps DB row columns to the Forecast model', async () => {
    const createdAt = new Date('2026-05-13T02:00:00Z');
    const pool = makePool([{
      id: 7, store_id: 1, product_id: 2, product_name: 'Zinger Burger',
      forecast_date: '2026-05-14', sale_hour: 10, predicted_quantity: '31.5', created_at: createdAt,
    }]);
    const repo   = new ForecastRepository(pool);
    const result = await repo.getForecastsByStoreAndDate(1, '2026-05-14');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 7, storeId: 1, productId: 2, productName: 'Zinger Burger',
      forecastDate: '2026-05-14', saleHour: 10, predictedQuantity: 31.5, createdAt,
    });
  });

  it('includes a JOIN with the products table for product names', async () => {
    const pool = makePool([]);
    const repo = new ForecastRepository(pool);

    await repo.getForecastsByStoreAndDate(1, '2026-05-14');

    const [sql] = (pool.query as ReturnType<typeof vi.fn>).mock.calls[0] as [string];
    expect(sql).toMatch(/JOIN products/i);
  });
});
