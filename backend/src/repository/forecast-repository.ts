import { Pool } from 'pg';

import { AverageSale } from '../models/historical-sale';
import { Forecast, ForecastRow } from '../models/forecast';
import { IForecastRepository } from './i-forecast-repository';

export class ForecastRepository implements IForecastRepository {
  constructor(private readonly pool: Pool) {}

  async getAverageSales(storeId: number, fromDate: Date, toDate: Date): Promise<AverageSale[]> {
    const result = await this.pool.query<{
      product_id: number;
      sale_hour: number;
      avg_quantity: string;
    }>(
      `SELECT product_id, sale_hour, AVG(quantity) AS avg_quantity
       FROM historical_sales
       WHERE store_id = $1 AND sale_date >= $2 AND sale_date < $3
       GROUP BY product_id, sale_hour`,
      [storeId, fromDate, toDate],
    );
    return result.rows.map(row => ({
      productId: row.product_id,
      saleHour: row.sale_hour,
      avgQuantity: parseFloat(row.avg_quantity),
    }));
  }

  async upsertForecasts(rows: ForecastRow[]): Promise<void> {
    if (rows.length === 0) return;

    const values: unknown[] = [];
    const placeholders = rows.map((row, i) => {
      const base = i * 5;
      values.push(row.storeId, row.productId, row.forecastDate, row.saleHour, row.predictedQuantity);
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
    });

    await this.pool.query(
      `INSERT INTO forecasts (store_id, product_id, forecast_date, sale_hour, predicted_quantity)
       VALUES ${placeholders.join(', ')}
       ON CONFLICT ON CONSTRAINT forecasts_unique
       DO UPDATE SET predicted_quantity = EXCLUDED.predicted_quantity, created_at = NOW()`,
      values,
    );
  }

  async getForecastsByStoreAndDate(storeId: number, forecastDate: string): Promise<Forecast[]> {
    const result = await this.pool.query<{
      id: number;
      store_id: number;
      product_id: number;
      product_name: string;
      forecast_date: string;
      sale_hour: number;
      predicted_quantity: string;
      created_at: Date;
    }>(
      `SELECT f.id, f.store_id, f.product_id, p.name AS product_name,
              f.forecast_date, f.sale_hour, f.predicted_quantity, f.created_at
       FROM forecasts f
       JOIN products p ON p.id = f.product_id
       WHERE f.store_id = $1 AND f.forecast_date = $2
       ORDER BY f.sale_hour, p.name`,
      [storeId, forecastDate],
    );
    return result.rows.map(row => ({
      id: row.id,
      storeId: row.store_id,
      productId: row.product_id,
      productName: row.product_name,
      forecastDate: row.forecast_date,
      saleHour: row.sale_hour,
      predictedQuantity: parseFloat(row.predicted_quantity),
      createdAt: row.created_at,
    }));
  }
}
