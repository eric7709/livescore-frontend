"use client";

import { useTeam } from "@/features/team/utils/team.api";
import { useParams } from "next/navigation";

export default function Page() {
  const { teamId } = useParams<{ teamId: string }>();
  const { data, isLoading, isError } = useTeam(Number(teamId));

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 mt-5">
      <div className="h-32 w-32 rounded-full shadow-md border border-green-400" />
        <div className="text-sm flex-1 space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mt-5 text-sm text-red-500">
        Failed to load team details.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 mt-5">
      {/* Team logo placeholder */}
      <div className="h-32 w-32 rounded-full shadow-md border border-green-400" />

      <div className="text-sm flex-1 space-y-1">
        <p className="text-base font-semibold">{data.name}</p>
        <p>
          Stadium: <span className="font-semibold">{data.stadium}</span>
        </p>
        <p>
          Manager: <span className="font-semibold">{data.managerName}</span>
        </p>
      </div>
    </div>
  );
}