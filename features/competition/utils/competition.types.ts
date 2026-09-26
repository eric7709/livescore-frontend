import { MatchStatus } from "@/features/match/utils/match.types";
import { COMPETITION_STATUSES, COMPETITION_TYPES, LEG_FORMATS, SCOPES } from "./competition.constants";



// ============ DTOs ============

export type CompetitionStatus = typeof COMPETITION_STATUSES[number];
export type CompetitionType = typeof COMPETITION_TYPES[number];
export type CompetitionScope = typeof SCOPES[number];
export type CompetitionLegFormat = typeof LEG_FORMATS[number];

export interface CompetitionDTO {
  id: number;
  name: string;
  competitionCode: string;
  logoUrl: string;
  scope: CompetitionScope;
  status: CompetitionStatus;
  registeredTeamCount: number;
  legFormat: CompetitionLegFormat;
  totalTeams: number;
  competitionType: CompetitionType;
  totalRounds: number;
  startDate: string; // ISO date string, or you could use Date
  endDate: string;   // ISO date string, or you could use Date
  teamIds: Set<number> | null;
}

export interface TeamStandingDTO {
  played: number;
  goalsFor: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  goalDifference: number;
  goalsAgainst: number;
  teamId: number | null;
  teamName: string | null;
  lastFive: string | null;
}

export type RankingType = "most-save" | "most-yellow-cards" | "most-red-cards";


export interface CompetitionRequest {
  name?: string;
  competitionCode?: string;
  logoUrl?: string;
  scope?: CompetitionScope;
  status?: CompetitionStatus;
  legFormat?: CompetitionLegFormat;
  totalTeams?: number;
  competitionType?: CompetitionType;
  totalRounds?: number;
  startDate?: string; // ISO date string, or Date
  endDate?: string;   // ISO date string, or Date
  teamIds?: Set<number>;
}

export interface CompetitionQueryParams {
  teamId?: number | null;
  competitionCode?: string;
  matchId?: number | null;
  name?: string;
  status?: CompetitionStatus;
  scope?: CompetitionScope;
  legFormat?: CompetitionLegFormat;
  competitionType?: CompetitionType;
  startDate?: string; // ISO date string (YYYY-MM-DD) from LocalDate
  endDate?: string;   // ISO date string (YYYY-MM-DD) from LocalDate
}


// Shared fields across both DTOs


export interface TeamStandingDTO {
  played: number;
  goalsFor: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  goalDifference: number;
  goalsAgainst: number;
  teamId: number | null;
  teamName: string | null;
  lastFive: string | null;
}


export interface PlayerRankingDTO extends BasePlayerDTO {
  value: number;
}
export interface BasePlayerDTO {
  playerId: number;
  name: string;
  teamId: number;
  teamName: string;
  teamLogoUrl: string;
}


export interface PlayerStatDTO extends BasePlayerDTO {
  numberOfGoals: number;
  numberOfAssists: number;
}



// ============ Fixture and Result Types ============

export interface CompetitionFixture {
  competitionId: number;
  competitionName: string;
  competitionCode: string;
  competitionLogoUrl: string;
  fixtures: Fixture[];
}

export interface Fixture {
  matchId: string;
  matchDate: string;
  matchTime: string;
  homeTeamId: string;
  homeTeamName: string;
  homeTeamCode: string;
  homeTeamLogoUrl: string;
  awayTeamId: string;
  awayTeamName: string;
  awayTeamCode: string;
  awayTeamLogoUrl: string;
  status: MatchStatus; // You'll need to define this enum
}

export interface CompetitionResult {
  competitionId: number;
  competitionName: string;
  competitionCode: string;
  competitionLogoUrl: string;
  results: Result[];
}

export interface Result {
  matchId: string;
  matchDate: string;
  matchTime: string;
  homeTeamId: string;
  homeTeamName: string;
  homeTeamCode: string;
  homeTeamLogoUrl: string;
  homeScore: number;
  awayTeamId: string;
  awayTeamName: string;
  awayTeamCode: string;
  awayTeamLogoUrl: string;
  awayScore: number;
}
