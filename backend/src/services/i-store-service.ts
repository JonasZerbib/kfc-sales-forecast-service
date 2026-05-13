import { Store } from '../models/store';

export interface IStoreService {
  getAllStores(): Promise<Store[]>;
}
