import type { Store } from '../api/stores';

interface StoreSelectorProps {
  stores: Store[];
  selectedStoreId: number | null;
  onSelect: (storeId: number) => void;
  disabled: boolean;
}

export function StoreSelector({
  stores,
  selectedStoreId,
  onSelect,
  disabled,
}: StoreSelectorProps): JSX.Element {
  return (
    <div className="field">
      <label htmlFor="store-select">Store</label>
      <select
        id="store-select"
        value={selectedStoreId ?? ''}
        onChange={(e) => onSelect(Number(e.target.value))}
        disabled={disabled}
      >
        <option value="" disabled>
          Select a store…
        </option>
        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name} — {store.location}
          </option>
        ))}
      </select>
    </div>
  );
}
