import { useState, useEffect, useCallback } from 'react'
import tentService from '../services/tentService'
import queryCache from '../utils/queryCache'

export function useTents(params = {}) {
  const [tents, setTents] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState(null)

  const stringifiedParams = JSON.stringify(params)

  const fetchTents = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true)
    setIsFetching(true)
    setError(null)

    try {
      const res = await tentService.getTents(params)
      if (res && res.success) {
        setTents(res.data)
        setPagination(res.pagination)
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat katalog alat tenda.')
    } finally {
      setLoading(false)
      setIsFetching(false)
    }
  }, [stringifiedParams])

  useEffect(() => {
    fetchTents()

    // Subscribe to query cache invalidations
    const unsubscribe = queryCache.subscribe((invalidatedKey) => {
      if (invalidatedKey === '*' || String(invalidatedKey).includes('tents')) {
        fetchTents(true)
      }
    })

    return unsubscribe
  }, [fetchTents])

  return {
    tents,
    pagination,
    loading,
    isFetching,
    error,
    refetch: () => fetchTents(false),
  }
}

