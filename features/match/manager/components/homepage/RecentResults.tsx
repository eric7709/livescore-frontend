"use client";

import { ArrowRight, CalendarDays } from "lucide-react";
import Link from "next/link";
import { useTeamResults } from "@/features/team/utils/team.api";

const badgeColor: Record<string, string> = {
  W: "text-green-600 bg-green-50 border-green-100",
  D: "text-yellow-600 bg-yellow-50 border-yellow-100",
  L: "text-red-600 bg-red-50 border-red-100",
};

export default function RecentResults({ teamId }: { teamId: string }) {
  const { data, isLoading, isError } = useTeamResults(Number(teamId), {
    size: 5,
  });

  const recentResults = data?.content ?? [];

  const formatDate = (matchDate: string) => {
    const [day, month, year] = matchDate.split("-");

    if (!day || !month || !year) {
      return matchDate;
    }

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    if (Number.isNaN(date.getTime())) {
      return matchDate;
    }

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
            Recent Results
          </h2>

          <p className="mt-0.5 text-xs text-gray-400">
            Your team&apos;s latest matches
          </p>
        </div>

        <Link
          href={`/manager/${teamId}/results`}
          className="flex items-center gap-1 text-xs font-medium text-gray-600 transition-colors hover:text-gray-900"
        >
          View all
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="mt-4 space-y-1.5">
        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-lg border border-gray-100 px-3.5 py-2.5"
            >
              <div className="h-3 w-40 rounded bg-gray-100" />
              <div className="mt-1.5 h-2.5 w-24 rounded bg-gray-100" />
            </div>
          ))}

        {isError && (
          <div className="rounded-lg border border-red-100 bg-red-50/40 px-4 py-6 text-center">
            <p className="text-sm font-medium text-red-500">
              Couldn&apos;t load recent results.
            </p>

            <p className="mt-1 text-xs text-red-400">
              Please try again later.
            </p>
          </div>
        )}

        {!isLoading && !isError && recentResults.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-200 px-4 py-7 text-center">
            <CalendarDays
              size={18}
              className="mx-auto text-gray-300"
            />

            <p className="mt-1.5 text-sm font-medium text-gray-500">
              No recent results
            </p>

            <p className="mt-0.5 text-xs text-gray-400">
              Completed matches will appear here.
            </p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          recentResults.map((match) => (
            <Link
              key={match.matchId}
              href={`/match/${match.matchId}`}
              className="group flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/40 px-3.5 py-2.5 transition-colors hover:border-gray-200 hover:bg-gray-50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-tight text-gray-900">
                  {match.homeTeamName}

                  <span className="mx-1.5 font-normal text-gray-400">
                    vs
                  </span>

                  {match.awayTeamName}
                </p>

                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-400">
                  <CalendarDays size={12} />

                  <span>{formatDate(match.matchDate)}</span>

                  <span className="text-gray-300">·</span>

                  <span>
                    {String(match.homeTeamId) === String(teamId)
                      ? "Home"
                      : "Away"}
                  </span>
                </div>
              </div>

              <div className="ml-3 flex shrink-0 items-center gap-2">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-md border text-[10px] font-bold ${
                    badgeColor[match.badge] ??
                    "border-gray-200 bg-gray-50 text-gray-500"
                  }`}
                >
                  {match.badge}
                </span>

                <span className="min-w-[34px] text-right text-sm font-semibold text-gray-900">
                  {match.homeScore}-{match.awayScore}
                </span>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}