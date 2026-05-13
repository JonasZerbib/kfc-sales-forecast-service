import { Router } from 'express';

import { StoreController } from '../controllers/store-controller';

export function createStoreRouter(controller: StoreController): Router {
  const router = Router();
  router.get('/', controller.getAll);
  return router;
}
