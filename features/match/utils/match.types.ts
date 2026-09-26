// ============ Enums (as string unions) ============

import { CompetitionStatus, CompetitionType } from "@/features/competition/utils/competition.types";

export type MatchType = "REGULAR" | "KNOCKOUT" | "FRIENDLY" | "PLAYOFF" | "FINAL";

export type MatchStatus =
  | "SCHEDULED"
  | "LIVE"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELLED"
  | "ABANDONED"
  | "SUSPENDED";

  export type MatchPeriod =
    | "PRE_MATCH"
    | "FIRST_HALF"
    | "HALF_TIME"
    | "SECOND_HALF"
    | "EXTRA_TIME_FIRST_HALF"
    | "EXTRA_TIME_HALF_TIME"
    | "EXTRA_TIME_SECOND_HALF"
    | "PENALTIES"
    | "FULL_TIME";

// ============ DTOs ============

export interface MatchSummary {
  id: number;
  homeScore: number | null;
  awayScore: number | null;
  period: MatchPeriod;
  status: MatchStatus;
  abandonedReason: string | null;
  stadium: string | null;
  matchDate: string; // Instant, ISO date string
  startedAt: string | null;
  periodStartedAt: string | null;
  matchType: MatchType;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeTeamName: string 
  awayTeamName: string 
  competitionId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompetitionSummary {
  id: number;
  name: string;
  competitionCode: string;
  logoUrl: string | null;
  competitionType: CompetitionType;
  status: CompetitionStatus;
  totalTeams: number | null;
}

export interface CompetitionMatchesDTO {
  competition: CompetitionSummary;
  matches: MatchSummary[];
}

// ============ Request types ============

export interface MatchesByDateRequest {
  date?: string; // ISO date 'YYYY-MM-DD', omit for today
  status?: MatchStatus[]; // repeated query params, omit for all statuses
}

export interface MatchSearchRequest {
  matchId?: number;
  competitionId?: number;
  homeTeamId?: number;
  awayTeamId?: number;
  stadium?: string;
  dateFrom?: string; // LocalDate, ISO date string (yyyy-MM-dd)
  dateTo?: string;   // LocalDate, ISO date string (yyyy-MM-dd)
  period?: MatchPeriod;
  status?: MatchStatus;
  matchType?: MatchType;
}

export interface MatchRequest {
  homeTeamId: number;
  awayTeamId: number;
  competitionId: number | null;
  stadium?: string;
  matchDate: string; 
  matchType: MatchType;
  status: MatchStatus;
  period?: MatchPeriod
}

export interface MatchFormValues {
  homeTeamId: string;
  awayTeamId: string;
  competitionId: string;
  stadium: string;
  matchDate: string; 
  matchType: MatchType;
  period: MatchPeriod;
  status: MatchStatus;
  startedAt: string;
  periodStartedAt: string;
}

export interface MatchDTO {
  id: number;
  homeScore: number | null;
  awayScore: number | null;
  period: MatchPeriod;
  status: MatchStatus;
  matchType: MatchType;
  abandonedReason: string | null;
  stadium: string | null;
  matchDate: string; // Instant, ISO date string
  startedAt: string | null;
  periodStartedAt: string | null;
  homeTeamId: number | null;
  homeTeamName: string | null;
  homeTeamLogoUrl: string | null;
  homeTeamCode: string ;
  matchPeriods: MatchPeriod[]

  awayTeamId: number | null;
  awayTeamName: string | null;
  awayTeamLogoUrl: string | null;
  awayTeamCode: string ;

  competitionId: number | null;
  competitionName: string | null;
  competitionLogoUrl: string | null;
  lineupSubmitted: boolean
}

export const MATCH_STATUSES = [
  'SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 
  'CANCELLED', 'ABANDONED', 'SUSPENDED'
] as const

export const MATCH_TYPES = [
  'REGULAR', 'KNOCKOUT', 'FRIENDLY', 'PLAYOFF', 'FINAL'
] as const

export const MATCH_PERIODS = [
  'PRE_MATCH', 'FIRST_HALF', 'HALF_TIME', 'SECOND_HALF',
  'EXTRA_TIME_FIRST_HALF', 'EXTRA_TIME_HALF_TIME',
  'EXTRA_TIME_SECOND_HALF', 'PENALTIES', 'FULL_TIME'
] as const

// Then in your form file


export type MatchResult = "WIN" | "LOSS" | "DRAW";

export interface TeamFormEntryDTO {
  matchId: number;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamLogo: string | null;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamLogo: string | null;
  homeScore: number;
  awayScore: number;
  score: string;
  competitionId: number | null;
  competitionName: string | null;
  competitionLogoUrl: string | null;
  matchDate: string; // ISO instant string
  result: MatchResult;
}

export interface HeadToHeadEntryDTO {
  matchId: number;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamLogo: string | null;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamLogo: string | null;
  homeScore: number;
  awayScore: number;
  score: string;
  competitionId: number | null;
  competitionName: string | null;
  competitionLogoUrl: string | null;
  matchDate: string; // ISO instant string
}

export interface MatchOverviewDTO {
  homeTeamForm: TeamFormEntryDTO[];
  awayTeamForm: TeamFormEntryDTO[];
  headToHead: HeadToHeadEntryDTO[];
}