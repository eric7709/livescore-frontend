import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CompetitionStatus,
  CompetitionRequest,
  CompetitionDTO,
  TeamStandingDTO,
  PlayerStatDTO,
  CompetitionQueryParams,
  PlayerRankingDTO,
  RankingType,
  CompetitionResult,
  CompetitionFixture
} from './competition.types';
import { axiosInstance } from '@/features/shared/utils/axiosInstance';
import { PageParams, PageResponse } from '@/features/shared/types/pages.types';

// ============ Queries (GET Requests) ============
export const useGetCompetitions = (status?: CompetitionStatus) =>
  useQuery({
    queryKey: ['competitions', { status }],
    queryFn: async () => {
      const response = await axiosInstance.get<CompetitionDTO[]>('/competitions', {
        params: status ? { status } : {}
      });
      return response.data;
    }
  });

export const useGetCompetitionById = (id?: number) =>
  useQuery({
    queryKey: ['competition', id],
    queryFn: async () => {
      const response = await axiosInstance.get<CompetitionDTO>(`/competitions/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

export const useSearchCompetitions = (
  queryParams: CompetitionQueryParams = {},
  pageParams: PageParams = { size: 20, sort: 'startDate,desc' },
  enabled: boolean = true
) =>
  useQuery<PageResponse<CompetitionDTO>>({
    queryKey: ['competitions', 'search', { queryParams, pageParams }],
    queryFn: async () => {
      const response = await axiosInstance.get<PageResponse<CompetitionDTO>>(
        '/competitions/search',
        {
          params: { ...queryParams, ...pageParams }
        }
      );
      return response.data;
    },
    enabled // Useful for preventing search until filters are applied
  });

export const useGetStandings = (id?: number) =>
  useQuery({
    queryKey: ['competition', id, 'standings'],
    queryFn: async () => {
      const response = await axiosInstance.get<TeamStandingDTO[]>(`/competitions/${id}/standings`);
      return response.data;
    },
    enabled: !!id,
  });

export const useGetLiveTable = (id?: number) =>
  useQuery({
    queryKey: ['competition', id, 'live-table'],
    queryFn: async () => {
      const response = await axiosInstance.get<TeamStandingDTO[]>(`/competitions/${id}/standings/live`);
      return response.data;
    },
    enabled: !!id,
  });

export const useGetTopScorers = (id?: number) =>
  useQuery({
    queryKey: ['competition', id, 'top-scorer'],
    queryFn: async () => {
      const response = await axiosInstance.get<PlayerStatDTO[]>(`/competitions/${id}/top-scorers`);
      return response.data;
    },
    enabled: !!id,
  });

export const useGetTopAssisters = (id?: number) =>
  useQuery({
    queryKey: ['competition', id, 'top-assister'],
    queryFn: async () => {
      const response = await axiosInstance.get<PlayerStatDTO[]>(`/competitions/${id}/top-assists`);
      return response.data;
    },
    enabled: !!id,
  });

// ============ Mutations (POST, PUT, DELETE) ============

export const useCreateCompetition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newCompetition: CompetitionRequest) => {
      const response = await axiosInstance.post<CompetitionDTO>('/competitions', newCompetition);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['competitions'] }),
  });
};

export const useUpdateCompetition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: CompetitionRequest }) => {
      const response = await axiosInstance.put<CompetitionDTO>(`/competitions/${id}`, payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      queryClient.invalidateQueries({ queryKey: ['competition', variables.id] });
    },
  });
};

export const useDeleteCompetition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/competitions/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['competitions'] }),
  });
};

// ============ Team Management Mutations ============

export const useAddTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ compId, teamId }: { compId: number; teamId: number }) => {
      const response = await axiosInstance.post<CompetitionDTO>(`/competitions/${compId}/teams/${teamId}`);
      return response.data;
    },
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['competition', variables.compId] }),
  });
};

export const useAddTeamsBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ compId, teamIds }: { compId: number; teamIds: number[] }) => {
      const response = await axiosInstance.post<CompetitionDTO>(`/competitions/${compId}/teams`, teamIds);
      return response.data;
    },
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['competition', variables.compId] }),
  });
};

export const useRemoveTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ compId, teamId }: { compId: number; teamId: number }) => {
      const response = await axiosInstance.delete<CompetitionDTO>(`/competitions/${compId}/teams/${teamId}`);
      return response.data;
    },
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['competition', variables.compId] }),
  });
};

export const useRemoveTeamsBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ compId, teamIds }: { compId: number; teamIds: number[] }) => {
      const response = await axiosInstance.delete<CompetitionDTO>(`/competitions/${compId}/teams`, { data: teamIds });
      return response.data;
    },
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['competition', variables.compId] }),
  });
};


export const useGetMostSaves = (id?: number) =>
  useQuery({
    queryKey: ['competition', id, 'most-save'],
    queryFn: async () => {
      const response = await axiosInstance.get<PlayerRankingDTO[]>(`/competitions/${id}/most-saves`);
      return response.data;
    },
    enabled: !!id,
  });

export const useGetMostYellowCards = (id?: number) =>
  useQuery({
    queryKey: ['competition', id, 'most-yellow-cards'],
    queryFn: async () => {
      const response = await axiosInstance.get<PlayerRankingDTO[]>(`/competitions/${id}/most-yellow-cards`);
      return response.data;
    },
    enabled: !!id,
  });

export const useGetMostRedCards = (id?: number) =>
  useQuery({
    queryKey: ['competition', id, 'most-red-cards'],
    queryFn: async () => {
      const response = await axiosInstance.get<PlayerRankingDTO[]>(`/competitions/${id}/most-red-cards`);
      return response.data;
    },
    enabled: !!id,
  });

export function usePlayerRanking(competitionId: string, type: RankingType) {
  return useQuery({
    queryKey: ["player-ranking", type, competitionId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<PlayerRankingDTO[]>(
        `/api/competitions/${competitionId}/rankings/${type}`
      );
      return data;
    },
    enabled: !!competitionId,
  });
}

// ============ Fixtures and Results Queries ============

export const useGetFixtures = (competitionId?: number, date?: string) =>
  useQuery({
    queryKey: ['competition', competitionId, 'fixtures', { date }],
    queryFn: async () => {
      const response = await axiosInstance.get<CompetitionFixture>(
        `/competitions/${competitionId}/fixtures`,
        {
          params: date ? { date } : {}
        }
      );
      return response.data;
    },
    enabled: !!competitionId,
  });

export const useGetResults = (competitionId?: number, date?: string) =>
  useQuery({
    queryKey: ['competition', competitionId, 'results', { date }],
    queryFn: async () => {
      const response = await axiosInstance.get<CompetitionResult>(
        `/competitions/${competitionId}/results`,
        {
          params: date ? { date } : {}
        }
      );
      return response.data;
    },
    enabled: !!competitionId,
  });