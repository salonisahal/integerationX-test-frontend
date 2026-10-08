import type { ReactNode } from 'react'
import { SkeletonLine } from '../common/Skeleton'

interface ChartCardProps {
  title: string
  loading?: boolean
  children: ReactNode
}

export default function ChartCard({ title, loading, children }: ChartCardProps) {
  return (
    <div className="rounded-card border border-border bg-card p-5 shadow-card">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">{title}</h3>
      {loading ? <SkeletonLine className="h-56 w-full" /> : <div className="h-56 w-full">{children}</div>}
    </div>
  )
}
