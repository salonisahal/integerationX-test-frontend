import { AlertTriangle } from 'lucide-react'
import Button from './Button'

interface ErrorStateProps {
  message?: string
  onRetry: () => void
}

// Rendered whenever a real-branch API call fails so the error is visible
// rather than silently replaced with stale or fake data.
export default function ErrorState({ message = 'Unable to load data.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <AlertTriangle size={36} className="text-danger" />
      <p className="text-sm text-gray-700">{message}</p>
      <Button variant="secondary" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}
