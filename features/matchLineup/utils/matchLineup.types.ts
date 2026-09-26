// --- Enums (string union types) ---

import { Position } from "@/features/profile/utils/profile.types";

export type LineupStatus = "STARTER" | "SUBSTITUTE" | "MISSING";

export type MissingReason =
  | "INJURED"
  | "SUSPENDED"
  | "ILLNESS"
  | "PERSONAL"
  | "UNKNOWN";

export type BookingStatus = "YELLOW_CARD" | "RED_CARD" | "YELLOW_RED_CARD";

export type SubstitutionStatus =  "SUBBED_ON" | "SUBBED_OFF";



export type Formation =
  // Back Four
  | "F_4_4_2"
  | "F_4_4_1_1"
  | "F_4_3_3"
  | "F_4_3_2_1"
  | "F_4_3_1_2"
  | "F_4_2_3_1"
  | "F_4_2_2_2"
  | "F_4_2_4"
  | "F_4_1_4_1"
  | "F_4_1_3_2"
  | "F_4_1_2_1_2"
  | "F_4_1_2_3"
  | "F_4_5_1"
  // Back Three
  | "F_3_4_3"
  | "F_3_4_2_1"
  | "F_3_4_1_2"
  | "F_3_5_2"
  | "F_3_5_1_1"
  | "F_3_6_1"
  | "F_3_2_4_1"
  // Back Five
  | "F_5_4_1"
  | "F_5_3_2"
  | "F_5_2_3"
  // Historical / Occasionally Used
  | "F_2_3_5"
  | "F_WM";

// --- DTOs (response types) ---

export interface LineupPlayerDTO {
  playerName: string;
  playerId: number;
  status: LineupStatus;
  position: Position;
  squadNumber: number;
    slotLabel?: string; // add this line

}

export interface MatchLineupDTO {
  matchId: number;
  teamId: number;
  teamName: string;
  captainId: number;
  formation: Formation;
  lineup: LineupPlayerDTO[];
}

export interface MatchLineupBothTeams {
  matchId: number;
  homeTeam: MatchLineupDTO;
  awayTeam: MatchLineupDTO;
}

export interface MatchPlayerStatsBothTeams {
  matchId: number;
  homeTeam: PlayerLineupInfo[];
  awayTeam: PlayerLineupInfo[];
}

// --- Request types ---

export interface PlayerLineupInfo {
  playerId: number;
  playerName: string;
  squadNumber: number;
  bookingStatus: BookingStatus | null;
  lineupStatus: LineupStatus;
  position: Position
  substitutionStatus: SubstitutionStatus | null;
  subbable: boolean;
  bookable: boolean;
  ableToScoreOrAssist: boolean;
  ableToComeOn: boolean;
}

export interface LineupPlayerRequest {
  playerId: number;
  position: Position;
  slotLabel?: string;
  status: LineupStatus;
  missingReason: MissingReason | null;
}

export interface MatchLineUpRequest {
  matchId: number;
  teamId: number;
  captainId: number;
  formation: Formation;
  players: LineupPlayerRequest[];
}

export type DragTargetType =
  | { type: "slot"; slotIndex: number }
  | { type: "bench" }
  | { type: "missing"; reason?: MissingReason };

export type SidebarTab = "bench" | "missing" | "unassigned" | "all";

export interface SlotCoordinate {
  x: number;
  y: number;
  label: string;
}
export interface RowLayoutTemplate {
  y: number;
  xOff: number;
  label: string;
}