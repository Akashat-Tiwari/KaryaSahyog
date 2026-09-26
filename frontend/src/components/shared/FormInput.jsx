

/**
 * Reusable input component with label, error message, and optional end adornment.
 * Props:
 * - id: string (required) – HTML id for the input and label association.
 * - label: string – Text displayed above the input.
 * - type: string – Input type (e.g., 'text', 'email', 'password'). Defaults to 'text'.
 * - value: string – Controlled value.
 * - onChange: (e) => void – Change handler.
 * - placeholder?: string – Placeholder text.
 * - error?: string – Error message displayed below the input.
 * - required?: boolean – Adds required attribute and visual indicator.
 * - endAdornment?: ReactNode – Node rendered inside the input container on the right (e.g., eye icon).
 */
export default function FormInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  required = false,
  endAdornment,
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}{required && <span className="ml-0.5 text-rose-600">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
        />
        {endAdornment && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            {endAdornment}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
