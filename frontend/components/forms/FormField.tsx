interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}

export default function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-gray-700 dark:text-gray-300 font-semibold mb-2"
      >
        {label}
      </label>
      {children}
      {error && <p className="text-danger text-sm mt-1">{error}</p>}
    </div>
  );
}

export const fieldClassName = (hasError?: boolean) =>
  `w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-900 dark:text-gray-100 ${
    hasError ? 'border-danger' : 'border-gray-200 dark:border-slate-700'
  }`;
