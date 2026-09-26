import { CaptainStatus, PlayerStatus, Position } from "@/features/profile/utils/profile.types";

// ─── API DTOs ──────────────────────────────────────────────────────
export type TeamResponseDTO = {
    id: number;
    name: string;
    logoUrl: string | null;
    managerId: number;
    managerName: string;
    teamCode: string;
    stadium?: string
};



export interface Fixture {
  matchId: string;
  matchDate: string;
  matchTime: string;

  competitionId: string;
  competitionName: string;
  competitionCode: string;
  competitionLogoUrl?: string;

  homeTeamId: string;
  homeTeamName: string;
  homeTeamCode: string;
  homeTeamLogoUrl?: string;

  awayTeamId: string;
  awayTeamName: string;
  awayTeamCode: string;
  awayTeamLogoUrl?: string;
}


export interface ManagerProfile {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl?: string;
  status: PlayerStatus;
  teamName?: string;
  teamId?: number;
  teamLogoUrl?: string
}

export type GetTeamFixturesParams = {
  date?: string; // ISO "yyyy-MM-dd"
  competitionId?: number;
  page?: number;  // 0-based, defaults to 0 server-side
  size?: number;  // defaults to 10 server-side
};
export type GetTeamResultsParams = {
  date?: string; // ISO "yyyy-MM-dd"
  competitionId?: number;
  page?: number;  // 0-based, defaults to 0 server-side
  size?: number;  // defaults to 10 server-side
};



export interface Result {
  matchId: string;
  matchDate: string;
  matchTime: string;

  competitionId: string;
  competitionName: string;
  competitionCode: string;
  competitionLogoUrl?: string;

  homeTeamId: string;
  homeTeamName: string;
  homeTeamCode: string;
  homeTeamLogoUrl?: string;
  homeScore: number;

  awayTeamId: string;
  awayTeamName: string;
  awayTeamCode: string;
  awayTeamLogoUrl?: string;
  awayScore: number;

  badge: "W" | "L" | "D";
}

export type TeamRequestDTO = {
    name: string;
    teamCode: string;
    logoUrl: string | null;
    managerId?: number | null;
    competitionId?: number | null;
};
export type TeamSummaryDTO = {
    teamId: number
    teamName: string
    teamLogoUrl: string 
    teamCode: String
    teamStadium?: String
}
// ─── UI Types ──────────────────────────────────────────────────────
export type ModalType = "CREATE" | "UPDATE" | "DELETE" | null;

export type UIState = {
    loading: boolean;
    modalType: ModalType;
};

export type Sort = {
    field: "name" | "id" | "teamCode";
    direction: "asc" | "desc";
};

export interface TeamPaginationState {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export type Filter = {
    search: string;
    competitionId: number | "ALL";
};

export type FormData = {
    name: string;
    logoUrl: string;
    teamCode: string;
};

export interface Player {
  id: string;
  fullName: string;
  squadNumber: number;
  avatarUrl?: string;
  status: PlayerStatus;
  captainStatus: CaptainStatus
  position: Position;
}

export interface TeamSquadAndManager {
  squad: Player[];
  manager: ManagerProfile | null;
}

export type FormError = {
    name: string;
    logoUrl: string;
    teamCode: string;
    managerId: string;
    competitionId: string;
};

export type ImageState = {
    file: File | null;
    previewUrl: string;
    isUploading: boolean;
};

export type GetTeamSquadParams = {
  status?: PlayerStatus;
  position?: Position[];
}



// ─── Store Type ────────────────────────────────────────────────────
export type TeamStore = {
    // ─── State ────────────────────────────────────────────────────────
    teams: TeamResponseDTO[];
    selectedTeam: TeamResponseDTO | null;
    formData: FormData;
    formError: FormError;
    filter: Filter;
    pagination: TeamPaginationState;
    uiState: UIState;
    sort: Sort;
    image: ImageState;

    // ─── Setters ──────────────────────────────────────────────────────
    setTeams: (teams: TeamResponseDTO[]) => void;
    setSelectedTeam: (team: TeamResponseDTO | null) => void;
    setField: (field: keyof FormData, value: string) => void;
    setFormError: (error: Partial<FormError>) => void;
    setLoading: (loading: boolean) => void;
    openModal: (modalType: ModalType) => void;
    closeModal: () => void;
    resetForm: () => void;
    loadForm: (team: TeamResponseDTO) => void;

    // ─── Image actions ──────────────────────────────────────────────
    setImage: (file: File) => void;
    clearImage: () => void;
    setImageUploading: (isUploading: boolean) => void;
    setImageFromEvent: (e: React.ChangeEvent<HTMLInputElement>) => void;
    clearImageAndField: () => void;
    handleCloseModal: () => void;

    // ─── Filter actions ──────────────────────────────────────────────
    setSearch: (search: string) => void;
    setCompetitionFilter: (competitionId: number | "ALL") => void;
    resetFilters: () => void;


    // ─── TeamPaginationState actions ──────────────────────────────────────────
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    setTotal: (total: number) => void;
    setPagination: (pagination: Partial<TeamPaginationState>) => void;

    // ─── Sort action ──────────────────────────────────────────────────
    setSort: (field: Sort["field"], direction: Sort["direction"]) => void;

    buildPayload: () => TeamRequestDTO;


    // ─── Validation ──────────────────────────────────────────────────
    validate: () => boolean;
};