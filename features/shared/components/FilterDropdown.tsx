// components/FilterDropdown.tsx
import { useState, useRef, useEffect, ReactNode } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { CustomSelect } from "@/features/shared/components/CustomComponents";

type FilterField<T = string> = {
  id: string;
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  placeholder?: string;
};

type FilterDropdownProps = {
  filters: FilterField[];
  onReset?: () => void;
  activeCount?: number;
  triggerLabel?: string;
  extra?: ReactNode; // custom fields rendered below the select filters
};

export function FilterDropdown({ filters, onReset, activeCount, triggerLabel = "Filters", extra }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const computedActive = activeCount ?? filters.filter(f => f.value !== "ALL" && f.value !== "" && f.value !== null).length;
  const hasActive = computedActive > 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
        className={`
          relative flex items-center gap-2 rounded-xl border  px-3.5 h-10 text-xs font-medium
          transition-all duration-200 shadow-sm
          ${open
            ? "border-blue-200 bg-blue-50 text-blue-700 shadow-blue-100"
            : hasActive
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
          }
        `}
      >
        <SlidersHorizontal size={12} className={hasActive ? "text-blue-600" : "text-gray-400"} />
        <span>{triggerLabel}</span>
        {hasActive && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white">
            {computedActive}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={12} className="text-gray-400" />
              <p className="text-xs font-semibold text-gray-700">{triggerLabel}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
            >
              <X size={12} />
            </button>
          </div>

          <div className="px-4 py-3 space-y-3">
            {filters.map((field) => (
              <div key={field.id}>
                <p className="mb-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{field.label}</p>
                <CustomSelect
                  placeholder={field.placeholder || `All ${field.label.toLowerCase()}`}
                  options={field.options}
                  value={field.value}
                  onSelect={(val) => field.onChange(val)}
                />
              </div>
            ))}
            {extra}
          </div>

          {hasActive && onReset && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/60">
              <button
                type="button"
                onClick={() => { onReset(); setOpen(false); }}
                className="w-full rounded-xl border border-gray-200 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-white hover:text-gray-800 hover:border-gray-300"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}