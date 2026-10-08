import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-4 text-center">
      <FileQuestion size={48} className="text-gray-300" />
      <h1 className="text-2xl font-semibold text-gray-900">Page not found</h1>
      <p className="max-w-sm text-sm text-muted">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        to="/"
        className="rounded-input bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
      >
        Go Home
      </Link>
    </div>
  )
}
