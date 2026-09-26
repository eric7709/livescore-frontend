"use client"
import { useState } from "react";
import { useParams } from "next/navigation";
import { X } from "lucide-react";
import { useGetMatchById } from "@/features/match/utils/match.api";
import { useGetMatchPlayerStats } from "@/features/matchLineup/utils/matchLineup.api";
import { useMatchTrackerStore } from "../../utils/matchTracker.store";
import { useCreateMatchEvent } from "../../utils/matchEvent.api";

export default function PenaltyMissedModal() {
  const params = useParams<{ matchId: string }>();
  const matchId = Number(params.matchId);

  const { data: match } = useGetMatchById(matchId);
  const { data: playerStats } = useGetMatchPlayerStats(matchId);
  const { mutate, isPending } = useCreateMatchEvent();
  const { modal, teamId, closeModal } = useMatchTrackerStore();

  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  // The penalty taker belongs to the team that was AWARDED the penalty —
  // the same team clicked in MainEventButtons. No team swap needed here,
  // unlike PenaltyAwardedModal where the conceding team is the opposition.
  const isHomeTeam = match && teamId === match.homeTeamId;
  const teamCode = isHomeTeam ? match?.homeTeamCode : match?.awayTeamCode;

  const takingSquad =
    playerStats &&
    (isHomeTeam ? playerStats.homeTeam : playerStats.awayTeam).filter((p) => p.ableToScoreOrAssist);

  const handleSubmit = (): void => {
    if (selectedPlayerId == null || !match || !teamId) return;

    mutate(
      {
        eventType: "PENALTY_MISSED",
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

  if (modal !== "PENALTY_MISSED") return null;

  return (
    <div className="fixed inset-0 z-50 h-screen w-screen bg-slate-950/40 backdrop-blur-md">
   

      <div className="h-full w-full flex flex-col bg-white font-body overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#E4E7EC] bg-linear-to-b from-[#FEF3F2] to-white shrink-0">
          <div>
            <p className="font-condensed text-[10px] font-bold tracking-[0.2em] text-[#98A2B3] uppercase">
              Penalty Missed
            </p>
            <p className="font-condensed text-lg font-bold text-[#101828] leading-tight uppercase mt-0.5">
              Select player who <span className="text-[#B42318]">missed</span>
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
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E4E7EC] text-[#667085] hover:bg-[#F9FAFB] hover:text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#F04438] transition-colors"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Player list */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#EEF0F3]">
          {takingSquad?.map((p) => {
            const isSelected = selectedPlayerId === p.playerId;
            return (
              <button
                key={p.playerId}
                type="button"
                onClick={() => setSelectedPlayerId(p.playerId)}
                className={`group relative flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors focus:outline-none focus-visible:bg-[#F9FAFB] focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#F04438] ${
                  isSelected ? "bg-[#FEF3F2]/50" : "hover:bg-[#F9FAFB]"
                }`}
              >
                {/* Red Left Indicator Line */}
                <span
                  className={`absolute left-0 top-0 bottom-0 w-[3px] bg-[#F04438] transition-transform duration-150 ${
                    isSelected ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100 group-focus-visible:scale-y-100"
                  }`}
                />

                {/* Number Badge */}
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border font-condensed text-sm font-bold transition-colors ${
                    isSelected
                      ? "border-[#F04438] bg-[#FEF3F2] text-[#B42318]"
                      : "border-[#E4E7EC] bg-[#F9FAFB] text-[#101828] group-hover:border-[#F04438]/50 group-hover:text-[#B42318]"
                  }`}
                >
                  {p.squadNumber}
                </span>

                {/* Player Metadata */}
                <span className="flex flex-col min-w-0">
                  <span className="truncate text-[13px] font-semibold text-[#101828]">
                    {p.playerName}
                  </span>
                </span>

                {/* Action Indicator: X-Marked */}
                <span
                  className={`ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    isSelected
                      ? "border-[#F04438] bg-[#F04438]"
                      : "border-[#D0D5DD] bg-transparent group-hover:border-[#F04438] group-hover:bg-[#F04438]"
                  }`}
                >
                  <svg
                    viewBox="0 0 12 12"
                    className={`h-2 w-2 transition-colors ${
                      isSelected ? "text-white" : "text-transparent group-hover:text-white"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="9" y1="3" x2="3" y2="9" />
                    <line x1="3" y1="3" x2="9" y2="9" />
                  </svg>
                </span>
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
            className="w-full h-10 flex items-center justify-center rounded-md font-condensed text-sm font-bold tracking-wider uppercase text-white bg-[#F04438] hover:bg-[#D92D20] active:bg-[#B42318] focus:outline-none focus:ring-2 focus:ring-[#F04438] focus:ring-offset-2 transition-colors disabled:bg-[#F2F4F7] disabled:text-[#98A2B3] disabled:cursor-not-allowed"
          >
            {isPending ? "Submitting..." : "Confirm Miss"}
          </button>
        </div>
      </div>
    </div>
  );
}