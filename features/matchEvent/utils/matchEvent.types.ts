import { MatchPeriod } from "@/features/match/utils/match.types";

export type EventType =
  // Goals
  | "GOAL"
  | "OWN_GOAL"
  | "PENALTY_GOAL"
  | "FREE_KICK_GOAL"
  | "LONG_RANGE_GOAL"
  | "PENALTY_MISSED"
  | "PENALTY_AWARDED"
  // Cards
  | "YELLOW_CARD"
  | "RED_CARD"
  | "YELLOW_RED_CARD" // second yellow -> red (server-side upgrade only, not directly selectable)
  // Substitutions
  | "SUBSTITUTION"
  // Set pieces
  | "CORNER"
  | "FREE_KICK"
  | "THROW_IN"
  | "GOAL_KICK"
  | "OFFSIDE"
  // Fouls / misconduct
  | "FOUL"
  // Shots
  | "SHOT_ON_TARGET"
  | "SHOT_OFF_TARGET"
  | "SHOT_BLOCKED"
  // Goalkeeping
  | "SAVE"
  // Possession / play
  | "KEY_PASS"
  | "DRIBBLE"
  | "INTERCEPTION"
  | "TACKLE"
  | "CLEARANCE"
  // Match management
  | "KICK_OFF"
  | "HALF_TIME"
  | "FULL_TIME"
  | "VAR_REVIEW"
  | "INJURY";

export type EventCategory =
  | "GOALS"
  | "CARDS"
  | "SUBSTITUTION"
  | "SET_PIECES"
  | "FOULS"
  | "SHOTS"
  | "GOALKEEPING"
  | "POSSESSION";

// Events with their own dedicated modal (rich player-out/in, goal-type,
// assist, own-goal-team-swap flows). Everything else in a category below
// falls through to GenericEventModal.
export const DEDICATED_MODAL_EVENTS: EventType[] = [
  "SUBSTITUTION",
  "GOAL",
  "OWN_GOAL",
  "PENALTY_GOAL",
  "FREE_KICK_GOAL",
  "LONG_RANGE_GOAL",
  "PENALTY_AWARDED",
  "PENALTY_MISSED",
  "YELLOW_CARD",
  "RED_CARD",
];

// KICK_OFF / HALF_TIME / FULL_TIME are driven by MatchControlPanel's
// period-advance flow already — not exposed as tappable tracker buttons to
// avoid a second, conflicting way to change match state.
export const EVENT_CATEGORIES: Record<EventCategory, EventType[]> = {
  GOALS: ["GOAL", "OWN_GOAL", "PENALTY_GOAL", "FREE_KICK_GOAL", "LONG_RANGE_GOAL", "PENALTY_AWARDED", "PENALTY_MISSED"],
  CARDS: ["YELLOW_CARD", "RED_CARD"],
  SUBSTITUTION: ["SUBSTITUTION"],
  SET_PIECES: ["CORNER", "FREE_KICK", "THROW_IN", "GOAL_KICK", "OFFSIDE"],
  FOULS: ["FOUL", "VAR_REVIEW", "INJURY"],
  SHOTS: ["SHOT_ON_TARGET", "SHOT_OFF_TARGET", "SHOT_BLOCKED"],
  GOALKEEPING: ["SAVE"],
  POSSESSION: [ "KEY_PASS", "DRIBBLE", "INTERCEPTION", "TACKLE", "CLEARANCE"],
};

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  GOALS: "Goals",
  CARDS: "Cards",
  SUBSTITUTION: "Subs",
  SET_PIECES: "Set Pieces",
  FOULS: "Fouls",
  SHOTS: "Shots",
  GOALKEEPING: "Goalkeeping",
  POSSESSION: "Possession",
};

export const EVENT_LABELS: Partial<Record<EventType, string>> = {
  CORNER: "Corner",
  FREE_KICK: "Free Kick",
  THROW_IN: "Throw-in",
  GOAL_KICK: "Goal Kick",
  OFFSIDE: "Offside",
  FOUL: "Foul",
  VAR_REVIEW: "VAR Review",
  INJURY: "Injury",
  SHOT_ON_TARGET: "Shot on Target",
  SHOT_OFF_TARGET: "Shot off Target",
  SHOT_BLOCKED: "Shot Blocked",
  SAVE: "Save",
  KEY_PASS: "Key Pass",
  DRIBBLE: "Dribble",
  INTERCEPTION: "Interception",
  TACKLE: "Tackle",
  CLEARANCE: "Clearance",
};

// Events with their own dedicated modal (rich player-out/in, goal-type,
// assist, own-goal team-swap flows).
export const MODAL_EVENTS: EventType[] = [
  "SUBSTITUTION",
  "GOAL",
  "PENALTY_AWARDED",
  "PENALTY_MISSED",
  "YELLOW_CARD",
  "RED_CARD",
];

// Events that just log team + event type, no player, fired immediately on
// click. Only the ones currently wired up — extend this list as more get
// built out.
export const REGISTER_ONLY_EVENTS: EventType[] = [
  "CORNER",
  "OFFSIDE",
  "THROW_IN",
  "GOAL_KICK",
  "FREE_KICK",
  "FOUL",
  "SAVE",
  "SHOT_ON_TARGET",
  "SHOT_OFF_TARGET",
];

export const EVENT_TYPES: EventType[] = [
  "GOAL",
  "OWN_GOAL",
  "PENALTY_GOAL",
  "FREE_KICK_GOAL",
  "LONG_RANGE_GOAL",
  "PENALTY_MISSED",
  "PENALTY_AWARDED",
  "YELLOW_CARD",
  "RED_CARD",
  "YELLOW_RED_CARD",
  "SUBSTITUTION",
  "CORNER",
  "FREE_KICK",
  "THROW_IN",
  "GOAL_KICK",
  "OFFSIDE",
  "FOUL",
  "SHOT_ON_TARGET",
  "SHOT_OFF_TARGET",
  "SHOT_BLOCKED",
  "SAVE",
  "KEY_PASS",
  "DRIBBLE",
  "INTERCEPTION",
  "TACKLE",
  "CLEARANCE",
  "KICK_OFF",
  "HALF_TIME",
  "FULL_TIME",
  "VAR_REVIEW",
  "INJURY",
];


// --- EventTypeCount.java ---------------------------------------------------

export interface EventTypeCount {
  eventType: EventType;
  homeValue: number;
  awayValue: number;
}

// --- MatchEventDTO.java -----------------------------------------------------

export interface MatchEventDTO {
  id: number;
  matchId: number | null;
  scoringTeamId: number | null;
  teamId: number | null;
  primaryPlayerId: number | null;
  primaryPlayerName: string | null;
  secondaryPlayerId: number | null;
  secondaryPlayerName: string | null;
  eventType: EventType;
  period: MatchPeriod;
  minute: number;
  second: number;
  eventData: string | null; // JSON string: x,y coords, shot xG, etc
  createdAt: string; // Instant serialized as ISO-8601 string
}

// --- MatchEventRequest.java --------------------------------------------------

export interface MatchEventRequest {
  matchId: number;
  teamId: number;
  primaryPlayerId?: number | null;
  secondaryPlayerId?: number | null;
  eventType: EventType;
  period: MatchPeriod;
  eventData?: string | null;
}



export interface EventTypeCount {
  eventType: EventType;
  homeValue: number;
  awayValue: number;
}

export interface MatchStatistic {
  period: MatchPeriod | null;
  periodLabel: string;
  statistics: EventTypeCount[];
}

// --- MatchSummary.java -------------------------------------------------------

export interface MatchSummary {
  period: MatchPeriod;
  periodLabel: string
  homeScore: number;
  awayScore: number;
  summaries: MatchEventDTO[];
}