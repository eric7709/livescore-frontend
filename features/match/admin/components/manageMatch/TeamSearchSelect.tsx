"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, X, Loader2, Check } from "lucide-react";
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import { useSearchTeams } from "@/features/team/utils/team.api";

interface TeamSearchSelectProps {
  value?: string | number;
  selectedName?: string;
  onSelect: (id: number | null, name: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  excludeTeamId?: number;
}

export function TeamSearchSelect({
  value,
  selectedName = "",
  onSelect,
  placeholder = "Search team...",
  disabled = false,
  error,
  excludeTeamId,
}: TeamSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(selectedName);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calls useSearchTeams with positional arguments (query, page, size)
  const { data, isLoading, isFetching } = useSearchTeams(debouncedSearch, 0, 15);
  const fetchedTeams = data?.content ?? [];

  // Exclude the designated team (e.g., prevent selecting home team as away team)
  const filteredTeams = fetchedTeams.filter((team) => {
    if (excludeTeamId && team.id === excludeTeamId) return false;
    return true;
  });

  useEffect(() => {
    setSearchTerm(selectedName ?? "");
  }, [selectedName]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (teamId: number, teamName: string) => {
    onSelect(teamId, teamName);
    setSearchTerm(teamName);
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null, null);
    setSearchTerm("");
    if (isOpen) inputRef.current?.focus();
  };

  const loading = isLoading || isFetching;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Box */}
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
        <Search size={14} className="pointer-events-none absolute left-3 text-slate-400 shrink-0" />

        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={searchTerm}
          placeholder={placeholder}
          onFocus={() => !disabled && setIsOpen(true)}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent py-2 pl-9 pr-9 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none disabled:cursor-not-allowed"
        />

        {/* Action Controls */}
        <div className="absolute right-3 flex items-center gap-1.5 shrink-0">
          {loading ? (
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

      {error && <p className="mt-1 text-[11px] font-medium text-rose-500">{error}</p>}

      {/* Floating Options Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-52 overflow-y-auto rounded-xl border border-slate-100 bg-white p-1 shadow-lg ring-1 ring-slate-900/5">
          <ul role="listbox" className="space-y-0.5">
            {loading && filteredTeams.length === 0 ? (
              <li className="px-3 py-2 text-center text-xs text-slate-400 italic">
                Searching teams...
              </li>
            ) : filteredTeams.length === 0 ? (
              <li className="px-3 py-2 text-center text-xs text-slate-400 italic">
                {debouncedSearch.trim() ? "No teams found" : "Type to search"}
              </li>
            ) : (
              filteredTeams.map((team) => {
                const isSelected = String(team.id) === String(value);
                return (
                  <li
                    key={team.id}
                    onClick={() => handleSelect(team.id, team.name)}
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
                    <span className="truncate">{team.name}</span>
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