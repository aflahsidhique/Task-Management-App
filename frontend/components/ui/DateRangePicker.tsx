'use client';

import { format } from 'date-fns';

interface DateRangePickerProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ from, to, onChange }) => {
  const label = `${format(new Date(from), 'MMM d')} - ${format(new Date(to), 'MMM d, yyyy')}`;

  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
      <span>{label}</span>
      <input
        type="date"
        value={from}
        onChange={(e) => onChange(e.target.value, to)}
        className="sr-only"
        aria-label="From date"
      />
      <input
        type="date"
        value={to}
        onChange={(e) => onChange(from, e.target.value)}
        className="sr-only"
        aria-label="To date"
      />
    </div>
  );
};

export default DateRangePicker;
