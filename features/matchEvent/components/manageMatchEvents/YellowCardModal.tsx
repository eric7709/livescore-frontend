"use client"
import { useState } from "react";
import { useParams } from "next/navigation";
import { X } from "lucide-react";
import { useGetMatchById } from "@/features/match/utils/match.api";
import { useGetMatchPlayerStats } from "@/features/matchLineup/utils/matchLineup.api";
import { useMatchTrackerStore } from "../../utils/matchTracker.store";
import { useCreateMatchEvent } from "../../utils/matchEvent.api";
import { MatchEventUtils } from "../../utils/matchEvent.utils";

export default function YellowCardModal() {
  const params = useParams<{ matchId: string }>();
  const matchId = Number(params.matchId);
  const { data: match } = useGetMatchById(matchId);
  const { data: playerStats } = useGetMatchPlayerStats(matchId);
  const { mutate, isPending } = useCreateMatchEvent();
  const { modal, teamId, closeModal } = useMatchTrackerStore();
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const teamCode = MatchEventUtils.getTeamSideAndCode(teamId, match)
  const bookableSquad = MatchEventUtils.getBookableSquad(playerStats, Number(teamId), match)
  const selectedPlayer = MatchEventUtils.getSelectedPlayer(selectedPlayerId, bookableSquad)
  const willBeSecondYellow = selectedPlayer?.bookingStatus === "YELLOW_CARD";
  const handleSubmit = (): void => {
    if (selectedPlayerId == null || !match || !teamId) return;
    mutate(
      {
        eventType: "YELLOW_CARD",
        matchId,
        period: match.period,
        teamId,
        primaryPlayerId: selectedPlayerId,
        secondaryPlayerId: null,
      },
      {
        onSuccess: () => {
          setSelectedPlayerId(null);
          closeModal();
        },
      }
    );
  };

  const handleClose = (): void => closeModal();

  if (modal !== "YELLOW_CARD") return null;

  return (
    <div className="fixed inset-0 z-50 h-screen w-screen bg-slate-950/40 backdrop-blur-md">
   

      <div className="h-full w-full flex flex-col bg-white font-body overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#E4E7EC] bg-linear-to-b from-[#FFFAEB] to-white shrink-0">
          <div>
            <p className="font-condensed text-[10px] font-bold tracking-[0.2em] text-[#98A2B3] uppercase">
              Yellow Card
            </p>
            <p className="font-condensed text-lg font-bold text-[#101828] leading-tight uppercase mt-0.5">
              Select player to <span className="text-[#B45309]">caution</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {teamCode && (
              <span className="font-condensed text-xs font-bold tracking-wide text-white bg-[#DA291C] px-2 py-1 rounded">
                {teamCode}
              </span>
            )}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E4E7EC] text-[#667085] hover:bg-[#F9FAFB] hover:text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#F5B70A] transition-colors"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Player list */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#EEF0F3]">
          {bookableSquad?.map((p) => {
            const isSelected = selectedPlayerId === p.playerId;
            return (
              <button
                key={p.playerId}
                type="button"
                onClick={() => setSelectedPlayerId(p.playerId)}
                className={`group relative flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors focus:outline-none focus-visible:bg-[#F9FAFB] focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#F5B70A] ${isSelected ? "bg-[#FFFAEB]/50" : "hover:bg-[#F9FAFB]"
                  }`}
              >
                {/* Yellow Left Indicator Line */}
                <span
                  className={`absolute left-0 top-0 bottom-0 w-[3px] bg-[#F5B70A] transition-transform duration-150 ${isSelected ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100 group-focus-visible:scale-y-100"
                    }`}
                />

                {/* Number Badge */}
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border font-condensed text-sm font-bold transition-colors ${isSelected
                      ? "border-[#F5B70A] bg-[#FFFAEB] text-[#B45309]"
                      : "border-[#E4E7EC] bg-[#F9FAFB] text-[#101828] group-hover:border-[#F5B70A]/50 group-hover:text-[#B45309]"
                    }`}
                >
                  {p.squadNumber}
                </span>

                {/* Player Metadata */}
                <span className="flex flex-col min-w-0">
                  <span className="truncate text-[13px] font-semibold text-[#101828]">
                    {p.playerName}
                  </span>
                  {p.bookingStatus === "YELLOW_CARD" && (
                    <span className="font-condensed text-[10px] font-bold tracking-wide text-[#B45309] uppercase">
                      Already on a yellow — this will be a 2nd yellow
                    </span>
                  )}
                </span>

                {/* Card Indicator */}
                <span
                  className={`ml-auto h-4 w-3 shrink-0 rounded-[2px] border-2 transition-colors ${isSelected
                      ? "border-[#F5B70A] bg-[#F5B70A]"
                      : "border-[#D0D5DD] bg-transparent group-hover:border-[#F5B70A] group-hover:bg-[#F5B70A]"
                    }`}
                />
              </button>
            );
          })}
        </div>

        {/* Footer with Submit Button */}
        <div className="px-5 py-4 border-t border-[#E4E7EC] bg-[#F9FAFB] shrink-0">
          <button
            type="button"
            disabled={selectedPlayerId === null || isPending}
            onClick={handleSubmit}
            className="w-full h-10 flex items-center justify-center rounded-md font-condensed text-sm font-bold tracking-wider uppercase text-white bg-[#F5B70A] hover:bg-[#D97706] active:bg-[#B45309] focus:outline-none focus:ring-2 focus:ring-[#F5B70A] focus:ring-offset-2 transition-colors disabled:bg-[#F2F4F7] disabled:text-[#98A2B3] disabled:cursor-not-allowed"
          >
            {isPending ? "Submitting..." : willBeSecondYellow ? "Confirm 2nd Yellow (Red)" : "Confirm Yellow Card"}
          </button>
        </div>
      </div>
    </div>
  );
}