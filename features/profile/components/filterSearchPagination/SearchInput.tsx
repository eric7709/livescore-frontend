// src/_shared/components/SearchInput.tsx
import { Search } from "lucide-react";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchInput({ value, onChange, placeholder = "Search...", className = "" }: SearchInputProps) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search size={13} className="absolute left-3 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-52 rounded-xl border border-gray-200 bg-white pl-8 pr-3 text-xs text-gray-700
          placeholder:text-gray-400 shadow-sm outline-none
          transition-all duration-200
          hover:border-gray-300
          focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}