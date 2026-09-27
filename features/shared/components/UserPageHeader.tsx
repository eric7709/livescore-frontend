"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { inter, scoreMono } from "@/public/fonts/fonts";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Search, Bell } from "lucide-react";
import Logo from "./Logo";

export default function UserPageHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Entirely hide on admin, manager, and moderator routes
  const isCompletelyHiddenRoute = 
    pathname.startsWith("/admin") || 
    pathname.startsWith("/manager") || 
    pathname.startsWith("/lineup-builder") || 
    pathname.startsWith("/moderator") ||
    pathname.startsWith("/auth");

  // The whole filter bar — status tabs AND the date picker — only applies
  // to the home page's fixtures list, so it's hidden everywhere else.
  const isSubBarHidden = pathname !== "/";

  const currentStatus = searchParams.get("status") || "all";
  const todayIso = new Date().toISOString().split("T")[0];
  const selectedDate = searchParams.get("date") || todayIso;

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isCompletelyHiddenRoute) {
    return null;
  }

  const updateQueryParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDateShift = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const newDateIso = d.toISOString().split("T")[0];
    updateQueryParams("date", newDateIso);
  };

  const formatDisplayDate = (dateStr: string) => {
    if (dateStr === todayIso) return "Today";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const statusTabs = [
    { id: "all", label: "All" },
    { id: "live", label: "Live", isLive: true },
    { id: "upcoming", label: "Upcoming" },
    { id: "finished", label: "Finished" },
  ];

  return (
    <header className={`${inter.variable} z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md`}>
      {/* Top Navbar */}
      <div className="mx-auto flex h-15 items-center justify-between px-4 py-3 sm:px-6">
        <Logo />

        {/* Global Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button 
            aria-label="Search matches"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 sm:h-9 sm:w-9"
          >
            <Search size={16} className="sm:hidden" />
            <Search size={18} className="hidden sm:block" />
          </button>
          <button 
            aria-label="Notifications"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 sm:h-9 sm:w-9"
          >
            <Bell size={16} className="sm:hidden" />
            <Bell size={18} className="hidden sm:block" />
          </button>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      {!isSubBarHidden && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-3 py-2 sm:px-6">
          <div className="flex items-center justify-between gap-2">

            {/* Status Tabs */}
            <div className="no-scrollbar -mr-2 flex flex-1 overflow-x-auto pr-2 sm:mr-0 sm:pr-0">
              <nav className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-200/50 p-1">
                {statusTabs.map((tab) => {
                  const isActive = currentStatus === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => updateQueryParams("status", tab.id)}
                      className={`${scoreMono.className} relative flex h-7 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-[10px] font-bold uppercase tracking-wider transition-all sm:h-8 sm:px-3 sm:text-[11px] ${
                        isActive
                          ? "border border-slate-200/60 bg-white text-slate-900 shadow-2xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {tab.isLive && (
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                        </span>
                      )}
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Date Picker Container */}
            <div className="relative shrink-0" ref={popoverRef}>
              <div className="flex items-center gap-0.5 rounded-xl border border-slate-200/80 bg-white p-1 shadow-2xs">
                
                {/* Previous Day Arrow: Hidden on mobile */}
                <button
                  onClick={() => handleDateShift(-1)}
                  className="hidden h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 sm:flex"
                  aria-label="Previous day"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Main Date Display Trigger */}
                <button
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  className={`${scoreMono.className} flex h-6 items-center gap-1.5 rounded-lg bg-slate-50 px-2 text-[10px] font-bold text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 sm:h-7 sm:gap-2 sm:px-2.5 sm:text-xs`}
                >
                  <CalendarIcon size={12} className="text-slate-400 sm:hidden" />
                  <CalendarIcon size={14} className="hidden text-slate-400 sm:block" />
                  <span>{formatDisplayDate(selectedDate)}</span>
                </button>

                {/* Next Day Arrow: Hidden on mobile */}
                <button
                  onClick={() => handleDateShift(1)}
                  className="hidden h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 sm:flex"
                  aria-label="Next day"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Date Popover */}
              {isDatePickerOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 w-60 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                  <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className={`${scoreMono.className} text-[10px] font-bold uppercase tracking-wider text-slate-400`}>
                      Select Date
                    </span>
                    <button
                      onClick={() => {
                        updateQueryParams("date", todayIso);
                        setIsDatePickerOpen(false);
                      }}
                      className="text-[10px] font-semibold text-emerald-600 hover:underline"
                    >
                      Reset Today
                    </button>
                  </div>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      if (e.target.value) {
                        updateQueryParams("date", e.target.value);
                        setIsDatePickerOpen(false);
                      }
                    }}
                    className={`${scoreMono.className} w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500`}
                  />
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
}