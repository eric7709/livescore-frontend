// manager.types.ts

import { PlayerStatus, Position } from "@/features/profile/utils/profile.types";

// ============ Enums (must mirror backend exactly) ============



export type ResultBadge = 'W' | 'D' | 'L';

// ============ DTOs ============

export interface FixtureDTO {
  matchId: string;

  matchDate: string; // dd-MM-yyyy
  matchTime: string; // HH:mm

  competitionId: string;
  competitionName: string;
  competitionCode: string;
  competitionLogoUrl: string;

  homeTeamId: string;
  homeTeamName: string;
  homeTeamCode: string;
  homeTeamLogoUrl: string;

  awayTeamId: string;
  awayTeamName: string;
  awayTeamCode: string;
  awayTeamLogoUrl: string;
}

export interface ResultDTO {
  matchId: string;

  matchDate: string;
  matchTime: string;

  competitionId: string;
  competitionName: string;
  competitionCode: string;
  competitionLogoUrl: string;

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

  badge: ResultBadge;
}

export interface PlayerDTO {
  id: string;
  fullName: string;
  squadNumber: number;
  avatarUrl: string;
  status: PlayerStatus;
  position: Position;
}

// ============ Query param shapes ============

export interface MatchFilterParams {
  date?: string;          // yyyy-MM-dd — matches backend LocalDate binding
  competitionId?: number;
}

export interface PlayerFilterParams {
  status?: PlayerStatus;
  position?: string;
}