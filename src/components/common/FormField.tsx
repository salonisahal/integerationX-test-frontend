import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  htmlFor: string
  error?: string
  helperText?: string
  required?: boolean
  children: ReactNode
}

// Shared layout for a labeled form field. Shows persistent helper text when
// valid, and swaps to an inline error message once the field is invalid
// (per the FORM VALIDATION requirement).
export default function FormField({ label, htmlFor, error, helperText, required, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-muted">{helperText}</p>
      ) : null}
    </div>
  )
}
