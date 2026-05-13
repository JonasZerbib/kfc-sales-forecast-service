import { Store } from '../models/store';
import { IStoreRepository } from '../repository/i-store-repository';
import { IStoreService } from './i-store-service';

export class StoreService implements IStoreService {
  constructor(private readonly storeRepository: IStoreRepository) {}

  async getAllStores(): Promise<Store[]> {
    return this.storeRepository.findAll();
  }
}
