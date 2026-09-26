import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

import type { FilterState, Position, Role, StarterStatus } from './profile.types'

type FilterKey = 'search' | 'role' | 'position' | 'starterStatus' | 'teamId'

const FILTER_DEFAULTS: Record<FilterKey, string> = {
  search: '',
  role: 'ALL',
  position: 'ALL',
  starterStatus: 'ALL',
  teamId: 'ALL',
}

export function useProfileParams() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filters: FilterState = {
    search: searchParams.get('search') ?? FILTER_DEFAULTS.search,
    role: (searchParams.get('role') as Role | 'ALL') ?? FILTER_DEFAULTS.role,
    position: (searchParams.get('position') as Position | 'ALL') ?? FILTER_DEFAULTS.position,
    starterStatus: (searchParams.get('starterStatus') as StarterStatus) ?? FILTER_DEFAULTS.starterStatus,
    teamId: (() => {
      const raw = searchParams.get('teamId') ?? FILTER_DEFAULTS.teamId
      return raw === 'ALL' ? 'ALL' : Number(raw)
    })(),
  }

  const page     = Number(searchParams.get('page') ?? 0)
  const pageSize = Number(searchParams.get('size') ?? 10)

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