import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ForecastService } from '../../src/services/forecast-service';
import type { IForecastRepository } from '../../src/repository/i-forecast-repository';
import type { IStoreRepository } from '../../src/repository/i-store-repository';
import type { Config } from '../../src/config/config';
import type { AverageSale } from '../../src/models/historical-sale';
import type { ForecastRow } from '../../src/models/forecast';
import type { Store } from '../../src/models/store';

const MOCK_CONFIG = { lookbackDays: 14 } as unknown as Config;

const MOCK_STORES: Store[] = [
  { id: 1, name: 'KFC London', location: 'London' },
];

const MOCK_AVERAGES: AverageSale[] = [
  { productId: 1, saleHour: 0,  avgQuantity: 15.5 },
  { productId: 1, saleHour: 1,  avgQuantity: 8.0  },
  { productId: 2, saleHour: 0,  avgQuantity: 22.3 },
];

// Midnight UTC so toISOString().split('T')[0] is always '2026-05-13'
const FORECAST_DATE = new Date('2026-05-13T00:00:00.000Z');

describe('ForecastService', () => {
  let getAverageSalesMock: ReturnType<typeof vi.fn>;
  let upsertForecastsMock: ReturnType<typeof vi.fn>;
  let findAllMock: ReturnType<typeof vi.fn>;
  let forecastRepo: IForecastRepository;
  let storeRepo: IStoreRepository;
  let service: ForecastService;

  beforeEach(() => {
    getAverageSalesMock = vi.fn().mockResolvedValue(MOCK_AVERAGES);
    upsertForecastsMock  = vi.fn().mockResolvedValue(undefined);
    findAllMock          = vi.fn().mockResolvedValue(MOCK_STORES);

    forecastRepo = {
      getAverageSales:            getAverageSalesMock,
      upsertForecasts:            upsertForecastsMock,
      getForecastsByStoreAndDate: vi.fn().mockResolvedValue([]),
    } as IForecastRepository;

    storeRepo = {
      findAll: findAllMock,
    } as IStoreRepository;

    service = new ForecastService(forecastRepo, storeRepo, MOCK_CONFIG);
  });

  it('should query average sales once per store', async () => {
    await service.generateForDate(FORECAST_DATE);

    expect(getAverageSalesMock).toHaveBeenCalledTimes(1);
    expect(getAverageSalesMock).toHaveBeenCalledWith(1, expect.any(Date), expect.any(Date));
  });

  it('should upsert exactly as many rows as returned averages', async () => {
    await service.generateForDate(FORECAST_DATE);

    expect(upsertForecastsMock).toHaveBeenCalledTimes(1);
    const [rows] = upsertForecastsMock.mock.calls[0] as [ForecastRow[]];
    expect(rows).toHaveLength(MOCK_AVERAGES.length);
  });

  it('should set correct forecastDate and storeId on every row', async () => {
    await service.generateForDate(FORECAST_DATE);

    const [rows] = upsertForecastsMock.mock.calls[0] as [ForecastRow[]];
    for (const row of rows) {
      expect(row.forecastDate).toBe('2026-05-13');
      expect(row.storeId).toBe(1);
    }
  });

  it('should skip upsert when no historical data exists for a store', async () => {
    getAverageSalesMock.mockResolvedValue([]);
    await service.generateForDate(FORECAST_DATE);

    expect(upsertForecastsMock).not.toHaveBeenCalled();
  });

  it('should process all stores in parallel', async () => {
    const THREE_STORES: Store[] = [
      { id: 1, name: 'KFC London',     location: 'London'     },
      { id: 2, name: 'KFC Manchester', location: 'Manchester' },
      { id: 3, name: 'KFC Birmingham', location: 'Birmingham' },
    ];
    findAllMock.mockResolvedValue(THREE_STORES);

    await service.generateForDate(FORECAST_DATE);

    expect(getAverageSalesMock).toHaveBeenCalledTimes(3);
    expect(upsertForecastsMock).toHaveBeenCalledTimes(3);
  });

  it('should pass the correct lookback date range to the repository', async () => {
    await service.generateForDate(FORECAST_DATE);

    const [, fromDate, toDate] = getAverageSalesMock.mock.calls[0] as [number, Date, Date];

    const expectedFromDate = new Date(FORECAST_DATE);
    expectedFromDate.setDate(expectedFromDate.getDate() - 14);

    expect(fromDate).toEqual(expectedFromDate);
    expect(toDate).toEqual(FORECAST_DATE);
  });
});
