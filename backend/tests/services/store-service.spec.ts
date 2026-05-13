import { describe, it, expect, vi, beforeEach } from 'vitest';

import { StoreService } from '../../src/services/store-service';
import type { IStoreRepository } from '../../src/repository/i-store-repository';
import type { Store } from '../../src/models/store';

const MOCK_STORES: Store[] = [
  { id: 1, name: 'KFC London',     location: 'London'     },
  { id: 2, name: 'KFC Manchester', location: 'Manchester' },
];

describe('StoreService', () => {
  let findAllMock: ReturnType<typeof vi.fn>;
  let storeRepository: IStoreRepository;
  let service: StoreService;

  beforeEach(() => {
    findAllMock      = vi.fn().mockResolvedValue(MOCK_STORES);
    storeRepository  = { findAll: findAllMock } as IStoreRepository;
    service          = new StoreService(storeRepository);
  });

  it('returns all stores from the repository', async () => {
    const result = await service.getAllStores();

    expect(result).toEqual(MOCK_STORES);
    expect(findAllMock).toHaveBeenCalledTimes(1);
  });

  it('returns an empty array when repository returns no stores', async () => {
    findAllMock.mockResolvedValue([]);

    const result = await service.getAllStores();

    expect(result).toEqual([]);
  });

  it('propagates errors thrown by the repository', async () => {
    const dbError = new Error('Connection refused');
    findAllMock.mockRejectedValue(dbError);

    await expect(service.getAllStores()).rejects.toThrow('Connection refused');
  });
});
