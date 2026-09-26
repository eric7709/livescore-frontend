// team/shared/useTeamParams.ts
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

type FilterKey = 'search' | 'competitionId'

const FILTER_DEFAULTS: Record<FilterKey, string> = {
  search: '',
  competitionId: 'ALL',
}

export function useTeamParams() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filters = {
    search:        searchParams.get('search')        ?? FILTER_DEFAULTS.search,
    competitionId: searchParams.get('competitionId') ?? FILTER_DEFAULTS.competitionId,
  }

  const page     = Number(searchParams.get('page') ?? 0)
  const pageSize = Number(searchParams.get('size') ?? 15)

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === '') {
          next.delete(key)
        } else {
          next.set(key, value)
        }
      }
      router.replace(`${pathname}?${next.toString()}`, { scroll: false })
    },
    [searchParams, pathname, router]
  )

  const setFilter = useCallback(
    (key: FilterKey, value: string) => updateParams({ [key]: value, page: '0' }),
    [updateParams]
  )

  const setPage = useCallback(
    (p: number) => updateParams({ page: String(p) }),
    [updateParams]
  )

  const setPageSize = useCallback(
    (size: number) => updateParams({ size: String(size), page: '0' }),
    [updateParams]
  )

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false })
  }, [pathname, router])

  return { filters, page, pageSize, setFilter, setPage, setPageSize, resetFilters }
}