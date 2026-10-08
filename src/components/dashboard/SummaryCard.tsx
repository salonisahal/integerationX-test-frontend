import type { ComponentType } from 'react'
import { SkeletonCard } from '../common/Skeleton'

interface SummaryCardProps {
  label: string
  value: number | string
  icon: ComponentType<{ size?: number; className?: string }>
  loading?: boolean
  tone?: 'primary' | 'success' | 'danger' | 'accent'
}

const toneClasses: Record<NonNullable<SummaryCardProps['tone']>, string> = {
  primary: 'bg-primary-100 text-primary',
  success: 'bg-green-100 text-success',
  danger: 'bg-red-100 text-danger',
  accent: 'bg-purple-100 text-accent',
}

export default function SummaryCard({ label, value, icon: Icon, loading, tone = 'primary' }: SummaryCardProps) {
  if (loading) return <SkeletonCard />

  return (
    <div className="flex items-center gap-4 rounded-card border border-border bg-card p-5 shadow-card">
      <div className={`flex h-11 w-11 items-center justify-center rounded-input ${toneClasses[tone]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-sm text-muted">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  )
}
