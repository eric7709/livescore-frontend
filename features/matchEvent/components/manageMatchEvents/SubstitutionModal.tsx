"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeftRight, Recycle, X } from "lucide-react";
import { useGetMatchById } from "@/features/match/utils/match.api";
import { useMatchTrackerStore } from "../../utils/matchTracker.store";
import { useCreateMatchEvent } from "../../utils/matchEvent.api";
import { MatchEventUtils } from "../../utils/matchEvent.utils";

export default function SubstitutionModal() {
  const params = useParams<{ matchId: string }>();
  const matchId = Number(params.matchId);

  const { data: match } = useGetMatchById(matchId);
  const [playerOutId, setPlayerOutId] = useState<number | null>(null);
  const [playerInId, setPlayerInId] = useState<number | null>(null);
  const { mutate, isPending } = useCreateMatchEvent();
  const { modal, teamId, playersIn, playersOut, closeModal, eventType } = useMatchTrackerStore();

  // Derive the selected player objects from the store's lists
  const selectedPlayerOut = playersOut?.find((p) => p.playerId === playerOutId) ?? null;
  const selectedPlayerIn = playersIn?.find((p) => p.playerId === playerInId) ?? null;

  // Which side is currently making the substitution
  const teamCode = MatchEventUtils.getTeamSideAndCode(teamId, match)

  const handlePlayerOutSelect = (id: number): void => {
    setPlayerOutId(id);
    // A player cannot replace themselves
    if (playerInId === id) {
      setPlayerInId(null);
    }
  };

  const handlePlayerInSelect = (id: number): void => {
    if (id === playerOutId) return;
    setPlayerInId(id === playerInId ? null : id); // Toggle selection
  };

  const handleSubmit = (): void => {
    if (playerOutId == null || playerInId == null || eventType == null || !match || !teamId) return;

    mutate(
      {
        eventType,
        matchId,
        period: match.period,
        teamId,
        // Backend contract: primaryPlayerId = player going OFF,
        // secondaryPlayerId = player coming ON.
        primaryPlayerId: playerOutId,
        secondaryPlayerId: playerInId,
      },
      {
        onSuccess: () => {
          setPlayerOutId(null);
          setPlayerInId(null);
          closeModal();
        },
      }
    );
  };

  const handleClose = (): void => closeModal();

  if (modal !== "SUBSTITUTION") return null;

  return (
    <div className="fixed inset-0 z-50 h-screen w-screen bg-slate-950/40 backdrop-blur-md">
      
      <div className="h-full w-full flex flex-col bg-white font-body overflow-hidden">

        {/* Main Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#E4E7EC] bg-linear-to-b from-[#FFF4F0] to-white shrink-0">
          <div>
            <p className="font-condensed text-[10px] font-bold tracking-[0.2em] text-[#98A2B3] uppercase">
              Match Event
            </p>
            <p className="font-condensed text-lg font-bold text-[#101828] leading-tight uppercase mt-0.5">
              Select <span className="text-[#D92D20]">Player Out</span> & <span className="text-[#16C784]">Player In</span>
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
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E4E7EC] text-[#667085] hover:bg-[#F9FAFB] hover:text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#101828] transition-colors"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Scrollable Container with separated lists */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#EEF0F3]">

          {/* Section 1: Player Going Out */}
          <div>
            <div className="sticky top-0 z-10 bg-[#FEF3F2] border-b border-[#E4E7EC] px-5 py-2">
              <span className="font-condensed text-[11px] font-extrabold tracking-wider text-[#101828] uppercase flex items-center gap-1.5">
                <ArrowLeftRight size={12} className="text-[#D92D20]" strokeWidth={3} />
                1. Player Coming Off (Out)
              </span>
            </div>
            <div className="divide-y divide-[#EEF0F3]">
              {playersOut?.map((p) => {
                const isSelected = playerOutId === p.playerId;
                return (
                  <button
                    key={`out-${p.playerId}`}
                    type="button"
                    onClick={() => handlePlayerOutSelect(p.playerId)}
                    className={`group relative flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors focus:outline-none ${isSelected ? "bg-[#FEF3F2]/60" : "hover:bg-[#F9FAFB]"
                      }`}
                  >
                    <span
                      className={`absolute left-0 top-0 bottom-0 w-[3px] bg-[#D92D20] transition-transform duration-150 ${isSelected ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
                        }`}
                    />
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border font-condensed text-sm font-bold transition-colors ${isSelected
                          ? "border-[#D92D20] bg-[#FEF3F2] text-[#D92D20]"
                          : "border-[#E4E7EC] bg-[#F9FAFB] text-[#101828] group-hover:border-[#D92D20]/40 group-hover:text-[#D92D20]"
                        }`}
                    >
                      {p.squadNumber}
                    </span>
                    <span className="flex flex-col min-w-0">
                      <span className="truncate text-[13px] font-semibold text-[#101828]">
                        {p.playerName}
                      </span>
                    </span>
                    <ArrowLeftRight
                      size={15}
                      strokeWidth={2.5}
                      className={`ml-auto shrink-0 transition-colors ${isSelected ? "text-[#D92D20]" : "text-[#98A2B3] group-hover:text-[#D92D20]"
                        }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Player Coming On */}
          <div>
            <div className="sticky top-0 z-10 bg-[#EFFBF5] border-b border-[#E4E7EC] px-5 py-2">
              <span className="font-condensed text-[11px] font-extrabold tracking-wider text-[#101828] uppercase flex items-center gap-1.5">
                <ArrowLeftRight size={12} className="text-[#16C784]" strokeWidth={3} />
                2. Player Coming On (In)
              </span>
            </div>
            <div className="divide-y divide-[#EEF0F3]">
              {playersIn?.map((p) => {
                const isSelected = playerInId === p.playerId;
                const isOut = playerOutId === p.playerId;
                return (
                  <button
                    key={`in-${p.playerId}`}
                    type="button"
                    disabled={isOut}
                    onClick={() => handlePlayerInSelect(p.playerId)}
                    className={`group relative flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors focus:outline-none ${isSelected
                        ? "bg-[#EFFBF5]/60"
                        : "hover:bg-[#F9FAFB] disabled:opacity-40 disabled:hover:bg-transparent"
                      }`}
                  >
                    <span
                      className={`absolute left-0 top-0 bottom-0 w-[3px] bg-[#16C784] transition-transform duration-150 ${isSelected ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
                        }`}
                    />
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border font-condensed text-sm font-bold transition-colors ${isSelected
                          ? "border-[#16C784] bg-[#EFFBF5] text-[#16C784]"
                          : "border-[#E4E7EC] bg-[#F9FAFB] text-[#101828] group-hover:border-[#16C784]/40 group-hover:text-[#16C784]"
                        }`}
                    >
                      {p.squadNumber}
                    </span>
                    <span className="flex flex-col min-w-0">
                      <span className="truncate text-[13px] font-semibold text-[#101828]">
                        {p.playerName}
                      </span>
                    </span>
                    <ArrowLeftRight
                      size={15}
                      strokeWidth={2.5}
                      className={`ml-auto shrink-0 transition-colors ${isSelected ? "text-[#16C784]" : "text-[#98A2B3] group-hover:text-[#16C784] group-disabled:opacity-20"
                        }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic Selection Preview Bar */}
        <div className="px-5 py-4 border-t border-[#E4E7EC] bg-slate-50 flex flex-col items-center gap-3 shrink-0">
          <span className="font-condensed text-[10px] font-bold tracking-wider text-[#98A2B3] uppercase">
            Selection Preview
          </span>

          <div className="w-full flex flex-col items-center gap-2.5">
            {/* Player Out Display Row */}
            <div className="flex items-center w-full">
              <div className="flex-grow border-t border-[#E4E7EC]" />
              <span className="mx-3 text-[13px] font-bold text-[#101828] flex items-center gap-1.5 shrink-0">
                {selectedPlayerOut ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#D92D20]" />
                    {selectedPlayerOut.playerName} ({selectedPlayerOut.squadNumber})
                  </>
                ) : (
                  <span className="text-[#98A2B3] font-normal italic">Select Player Out</span>
                )}
              </span>
              <div className="flex-grow border-t border-[#E4E7EC]" />
            </div>

            {/* Recycle Connection Icon */}
            <div className="flex items-center justify-center">
              <Recycle size={15} className="text-[#98A2B3]" strokeWidth={2.5} />
            </div>

            {/* Player In Display Row */}
            <div className="flex items-center w-full">
              <div className="flex-grow border-t border-[#E4E7EC]" />
              <span className="mx-3 text-[13px] font-bold text-[#101828] flex items-center gap-1.5 shrink-0">
                {selectedPlayerIn ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#16C784]" />
                    {selectedPlayerIn.playerName} ({selectedPlayerIn.squadNumber})
                  </>
                ) : (
                  <span className="text-[#98A2B3] font-normal italic">Select Player In</span>
                )}
              </span>
              <div className="flex-grow border-t border-[#E4E7EC]" />
            </div>
          </div>
        </div>

        {/* Footer with Submit Button */}
        <div className="px-5 py-4 border-t border-[#E4E7EC] bg-[#F9FAFB] shrink-0">
          <button
            type="button"
            disabled={playerOutId === null || playerInId === null || isPending}
            onClick={handleSubmit}
            className="w-full h-10 flex items-center justify-center rounded-md font-condensed text-sm font-bold tracking-wider uppercase text-white bg-[#101828] hover:bg-[#1F2A37] active:bg-[#030712] focus:outline-none focus:ring-2 focus:ring-[#101828] focus:ring-offset-2 transition-colors disabled:bg-[#F2F4F7] disabled:text-[#98A2B3] disabled:cursor-not-allowed"
          >
            {isPending ? "Submitting..." : "Confirm Substitution"}
          </button>
        </div>
      </div>
    </div>
  );
}