import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
  secondary: 'bg-white text-gray-700 border border-border hover:bg-surface focus:ring-primary',
  danger: 'bg-danger text-white hover:bg-red-700 focus:ring-danger',
  ghost: 'bg-transparent text-gray-600 hover:bg-surface focus:ring-primary',
}

export default function Button({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-input px-4 py-2 text-sm font-medium
        transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed
        disabled:opacity-60 ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}
