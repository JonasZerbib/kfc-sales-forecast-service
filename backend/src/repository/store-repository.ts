import { Pool } from 'pg';

import { Store } from '../models/store';
import { IStoreRepository } from './i-store-repository';

export class StoreRepository implements IStoreRepository {
  constructor(private readonly pool: Pool) {}

  async findAll(): Promise<Store[]> {
    const result = await this.pool.query<{ id: number; name: string; location: string }>(
      'SELECT id, name, location FROM stores ORDER BY id',
    );
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      location: row.location,
    }));
  }
}
