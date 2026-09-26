// ResultFilter.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Sliders, RotateCcw } from "lucide-react";
import { CompetitionDTO } from "@/features/competition/utils/competition.types";

interface ResultFilterProps {
  date: string | null;          // yyyy-MM-dd
  competitionId: number | null;
  competitions: CompetitionDTO[];
  competitionsLoading?: boolean;
  onDateChange: (date: string | null) => void;
  onCompetitionChange: (competitionId: number | null) => void;
  onReset: () => void;
}

export default function ResultFilter({
  date,
  competitionId,
  competitions,
  competitionsLoading = false,
  onDateChange,
  onCompetitionChange,
  onReset,
}: ResultFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeFilterCount = [date, competitionId].filter((v) => v !== null).length;
  const hasActiveParams = activeFilterCount > 0;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 px-4 py-2.5 bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200"
      >
        <Sliders size={14} className="text-slate-400" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="text-[10px] font-medium text-white bg-purple-500 px-1.5 py-0.5 rounded-full min-w-4.5 text-center">
            {activeFilterCount}
          </span>
        )}
        <svg
          className={`w-4 h-4 text-slate-400 transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-50 bg-white rounded-xl border border-slate-200/60 shadow-lg shadow-slate-200/30 p-4 min-w-70 max-w-md">
          <div className="flex flex-col gap-3">
            {/* Competition Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Competition
              </label>
              <select
                value={competitionId ?? ""}
                onChange={(e) =>
                  onCompetitionChange(e.target.value ? Number(e.target.value) : null)
                }
                disabled={competitionsLoading}
                className="text-xs px-3 py-2 rounded-lg border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 disabled:opacity-50"
              >
                <option value="">
                  {competitionsLoading ? "Loading competitions..." : "All competitions"}
                </option>
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Date
              </label>
              <input
                type="date"
                value={date ?? ""}
                onChange={(e) => onDateChange(e.target.value || null)}
                className="text-xs px-3 py-2 rounded-lg border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-100">
              <span className="text-[10px] text-slate-400">
                {activeFilterCount} active filter{activeFilterCount !== 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={onReset}
                  disabled={!hasActiveParams}
                  className={`
                    h-9 px-3 text-xs font-medium rounded-xl
                    flex items-center gap-2
                    transition-colors duration-150
                    ${hasActiveParams
                      ? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200/50"
                      : "bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-200/50"
                    }
                  `}
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="h-9 px-3 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}