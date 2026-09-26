"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { useTransferPlayers } from "@/features/transfer/utils/transfer.api";
import { TransferPlayerOption } from "@/features/transfer/utils/transfer.types";

interface PlayerComboboxProps {
  /** Currently selected player, or null if none picked yet. */
  selected: TransferPlayerOption | null;
  onSelect: (player: TransferPlayerOption) => void;
  onClear: () => void;
  disabled?: boolean;
}

function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function PlayerCombobox({ selected, onSelect, onClear, disabled }: PlayerComboboxProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebouncedValue(query);
  const { data: players = [], isFetching } = useTransferPlayers(debouncedQuery);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue = isOpen ? query : selected?.name ?? query;
  const showClear = !!selected && !isOpen;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

        <input
          type="text"
          value={displayValue}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setQuery("");
            setIsOpen(true);
          }}
          placeholder="Search players..."
          disabled={disabled}
          className="w-full rounded-xl border border-slate-200 pl-8 pr-8 py-2 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
        />

        {showClear ? (
          <button
            type="button"
            onClick={() => {
              onClear();
              setQuery("");
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={13} />
          </button>
        ) : (
          <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        )}
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {isFetching ? (
            <div className="px-3 py-2 text-xs text-slate-400">Searching…</div>
          ) : players.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-400">No players found</div>
          ) : (
            players.map((player) => (
              <button
                key={player.id}
                type="button"
                onClick={() => {
                  onSelect(player);
                  setQuery("");
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs hover:bg-slate-50"
              >
                <span className="truncate font-medium text-slate-700">
                  {player.name}
                  {player.squadNumber != null ? ` (#${player.squadNumber})` : ""}
                </span>
                {player.teamName && (
                  <span className="shrink-0 text-[11px] text-slate-400">{player.teamName}</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}