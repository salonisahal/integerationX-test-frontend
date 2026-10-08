import type { ReactNode } from 'react'

type Tone = 'success' | 'danger' | 'warning' | 'info' | 'neutral'

const toneClasses: Record<Tone, string> = {
  success: 'bg-green-100 text-green-700',
  danger: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-blue-100 text-blue-700',
  neutral: 'bg-gray-100 text-gray-700',
}

const statusToneMap: Record<string, Tone> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  PRESENT: 'success',
  ABSENT: 'danger',
  LATE: 'warning',
  EXCUSED: 'info',
  DRAFT: 'neutral',
  PUBLISHED: 'success',
  CLOSED: 'danger',
}

export function statusToTone(status: string): Tone {
  return statusToneMap[status] ?? 'neutral'
}

export default function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}>
      {children}
    </span>
  )
}
