// PlayerHeader.tsx
"use client";

import { PlayerStatus, PositionGroup } from "@/features/profile/utils/profile.types";
import PlayerFilter from "./PlayerFilter";

interface PlayerHeaderProps {
  status: PlayerStatus | null;
  position: PositionGroup | null;
  statusOptions: PlayerStatus[];
  positionOptions: PositionGroup[];
  onStatusChange: (status: PlayerStatus | null) => void;
  onPositionChange: (position: PositionGroup | null) => void;
  onReset: () => void;
}

export default function PlayerHeader({
  status,
  position,
  statusOptions,
  positionOptions,
  onStatusChange,
  onPositionChange,
  onReset,
}: PlayerHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 rounded-xl shadow border border-slate-200/60">
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 rounded-full bg-linear-to-b from-emerald-500 to-emerald-600" />
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Squad</h1>
          <p className="text-xs text-slate-400 font-medium hidden sm:block">Manage your player roster</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <PlayerFilter
          status={status}
          position={position}
          statusOptions={statusOptions}
          positionOptions={positionOptions}
          onStatusChange={onStatusChange}
          onPositionChange={onPositionChange}
          onReset={onReset}
        />
      </div>
    </div>
  );
}