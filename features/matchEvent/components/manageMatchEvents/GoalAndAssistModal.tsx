"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { CircleDot, Send, Recycle, HelpCircle, X } from "lucide-react";
import { useGetMatchById } from "@/features/match/utils/match.api";
import { useGetMatchPlayerStats } from "@/features/matchLineup/utils/matchLineup.api";
import { useMatchTrackerStore } from "../../utils/matchTracker.store";
import { useCreateMatchEvent } from "../../utils/matchEvent.api";
import { MatchEventUtils, GoalType, GOAL_TYPES } from "../../utils/matchEvent.utils";
import { EVENT_LABELS, EventType } from "../../utils/matchEvent.types";

function labelFor(type: EventType): string {
  return EVENT_LABELS[type] ?? type.replace(/_/g, " ");
}

export default function GoalAndAssistModal() {
  const params = useParams<{ matchId: string }>();
  const matchId = Number(params.matchId);

  const { data: match } = useGetMatchById(matchId);
  const { data: playerStats } = useGetMatchPlayerStats(matchId);
  const { mutate, isPending } = useCreateMatchEvent();
  const { modal, teamId, closeModal, eventType, setEventType } = useMatchTrackerStore();

  const [goalscorerId, setGoalscorerId] = useState<number | null>(null);
  const [assistId, setAssistId] = useState<number | null>(null);

  // Compute clean values using MatchEventUtils
  const goalType = MatchEventUtils.getGoalType(eventType);
  const scorersTeamId = MatchEventUtils.getScorersTeamId(match, teamId, goalType);
  const scorersIsHome = MatchEventUtils.isHomeTeam(match, scorersTeamId);
  const teamCode = MatchEventUtils.getTeamSideAndCode(scorersTeamId, match);
  const assistsAllowed = MatchEventUtils.areAssistsAllowed(goalType);

  // Filter player lists
  const scorerPool = playerStats && (scorersIsHome ? playerStats.homeTeam : playerStats.awayTeam).filter(
    (p) => p.ableToScoreOrAssist
  );

  const selectedScorer = scorerPool?.find((p) => p.playerId === goalscorerId) ?? null;
  const selectedAssister = scorerPool?.find((p) => p.playerId === assistId) ?? null;

  const handleGoalTypeChange = (type: GoalType) => {
    setEventType(type);
    setGoalscorerId(null);
    setAssistId(null);
  };

  const handleGoalscorerSelect = (id: number): void => {
    setGoalscorerId(id);
    if (assistId === id) {
      setAssistId(null);
    }
  };

  const handleAssistSelect = (id: number): void => {
    if (id === goalscorerId) return;
    setAssistId(id === assistId ? null : id);
  };

  const handleSubmit = (): void => {
    const payload = MatchEventUtils.buildEventPayload(
      matchId,
      match?.period,
      scorersTeamId,
      eventType,
      goalscorerId,
      assistsAllowed ? assistId : null
    );

    if (!payload) return;

    mutate(payload, {
      onSuccess: () => {
        setGoalscorerId(null);
        setAssistId(null);
        closeModal();
      },
    });
  };

  const handleClose = (): void => closeModal();

  // Guard Clause computed using utility class
  if (!MatchEventUtils.shouldRenderGoalModal(modal)) return null;

  return (
    <div className="fixed inset-0 z-50 h-screen w-screen bg-slate-950/40 backdrop-blur-md">
      <div className="h-full w-full flex flex-col bg-white font-body overflow-hidden">

        {/* Main Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#E4E7EC] bg-linear-to-b from-[#EFFBF5] to-white shrink-0">
          <div>
            <p className="font-condensed text-[10px] font-bold tracking-[0.2em] text-[#98A2B3] uppercase">
              Goal Event
            </p>
            <p className="font-condensed text-lg font-bold text-[#101828] leading-tight uppercase mt-0.5">
              Select <span className="text-[#16C784]">Scorer</span> & <span className="text-[#F79009]">Assister</span>
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

        {/* Goal Type Selector Container */}
        <div className="px-5 py-3 border-b border-[#E4E7EC] bg-slate-50 flex flex-col gap-1.5 shrink-0">
          <span className="font-condensed text-[10px] font-bold tracking-wider text-[#98A2B3] uppercase">
            Goal Type
          </span>

          <div className="flex flex-col gap-1.5 w-full">
            {/* Row 1: 3 Columns */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { value: "GOAL" as GoalType, label: "Regular Goal" },
                { value: "PENALTY_GOAL" as GoalType, label: "Penalty" },
                { value: "FREE_KICK_GOAL" as GoalType, label: "Free Kick" },
              ].map((type) => {
                const isSelected = goalType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleGoalTypeChange(type.value)}
                    className={`h-8 rounded text-[11px] font-bold tracking-wide uppercase font-condensed transition-all border flex items-center justify-center ${
                      isSelected
                        ? "border-[#16C784] bg-[#EFFBF5] text-[#10A36B]"
                        : "border-[#D0D5DD] bg-white text-[#475467] hover:bg-[#F9FAFB]"
                    }`}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>

            {/* Row 2: 2 Columns */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { value: "LONG_RANGE_GOAL" as GoalType, label: "Long Range" },
                { value: "OWN_GOAL" as GoalType, label: "Own Goal" },
              ].map((type) => {
                const isSelected = goalType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleGoalTypeChange(type.value)}
                    className={`h-8 rounded text-[11px] font-bold tracking-wide uppercase font-condensed transition-all border flex items-center justify-center ${
                      isSelected
                        ? type.value === "OWN_GOAL"
                          ? "border-[#D92D20] bg-[#FEF3F2] text-[#B42318]"
                          : "border-[#16C784] bg-[#EFFBF5] text-[#10A36B]"
                        : "border-[#D0D5DD] bg-white text-[#475467] hover:bg-[#F9FAFB]"
                    }`}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {goalType === "OWN_GOAL" && (
            <p className="text-[10px] text-[#B42318] font-medium mt-0.5">
              Showing {teamCode ?? "opposition"} players — the goal will be credited to the other team.
            </p>
          )}
        </div>

        {/* Scrollable Container with separated lists */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#EEF0F3]">

          {/* Section 1: Goalscorer */}
          <div>
            <div className="sticky top-0 z-10 bg-[#EFFBF5] border-b border-[#E4E7EC] px-5 py-2">
              <span className="font-condensed text-[11px] font-extrabold tracking-wider text-[#101828] uppercase flex items-center gap-1.5">
                <CircleDot size={12} className="text-[#16C784]" strokeWidth={3} />
                {goalType === "OWN_GOAL" ? "1. Own Goal Scorer" : "1. Goalscorer"}
              </span>
            </div>
            <div className="divide-y divide-[#EEF0F3]">
              {scorerPool?.map((p) => {
                const isSelected = goalscorerId === p.playerId;
                return (
                  <button
                    key={`scorer-${p.playerId}`}
                    type="button"
                    onClick={() => handleGoalscorerSelect(p.playerId)}
                    className={`group relative flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors focus:outline-none ${
                      isSelected ? "bg-[#EFFBF5]/60" : "hover:bg-[#F9FAFB]"
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-0 bottom-0 w-[3px] bg-[#16C784] transition-transform duration-150 ${
                        isSelected ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
                      }`}
                    />

                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border font-condensed text-sm font-bold transition-colors ${
                        isSelected
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

                    <CircleDot
                      size={15}
                      strokeWidth={2.5}
                      className={`ml-auto shrink-0 transition-colors ${
                        isSelected ? "text-[#16C784]" : "text-[#98A2B3] group-hover:text-[#16C784]"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Assist Provider */}
          {assistsAllowed ? (
            <div>
              <div className="sticky top-0 z-10 bg-[#FFF8EB] border-b border-[#E4E7EC] px-5 py-2">
                <span className="font-condensed text-[11px] font-extrabold tracking-wider text-[#101828] uppercase flex items-center gap-1.5">
                  <Send size={11} className="text-[#F79009]" strokeWidth={3} />
                  2. Assist Provider (Optional)
                </span>
              </div>
              <div className="divide-y divide-[#EEF0F3]">
                {scorerPool?.map((p) => {
                  const isSelected = assistId === p.playerId;
                  const isScorer = goalscorerId === p.playerId;
                  return (
                    <button
                      key={`assist-${p.playerId}`}
                      type="button"
                      disabled={isScorer}
                      onClick={() => handleAssistSelect(p.playerId)}
                      className={`group relative flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors focus:outline-none ${
                        isSelected
                          ? "bg-[#FFF8EB]/60"
                          : "hover:bg-[#F9FAFB] disabled:opacity-40 disabled:hover:bg-transparent"
                      }`}
                    >
                      <span
                        className={`absolute left-0 top-0 bottom-0 w-[3px] bg-[#F79009] transition-transform duration-150 ${
                          isSelected ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
                        }`}
                      />

                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border font-condensed text-sm font-bold transition-colors ${
                          isSelected
                            ? "border-[#F79009] bg-[#FFF8EB] text-[#F79009]"
                            : "border-[#E4E7EC] bg-[#F9FAFB] text-[#101828] group-hover:border-[#F79009]/40 group-hover:text-[#F79009]"
                        }`}
                      >
                        {p.squadNumber}
                      </span>

                      <span className="flex flex-col min-w-0">
                        <span className="truncate text-[13px] font-semibold text-[#101828]">
                          {p.playerName}
                          {isScorer && <span className="text-[9px] text-[#16C784] normal-case ml-1">(Scorer)</span>}
                        </span>
                      </span>

                      <Send
                        size={14}
                        strokeWidth={2.5}
                        className={`ml-auto shrink-0 transition-colors ${
                          isSelected ? "text-[#F79009]" : "text-[#98A2B3] group-hover:text-[#F79009] group-disabled:opacity-20"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center bg-amber-50/30">
              <p className="text-xs text-[#667085] font-medium leading-relaxed">
                Assists are disabled for{" "}
                <span className="text-[#D97706] font-semibold">
                  {goalType === "OWN_GOAL" ? "Own Goals" : goalType === "PENALTY_GOAL" ? "Penalties" : "Free Kicks"}
                </span>
                .
              </p>
            </div>
          )}
        </div>

        {/* Dynamic Selection Preview Bar */}
        <div className="px-5 py-4 border-t border-[#E4E7EC] bg-slate-50 flex flex-col items-center gap-3 shrink-0">
          <span className="font-condensed text-[10px] font-bold tracking-wider text-[#98A2B3] uppercase">
            Selection Preview
          </span>

          <div className="w-full flex flex-col items-center gap-2.5">
            {/* Goalscorer Display Row */}
            <div className="flex items-center w-full">
              <div className="flex-grow border-t border-[#E4E7EC]" />
              <span className="mx-3 text-[13px] font-bold text-[#101828] flex items-center gap-1.5 shrink-0">
                {selectedScorer ? (
                  <>
                    <CircleDot
                      size={12}
                      className={goalType === "OWN_GOAL" ? "text-[#D92D20]" : "text-[#16C784]"}
                      strokeWidth={3}
                    />
                    {selectedScorer.playerName} ({selectedScorer.squadNumber})
                    {goalType === "OWN_GOAL" && (
                      <span className="text-[10px] font-normal text-[#D92D20] lowercase tracking-wide font-condensed">
                        (OG)
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-[#98A2B3] font-normal italic">
                    {goalType === "OWN_GOAL" ? "Select Own Goal Scorer" : "Select Goalscorer"}
                  </span>
                )}
              </span>
              <div className="flex-grow border-t border-[#E4E7EC]" />
            </div>

            {/* Recycle Connection Icon */}
            <div className="flex items-center justify-center">
              <Recycle size={15} className="text-[#98A2B3]" strokeWidth={2.5} />
            </div>

            {/* Assister Display Row */}
            <div className="flex items-center w-full">
              <div className="flex-grow border-t border-[#E4E7EC]" />
              <span className="mx-3 text-[13px] font-bold text-[#101828] flex items-center gap-1.5 shrink-0">
                {!assistsAllowed ? (
                  <span className="text-[#98A2B3] font-normal italic flex items-center gap-1">
                    <HelpCircle size={12} strokeWidth={2.5} />
                    No assist on this goal type
                  </span>
                ) : selectedAssister ? (
                  <>
                    <Send size={11} className="text-[#F79009]" strokeWidth={3} />
                    {selectedAssister.playerName} ({selectedAssister.squadNumber})
                  </>
                ) : (
                  <span className="text-[#98A2B3] font-normal italic">No Assist Selected</span>
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
            disabled={goalscorerId === null || isPending}
            onClick={handleSubmit}
            className={`w-full h-10 flex items-center justify-center rounded-md font-condensed text-sm font-bold tracking-wider uppercase text-white transition-colors disabled:bg-[#F2F4F7] disabled:text-[#98A2B3] disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              goalType === "OWN_GOAL"
                ? "bg-[#D92D20] hover:bg-[#B42318] active:bg-[#912018] focus:ring-[#D92D20]"
                : "bg-[#16C784] hover:bg-[#10A36B] active:bg-[#0E8A5A] focus:ring-[#16C784]"
            }`}
          >
            {isPending
              ? "Submitting..."
              : goalType === "OWN_GOAL"
              ? "Confirm Own Goal"
              : assistId !== null
              ? "Confirm Goal & Assist"
              : "Confirm Goal (No Assist)"}
          </button>
        </div>
      </div>
    </div>
  );
}