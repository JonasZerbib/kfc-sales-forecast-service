import { useState, useEffect } from 'react';

import { fetchStores }    from './api/stores';
import { fetchForecasts } from './api/forecasts';
import type { Store }     from './api/stores';
import type { Forecast }  from './api/forecasts';
import { StoreSelector }  from './components/StoreSelector';
import { DatePicker }     from './components/DatePicker';
import { ForecastTable }  from './components/ForecastTable';
import './App.css';

/** Returns today's date as YYYY-MM-DD in local time. */
function todayLocal(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function App(): JSX.Element {
  // ── Store list ──────────────────────────────────────────────────────────────
  const [stores, setStores]           = useState<Store[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [storesError, setStoresError] = useState<string | null>(null);

  // ── User selections ─────────────────────────────────────────────────────────
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate]       = useState<string>(todayLocal());

  // ── Forecast data ────────────────────────────────────────────────────────────
  const [forecasts, setForecasts]           = useState<Forecast[]>([]);
  const [forecastsLoading, setForecastsLoading] = useState(false);
  const [forecastsError, setForecastsError] = useState<string | null>(null);

  // Load stores once on mount
  useEffect(() => {
    let cancelled = false;

    fetchStores()
      .then((data) => {
        if (!cancelled) setStores(data);
      })
      .catch(() => {
        if (!cancelled) setStoresError('Could not load stores. Is the backend running?');
      })
      .finally(() => {
        if (!cancelled) setStoresLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // Reload forecasts whenever store or date changes (only when both are set)
  useEffect(() => {
    if (selectedStoreId === null || selectedDate === '') return;

    let cancelled = false;
    setForecastsLoading(true);
    setForecastsError(null);

    fetchForecasts(selectedStoreId, selectedDate)
      .then((data) => {
        if (!cancelled) setForecasts(data);
      })
      .catch(() => {
        if (!cancelled) setForecastsError('Could not load forecasts. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setForecastsLoading(false);
      });

    return () => { cancelled = true; };
  }, [selectedStoreId, selectedDate]);

  return (
    <div className="app">
      <header>
        <h1>KFC Sales Forecast</h1>
        <p className="subtitle">Daily predicted sales per product and hour</p>
      </header>

      <main>
        <section className="controls">
          {storesError !== null ? (
            <p className="status error">{storesError}</p>
          ) : (
            <StoreSelector
              stores={stores}
              selectedStoreId={selectedStoreId}
              onSelect={setSelectedStoreId}
              disabled={storesLoading}
            />
          )}

          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            disabled={storesLoading}
          />
        </section>

        <ForecastTable
          forecasts={forecasts}
          loading={forecastsLoading}
          error={forecastsError}
        />
      </main>
    </div>
  );
}
