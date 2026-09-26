// PlayerCard.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ChevronDown, Star, ShieldCheck, Loader2, Crown, Plus } from "lucide-react";
import { PlayerStatus} from "@/features/profile/utils/profile.types";
import { Player } from "@/features/team/utils/team.types";
import { useUpdatePlayerStatus, useMakeCaptain, useMakeViceCaptain } from "@/features/profile/utils/profile.api";

interface PlayerCardProps {
  player: Player;
}

const STATUS_CONFIG: Record<PlayerStatus, { label: string; dotClass: string; textClass: string }> = {
  ACTIVE: { label: "Active", dotClass: "bg-emerald-500", textClass: "text-emerald-700" },
  INJURED: { label: "Injured", dotClass: "bg-red-500", textClass: "text-red-700" },
  SUSPENDED: { label: "Suspended", dotClass: "bg-amber-500", textClass: "text-amber-700" },
  UNAVAILABLE: { label: "Unavailable", dotClass: "bg-slate-400", textClass: "text-slate-500" },
};

const STATUS_OPTIONS: PlayerStatus[] = ["ACTIVE", "INJURED", "SUSPENDED", "UNAVAILABLE"];

// Fixed palette so colors stay legible (readable text on top) — the pick
// per-player is randomized (well, hashed) but stable across re-renders,
// so the same player always lands on the same color instead of flickering.
const AVATAR_PALETTE = [
  { bg: "from-blue-100 to-blue-200", border: "border-blue-200/60", text: "text-blue-700" },
  { bg: "from-purple-100 to-purple-200", border: "border-purple-200/60", text: "text-purple-700" },
  { bg: "from-rose-100 to-rose-200", border: "border-rose-200/60", text: "text-rose-700" },
  { bg: "from-orange-100 to-orange-200", border: "border-orange-200/60", text: "text-orange-700" },
  { bg: "from-teal-100 to-teal-200", border: "border-teal-200/60", text: "text-teal-700" },
  { bg: "from-indigo-100 to-indigo-200", border: "border-indigo-200/60", text: "text-indigo-700" },
  { bg: "from-pink-100 to-pink-200", border: "border-pink-200/60", text: "text-pink-700" },
  { bg: "from-cyan-100 to-cyan-200", border: "border-cyan-200/60", text: "text-cyan-700" },
  { bg: "from-lime-100 to-lime-200", border: "border-lime-200/60", text: "text-lime-700" },
  { bg: "from-fuchsia-100 to-fuchsia-200", border: "border-fuchsia-200/60", text: "text-fuchsia-700" },
];

// First letter of the first two names (e.g. "Ibe Emeka Eric" -> "IE").
// Previously this fell back to first+last name; now it's always first+second.
function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

// Simple deterministic hash so the "random" avatar color is stable per
// player (same player = same color every render) instead of reshuffling.
function avatarPaletteFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const params = useParams();
  const teamId = Number(params.teamId);
  const [isOpen, setIsOpen] = useState(false);

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdatePlayerStatus(teamId);
  const { mutate: makeCaptain, isPending: isMakingCaptain } = useMakeCaptain(teamId);
  const { mutate: makeViceCaptain, isPending: isMakingViceCaptain } = useMakeViceCaptain(teamId);

  const statusConfig = STATUS_CONFIG[player.status] ?? STATUS_CONFIG.ACTIVE;
  const isCaptain = player.captainStatus === "CAPTAIN";
  const isViceCaptain = player.captainStatus === "VICE_CAPTAIN";
  const isInjured = player.status === "INJURED";
  const avatarColors = avatarPaletteFor(player.fullName || String(player.id));

  function handleSelect(status: PlayerStatus) {
    setIsOpen(false);
    if (status === player.status) return;
    updateStatus({ playerId: player.id, status });
  }

  return (
    // NOTE: overflow-hidden removed here — it was clipping the absolutely
    // positioned status dropdown below. rounded-xl still clips the
    // background/border since none of the direct children bleed past it
    // except the intentionally-overflowing dropdown menu.
    <div
      className={`group relative bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 ${
        isCaptain
          ? "border-amber-300 ring-2 ring-amber-300/60 bg-gradient-to-br from-amber-50/80 to-white"
          : isViceCaptain
          ? "border-sky-200 ring-1 ring-sky-200/60 bg-gradient-to-br from-sky-50/40 to-white"
          : "border-slate-200/60 hover:border-slate-300/80"
      }`}
    >
      {/* Captain ribbon — unmissable at a glance */}
      {isCaptain && (
        <div className="absolute -top-2.5 left-4 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 shadow-sm">
          <Crown size={11} className="text-white fill-white" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white">Captain</span>
        </div>
      )}

      {/* Vice-captain ribbon — same idea, quieter sky color, shield icon */}
      {isViceCaptain && (
        <div className="absolute -top-2.5 left-4 flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500 shadow-sm">
          <ShieldCheck size={11} className="text-white fill-white" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white">Vice Captain</span>
        </div>
      )}

      <div className="p-4 sm:p-5 flex items-center gap-4">
        {/* Avatar — always shows initials now. Real photo rendering is
            commented out below in case we want to bring it back later. */}
        <div className="relative shrink-0">
          {/* {player.avatarUrl ? (
            <img
              src={player.avatarUrl}
              alt={player.fullName}
              className={`w-14 h-14 rounded-full object-cover border ${
                isCaptain ? "border-amber-300" : isViceCaptain ? "border-sky-200" : "border-slate-200/60"
              }`}
            />
          ) : ( */}
          <div
            className={`w-14 h-14 rounded-full bg-linear-to-br ${avatarColors.bg} border ${avatarColors.border} grid place-items-center`}
          >
            <span className={`text-sm font-bold ${avatarColors.text}`}>{initials(player.fullName)}</span>
          </div>
          {/* )} */}

          {/* Injury cross — reads instantly without opening the status dropdown */}
          {isInjured && (
            <div
              className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-red-500 border-2 border-white grid place-items-center"
              title="Injured"
            >
              <Plus size={11} className="text-white" strokeWidth={3} />
            </div>
          )}

          {player.squadNumber != null && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-800 border-2 border-white grid place-items-center">
              <span className="text-[10px] font-bold text-white">{player.squadNumber}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={`text-sm font-semibold truncate ${isCaptain ? "text-amber-900" : "text-slate-800"}`}>
              {player.fullName}
            </p>
            {isViceCaptain && <ShieldCheck size={13} className="text-sky-400 fill-sky-400 shrink-0" />}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {player.position}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {!isCaptain && (
            <button
              type="button"
              disabled={isMakingCaptain}
              onClick={() => makeCaptain(player.id)}
              title="Make captain"
              className="p-1.5 rounded-lg border border-slate-200/80 hover:bg-amber-50 hover:border-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isMakingCaptain ? (
                <Loader2 size={14} className="text-amber-500 animate-spin" />
              ) : (
                <Star size={14} className="text-amber-500" />
              )}
            </button>
          )}

          {!isViceCaptain && (
            <button
              type="button"
              disabled={isMakingViceCaptain || isCaptain}
              onClick={() => makeViceCaptain(player.id)}
              title={isCaptain ? "Already captain" : "Make vice captain"}
              className="p-1.5 rounded-lg border border-slate-200/80 hover:bg-sky-50 hover:border-sky-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isMakingViceCaptain ? (
                <Loader2 size={14} className="text-sky-500 animate-spin" />
              ) : (
                <ShieldCheck size={14} className="text-sky-500" />
              )}
            </button>
          )}

          {/* Status dropdown */}
          <div className="relative">
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => setIsOpen((open) => !open)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200/80 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdatingStatus ? (
                <Loader2 size={12} className="text-slate-400 animate-spin" />
              ) : isInjured ? (
                <Plus size={11} className="text-red-500" strokeWidth={3} />
              ) : (
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
              )}
              <span className={`text-xs font-medium ${statusConfig.textClass}`}>{statusConfig.label}</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {isOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden">
                  {STATUS_OPTIONS.map((option) => {
                    const config = STATUS_CONFIG[option];
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelect(option)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 transition-colors"
                      >
                        {option === "INJURED" ? (
                          <Plus size={11} className="text-red-500" strokeWidth={3} />
                        ) : (
                          <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
                        )}
                        <span className={`text-xs font-medium ${config.textClass}`}>{config.label}</span>
                        {option === player.status && (
                          <span className="ml-auto text-[10px] text-slate-400">Current</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}