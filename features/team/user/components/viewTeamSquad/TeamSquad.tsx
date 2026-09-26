"use client";

import { PlayerStatus, Position } from "@/features/profile/utils/profile.types";
import { useTeamSquad } from "@/features/team/utils/team.api";
import { teko, inter, scoreMono } from "@/public/fonts/fonts";

interface DisplayPlayer {
  id: string | number;
  number: number;
  name: string;
  position: string;
  photoUrl?: string;
}

interface TeamSquadProps {
  teamId: number;
  status?: PlayerStatus;
  position?: Position[];
}

export default function TeamSquad({ teamId, status, position }: TeamSquadProps) {
  const { data, isLoading, isError } = useTeamSquad(teamId, { status, position });

  const displayPlayers: DisplayPlayer[] =
    data?.squad.map((p) => ({
      id: p.id,
      number: p.squadNumber,
      name: p.fullName,
      position: p.position,
      photoUrl: p.avatarUrl,
    })) ?? [];

  const manager = data?.manager;

  return (
    <div className={`${inter.variable} mt-3 rounded-xl border border-[#E2E7DD] p-3 shadow-sm`}>
      <p className={`${scoreMono.className} mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7566]`}>
        Starting Squad
      </p>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl border border-[#E2E7DD] bg-white" />
          ))}
        </div>
      ) : isError ? (
        <p className="py-4 text-center text-[13px] text-[#6B7566]">
          Couldn&apos;t load the squad. Try refreshing.
        </p>
      ) : displayPlayers.length === 0 ? (
        <p className="py-4 text-center text-[13px] text-[#6B7566]">No players match this filter.</p>
      ) : (
        <div className="space-y-2">
          {displayPlayers?.map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-3 rounded-xl border border-[#E2E7DD] bg-white p-2.5 shadow-sm"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-[#14532D]">
                {player.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={player.photoUrl} alt={player.name} className="h-full w-full object-cover" />
                ) : null}
              </div>

              <p
                className={`${teko.className} w-9 shrink-0 text-right text-[28px] italic leading-none tracking-tight text-[#14532D]`}
                style={{ transform: "skewX(-6deg)" }}
              >
                {player.number}
              </p>

              <p className="truncate text-[13px] font-semibold text-[#14181C]">{player.name}</p>

              <span
                className={`${scoreMono.className} ml-auto shrink-0 rounded bg-[#14532D] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white`}
              >
                {player.position}
              </span>
            </div>
          ))}
        </div>
      )}

      {manager ? (
        <div className="mt-4 flex items-center gap-3 border-t border-[#E2E7DD] pt-3">
          <div className="h-11 w-11 overflow-hidden rounded-full border border-[#D9DED2] bg-white shadow-sm">
            {manager.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={manager.avatarUrl} alt={manager.fullName} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="text-sm">
            <p className={`${scoreMono.className} text-[10px] uppercase tracking-[0.15em] text-[#6B7566]`}>
              Manager
            </p>
            <p className="font-semibold text-[#14181C]">{manager.fullName}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}