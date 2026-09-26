// PlayerList.tsx
"use client";

import { useParams } from "next/navigation";
import PlayerCard from "./PlayerCard";
import { useTeamSquad } from "@/features/team/utils/team.api";
import { PlayerStatus, PositionGroup } from "@/features/profile/utils/profile.types";
import { getPositionCodesForGroup } from "@/features/profile/utils/positionGroup";
import { Player } from "@/features/team/utils/team.types";
import Loader from "@/features/match/manager/components/shared/Loader";

interface PlayerListProps {
  status?: PlayerStatus | null;
  position?: PositionGroup | null;
}

export default function PlayerList({ status = null, position = null }: PlayerListProps) {
  const params = useParams();
  const parsedTeamId = Number(params.teamId);
  const teamId = Number.isNaN(parsedTeamId) ? undefined : parsedTeamId;

  const positionCodes = position ? getPositionCodesForGroup(position) : undefined;

  const { data, isLoading, isError } = useTeamSquad(teamId as number, {
    status: status ?? undefined,
    position: positionCodes,
  });

  const players = data?.squad ?? [];

  if (isLoading) {
    return <Loader type="players"/>;
  }

  if (isError) {
    return <div className="text-red-500">Failed to load players.</div>;
  }

  if (players.length === 0) {
    return <div className="text-gray-500">No players found.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {players.map((player: Player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
}