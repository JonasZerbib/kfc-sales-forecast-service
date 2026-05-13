export interface Store {
  id: number;
  name: string;
  location: string;
}

export async function fetchStores(): Promise<Store[]> {
  const response = await fetch('/api/stores');
  if (!response.ok) {
    throw new Error(`Failed to fetch stores: ${response.status}`);
  }
  return response.json() as Promise<Store[]>;
}
