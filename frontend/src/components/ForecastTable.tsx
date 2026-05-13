import type { Forecast } from '../api/forecasts';

interface ForecastTableProps {
  forecasts: Forecast[];
  loading: boolean;
  error: string | null;
}

/** Format saleHour (0-23) as "HH:00 – HH+1:00" */
function formatHourSlot(hour: number): string {
  const start = String(hour).padStart(2, '0');
  const end   = String(hour + 1).padStart(2, '0');
  return `${start}:00 – ${end}:00`;
}

export function ForecastTable({ forecasts, loading, error }: ForecastTableProps): JSX.Element {
  if (loading) {
    return <p className="status">Loading forecasts…</p>;
  }

  if (error !== null) {
    return <p className="status error">{error}</p>;
  }

  if (forecasts.length === 0) {
    return <p className="status">No forecasts found. Select a store and date above.</p>;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Hour</th>
            <th>Product</th>
            <th>Predicted qty</th>
          </tr>
        </thead>
        <tbody>
          {forecasts.map((f) => (
            <tr key={f.id}>
              <td>{formatHourSlot(f.saleHour)}</td>
              <td>{f.productName}</td>
              <td>{Math.ceil(f.predictedQuantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
