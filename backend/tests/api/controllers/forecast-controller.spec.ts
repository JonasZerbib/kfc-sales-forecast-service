import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';

import { ForecastController } from '../../../src/api/controllers/forecast-controller';
import type { IForecastService } from '../../../src/services/i-forecast-service';
import type { Forecast } from '../../../src/models/forecast';

const MOCK_FORECASTS: Forecast[] = [
  {
    id: 1,
    storeId: 1,
    productId: 2,
    productName: 'Zinger Burger',
    forecastDate: '2026-05-14',
    saleHour: 12,
    predictedQuantity: 30,
    createdAt: new Date('2026-05-13T02:00:00Z'),
  },
];

function makeReq(query: Record<string, unknown>): Request {
  return { query } as unknown as Request;
}

function makeRes(): { res: Response; json: ReturnType<typeof vi.fn>; status: ReturnType<typeof vi.fn> } {
  const json   = vi.fn();
  const status = vi.fn().mockReturnThis();
  const res    = { json, status } as unknown as Response;
  (res as unknown as Record<string, unknown>)['json'] = json;
  return { res, json, status };
}

describe('ForecastController', () => {
  let getForecastsMock: ReturnType<typeof vi.fn>;
  let forecastService: IForecastService;
  let controller: ForecastController;
  let next: NextFunction;

  beforeEach(() => {
    getForecastsMock = vi.fn().mockResolvedValue(MOCK_FORECASTS);
    forecastService = {
      generateForDate:              vi.fn(),
      getForecastsByStoreAndDate:   getForecastsMock,
    } as IForecastService;

    controller = new ForecastController(forecastService);
    next       = vi.fn() as unknown as NextFunction;
  });

  it('returns 200 with forecast data for valid params', async () => {
    const req        = makeReq({ storeId: '1', date: '2026-05-14' });
    const { res, json, status } = makeRes();

    await controller.getByStoreAndDate(req, res, next);

    expect(status).not.toHaveBeenCalled();
    expect(json).toHaveBeenCalledWith(MOCK_FORECASTS);
    expect(getForecastsMock).toHaveBeenCalledWith(1, '2026-05-14');
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 400 when storeId is missing', async () => {
    const req        = makeReq({ date: '2026-05-14' });
    const { res, json, status } = makeRes();

    await controller.getByStoreAndDate(req, res, next);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.anything() }));
    expect(getForecastsMock).not.toHaveBeenCalled();
  });

  it('returns 400 when date is missing', async () => {
    const req        = makeReq({ storeId: '1' });
    const { res, json, status } = makeRes();

    await controller.getByStoreAndDate(req, res, next);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.anything() }));
    expect(getForecastsMock).not.toHaveBeenCalled();
  });

  it('returns 400 when date format is invalid', async () => {
    const req        = makeReq({ storeId: '1', date: '14-05-2026' });
    const { res, json, status } = makeRes();

    await controller.getByStoreAndDate(req, res, next);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.anything() }));
    expect(getForecastsMock).not.toHaveBeenCalled();
  });

  it('returns 400 when storeId is not a number', async () => {
    const req        = makeReq({ storeId: 'abc', date: '2026-05-14' });
    const { res, json, status } = makeRes();

    await controller.getByStoreAndDate(req, res, next);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.anything() }));
    expect(getForecastsMock).not.toHaveBeenCalled();
  });

  it('calls next(err) when the service throws', async () => {
    const serviceError = new Error('DB connection lost');
    getForecastsMock.mockRejectedValue(serviceError);

    const req        = makeReq({ storeId: '1', date: '2026-05-14' });
    const { res, json } = makeRes();

    await controller.getByStoreAndDate(req, res, next);

    expect(next).toHaveBeenCalledWith(serviceError);
    expect(json).not.toHaveBeenCalled();
  });
});
