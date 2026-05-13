import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { IForecastService } from '../../services/i-forecast-service';

const querySchema = z.object({
  storeId: z.coerce.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format'),
});

export class ForecastController {
  constructor(private readonly forecastService: IForecastService) {}

  getByStoreAndDate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten().fieldErrors });
      return;
    }

    try {
      const forecasts = await this.forecastService.getForecastsByStoreAndDate(
        parsed.data.storeId,
        parsed.data.date,
      );
      res.json(forecasts);
    } catch (err) {
      next(err);
    }
  };
}
