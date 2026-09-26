"use client";

import { SlidersHorizontal } from "lucide-react";
import { MATCH_STATUSES, MatchStatus } from "@/features/match/utils/match.types";
import { Select, SelectOption } from "./Select";

export interface MatchFilters {
  date: string;
  status: MatchStatus | "ALL";
  scope: "date" | "all";
}

interface HeaderProps {
  filters: MatchFilters;
  onFiltersChange: (filters: MatchFilters) => void;
}

const SCOPE_OPTIONS: { label: string; value: MatchFilters["scope"] }[] = [
  { label: "By date", value: "date" },
  { label: "All matches", value: "all" },
];

function formatStatusLabel(status: MatchStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

const STATUS_OPTIONS: SelectOption<MatchFilters["status"]>[] = [
  { label: "All statuses", value: "ALL" },
  ...MATCH_STATUSES.map((status) => ({
    label: formatStatusLabel(status),
    value: status,
  })),
];

function ScopeToggle({
  value,
  onChange,
}: {
  value: MatchFilters["scope"];
  onChange: (scope: MatchFilters["scope"]) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Match scope"
      className="relative inline-grid grid-cols-2 rounded-lg border border-gray-200 bg-gray-50 p-0.5"
    >
      {/* Sliding indicator */}
      <span
        aria-hidden
        className={`pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-0.25rem)] rounded-[6px] bg-white shadow-sm ring-1 ring-black/[0.03] transition-transform duration-200 ease-out ${
          value === "all" ? "translate-x-full" : "translate-x-0"
        }`}
      />

      {SCOPE_OPTIONS.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={`relative z-10 whitespace-nowrap rounded-[6px] px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 ${
              active ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function Header({ filters, onFiltersChange }: HeaderProps) {
  const isDateScope = filters.scope === "date";

  const subtitle = isDateScope
    ? new Date(filters.date).toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "All matches on record";

  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-5">
      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-[var(--font-display)] text-xl font-medium tracking-tight text-gray-900">
            Matches
          </h1>
          <p className="mt-0.5 truncate text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        <ScopeToggle
          value={filters.scope}
          onChange={(scope) => onFiltersChange({ ...filters, scope })}
        />

        {isDateScope && (
          <input
            type="date"
            value={filters.date}
            onChange={(e) =>
              onFiltersChange({ ...filters, date: e.target.value })
            }
            aria-label="Filter by date"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition-all duration-150 hover:border-gray-300 focus:border-[#2F8F5B] focus:outline-none focus:ring-4 focus:ring-[#2F8F5B]/10"
          />
        )}

        <div className="flex items-center gap-1.5">
          <SlidersHorizontal
            className="h-3.5 w-3.5 text-gray-400"
            aria-hidden
          />
          <Select
            value={filters.status}
            options={STATUS_OPTIONS}
            onChange={(status) => onFiltersChange({ ...filters, status })}
            ariaLabel="Filter by status"
          />
        </div>
      </div>
    </div>
  );
}