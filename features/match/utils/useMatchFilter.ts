import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"
import { MatchFilterParams } from "../manager/utils/manager.types"

// Every possible key in MatchFilterParams, listed once.
const FILTER_KEYS: Array<keyof MatchFilterParams> = [
  "date",
  "competitionId",
];

// These specific keys should be converted to numbers when read from the URL.
const NUMBER_KEYS = new Set<keyof MatchFilterParams>([
  "competitionId",
]);

export const useMatchFilter = () => {

  const params = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  // ── READ: loop through every known key, pull it out of the URL ──
  const filters = useMemo<MatchFilterParams>(() => {
    const result: Record<string, string | number> = {};

    for (const key of FILTER_KEYS) {
      const raw = params.get(key); // string | null
      if (raw === null || raw === "") continue; // skip missing/empty keys

      result[key] = NUMBER_KEYS.has(key) ? Number(raw) : raw;
    }

    return result as MatchFilterParams;
  }, [params]);

  const replaceUrl = useCallback((searchParams: URLSearchParams) => {
    const query = searchParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [pathname, router]);

  // ── WRITE: set (or clear) a single field, keep everything else intact ──
  const setFilter = useCallback(<K extends keyof MatchFilterParams>(
    key: K,
    value: MatchFilterParams[K]
  ) => {
    const searchParams = new URLSearchParams(params.toString());

    if (value === undefined || value === null || value === "") {
      searchParams.delete(key);
    } else {
      searchParams.set(key, String(value));
    }

    replaceUrl(searchParams);
  }, [params, replaceUrl]);

  return {
    filters,
    setFilter,
  }
}