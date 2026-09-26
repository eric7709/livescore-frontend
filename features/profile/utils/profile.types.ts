import type React from 'react';

export type Role =
  | 'PLAYER'
  | 'MANAGER'
  | 'STAFF'
  | 'MODERATOR'
  | 'ADMIN';

export type Position =
  | 'GK'
  | 'CB'
  | 'LB'
  | 'RB'
  | 'LWB'
  | 'RWB'
  | 'CM'
  | 'CDM'
  | 'CAM'
  | 'LM'
  | 'RM'
  | 'LW'
  | 'RW'
  | 'ST'
  | 'CF';

export type CaptainStatus =
  | 'NONE'
  | 'CAPTAIN'
  | 'VICE_CAPTAIN';

export type PreferredFoot =
  | 'LEFT'
  | 'RIGHT'
  | 'BOTH';

export type PlayerStatus =
  | 'ACTIVE'
  | 'INJURED'
  | 'SUSPENDED'
  | 'UNAVAILABLE';

export type PositionGroup =
  | 'GOALKEEPER'
  | 'DEFENDER'
  | 'MIDFIELDER'
  | 'FORWARD';

export const STATUS_OPTIONS: {
  value: PlayerStatus;
  label: string;
}[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INJURED', label: 'Injured' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'UNAVAILABLE', label: 'Unavailable' },
];

/* ============================================================
   Profile Request DTO
   Matches com.zestio.app.profile.ProfileRequestDTO
   ============================================================ */

export interface ProfileRequestDTO {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatarUrl?: string;
  squadNumber?: number;
  teamId?: number;
  status?: PlayerStatus | null;
  role: Role;
  position?: Position | null;
  captainStatus?: CaptainStatus;
  preferredFoot?: PreferredFoot | null;
  height?: number | null;
  dateOfBirth?: string | null;
}

/* ============================================================
   Profile Response DTO
   Matches com.zestio.app.profile.dto.ProfileResponseDTO
   ============================================================ */

export interface ProfileResponseDTO {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl: string | null;
  squadNumber: number | null;
  status: PlayerStatus | null;
  role: Role;
  position: Position | null;
  captainStatus: CaptainStatus;
  preferredFoot: PreferredFoot | null;
  height: number | null;
  dateOfBirth: string | null;
  isStarter: boolean;
  teamId: number | null;
  teamName: string | null;
}

/* ============================================================
   Profile Summary
   ============================================================ */

export type ProfileSummaryResponseDTO = {
  id: number;
  fullName: string;
  squadNumber: number;
  position: Position;
  status: PlayerStatus | null;
};

/* ============================================================
   Display Labels
   ============================================================ */

export const ROLE_OPTIONS: {
  label: string;
  value: Role;
}[] = [
  { label: 'Player', value: 'PLAYER' },
  { label: 'Manager', value: 'MANAGER' },
  { label: 'Staff', value: 'STAFF' },
  { label: 'Moderator', value: 'MODERATOR' },
  { label: 'Admin', value: 'ADMIN' },
];

export const POSITION_OPTIONS: {
  label: string;
  value: Position;
}[] = [
  { label: 'Goalkeeper', value: 'GK' },
  { label: 'Center Back', value: 'CB' },
  { label: 'Left Back', value: 'LB' },
  { label: 'Right Back', value: 'RB' },
  { label: 'Left Wing Back', value: 'LWB' },
  { label: 'Right Wing Back', value: 'RWB' },
  { label: 'Center Midfielder', value: 'CM' },
  { label: 'Center Defensive Midfielder', value: 'CDM' },
  { label: 'Center Attacking Midfielder', value: 'CAM' },
  { label: 'Left Midfielder', value: 'LM' },
  { label: 'Right Midfielder', value: 'RM' },
  { label: 'Left Winger', value: 'LW' },
  { label: 'Right Winger', value: 'RW' },
  { label: 'Striker', value: 'ST' },
  { label: 'Center Forward', value: 'CF' },
];

export const POSITION_LABELS: Record<Position, string> = {
  GK: 'Goalkeeper',
  CB: 'Centre-back',
  LB: 'Left-back',
  RB: 'Right-back',
  LWB: 'Left wing-back',
  RWB: 'Right wing-back',
  CM: 'Central midfielder',
  CDM: 'Defensive midfielder',
  CAM: 'Attacking midfielder',
  LM: 'Left midfielder',
  RM: 'Right midfielder',
  LW: 'Left winger',
  RW: 'Right winger',
  ST: 'Striker',
  CF: 'Centre-forward',
};

/* ============================================================
   Captain Status Options
   ============================================================ */

export const CAPTAIN_STATUS_OPTIONS: {
  label: string;
  value: CaptainStatus;
}[] = [
  { label: 'None', value: 'NONE' },
  { label: 'Captain', value: 'CAPTAIN' },
  { label: 'Vice Captain', value: 'VICE_CAPTAIN' },
];

/* ============================================================
   Preferred Foot Options
   ============================================================ */

export const PREFERRED_FOOT_OPTIONS: {
  label: string;
  value: PreferredFoot;
}[] = [
  { label: 'Left', value: 'LEFT' },
  { label: 'Right', value: 'RIGHT' },
  { label: 'Both', value: 'BOTH' },
];

/* ============================================================
   Squad Roles
   Roles that have pitch position / squad number / starter
   status.
   ============================================================ */

export const SQUAD_ROLES: Role[] = ['PLAYER'];

/* ============================================================
   Team Option
   ============================================================ */

export interface TeamOption {
  id: number;
  name: string;
}

/* ============================================================
   Profile Query Parameters
   ============================================================ */

export interface ProfileQueryParams {
  search?: string;
  role?: Role;
  position?: Position;
  squadNumber?: number;
  teamId?: number | null;
  isStarter?: boolean;
  page?: number;
  size?: number;
}

/* ============================================================
   Modal
   ============================================================ */

export type ModalMode =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | null;

/* ============================================================
   Profile Statistics
   ============================================================ */

export interface ProfileStatsDTO {
  totalProfiles: number;
  totalPlayers: number;
  totalStaff: number;
  totalManagers: number;
}

/* ============================================================
   Filters
   ============================================================ */

export type StarterStatus =
  | 'ALL'
  | 'STARTER'
  | 'SUBSTITUTE';

export interface FilterState {
  search: string;
  role: Role | 'ALL';
  position: Position | 'ALL';
  starterStatus: StarterStatus;
  teamId: number | 'ALL';
}


/* ============================================================
   Form & UI Types
   ============================================================ */

export type FormData = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  squadNumber: string;
  teamId: string;
  role: Role;
  position: Position | undefined;
  status: PlayerStatus;
  captainStatus: CaptainStatus;
  preferredFoot: PreferredFoot | undefined;
  height: string;
  dateOfBirth: string;
  avatarUrl: string;
};

export type FormError = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  squadNumber: string;
  teamId: string;
  role: string;
  position: string;
  status: string;
  captainStatus: string;
  preferredFoot: string;
  height: string;
  dateOfBirth: string;
  avatarUrl: string;
};

/* ============================================================
   Image
   ============================================================ */

export type ImageState = {
  file: File | null;
  previewUrl: string;
  isUploading: boolean;
};

/* ============================================================
   Pagination
   ============================================================ */

export type PaginationState = {
  currentPage: number;
  total: number;
  pageSize: number;
};

/* ============================================================
   Profile Store
   ============================================================ */

export interface ProfileStore {
  /* ── State ────────────────────────────────────────────────── */

  profile: ProfileResponseDTO | null;
  modal: ModalMode;
  formData: FormData;
  formError: FormError;
  image: ImageState;
  pagination: PaginationState;
  filters: FilterState;

  /* ── Profile actions ──────────────────────────────────────── */

  setProfile: (
    profile: ProfileResponseDTO | null
  ) => void;

  updateProfile: (
    data: Partial<ProfileResponseDTO>
  ) => void;

  deleteProfile: () => void;

  openModal: (
    mode: ModalMode
  ) => void;

  closeModal: () => void;

  /* ── Form actions ─────────────────────────────────────────── */

  setField: <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => void;

  setFormError: (
    error: Partial<FormError>
  ) => void;

  resetForm: () => void;

  loadForm: (
    profile: ProfileResponseDTO
  ) => void;

  buildPayload: (
    resolvedAvatarUrl?: string
  ) => ProfileRequestDTO;

  validate: () => boolean;

  handleCloseModal: () => void;

  /* ── Image actions ────────────────────────────────────────── */

  setImage: (
    file: File
  ) => void;

  clearImage: () => void;

  setImageUploading: (
    isUploading: boolean
  ) => void;

  setImageFromEvent: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;

  clearImageAndField: () => void;

  /* ── Filter actions ───────────────────────────────────────── */

  setSearch: (
    search: string
  ) => void;

  setRole: (
    role: Role | 'ALL'
  ) => void;

  setPosition: (
    position: Position | 'ALL'
  ) => void;

  setTeamId: (
    teamId: number | 'ALL'
  ) => void;

  setStarterStatus: (
    status: StarterStatus
  ) => void;

  resetFilters: () => void;

  /* ── Pagination actions ───────────────────────────────────── */

  setPage: (
    currentPage: number
  ) => void;

  setTotal: (
    total: number
  ) => void;

  setPageSize: (
    pageSize: number
  ) => void;
}

// Add these to profile.types.ts (merge with what's already there).
// Role, Position, PreferredFoot are assumed to already exist in this file
// since ProfileRequestDTO references them — adjust the import/paths below
// if they actually live somewhere else.

export type TransferType = "TRANSFER" | "LOAN" | "FREE";

export interface ClubHistoryResponseDTO {
  id: number;

  fromClubId: number | null; // null for a free-agent signing / no prior club
  fromClubName: string | null;
  fromClubLogoUrl: string | null;

  toClubId: number;
  toClubName: string;
  toClubLogoUrl: string | null;

  from: string; // ISO date string (LocalDate)
  to: string | null; // null = current club
  fee: string | null; // preformatted, e.g. "€45.0M"
  loanFeeLabel: string | null; // e.g. "Loan fee: N/A"
  type: TransferType;
  appearances: number | null; // not yet populated on the backend
}

export interface CompetitionStatResponseDTO {
  id: string; // "{competitionId}-{clubId}"
  competitionId: number;
  competitionName: string;
  competitionLogoUrl: string | null;
  clubId: number;
  clubName: string;
  clubLogoUrl: string | null;
  appearances: number;
  goals: number;
  yellowCards: number;
  redCards: number;
}

export interface AddRosterMemberRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: Role; // PLAYER or STAFF only
  teamId?: number;
  position?: Position; // relevant for PLAYER, ignored for STAFF
  squadNumber?: number;
  preferredFoot?: PreferredFoot;
  height?: number;
  dateOfBirth?: string; // ISO date string
}