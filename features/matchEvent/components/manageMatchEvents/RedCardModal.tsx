"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { X } from "lucide-react";
import { useGetMatchById } from "@/features/match/utils/match.api";
import { useGetMatchPlayerStats } from "@/features/matchLineup/utils/matchLineup.api";
import { useMatchTrackerStore } from "../../utils/matchTracker.store";
import { useCreateMatchEvent } from "../../utils/matchEvent.api";
import { MatchEventUtils } from "../../utils/matchEvent.utils";

export default function RedCardModal() {
  const params = useParams<{ matchId: string }>();
  const matchId = Number(params.matchId);
  const { data: match } = useGetMatchById(matchId);
  const { data: playerStats } = useGetMatchPlayerStats(matchId);
  const { mutate, isPending } = useCreateMatchEvent();
  const { modal, teamId, closeModal } = useMatchTrackerStore();
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const teamCode = MatchEventUtils.getTeamSideAndCode(teamId, match);
  const bookableSquad = MatchEventUtils.getBookableSquad(playerStats, Number(teamId), match);
  const handleSubmit = (): void => {
    const payload = MatchEventUtils.buildEventPayload(
      matchId,
      match?.period,
      teamId,
      "RED_CARD",
      selectedPlayerId
    );

    if (!payload) return;

    mutate(payload, {
      onSuccess: () => {
        setSelectedPlayerId(null);
        closeModal();
      },
    });
  };

  const handleClose = (): void => {
    setSelectedPlayerId(null);
    closeModal();
  };

  if (modal !== "RED_CARD") return null;

  return (
    <div className="fixed inset-0 z-50 h-screen w-screen bg-slate-950/40 backdrop-blur-md">
      

      <div className="flex h-full w-full flex-col overflow-hidden bg-white font-body">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#E4E7EC] bg-linear-to-b from-[#FEF1F3] to-white px-5 py-4">
          <div>
            <p className="font-condensed text-[10px] font-bold uppercase tracking-[0.2em] text-[#98A2B3]">
              Red Card
            </p>

            <p className="mt-0.5 font-condensed text-lg font-bold uppercase leading-tight text-[#101828]">
              Select player to <span className="text-[#9E1239]">send off</span>
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {teamCode && (
              <span className="rounded bg-[#DA291C] px-2 py-1 font-condensed text-xs font-bold tracking-wide text-white">
                {teamCode}
              </span>
            )}

            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E4E7EC] text-[#667085] transition-colors hover:bg-[#F9FAFB] hover:text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#9E1239]"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Player List */}
        <div className="flex-1 divide-y divide-[#EEF0F3] overflow-y-auto">
          {bookableSquad?.map((player) => {
            const isSelected = selectedPlayerId === player.playerId;

            return (
              <button
                key={player.playerId}
                type="button"
                onClick={() => setSelectedPlayerId(player.playerId)}
                className={`group relative flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors focus:outline-none focus-visible:bg-[#F9FAFB] focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#9E1239] ${isSelected
                    ? "bg-[#FEF1F3]/50"
                    : "hover:bg-[#F9FAFB]"
                  }`}
              >
                <span
                  className={`absolute bottom-0 left-0 top-0 w-[3px] bg-[#9E1239] transition-transform duration-150 ${isSelected
                      ? "scale-y-100"
                      : "scale-y-0 group-hover:scale-y-100 group-focus-visible:scale-y-100"
                    }`}
                />

                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border font-condensed text-sm font-bold transition-colors ${isSelected
                      ? "border-[#9E1239] bg-[#FEF1F3] text-[#9E1239]"
                      : "border-[#E4E7EC] bg-[#F9FAFB] text-[#101828] group-hover:border-[#9E1239]/40 group-hover:text-[#9E1239]"
                    }`}
                >
                  {player.squadNumber}
                </span>

                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[13px] font-semibold text-[#101828]">
                    {player.playerName}
                  </span>

                  {player.bookingStatus === "YELLOW_CARD" && (
                    <span className="font-condensed text-[10px] font-bold uppercase tracking-wide text-[#B45309]">
                      Already on a yellow
                    </span>
                  )}
                </span>

                <span
                  className={`ml-auto h-4 w-3 shrink-0 rounded-[2px] border-2 transition-colors ${isSelected
                      ? "border-[#9E1239] bg-[#9E1239]"
                      : "border-[#D0D5DD] bg-transparent group-hover:border-[#9E1239] group-hover:bg-[#9E1239]"
                    }`}
                />
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-[#E4E7EC] bg-[#F9FAFB] px-5 py-4">
          <button
            type="button"
            disabled={selectedPlayerId === null || isPending}
            onClick={handleSubmit}
            className="flex h-10 w-full items-center justify-center rounded-md bg-[#9E1239] font-condensed text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#881337] active:bg-[#5C061F] focus:outline-none focus:ring-2 focus:ring-[#9E1239] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#F2F4F7] disabled:text-[#98A2B3]"
          >
            {isPending ? "Submitting..." : "Confirm Red Card"}
          </button>
        </div>
      </div>
    </div>
  );
}