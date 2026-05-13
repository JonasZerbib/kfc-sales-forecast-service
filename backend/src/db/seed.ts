import { Pool } from 'pg';

import { createLogger } from '../config/logger';

const logger = createLogger('seed');

const STORES = [
  { name: 'KFC London',     location: 'London'     },
  { name: 'KFC Manchester', location: 'Manchester' },
  { name: 'KFC Birmingham', location: 'Birmingham' },
  { name: 'KFC Leeds',      location: 'Leeds'      },
  { name: 'KFC Glasgow',    location: 'Glasgow'    },
];

const PRODUCTS = [
  'Zinger Burger',
  'Original Recipe Chicken',
  'Fillet Tower Burger',
  'Hot Wings',
  'Coleslaw',
  'Fries',
  'Corn',
  'Pepsi',
];

const LOOKBACK_DAYS = 14;
const CHUNK_SIZE = 500;

function deterministicQuantity(si: number, pi: number, hour: number, dayOffset: number): number {
  return Math.round(10 + ((si * 7 + pi * 3 + hour * 2 + dayOffset * 5) % 41));
}

/**
 * Returns true if data was freshly seeded, false if already present.
 * The caller uses this signal to decide whether to generate historical forecasts.
 */
export async function seedDb(pool: Pool): Promise<boolean> {
  const { rows } = await pool.query<{ count: string }>('SELECT COUNT(*) AS count FROM stores');
  if (parseInt(rows[0].count, 10) > 0) {
    logger.info('Seed data already present, skipping');
    return false;
  }

  logger.info('Seeding database...');

  const storeIds: number[] = [];
  for (const store of STORES) {
    const result = await pool.query<{ id: number }>(
      'INSERT INTO stores (name, location) VALUES ($1, $2) RETURNING id',
      [store.name, store.location],
    );
    storeIds.push(result.rows[0].id);
  }

  const productIds: number[] = [];
  for (const name of PRODUCTS) {
    const result = await pool.query<{ id: number }>(
      'INSERT INTO products (name) VALUES ($1) RETURNING id',
      [name],
    );
    productIds.push(result.rows[0].id);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  type SaleRow = [number, number, string, number, number];
  const salesRows: SaleRow[] = [];

  for (let dayOffset = 1; dayOffset <= LOOKBACK_DAYS; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split('T')[0];

    for (let si = 0; si < storeIds.length; si++) {
      for (let pi = 0; pi < productIds.length; pi++) {
        for (let hour = 0; hour < 24; hour++) {
          salesRows.push([
            storeIds[si],
            productIds[pi],
            dateStr,
            hour,
            deterministicQuantity(si, pi, hour, dayOffset),
          ]);
        }
      }
    }
  }

  for (let i = 0; i < salesRows.length; i += CHUNK_SIZE) {
    const chunk = salesRows.slice(i, i + CHUNK_SIZE);
    const params: unknown[] = [];
    const placeholders = chunk.map((row, idx) => {
      const base = idx * 5;
      params.push(...row);
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
    });
    await pool.query(
      `INSERT INTO historical_sales (store_id, product_id, sale_date, sale_hour, quantity)
       VALUES ${placeholders.join(', ')}`,
      params,
    );
  }

  logger.info({ totalRows: salesRows.length }, 'Seed data inserted successfully');
  return true;
}
