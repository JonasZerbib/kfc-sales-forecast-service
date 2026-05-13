import { Forecast, ForecastRow } from '../models/forecast';
import { Config } from '../config/config';
import { createLogger } from '../config/logger';

const logger = createLogger('ForecastService');
import { IForecastRepository } from '../repository/i-forecast-repository';
import { IStoreRepository } from '../repository/i-store-repository';
import { IForecastService } from './i-forecast-service';

export class ForecastService implements IForecastService {
  constructor(
    private readonly forecastRepository: IForecastRepository,
    private readonly storeRepository: IStoreRepository,
    private readonly config: Config,
  ) {}

  async getForecastsByStoreAndDate(storeId: number, forecastDate: string): Promise<Forecast[]> {
    return this.forecastRepository.getForecastsByStoreAndDate(storeId, forecastDate);
  }

  async generateForDate(forecastDate: Date): Promise<void> {
    const stores = await this.storeRepository.findAll();
    logger.info({ forecastDate, storeCount: stores.length }, 'Starting forecast generation');

    // All stores are independent — run in parallel
    await Promise.all(stores.map(store => this.generateForStore(store.id, forecastDate)));

    logger.info({ forecastDate }, 'Forecast generation complete');
  }

  private async generateForStore(storeId: number, forecastDate: Date): Promise<void> {
    const toDate = new Date(forecastDate);
    const fromDate = new Date(forecastDate);
    fromDate.setDate(fromDate.getDate() - this.config.lookbackDays);

    const averages = await this.forecastRepository.getAverageSales(storeId, fromDate, toDate);

    if (averages.length === 0) {
      logger.warn({ storeId }, 'No historical data found for store, skipping forecast');
      return;
    }

    const forecastDateStr = forecastDate.toISOString().split('T')[0];

    const rows: ForecastRow[] = averages.map(avg => ({
      storeId,
      productId: avg.productId,
      forecastDate: forecastDateStr,
      saleHour: avg.saleHour,
      predictedQuantity: Math.round(avg.avgQuantity * 100) / 100,
    }));

    await this.forecastRepository.upsertForecasts(rows);
    logger.info({ storeId, rowCount: rows.length }, 'Forecast upserted for store');
  }
}
