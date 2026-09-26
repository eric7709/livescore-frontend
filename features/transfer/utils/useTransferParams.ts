// transfer/utils/useTransferParams.ts
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { TransferFilters, TransferType } from './transfer.types'

type FilterKey = keyof TransferFilters

const FILTER_DEFAULTS = {
  search: '',
  transferType: 'ALL' as const,
  dateFrom: '',
  dateTo: '',
}

export function useTransferParams() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filters: TransferFilters = {
    search: searchParams.get('search') ?? FILTER_DEFAULTS.search,
    transferType:
      (searchParams.get('transferType') as 'ALL' | TransferType) ??
      FILTER_DEFAULTS.transferType,
    playerId: searchParams.get('playerId')
      ? Number(searchParams.get('playerId'))
      : undefined,
    fromTeamId: searchParams.get('fromTeamId')
      ? Number(searchParams.get('fromTeamId'))
      : undefined,
    toTeamId: searchParams.get('toTeamId')
      ? Number(searchParams.get('toTeamId'))
      : undefined,
    dateFrom: searchParams.get('dateFrom') ?? FILTER_DEFAULTS.dateFrom,
    dateTo: searchParams.get('dateTo') ?? FILTER_DEFAULTS.dateTo,
  }

  const page = Number(searchParams.get('page') ?? 0)
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
