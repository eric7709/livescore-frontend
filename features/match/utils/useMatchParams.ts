"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MatchStatus } from "@/features/match/utils/match.types";

export interface MatchFilters {
  teamId?: number;
  teamName?: string;
  competitionId?: number;
  status?: MatchStatus | "ALL";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export type FilterKey = keyof MatchFilters;

export function getMatchFilters(searchParams: URLSearchParams): MatchFilters {
  const teamId = searchParams.get("teamId");
  const competitionId = searchParams.get("competitionId");

  return {
    teamId: teamId ? Number(teamId) : undefined,
    teamName: searchParams.get("teamName") ?? undefined,
    competitionId: competitionId ? Number(competitionId) : undefined,
    status: (searchParams.get("status") as MatchStatus) ?? "ALL",
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
    search: searchParams.get("search") ?? undefined,
  };
}

export function useMatchParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = getMatchFilters(searchParams);

  const page = Number(searchParams.get("page") ?? 0);
  const pageSize = Number(searchParams.get("size") ?? 10);

  const updateParams = useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === "" || value === "ALL" || value === null || value === undefined) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }

      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  // Filter updates reset page to 0
  const setFilter = useCallback(
    (
      keyOrObject: FilterKey | Partial<Record<FilterKey, string | number | null | undefined>>,
      value?: string | number | null | undefined
    ) => {
      if (typeof keyOrObject === "object" && keyOrObject !== null) {
        updateParams({ ...keyOrObject, page: "0" });
      } else if (typeof keyOrObject === "string") {
        updateParams({ [keyOrObject]: value, page: "0" });
      }
    },
    [updateParams]
  );

  // Directly sets the page number
  const setPage = useCallback(
    (p: number) => updateParams({ page: String(p) }),
    [updateParams]
  );

  // Page size changes reset page to 0
  const setPageSize = useCallback(
    (size: number) => updateParams({ size: String(size), page: "0" }),
    [updateParams]
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  return { filters, page, pageSize, setFilter, setPage, setPageSize, resetFilters };
}