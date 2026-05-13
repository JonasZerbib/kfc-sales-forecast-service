import { NextFunction, Request, Response } from 'express';

import { IStoreService } from '../../services/i-store-service';

export class StoreController {
  constructor(private readonly storeService: IStoreService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stores = await this.storeService.getAllStores();
      res.json(stores);
    } catch (err) {
      next(err);
    }
  };
}
