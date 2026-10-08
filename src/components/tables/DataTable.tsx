import type { ReactNode } from 'react'
import { SkeletonTableRows } from '../common/Skeleton'
import EmptyState from '../common/EmptyState'
import ErrorState from '../common/ErrorState'

export interface DataTableColumn<T> {
  header: string
  render: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  loading: boolean
  error?: string
  emptyTitle: string
  emptyAction?: ReactNode
  onRetry?: () => void
  onRowClick?: (row: T) => void
}

// Generic table used by every list page in the app (students, teachers,
// courses, ...). Handles the loading / error / empty states so each list
// page only has to describe its columns.
export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  error,
  emptyTitle,
  emptyAction,
  onRetry,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-card border border-border bg-card shadow-card">
      <table className="w-full min-w-max text-left text-sm">
        <thead className="border-b border-border bg-surface">
          <tr>
            {columns.map((column) => (
              <th key={column.header} className="whitespace-nowrap px-4 py-3 font-semibold text-gray-600">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading && <SkeletonTableRows rows={5} columns={columns.length} />}

          {!loading && !error && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState title={emptyTitle} action={emptyAction} />
              </td>
            </tr>
          )}

          {!loading && error && (
            <tr>
              <td colSpan={columns.length}>
                <ErrorState message={error} onRetry={onRetry ?? (() => undefined)} />
              </td>
            </tr>
          )}

          {!loading &&
            !error &&
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? 'cursor-pointer hover:bg-surface' : undefined}
              >
                {columns.map((column) => (
                  <td key={column.header} className={`whitespace-nowrap px-4 py-3 text-gray-700 ${column.className ?? ''}`}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
