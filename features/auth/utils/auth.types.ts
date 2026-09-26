
// ================= ENUMS =================
// Mirror com.zestio.app.profile.enums.*

import { CaptainStatus, PlayerStatus, Position, Role } from "@/features/profile/utils/profile.types";


// ================= REQUEST DTOs =================

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  inviteCode: string;
}

export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface CreateInviteRequest {
  role: Role;
  teamId?: number;
  expiresInDays?: number;
}

// ================= RESPONSE DTOs =================

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface ProfileDetailsResponse {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl: string | null;
  squadNumber: number | null;
  status: PlayerStatus;
  role: Role;
  position: Position | null;
  captainStatus: CaptainStatus;
  teamId: number | null;
}

export interface InviteResponse {
  code: string;
  role: Role;
  teamId: number | null;
  expiresAt: string; // ISO instant
}