import { Router } from 'express';

import { ForecastController } from '../controllers/forecast-controller';
import { StoreController } from '../controllers/store-controller';
import { createForecastRouter } from './forecast-routes';
import { createStoreRouter } from './store-routes';

export function createApiRouter(
  storeController: StoreController,
  forecastController: ForecastController,
): Router {
  const router = Router();
  router.use('/stores', createStoreRouter(storeController));
  router.use('/forecasts', createForecastRouter(forecastController));
  return router;
}
