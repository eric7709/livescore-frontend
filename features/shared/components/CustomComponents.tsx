'use client';

import { Search, Check } from 'lucide-react';
import { TiArrowSortedDown } from 'react-icons/ti';
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, useState, useRef, useEffect, useCallback } from 'react';

// ─── CustomInput ─────────────────────────────────────────────────

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  widthStyle?: string;
  placeHolder?: string;
  search?: string;
}

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ label, error, widthStyle, placeHolder = "", search, className = '', ...props }, ref) => (
    <div>
      {label && <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>}
      <div className="relative">
        {search && <Search size={14} className="absolute top-1/2 text-gray-400 -translate-y-1/2 left-2.5" />}
        <input
          ref={ref}
          placeholder={placeHolder}
          className={`
            h-9 px-3 ${search ? "pl-8" : ""} border ${widthStyle ?? "w-full"}
            rounded-xl bg-white text-xs text-gray-700 outline-none
            border-gray-200 placeholder:text-gray-400
            transition-colors duration-150
            disabled:opacity-60 disabled:cursor-not-allowed
            ${error ? 'border-red-300' : 'focus:border-blue-400'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-0.5 text-[11px] text-red-500">{error}</p>}
    </div>
  )
);
CustomInput.displayName = 'CustomInput';

// ─── CustomSelect ─────────────────────────────────────────────────

interface Option {
  label: string;
  value: string;
}


export type CustomSelectProps = {
  options: Option[];
  onSelect: (value: string) => void;
  value: string;
  placeholder?: string;
  alignPosition?: "left" | "right";
  dropDirection?: "up" | "down";
  disabled?: boolean;
  zIndex?: number;
  error?: string;
};

export function CustomSelect({
  options,
  onSelect,
  value,
  placeholder = "Select an option",
  alignPosition = "right",
  dropDirection = "down",
  disabled = false,
  zIndex,
  error,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder;

  // ─── Positioning logic ──────────────────────────────────────────
  const updateDropdownPosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const shouldOpenUp =
      dropDirection === "up" ||
      (dropDirection === "down" && spaceBelow < 220 && spaceAbove > spaceBelow);

    const left = alignPosition === "right" ? rect.left : rect.left;
    // For left align, we could adjust, but we keep it simple: left aligned to button.

    setDropdownStyle({
      position: "fixed",
      width: rect.width,
      left: rect.left,
      zIndex: zIndex || 9999,
      ...(shouldOpenUp
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  }, [alignPosition, dropDirection, zIndex]);
  // ─── Toggle open ────────────────────────────────────────────────
  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      updateDropdownPosition();
    }
    setIsOpen((prev) => !prev);
  };
  // ─── Close dropdown ─────────────────────────────────────────────
  const closeDropdown = useCallback(() => setIsOpen(false), []);
  // ─── Handle outside clicks ─────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeDropdown]);

  // ─── Handle Escape key ──────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDropdown();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeDropdown]);

  // ─── Reposition on window resize/scroll ────────────────────────
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

  // ─── Select option ──────────────────────────────────────────────
  const handleSelect = (optionValue: string) => {
    onSelect(optionValue);
    closeDropdown();
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`
          h-9 px-3 border w-full rounded-xl
          bg-white text-xs font-medium text-gray-700
          flex items-center justify-between gap-2
          transition-colors duration-150
          ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-blue-400"}
          ${error ? "border-red-300 focus:ring-1 focus:ring-red-300" : "border-gray-200 focus:border-blue-400"}
        `}
      >
        <span className="truncate">{selectedLabel}</span>
        <TiArrowSortedDown
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {isOpen && !disabled && (
        <div
          style={dropdownStyle}
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <ul className="py-1 max-h-52 overflow-auto" role="listbox">
            {options.length === 0 ? (
              <li className="px-3 py-2.5 text-xs text-gray-400 italic">No options</li>
            ) : (
              options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <li
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    role="option"
                    aria-selected={isSelected}
                    className={`
                      px-3 py-2 text-xs cursor-pointer
                      flex items-center justify-between
                      transition-colors duration-100
                      ${
                        isSelected
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "hover:bg-gray-50 text-gray-600"
                      }
                    `}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check size={12} className="text-blue-600" />}
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




// ─── CustomTextArea ───────────────────────────────────────────────

interface CustomTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  rows?: number;
}

export const CustomTextArea = forwardRef<HTMLTextAreaElement, CustomTextAreaProps>(
  ({ label, error, className = '', rows = 4, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>}
      <textarea
        ref={ref}
        rows={rows}
        className={`
          w-full px-3 py-2 border border-gray-200 rounded-xl
          bg-white text-xs text-gray-700
          placeholder:text-gray-400
          focus:outline-none focus:border-blue-400
          transition-colors duration-150 resize-y
          disabled:opacity-60 disabled:cursor-not-allowed
          ${error ? 'border-red-300' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-0.5 text-[11px] text-red-500">{error}</p>}
    </div>
  )
);
CustomTextArea.displayName = 'CustomTextArea';