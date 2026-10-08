import type { SelectHTMLAttributes } from 'react'

export default function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = '', children, ...rest } = props
  return (
    <select
      className={`w-full rounded-input border border-border bg-white px-3 py-2 text-sm text-gray-900
        focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-100 ${className}`}
      {...rest}
    >
      {children}
    </select>
  )
}
