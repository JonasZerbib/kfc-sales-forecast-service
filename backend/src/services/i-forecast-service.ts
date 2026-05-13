import { Forecast } from '../models/forecast';

export interface IForecastService {
  generateForDate(forecastDate: Date): Promise<void>;
  getForecastsByStoreAndDate(storeId: number, forecastDate: string): Promise<Forecast[]>;
}
