export type TransferType = 'PERMANENT' | 'LOAN' | 'FREE'

export interface TransferResponseDTO {
  id: number
  playerId: number
  playerName?: string | null
  fromTeamId: number | null
  fromTeamName: string | null
  toTeamId: number
  toTeamName: string
  transferType: TransferType
  fee: number | null
  transferDate: string
  squadNumber?: number | null
}

export interface TransferRequestDTO {
  playerId: number
  toTeamId: number
  transferType: TransferType
  fee?: number | null
  transferDate: string
  /**
   * Squad number to assign at the destination team. Only required when the
   * player's current number is already taken there — the backend keeps
   * their current number automatically when it's free at the new team.
   */
  newSquadNumber?: number | null
}

export interface TransferPageResponse {
  content: TransferResponseDTO[]
  totalElements: number
  totalPages: number
  page: number
  size: number
  first: boolean
  last: boolean
}

export interface TransferTeamOption {
  id: number
  name: string
}

export interface TransferPlayerOption {
  id: number
  name: string
  squadNumber?: number | null
  position?: string | null
  /** Player's current club — used to auto-fill the transfer's "from team". */
  teamId: number | null
  teamName: string | null
}

export interface TransferFilters {
  search: string
  transferType: 'ALL' | TransferType
  playerId?: number
  fromTeamId?: number
  toTeamId?: number
  dateFrom: string
  dateTo: string
}

export interface TransferQueryParams extends TransferFilters {
  page: number
  size: number
  sort: string
  direction: 'asc' | 'desc'
}

export interface TransferFormData {
  playerId: string
  fromTeamId: string
  fromTeamName: string
  toTeamId: string
  toTeamName: string
  transferType: TransferType
  fee: string
  transferDate: string
  newSquadNumber: string
}

export type TransferModalMode = 'CREATE' | 'UPDATE' | 'DELETE' | null
