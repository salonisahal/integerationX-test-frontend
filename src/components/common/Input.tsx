import type { InputHTMLAttributes } from 'react'

export default function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props
  return (
    <input
      className={`w-full rounded-input border border-border bg-white px-3 py-2 text-sm text-gray-900
        placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary
        disabled:bg-gray-100 ${className}`}
      {...rest}
    />
  )
}
