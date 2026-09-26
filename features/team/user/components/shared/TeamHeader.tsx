"use client";

import TeamBatch from "./TeamBatch";
import TeamTabs from "./TeamTabs";
import { useTeamSquad } from "@/features/team/utils/team.api";

interface TeamHeaderProps {
  teamId: number;
}

export default function TeamHeader({ teamId }: TeamHeaderProps) {
  const { data, isLoading, isError } = useTeamSquad(teamId);
  const manager = data?.manager;

  console.log(data, "MANAGER")
  

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 pt-5">
        <div className="h-22 animate-pulse rounded-xl border border-[#E2E7DD] bg-[#F7F8F5]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-3 pt-5">
        <p className="py-4 text-center text-[13px] text-[#6B7566]">
          Couldn&apos;t load this team. Try refreshing.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pt-5">
      <TeamBatch name={manager?.teamName ?? "Unknown team"} id={teamId} crestUrl={manager?.teamLogoUrl} />
      <TeamTabs teamId={manager?.teamId ?? teamId} />
    </div>
  );
}