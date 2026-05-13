export interface Forecast {
  id: number;
  storeId: number;
  productId: number;
  productName: string;
  forecastDate: string;
  saleHour: number;
  predictedQuantity: number;
  createdAt: Date;
}

export interface ForecastRow {
  storeId: number;
  productId: number;
  forecastDate: string;
  saleHour: number;
  predictedQuantity: number;
}
