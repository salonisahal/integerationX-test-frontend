export function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
}

export function SkeletonTableRows({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <td key={columnIndex} className="px-4 py-3">
              <SkeletonLine className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-card border border-border bg-card p-5 shadow-card">
      <SkeletonLine className="mb-3 h-4 w-24" />
      <SkeletonLine className="h-8 w-16" />
    </div>
  )
}
