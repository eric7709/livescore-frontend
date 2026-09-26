import React from "react";

type LoaderType = "fixtures" | "results" | "players";

interface LoaderProps {
  type?: LoaderType;
  count?: number;
}

export default function Loader({ type = "fixtures", count }: LoaderProps) {
  // Default skeleton counts based on view layout
  const itemCount = count || (type === "players" ? 8 : 3);

  return (
    <div className="w-full space-y-6 animate-pulse p-4 sm:p-6">
      {/* Page Title & Header Skeleton */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
        <div className="space-y-2">
          <div className="h-7 w-32 bg-slate-200 rounded-md" />
          <div className="h-4 w-48 bg-slate-100 rounded-md" />
        </div>
        <div className="h-9 w-24 bg-slate-200 rounded-xl" />
      </div>

      {/* Content Skeleton Grid/List */}
      {type === "players" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: itemCount }).map((_, i) => (
            <PlayerCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from({ length: itemCount }).map((_, i) =>
            type === "results" ? (
              <ResultCardSkeleton key={i} />
            ) : (
              <FixtureCardSkeleton key={i} />
            )
          )}
        </div>
      )}
    </div>
  );
}

/* --- Individual Skeleton Components --- */

function FixtureCardSkeleton() {
  return (
    <div className="w-full bg-white border border-slate-200/70 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
      {/* Date Column */}
      <div className="flex flex-col items-start gap-1 pr-6 border-b md:border-b-0 md:border-r border-slate-100 w-full md:w-28 pb-3 md:pb-0">
        <div className="h-3 w-8 bg-slate-200 rounded-xs" />
        <div className="h-7 w-10 bg-slate-300 rounded-md" />
        <div className="h-3 w-12 bg-slate-200 rounded-xs" />
      </div>

      {/* Teams & Center Info */}
      <div className="flex-1 flex items-center justify-center gap-4 w-full">
        <div className="h-5 w-24 bg-slate-200 rounded-md" />
        <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
        <div className="h-5 w-24 bg-slate-200 rounded-md" />
      </div>

      {/* Action Button */}
      <div className="w-full md:w-auto flex justify-end">
        <div className="h-10 w-32 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}

function ResultCardSkeleton() {
  return (
    <div className="w-full bg-white border border-slate-200/70 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
      {/* Date Column */}
      <div className="flex flex-col items-start gap-1 pr-6 border-b md:border-b-0 md:border-r border-slate-100 w-full md:w-28 pb-3 md:pb-0">
        <div className="h-3 w-8 bg-slate-200 rounded-xs" />
        <div className="h-7 w-10 bg-slate-300 rounded-md" />
        <div className="h-3 w-12 bg-slate-200 rounded-xs" />
      </div>

      {/* Match Score & Teams */}
      <div className="flex-1 flex items-center justify-center gap-4 w-full">
        <div className="h-5 w-28 bg-slate-200 rounded-md text-right" />
        <div className="h-8 w-16 bg-slate-300 rounded-lg shrink-0" />
        <div className="h-5 w-28 bg-slate-200 rounded-md" />
      </div>

      {/* Outcome Badge (Win/Loss/Draw) */}
      <div className="w-full md:w-auto flex justify-end">
        <div className="h-6 w-14 bg-slate-200 rounded-full" />
      </div>
    </div>
  );
}

function PlayerCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-4 flex items-center justify-between shadow-xs">
      {/* Avatar & Player Name */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
        <div className="space-y-2">
          <div className="h-4 w-28 bg-slate-300 rounded-md" />
          <div className="h-3 w-12 bg-slate-200 rounded-md" />
        </div>
      </div>

      {/* Status Pill */}
      <div className="h-7 w-20 bg-slate-200 rounded-full" />
    </div>
  );
}