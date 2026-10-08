import type { TextareaHTMLAttributes } from 'react'

export default function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props
  return (
    <textarea
      className={`w-full rounded-input border border-border bg-white px-3 py-2 text-sm text-gray-900
        placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary
        disabled:bg-gray-100 ${className}`}
      {...rest}
    />
  )
}
