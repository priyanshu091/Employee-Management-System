import useSWR from 'swr'
import type { CompanySettings } from '@/types'

async function fetcher(url: string): Promise<CompanySettings | null> {
  const res = await fetch(url)
  const json = await res.json()
  return json.data ?? null
}

export function useCompanySettings() {
  const { data, error, isLoading, mutate } = useSWR('/api/settings', fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })

  return {
    settings: data,
    loading: isLoading,
    error,
    mutate,
  }
}
