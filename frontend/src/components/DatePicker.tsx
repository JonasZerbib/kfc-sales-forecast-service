interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  disabled: boolean;
}

export function DatePicker({ value, onChange, disabled }: DatePickerProps): JSX.Element {
  return (
    <div className="field">
      <label htmlFor="date-input">Forecast date</label>
      <input
        id="date-input"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
