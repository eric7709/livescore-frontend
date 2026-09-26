import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query'
import { axiosInstance } from '@/features/shared/utils/axiosInstance'
import {
  TransferFilters,
  TransferPageResponse,
  TransferPlayerOption,
  TransferQueryParams,
  TransferRequestDTO,
  TransferResponseDTO,
  TransferType,
} from './transfer.types'

const cleanParams = (params: TransferQueryParams) => {
  const result: Record<string, string | number> = {
    page: params.page,
    size: params.size,
    sort: params.sort,
    direction: params.direction,
  }

  if (params.search.trim()) result.search = params.search.trim()
  if (params.transferType !== 'ALL') result.transferType = params.transferType
  if (params.playerId) result.playerId = params.playerId
  if (params.fromTeamId) result.fromTeamId = params.fromTeamId
  if (params.toTeamId) result.toTeamId = params.toTeamId
  if (params.dateFrom) result.dateFrom = params.dateFrom
  if (params.dateTo) result.dateTo = params.dateTo

  return result
}

export function useTransfers(
  filters: TransferFilters,
  page: number,
  size: number,
  options?: Omit<UseQueryOptions<TransferPageResponse>, 'queryKey' | 'queryFn'>,
) {
  const params: TransferQueryParams = {
    ...filters,
    page,
    size,
    sort: 'transferDate',
    direction: 'desc',
  }

  return useQuery({
    queryKey: ['transfers', 'list', params],
    queryFn: async () => {
      const { data } = await axiosInstance.get<TransferPageResponse>('/transfers', {
        params: cleanParams(params),
      })

      return data
    },
    placeholderData: (previous) => previous,
    staleTime: 0,
    ...options,
  })
}

/**
 * Loads players for the transfer create/update modal's player combobox.
 * `search` filters server-side (same `search` param your /profiles list
 * endpoint already supports via useProfiles/useProfileParams) so a large
 * squad doesn't need to be pulled down and filtered client-side.
 *
 * If your profile endpoint uses a different URL, change only PLAYERS_ENDPOINT.
 */
const PLAYERS_ENDPOINT = '/profiles'

interface ProfileApiItem {
  id: number
  firstName?: string | null
  lastName?: string | null
  fullName?: string | null
  squadNumber?: number | null
  position?: string | null
  role?: string | null
  teamId?: number | null
  teamName?: string | null
}

interface ProfilePageResponse {
  content?: ProfileApiItem[]
}

export function useTransferPlayers(search = '') {
  return useQuery({
    queryKey: ['transfers', 'player-options', search],
    queryFn: async (): Promise<TransferPlayerOption[]> => {
      const { data } = await axiosInstance.get<ProfilePageResponse | ProfileApiItem[]>(
        PLAYERS_ENDPOINT,
        {
          params: {
            role: 'PLAYER',
            search: search.trim() || undefined,
            page: 0,
            size: 20,
          },
        },
      )

      const items = Array.isArray(data) ? data : data.content ?? []

      return items
        .filter((player) => player.role == null || player.role === 'PLAYER')
        .map((player) => ({
          id: player.id,
          name:
            player.fullName?.trim() ||
            `${player.firstName ?? ''} ${player.lastName ?? ''}`.trim() ||
            `Player #${player.id}`,
          squadNumber: player.squadNumber ?? null,
          position: player.position ?? null,
          teamId: player.teamId ?? null,
          teamName: player.teamName ?? null,
        }))
    },
    staleTime: 60 * 1000,
  })
}

export function useTransfer(id: number, options?: Omit<UseQueryOptions<TransferResponseDTO>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['transfers', 'detail', id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<TransferResponseDTO>(`/transfers/${id}`)
      return data
    },
    enabled: !!id,
    ...options,
  })
}

export function useCreateTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: TransferRequestDTO) => {
      const { data } = await axiosInstance.post<TransferResponseDTO>('/transfers', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
    },
  })
}

export function useUpdateTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: TransferRequestDTO }) => {
      const { data } = await axiosInstance.put<TransferResponseDTO>(`/transfers/${id}`, payload)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
      queryClient.invalidateQueries({ queryKey: ['transfers', 'detail', variables.id] })
    },
  })
}

export function useDeleteTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/transfers/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
    },
  })
}

export function useTransfersByType(type: TransferType, page = 0, size = 10) {
  return useTransfers(
    {
      search: '',
      transferType: type,
      dateFrom: '',
      dateTo: '',
    },
    page,
    size,
  )
}