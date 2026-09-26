import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

type FilterKey = 'search' | 'status' | 'scope' | 'legFormat' | 'competitionType';

const FILTER_DEFAULTS: Record<FilterKey, string> = {
  search: '',
  status: 'ALL',
  scope: 'ALL',
  legFormat: 'ALL',
  competitionType: 'ALL',
};

export function useCompetitionParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = {
    search: searchParams.get('search') ?? FILTER_DEFAULTS.search,
    status: searchParams.get('status') ?? FILTER_DEFAULTS.status,
    scope: searchParams.get('scope') ?? FILTER_DEFAULTS.scope,
    legFormat: searchParams.get('legFormat') ?? FILTER_DEFAULTS.legFormat,
    competitionType: searchParams.get('competitionType') ?? FILTER_DEFAULTS.competitionType,
  };

  const page = Number(searchParams.get('page') ?? 0);
  const pageSize = Number(searchParams.get('size') ?? 20);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === '') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const setFilter = useCallback(
    (key: FilterKey, value: string) => updateParams({ [key]: value, page: '0' }),
    [updateParams]
  );

  const setPage = useCallback(
    (p: number) => updateParams({ page: String(p) }),
    [updateParams]
  );

  const setPageSize = useCallback(
    (size: number) => updateParams({ size: String(size), page: '0' }),
    [updateParams]
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  return { filters, page, pageSize, setFilter, setPage, setPageSize, resetFilters };
}
