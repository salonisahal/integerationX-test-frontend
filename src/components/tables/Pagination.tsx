import { ChevronLeft, ChevronRight } from 'lucide-react'
import { totalPagesFor } from '../../utils/formatters'

interface PaginationProps {
  page: number
  limit: number
  total: number
  onPageChange: (page: number) => void
}

// Server-side pagination control shared by every list page. `page` is
// zero-indexed to match the backend's `page` query parameter.
export default function Pagination({ page, limit, total, onPageChange }: PaginationProps) {
  const totalPages = totalPagesFor(total, limit)
  const startRecord = total === 0 ? 0 : page * limit + 1
  const endRecord = Math.min(total, (page + 1) * limit)

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index).filter(
    (candidate) => Math.abs(candidate - page) <= 2 || candidate === 0 || candidate === totalPages - 1,
  )

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
      <p className="text-sm text-muted">
        Showing {startRecord}-{endRecord} of {total}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
          className="rounded-input p-1.5 text-gray-500 hover:bg-surface disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {pageNumbers.map((pageNumber, index) => {
          const previousNumber = pageNumbers[index - 1]
          const showEllipsis = previousNumber !== undefined && pageNumber - previousNumber > 1
          return (
            <span key={pageNumber} className="flex items-center">
              {showEllipsis && <span className="px-1 text-gray-400">...</span>}
              <button
                onClick={() => onPageChange(pageNumber)}
                className={`min-w-[2rem] rounded-input px-2 py-1 text-sm ${
                  pageNumber === page ? 'bg-primary text-white' : 'text-gray-600 hover:bg-surface'
                }`}
              >
                {pageNumber + 1}
              </button>
            </span>
          )
        })}

        <button
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
          className="rounded-input p-1.5 text-gray-500 hover:bg-surface disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
