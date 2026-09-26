"use client";

import { CalendarDays, Clock, MapPin, Radio, Users } from "lucide-react";
import Link from "next/link";

interface Fixture {
  id: string;
  home: string;
  away: string;
  date: string;
  time: string;
  venue?: string;
  status?: string;
}

interface FixtureCardProps {
  fixture: Fixture;
  teamId: number | string;
  isFirst?: boolean;
}

export default function FixtureCard({
  fixture,
  teamId,
  isFirst = false,
}: FixtureCardProps) {
  const parsedDate = new Date(fixture.date);

  const isValidDate = !Number.isNaN(parsedDate.getTime());

  const weekday = isValidDate
    ? parsedDate.toLocaleDateString("en-US", {
        weekday: "short",
      })
    : "";

  const day = isValidDate ? parsedDate.getDate() : "";

  const month = isValidDate
    ? parsedDate
        .toLocaleDateString("en-US", {
          month: "short",
        })
        .toUpperCase()
    : "";

  const isLive = Boolean(fixture.status);

  return (
    <div
      className={`group flex overflow-hidden rounded-xl border bg-white transition-all ${
        isFirst
          ? "border-emerald-200 shadow-sm hover:border-emerald-300 hover:shadow-md"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      {/* Date */}
      <div
        className={`flex w-[4.25rem] shrink-0 flex-col items-center justify-center border-r border-dashed px-2 py-3 ${
          isFirst
            ? "border-emerald-200 bg-emerald-50/60"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <span
          className={`text-[9px] font-bold uppercase tracking-wider ${
            isFirst ? "text-emerald-600" : "text-gray-400"
          }`}
        >
          {weekday}
        </span>

        <span
          className={`mt-0.5 font-mono text-2xl font-bold leading-none tabular-nums ${
            isFirst ? "text-emerald-700" : "text-gray-800"
          }`}
        >
          {day}
        </span>

        <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-gray-400">
          {month}
        </span>

        <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-gray-500">
          <Clock size={10} className="text-gray-400" />
          {fixture.time}
        </div>
      </div>

      {/* Main */}
      <div className="min-w-0 flex-1 px-3.5 py-3">
        <div className="mb-2 flex items-center justify-between">
          {isFirst ? (
            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Next Up
            </span>
          ) : (
            <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
              Upcoming
            </span>
          )}

          {isLive && (
            <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-red-500">
              <Radio size={10} className="animate-pulse" />
              Live
            </span>
          )}
        </div>

        {/* Teams */}
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-right text-sm font-semibold text-gray-900">
            {fixture.home}
          </p>

          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold ${
              isFirst
                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                : "border-gray-200 bg-gray-50 text-gray-400"
            }`}
          >
            VS
          </div>

          <p className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-gray-900">
            {fixture.away}
          </p>
        </div>

        {/* Bottom */}
        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
          <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-gray-400">
            <MapPin size={11} className="shrink-0" />

            <span className="truncate">
              {fixture.venue || "Venue TBD"}
            </span>
          </div>

          {isFirst && (
            <Link
              href={`/lineup-builder?match=${fixture.id}&team=${teamId}`}
              className="flex shrink-0 items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1.5 text-[10px] font-semibold text-white transition-colors hover:bg-emerald-500"
            >
              <Users size={11} />
              Build Lineup
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}