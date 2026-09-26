'use client';

import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react'; // or any icon set
import { TiArrowSortedDown } from 'react-icons/ti';

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: Option[];
  onSelect: (value: any) => void;
  value?: string;
  placeholder?: string;
  alignPosition?: 'left' | 'right';
  disabled?: boolean;
  zIndex?: number
  error?: string
}

export default function CustomSelect({
  options,
  onSelect,
  value,
  placeholder = 'Select an option',
  alignPosition = 'right',
  disabled = false,
  zIndex,
  error
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>(
    value ? options.find((opt) => opt.value === value)?.label || placeholder : placeholder
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const found = options.find((opt) => opt.value === value);
    setSelectedLabel(found ? found.label : placeholder);
  }, [value, options, placeholder]);

  const handleOptionClick = (option: Option) => {
    setSelectedLabel(option.label);
    onSelect(option.value);
    setIsOpen(false);
  };

  return (
    <div className="relative z-5000" style={{zIndex}} ref={containerRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          px-3.5 h-10 border w-full border-gray-200 rounded-lg shadow 
          bg-white text-[13px] font-medium text-gray-700 
          transition-all duration-200 
          flex items-center justify-between min-w-40
          ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span className="truncate text-[13px]">{selectedLabel}</span>
        <TiArrowSortedDown />
      </button>
      {isOpen && !disabled && (
        <div
          className={`
            absolute mt-2 w-full min-w-40 
            bg-white rounded-xl shadow-md border-2 border-gray-200 
            z-10000 overflow-hidden
            ${alignPosition === 'right' ? 'right-0' : 'left-0'}
          `}
        >
          <ul className="py-1.5 max-h-60 overflow-auto text-[13px]">
            {options.length === 0 ? (
              <li className="px-4 py-3 text-gray-400 italic">No options</li>
            ) : (
              options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <li
                    key={option.value}
                    onClick={() => handleOptionClick(option)}
                    className={`
                      px-4 py-2.5 text-[13px] cursor-pointer 
                      flex items-center justify-between
                      transition-colors font-semibold duration-150
                      ${isSelected 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-100 text-gray-600'
                      }
                    `}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="h-4 w-4 text-blue-600" />}
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