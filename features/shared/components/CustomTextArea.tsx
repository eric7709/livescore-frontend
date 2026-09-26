'use client';

import { TextareaHTMLAttributes, forwardRef } from 'react';

interface CustomTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  rows?: number;
}

const CustomTextArea = forwardRef<HTMLTextAreaElement, CustomTextAreaProps>(
  ({ label, error, className = '', rows = 4, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`
            w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm 
            bg-white text-sm text-gray-700 
            placeholder:text-gray-400
            hover:border-blue-400 hover:shadow-md 
            focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 
            transition-all duration-200
            resize-y
            disabled:opacity-60 disabled:cursor-not-allowed
            ${error ? 'border-red-300 focus:ring-red-500/40 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

CustomTextArea.displayName = 'CustomTextArea';
export default CustomTextArea;