import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface DatePickerProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type="date"
          className={`rounded-lg border bg-surface px-3 py-2 text-sm text-text transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
            error
              ? 'border-danger focus:ring-danger'
              : 'border-border hover:border-border-hover'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
export default DatePicker;
