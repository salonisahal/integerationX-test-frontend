import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  title: string
  action?: ReactNode
}

export default function EmptyState({ title, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Inbox size={36} className="text-gray-300" />
      <p className="text-sm text-muted">{title}</p>
      {action}
    </div>
  )
}
