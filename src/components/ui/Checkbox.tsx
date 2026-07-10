import { type InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={`h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
          />
          {label && (
            <label
              htmlFor={checkboxId}
              className="cursor-pointer text-sm text-text-secondary"
            >
              {label}
            </label>
          )}
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
export default Checkbox;
