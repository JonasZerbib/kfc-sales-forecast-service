import { AverageSale } from '../models/historical-sale';
import { Forecast, ForecastRow } from '../models/forecast';

export interface IForecastRepository {
  getAverageSales(storeId: number, fromDate: Date, toDate: Date): Promise<AverageSale[]>;
  upsertForecasts(rows: ForecastRow[]): Promise<void>;
  getForecastsByStoreAndDate(storeId: number, forecastDate: string): Promise<Forecast[]>;
}
