'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TiArrowSortedDown } from 'react-icons/ti';

interface CustomDateDropdownProps {
  onSelect: (date: Date | null) => void;
  alignPosition?: 'left' | 'right';
  dropDirection?: 'up' | 'down';
  value?: Date | null;
  placeholder?: string;
  disabled?: boolean;
  zIndex?: number;
  error?: string;
  label?: string;
}

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CustomDateDropdown({
  onSelect,
  alignPosition = 'right',
  dropDirection = 'down',
  value = null,
  placeholder = 'Select date',
  disabled = false,
  zIndex,
  error,
  label,
}: CustomDateDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);
  const [viewYear, setViewYear] = useState<number>(
    value ? value.getFullYear() : new Date().getFullYear()
  );
  const [viewMonth, setViewMonth] = useState<number>(
    value ? value.getMonth() : new Date().getMonth()
  );
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Update when value prop changes
  useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setViewYear(value.getFullYear());
      setViewMonth(value.getMonth());
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  // ─── Positioning logic ──────────────────────────────────────────
  const updateDropdownPosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const shouldOpenUp =
      dropDirection === "up" ||
      (dropDirection === "down" && spaceBelow < 400 && spaceAbove > spaceBelow);

    // Calculate left position based on alignPosition
    let left;
    if (alignPosition === 'right') {
      // Align exactly to the right edge of the button
      left = rect.right - 256; // 256 is the default width
    } else {
      // Align to the left edge of the button
      left = rect.left;
    }

    // Ensure dropdown doesn't go off screen
    if (left + 256 > window.innerWidth - 8) {
      left = window.innerWidth - 256 - 8;
    }
    if (left < 8) {
      left = 8;
    }

    setDropdownStyle({
      position: "fixed",
      width: 256,
      left: left,
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

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewYear, viewMonth, day);
    setSelectedDate(newDate);
    onSelect(newDate);
    setIsOpen(false);
  };

  const changeMonth = (offset: number) => {
    const newMonth = viewMonth + offset;
    if (newMonth < 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else if (newMonth > 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(newMonth);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const displayDate = selectedDate
    ? `${months[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
    : placeholder;

  return (
    <div className="w-full" ref={containerRef}>
      {label && <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>}
      
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        disabled={disabled}
        aria-haspopup="dialog"
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
        <span className="truncate">{displayDate}</span>
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
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden p-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => changeMonth(-1)}
              className="p-0.5 rounded hover:bg-gray-100 text-gray-500 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-800">
                {months[viewMonth]} {viewYear}
              </span>
              <button
                onClick={goToToday}
                className="text-[10px] font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                Today
              </button>
            </div>
            <button
              onClick={() => changeMonth(1)}
              className="p-0.5 rounded hover:bg-gray-100 text-gray-500 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="h-7" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const today = new Date();
              const isToday =
                today.getDate() === day &&
                today.getMonth() === viewMonth &&
                today.getFullYear() === viewYear;
              const isSelected =
                selectedDate &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === viewMonth &&
                selectedDate.getFullYear() === viewYear;

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`
                    h-7 w-full rounded-full text-xs font-medium
                    transition-all duration-150
                    ${isSelected 
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-200 hover:bg-blue-700' 
                      : isToday 
                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer with Clear */}
          <div className="mt-2 pt-1.5 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => {
                setSelectedDate(null);
                onSelect(null);
                setIsOpen(false);
              }}
              className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors px-2 py-0.5 rounded hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}