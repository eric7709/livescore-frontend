"use client";

import { use } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Users,
  Trophy,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

import UpcomingFixtures from "../../../features/match/manager/components/homepage/UpcomingFixtures";
import RecentResults from "../../../features/match/manager/components/homepage/RecentResults";
import RecentForm from "../../../features/match/manager/components/homepage/RecentForm";

import {
  useTeamResults,
  useTeamFixtures,
} from "@/features/team/utils/team.api";

type Props = {
  params: Promise<{
    teamId: string;
  }>;
};

export default function ManagerDashboard({ params }: Props) {
  const { teamId } = use(params);

  const { data, isLoading: resultsLoading } =
    useTeamResults(Number(teamId));

  const { data: fixturesData } = useTeamFixtures(Number(teamId), {
    size: 10,
  });

  const nextFixture = fixturesData?.content?.[0];

  const createLineupHref = nextFixture
    ? `/lineup-builder?match=${nextFixture.matchId}&team=${teamId}`
    : `/manager/${teamId}/fixtures`;

  const quickActions = [
    {
      title: "Create Lineup",
      description: nextFixture
        ? "Prepare for your next match"
        : "No upcoming match yet",
      icon: ClipboardList,
      href: createLineupHref,
    },
    {
      title: "Manage Squad",
      description: "View and manage your players",
      icon: Users,
      href: `/manager/${teamId}/players`,
    },
    {
      title: "See Results",
      description: "Review recent performance",
      icon: Trophy,
      href: `/manager/${teamId}/results`,
    },
    {
      title: "Match Schedule",
      description: "View all upcoming fixtures",
      icon: CalendarDays,
      href: `/manager/${teamId}/fixtures`,
    },
  ];

  return (
    <div className="min-h-full bg-gray-50">
      <div className="mx-auto max-w-[1400px] p-4 sm:p-6">
        {/* Page Header */}
        <div className="mb-5 rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
              Club Dashboard
            </span>
          </div>

          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Welcome back, Coach. Here&apos;s your team&apos;s overview.
          </p>
        </div>

        {/* Recent Form */}
        <div className="mb-5">
          <RecentForm
            teamId={teamId}
            games={data?.content}
            isLoading={resultsLoading}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-5">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-gray-900">
              Quick Actions
            </h2>

            <p className="mt-0.5 text-xs text-gray-400">
              Manage your club
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-gray-50/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600 transition-colors group-hover:border-emerald-100 group-hover:bg-emerald-50 group-hover:text-emerald-600">
                      <Icon size={17} />
                    </div>

                    <ArrowRight
                      size={14}
                      className="text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500"
                    />
                  </div>

                  <h3 className="mt-3 text-sm font-semibold text-gray-900">
                    {action.title}
                  </h3>

                  <p className="mt-1 text-xs leading-relaxed text-gray-400">
                    {action.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Fixtures & Results */}
        <div className="grid gap-5 lg:grid-cols-2">
          <UpcomingFixtures teamId={teamId} />
          <RecentResults teamId={teamId} />
        </div>
      </div>
    </div>
  );
}