// PlayersPage.tsx
"use client";

import { PlayerStatus, PositionGroup } from "@/features/profile/utils/profile.types";
import { useState } from "react";
import PlayerHeader from "../components/managePlayers/PlayerHeader";
import PlayerList from "../components/managePlayers/PlayerList";

const STATUS_OPTIONS: PlayerStatus[] = ["ACTIVE", "INJURED", "SUSPENDED", "UNAVAILABLE"];
const POSITION_OPTIONS: PositionGroup[] = ["GOALKEEPER", "DEFENDER", "MIDFIELDER", "FORWARD"];

export default function PlayersPage() {
  const [status, setStatus] = useState<PlayerStatus | null>(null);
  const [position, setPosition] = useState<PositionGroup | null>(null);

  const handleReset = () => {
    setStatus(null);
    setPosition(null);
  };

  return (
    <div className="space-y-4 p-3">
      <PlayerHeader
        status={status}
        position={position}
        statusOptions={STATUS_OPTIONS}
        positionOptions={POSITION_OPTIONS}
        onStatusChange={setStatus}
        onPositionChange={setPosition}
        onReset={handleReset}
      />
      <PlayerList status={status} position={position} />
    </div>
  );
}