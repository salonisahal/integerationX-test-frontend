import { useCallback, useEffect, useState } from 'react'
import type { ListResponse, QueryParams } from '../types'

interface UseListQueryResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  loading: boolean
  error: string
  reload: () => void
}

// Shared stateful hook extracting the fetch/loading/error/pagination logic
// duplicated across every list page (students, teachers, courses, etc.).
// `params` changes (search, filters, page, sort) automatically refetch.
export function useListQuery<T>(
  fetcher: (params: QueryParams) => Promise<ListResponse<T>>,
  params: QueryParams,
): UseListQueryResult<T> {
  const [items, setItems] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadToken, setReloadToken] = useState(0)

  const paramsKey = JSON.stringify(params)

  const load = useCallback(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    fetcher(params)
      .then((response) => {
        if (cancelled) return
        setItems(response.data)
        setTotal(response.total)
      })
      .catch(() => {
        if (cancelled) return
        setError('Unable to load data.')
        setItems([])
        setTotal(0)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, reloadToken])

  useEffect(() => {
    const cancel = load()
    return cancel
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  return {
    items,
    total,
    page: params.page ?? 0,
    limit: params.limit ?? 10,
    loading,
    error,
    reload,
  }
}
