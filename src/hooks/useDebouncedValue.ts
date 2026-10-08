import { useEffect, useState } from 'react'

// Shared stateful hook used by every search input across list pages so
// server-side search is not triggered on every keystroke.
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
