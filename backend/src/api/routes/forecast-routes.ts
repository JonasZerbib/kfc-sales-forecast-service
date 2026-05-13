import { Router } from 'express';

import { ForecastController } from '../controllers/forecast-controller';

export function createForecastRouter(controller: ForecastController): Router {
  const router = Router();
  router.get('/', controller.getByStoreAndDate);
  return router;
}
