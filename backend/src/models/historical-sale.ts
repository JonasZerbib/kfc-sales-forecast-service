export interface HistoricalSale {
  id: number;
  storeId: number;
  productId: number;
  saleDate: Date;
  saleHour: number;
  quantity: number;
}

export interface AverageSale {
  productId: number;
  saleHour: number;
  avgQuantity: number;
}
