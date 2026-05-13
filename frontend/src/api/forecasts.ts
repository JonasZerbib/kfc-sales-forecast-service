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

export async function fetchForecasts(storeId: number, date: string): Promise<Forecast[]> {
  const params   = new URLSearchParams({ storeId: String(storeId), date });
  const response = await fetch(`/api/forecasts?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch forecasts: ${response.status}`);
  }
  return response.json() as Promise<Forecast[]>;
}
