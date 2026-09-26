"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Check, Loader2 } from "lucide-react";
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import { useSearchCompetitions } from "@/features/competition/utils/competition.api";
import { CompetitionDTO } from "@/features/competition/utils/competition.types";

type CompetitionSearchSelectProps = {
  value: string;
  selectedName?: string;
  onSelect: (competitionId: number | null, competitionName: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
};

export function CompetitionSearchSelect({
  value,
  selectedName = "",
  onSelect,
  placeholder = "Search for a competition...",
  disabled = false,
  error,
}: CompetitionSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(selectedName);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isFetching } = useSearchCompetitions({ name: debouncedSearch });
  const filteredCompetitions = data?.content ?? [];

  useEffect(() => {
    setSearchTerm(selectedName ?? "");
  }, [selectedName]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (competition: CompetitionDTO) => {
    onSelect(competition.id, competition.name);
    setSearchTerm(competition.name);
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null, null);
    setSearchTerm("");
    if (isOpen) inputRef.current?.focus();
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Input Outer Box Container */}
      <div
        className={`
          relative flex w-full items-center rounded-xl border bg-white shadow-2xs transition duration-150 overflow-hidden
          ${disabled ? "opacity-60 cursor-not-allowed bg-slate-50" : "hover:border-slate-300"}
          ${
            error
              ? "border-rose-300 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20"
              : "border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
          }
        `}
      >
        {/* Left Search Icon */}
        <Search
          size={14}
          className="pointer-events-none absolute left-3 text-slate-400 shrink-0"
        />

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          className="w-full bg-transparent py-2 pl-9 pr-9 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none disabled:cursor-not-allowed"
        />

        {/* Right Icon Actions (Clear / Loading Spinner / Chevron) */}
        <div className="absolute right-3 flex items-center gap-1.5 shrink-0">
          {isFetching ? (
            <Loader2 size={13} className="animate-spin text-slate-400" />
          ) : searchTerm && !disabled ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 transition p-0.5 rounded-md hover:bg-slate-100"
            >
              <X size={13} />
            </button>
          ) : (
            <ChevronDown
              size={13}
              className={`pointer-events-none text-slate-400 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-blue-600" : ""
              }`}
            />
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="mt-1 text-[11px] font-medium text-rose-500">{error}</p>}

      {/* Floating Options Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-52 overflow-y-auto rounded-xl border border-slate-100 bg-white p-1 shadow-lg ring-1 ring-slate-900/5">
          <ul role="listbox" className="space-y-0.5">
            {isFetching && filteredCompetitions.length === 0 ? (
              <li className="px-3 py-2 text-center text-xs text-slate-400 italic">
                Searching competitions...
              </li>
            ) : filteredCompetitions.length === 0 ? (
              <li className="px-3 py-2 text-center text-xs text-slate-400 italic">
                {debouncedSearch.trim() ? "No competitions found" : "Type to search"}
              </li>
            ) : (
              filteredCompetitions.map((competition) => {
                const isSelected = String(competition.id) === value;
                return (
                  <li
                    key={competition.id}
                    onClick={() => handleSelect(competition)}
                    role="option"
                    aria-selected={isSelected}
                    className={`
                      flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition
                      ${
                        isSelected
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                      }
                    `}
                  >
                    <span className="truncate">{competition.name}</span>
                    {isSelected && <Check size={13} className="shrink-0 text-blue-600 ml-2" />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}