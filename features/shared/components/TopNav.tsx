"use client";

import React from "react";

import { Bell, Search, User, ChevronDown } from "lucide-react";

export default function TopNav() {
  return (
    <header className="w-full h-17 bg-white border-b border-emerald-100 flex items-center justify-between px-6 select-none">

      {/* Left: Search */}
      <div className="relative w-72 group">
        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none group-focus-within:text-emerald-500 transition-colors">
          <Search size={14} />
        </span>

        <input
          type="text"
          placeholder="Quick search..."
          className="w-full h-8 pl-9 pr-3 text-xs bg-gray-50 hover:bg-gray-100 focus:bg-white border border-gray-200 focus:border-emerald-500/30 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all duration-150"
        />
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4">

        {/* Notification Bell */}
        <button className="relative p-1.5 text-gray-400 hover:text-emerald-600 transition-colors focus:outline-none">
          <Bell size={16} />

          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200" />

        {/* User Dropdown */}
        <button className="flex items-center gap-2.5 group focus:outline-none">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
            <User size={15} />
          </div>

          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-medium text-gray-700 group-hover:text-emerald-600 transition-colors">
              Eric Zestio
            </span>

            <span className="text-[10px] font-medium text-gray-400 -mt-0.5">
              Admin
            </span>
          </div>

          <ChevronDown
            size={12}
            className="text-gray-400 group-hover:text-emerald-600 transition-colors"
          />
        </button>
      </div>
    </header>
  );
}