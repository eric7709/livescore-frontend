// ─── CustomSearch ───────────────────────────────────────────────

import { Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface SearchOption {
  value: string;
  label: string;
}

export type CustomSearchProps = {
  options: SearchOption[];
  onQueryChange: (query: string) => void;
  onSelect: (option: SearchOption) => void;
  isLoading?: boolean;
  value?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  zIndex?: number;
  minChars?: number;
};

export function CustomSearch({
  options,
  onQueryChange,
  onSelect,
  isLoading = false,
  value,
  placeholder = "Search...",
  label,
  error,
  disabled = false,
  zIndex,
  minChars = 1,
}: CustomSearchProps) {
  const [query, setQuery] = useState(value ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ─── Positioning logic (mirrors CustomSelect) ──────────────────
  const updateDropdownPosition = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const shouldOpenUp = spaceBelow < 220 && spaceAbove > spaceBelow;

    setDropdownStyle({
      position: "fixed",
      width: rect.width,
      left: rect.left,
      zIndex: zIndex || 9999,
      ...(shouldOpenUp
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  }, [zIndex]);

  // ─── Close dropdown ─────────────────────────────────────────────
  const closeDropdown = useCallback(() => setIsOpen(false), []);

  // ─── Sync external value changes (e.g. parent resets the field) ─
  useEffect(() => {
    if (value !== undefined) setQuery(value);
  }, [value]);

  // ─── Handle outside clicks ──────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeDropdown]);

  // ─── Handle Escape key ───────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDropdown();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeDropdown]);

  // ─── Reposition on resize/scroll ────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleReposition = () => updateDropdownPosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen, updateDropdownPosition]);

  // ─── Handlers ────────────────────────────────────────────────────
  const handleFocus = () => {
    if (disabled) return;
    updateDropdownPosition();
    if (query.trim().length >= minChars) setIsOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setQuery(next);
    onQueryChange(next);
    updateDropdownPosition();
    setIsOpen(next.trim().length >= minChars);
  };

  const handleSelect = (option: SearchOption) => {
    onSelect(option);
    setQuery(option.label);
    closeDropdown();
  };

  const showDropdown = isOpen && !disabled && query.trim().length >= minChars;

  return (
    <div className="relative" ref={containerRef}>
      {label && <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>}

      <div className="relative">
        <Search size={14} className="absolute top-1/2 text-gray-400 -translate-y-1/2 left-2.5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            h-9 pl-8 pr-3 border w-full
            rounded-xl bg-white text-xs text-gray-700 outline-none
            border-gray-200 placeholder:text-gray-400
            transition-colors duration-150
            disabled:opacity-60 disabled:cursor-not-allowed
            ${error ? "border-red-300" : "focus:border-blue-400"}
          `}
        />
      </div>

      {error && <p className="mt-0.5 text-[11px] text-red-500">{error}</p>}

      {showDropdown && (
        <div
          style={dropdownStyle}
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <ul className="py-1 max-h-52 overflow-auto" role="listbox">
            {isLoading ? (
              <li className="px-3 py-2.5 text-xs text-gray-400 italic">Searching...</li>
            ) : options.length === 0 ? (
              <li className="px-3 py-2.5 text-xs text-gray-400 italic">No results</li>
            ) : (
              options.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  role="option"
                  className="
                    px-3 py-2 text-xs cursor-pointer
                    flex items-center justify-between
                    transition-colors duration-100
                    hover:bg-gray-50 text-gray-600
                  "
                >
                  <span>{option.label}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}