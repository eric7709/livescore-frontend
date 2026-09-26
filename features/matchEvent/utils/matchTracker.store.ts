import { create } from "zustand"
import { PlayerLineupInfo } from "../../matchLineup/utils/matchLineup.types"
import { EventType } from "./matchEvent.types"


type MatchTrackerState = {
    modal: EventType | null
    teamId: number | null
    eventType: EventType | null
    primaryPlayer: PlayerLineupInfo | null
    secondaryPlayer: PlayerLineupInfo | null
    penaltyEngagers: PlayerLineupInfo[]
    goalScorers: PlayerLineupInfo[]
    playersOut: PlayerLineupInfo[]
    playersIn: PlayerLineupInfo[]
    bookingRecipients: PlayerLineupInfo[]
    assistProviders: PlayerLineupInfo[] | null

    setModal: (modal: EventType) => void
    setTeamId: (teamId: number | null) => void
    setEventType: (eventType: EventType | null) => void
    setPrimaryPlayer: (player: PlayerLineupInfo | null) => void
    setSecondaryPlayer: (player: PlayerLineupInfo | null) => void
    clearPlayer: () => void
    closeModal: () => void
    openModal: (modal: EventType) => void

    setTeamPlayersOut: (playersOut: PlayerLineupInfo[]) => void
    setTeamPlayersIn: (playersIn: PlayerLineupInfo[]) => void
    setPenaltyEngagers: (players: PlayerLineupInfo[]) => void
    setGoalScorers: (players: PlayerLineupInfo[]) => void
    setBookingRecipients: (players: PlayerLineupInfo[]) => void
    setAssistProviders: (players: PlayerLineupInfo[] | null) => void

    resetData: () => void
    reset: () => void
}

const initialState = {
    modal: null,
    teamId: null as number | null,
    eventType: null as EventType | null,
    primaryPlayer: null as PlayerLineupInfo | null,
    secondaryPlayer: null as PlayerLineupInfo | null,
    penaltyEngagers: [] as PlayerLineupInfo[],
    goalScorers: [] as PlayerLineupInfo[],
    playersOut: [] as PlayerLineupInfo[],
    playersIn: [] as PlayerLineupInfo[],
    bookingRecipients: [] as PlayerLineupInfo[],
    assistProviders: null as PlayerLineupInfo[] | null,
}

export const useMatchTrackerStore = create<MatchTrackerState>((set) => ({
    ...initialState,

    setModal: (modal) => set({ modal }),
    setTeamId: (teamId) => set({ teamId }),
    setEventType: (eventType) => set({ eventType }),
    setPrimaryPlayer: (primaryPlayer) => set({ primaryPlayer }),
    setSecondaryPlayer: (secondaryPlayer) => set({ secondaryPlayer }),
    clearPlayer: () => set({ primaryPlayer: null, secondaryPlayer: null }),
    closeModal: () => set({ modal: null }),
    openModal: (modal) => set({ modal }),

    setTeamPlayersOut: (playersOut) => set({ playersOut }),
    setTeamPlayersIn: (playersIn) => set({ playersIn }),
    setPenaltyEngagers: (penaltyEngagers) => set({ penaltyEngagers }),
    setGoalScorers: (goalScorers) => set({ goalScorers }),
    setBookingRecipients: (bookingRecipients) => set({ bookingRecipients }),
    setAssistProviders: (assistProviders) => set({ assistProviders }),

    resetData: () =>
        set({
            goalScorers: [],
            assistProviders: null,
            bookingRecipients: [],
            penaltyEngagers: [],
            playersOut: [],
            playersIn: [],
        }),

    reset: () => set(initialState),
}))