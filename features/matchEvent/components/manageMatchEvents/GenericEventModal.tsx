"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import { X } from "lucide-react"
import { useGetMatchById } from "@/features/match/utils/match.api"
import { useCreateMatchEvent } from "../../utils/matchEvent.api"
import { useMatchTrackerStore } from "../../utils/matchTracker.store"
import { MatchEventUtils } from "../../utils/matchEvent.utils"
import { EVENT_LABELS, EventType } from "../../utils/matchEvent.types"

function labelFor(type: EventType): string {
  return EVENT_LABELS[type] ?? type.replace(/_/g, " ")
}

export default function GenericEventModal() {
  const params = useParams<{ matchId: string }>()
  const matchId = Number(params.matchId)
  const { data: match } = useGetMatchById(matchId)
  const { mutate, isPending } = useCreateMatchEvent()
  const { modal, teamId, playersOut, closeModal, eventType } = useMatchTrackerStore()
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null)
  const teamCode = MatchEventUtils.getTeamSideAndCode(teamId, match)
  const handleSubmit = (): void => {
    const payload = MatchEventUtils.buildEventPayload(
      matchId,
      match?.period,
      teamId,
      eventType,
      selectedPlayerId
    )
    if (!payload) return
    mutate(payload, {
      onSuccess: () => {
        setSelectedPlayerId(null)
        closeModal()
      },
    })
  }

  const handleClose = (): void => closeModal()

  if (!MatchEventUtils.shouldRenderGenericModal(modal)) return null;
  return (
    <div className="fixed inset-0 z-50 h-screen w-screen bg-slate-950/40 backdrop-blur-md">
      
      <div className="h-full w-full flex flex-col bg-white font-body overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#E4E7EC] bg-linear-to-b from-[#F3F4F6] to-white shrink-0">
          <div>
            <p className="font-condensed text-[10px] font-bold tracking-[0.2em] text-[#98A2B3] uppercase">
              {eventType ? labelFor(eventType) : "Event"}
            </p>
            <p className="font-condensed text-lg font-bold text-[#101828] leading-tight uppercase mt-0.5">
              Select <span className="text-[#475467]">Player</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {teamCode && (
              <span className="font-condensed text-xs font-bold tracking-wide text-white bg-[#344054] px-2 py-1 rounded">
                {teamCode}
              </span>
            )}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E4E7EC] text-[#667085] hover:bg-[#F9FAFB] hover:text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#344054] transition-colors"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Player list */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#EEF0F3]">
          {playersOut?.map((p) => {
            const isSelected = selectedPlayerId === p.playerId
            return (
              <button
                key={p.playerId}
                type="button"
                onClick={() => setSelectedPlayerId(p.playerId)}
                className={`group relative flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors focus:outline-none ${isSelected ? "bg-[#F3F4F6]/60" : "hover:bg-[#F9FAFB]"
                  }`}
              >
                <span
                  className={`absolute left-0 top-0 bottom-0 w-[3px] bg-[#344054] transition-transform duration-150 ${isSelected ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
                    }`}
                />
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border font-condensed text-sm font-bold transition-colors ${isSelected
                    ? "border-[#344054] bg-[#F3F4F6] text-[#344054]"
                    : "border-[#E4E7EC] bg-[#F9FAFB] text-[#101828] group-hover:border-[#344054]/40"
                    }`}
                >
                  {p.squadNumber}
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="truncate text-[13px] font-semibold text-[#101828]">
                    {p.playerName}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#E4E7EC] bg-[#F9FAFB] shrink-0">
          <button
            type="button"
            disabled={selectedPlayerId === null || isPending}
            onClick={handleSubmit}
            className="w-full h-10 flex items-center justify-center rounded-md font-condensed text-sm font-bold tracking-wider uppercase text-white bg-[#344054] hover:bg-[#1D2939] active:bg-[#101828] focus:outline-none focus:ring-2 focus:ring-[#344054] focus:ring-offset-2 transition-colors disabled:bg-[#F2F4F7] disabled:text-[#98A2B3] disabled:cursor-not-allowed"
          >
            {isPending ? "Submitting..." : `Confirm ${eventType ? labelFor(eventType) : "Event"}`}
          </button>
        </div>
      </div>
    </div>
  )
}