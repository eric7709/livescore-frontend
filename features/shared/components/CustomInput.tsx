'use client';

import { Search, LucideIcon } from 'lucide-react';
import { InputHTMLAttributes, forwardRef } from 'react';

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  widthStyle?: string;
  placeholder?: string;
  icon?: LucideIcon;
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ label, error, widthStyle, placeholder = '', icon: Icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon size={18} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 pointer-events-none" />
          )}
          <input
            ref={ref}
            placeholder={placeholder}
            className={`
              w-full h-11 px-3.5 ${Icon ? 'pl-10' : ''} 
              border ${widthStyle ? widthStyle : 'w-full'} outline-none 
              border-gray-200 rounded-xl shadow-sm
              bg-white text-sm text-gray-900 
              placeholder:text-gray-400
              transition-all duration-200
              focus:border-black focus:ring-1 focus:ring-black
              disabled:opacity-60 disabled:cursor-not-allowed
              ${error ? 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50/20' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);

CustomInput.displayName = 'CustomInput';
export default CustomInput;