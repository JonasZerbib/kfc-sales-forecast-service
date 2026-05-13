import { Store } from '../models/store';

export interface IStoreRepository {
  findAll(): Promise<Store[]>;
}
