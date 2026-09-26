"use client";

import { ArrowRight, CalendarDays } from "lucide-react";
import Link from "next/link";
import { useTeamFixtures } from "@/features/team/utils/team.api";
import { Fixture } from "@/features/team/utils/team.types";

export default function UpcomingFixtures({ teamId }: { teamId: string }) {
  const { data, isLoading } = useTeamFixtures(Number(teamId));

  const fixtures: Fixture[] = data?.content ?? [];

  const formatDate = (matchDate: string) => {
    const date = new Date(matchDate);

    if (Number.isNaN(date.getTime())) return matchDate;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Upcoming Fixtures
          </h2>

          <p className="mt-0.5 text-xs text-gray-400">
            Your team&apos;s next matches
          </p>
        </div>

        <Link
          href={`/manager/${teamId}/fixtures`}
          className="flex items-center gap-1 text-xs font-medium text-gray-600 transition-colors hover:text-gray-900"
        >
          View all
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="mt-4 space-y-1.5">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-lg border border-gray-100 px-3.5 py-2.5"
            >
              <div className="h-3 w-40 rounded bg-gray-100" />
              <div className="mt-1.5 h-2.5 w-44 rounded bg-gray-100" />
            </div>
          ))
        ) : fixtures.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 px-4 py-7 text-center">
            <CalendarDays
              size={18}
              className="mx-auto text-gray-300"
            />

            <p className="mt-1.5 text-sm font-medium text-gray-500">
              No upcoming fixtures
            </p>

            <p className="mt-0.5 text-xs text-gray-400">
              Your next matches will appear here.
            </p>
          </div>
        ) : (
          fixtures.map((fixture) => {
            const isHome =
              String(fixture.homeTeamId) === String(teamId);

            return (
              <Link
                key={fixture.matchId}
                href={`/match/${fixture.matchId}`}
                className="group flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/40 px-3.5 py-2.5 transition-colors hover:border-gray-200 hover:bg-gray-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold leading-tight text-gray-900">
                    {fixture.homeTeamName}
                    <span className="mx-1.5 font-normal text-gray-400">
                      vs
                    </span>
                    {fixture.awayTeamName}
                  </p>

                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-400">
                    <CalendarDays size={12} />

                    <span>{formatDate(fixture.matchDate)}</span>

                    <span className="text-gray-300">·</span>

                    <span>{fixture.matchTime}</span>
                  </div>
                </div>

                <span className="ml-3 shrink-0 text-[10px] font-medium text-gray-400">
                  {isHome ? "Home" : "Away"}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}