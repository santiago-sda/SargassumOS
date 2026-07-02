'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Beach } from '@/types'

export function useBeaches() {
  const [beaches, setBeaches] = useState<Beach[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/beaches')
      const data = await res.json()
      setBeaches(data)
    } catch (e) {
      setError(e as Error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 60_000)
    return () => clearInterval(interval)
  }, [load])

  // Realtime: re-fetch beaches whenever any report is inserted
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('reports-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reports' },
        () => {
          // Short delay so the API has time to update current_condition
          setTimeout(load, 1000)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [load])

  return { beaches, isLoading, error, refresh: load }
}
