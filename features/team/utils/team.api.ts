import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UseQueryOptions } from "@tanstack/react-query";
import { Fixture, GetTeamFixturesParams, GetTeamResultsParams, GetTeamSquadParams, Result, TeamRequestDTO, TeamResponseDTO, TeamSquadAndManager, TeamSummaryDTO } from "./team.types";
import { useTeamStore } from "./store";
import { Option } from "@/features/shared/types/option.types";
import { axiosInstance } from "@/features/shared/utils/axiosInstance";
import { PageResponse } from "@/features/shared/types/pages.types";

interface GetTeamsParams {
  query?: string;
  competitionId?: number;
  page?: number;
  size?: number;
  sort?: string;
}

// ================= QUERIES =================

export function useGetTeams() {
  const filter = useTeamStore((s) => s.filter);
  const pagination = useTeamStore((s) => s.pagination);
  const sort = useTeamStore((s) => s.sort);

  const params: GetTeamsParams = {
    query: filter.search,
    competitionId: filter.competitionId === "ALL" ? undefined : filter.competitionId,
    page: pagination.page,
    size: pagination.size,
    sort: `${sort.field},${sort.direction}`,
  };

  return useQuery({
    queryKey: ["teams", "list", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get<TeamResponseDTO[]>("/teams", { params });
      return data;
    },

    staleTime: 0,
  });
}

export function useTeam(
  id: number,
  options?: UseQueryOptions<TeamResponseDTO>
) {
  return useQuery({
    queryKey: ["teams", "detail", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<TeamResponseDTO>(
        `/teams/${id}`
      );
      return data;
    },
    enabled: !!id,
    ...options,
  });
}

export function useTeamSquadNumbers(
  teamId: number,
  options?: Omit<UseQueryOptions<number[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ["teams", "detail", teamId, "squad-numbers"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<number[]>(`/teams/${teamId}/squad-numbers`);
      return data;
    },
    enabled: !!teamId,
    ...options,
  });
}

export function useTeamOpponent(
  id: number,
  matchId: number,
  options?: UseQueryOptions<TeamResponseDTO>
) {
  return useQuery({
    queryKey: ["teams", "detail", id, matchId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<TeamResponseDTO>(
        `/teams/${id}/match/${matchId}/opponent`
      );
      return data;
    },
    enabled: !!id && !!matchId,
    ...options,
  });
}

export function useTeamSummary(query?: string, options?: UseQueryOptions<TeamSummaryDTO[]>) {
  return useQuery({
    queryKey: ["teams", "summary", query],
    queryFn: async () => {
      const { data } = await axiosInstance.get<TeamSummaryDTO[]>("/teams/summary", {
        params: query ? { query } : undefined,
      });
      return data;
    },
    ...options,
  });
}

export function useBatchTeams(ids: number[]) {
  return useQuery({
    queryKey: ["teams", "batch", ids],
    queryFn: async () => {
      const { data } = await axiosInstance.post<TeamResponseDTO[]>("/teams/batch", ids);
      return data;
    },
    enabled: ids.length > 0,
  });
}

export function useSearchTeams(query: string, page = 0, size = 15) {
  return useQuery({
    queryKey: ["teams", "search", query, page, size],
    queryFn: async () => {
      const { data } = await axiosInstance.get<PageResponse<TeamResponseDTO>>("/teams/search", {
        params: { query, page, size },
      });
      return data;
    },
  });
}

export function useGetTeamsOptions(search: string): Option[] {
  const result = useQuery({
    queryKey: ["teams", "options", search],
    queryFn: async () => {
      const { data } = await axiosInstance.get<PageResponse<TeamResponseDTO>>(
        "/teams/search",
        {
          params: {
            query: search,
            page: 0,
            size: 20,
          },
        }
      );
      return data;
    },
    enabled: search.length > 0,
    staleTime: 0,
  });

  return (
    result.data?.content.map((team: TeamResponseDTO) => ({
      value: team.id.toString(),
      label: team.name,
    })) || []
  );
}

// ================= MUTATIONS =================

export function useAddTeamsToCompetition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ competitionId, teamIds }: { competitionId: number; teamIds: number[] }) => {
      await axiosInstance.post(`/competitions/${competitionId}/teams`, teamIds);
    },
    onSuccess: (_, { competitionId }) => {
      queryClient.invalidateQueries({ queryKey: ["competitions", competitionId, "teams"] });
      queryClient.invalidateQueries({ queryKey: ["teams", "list"] });
    },
    onError: (error) => {
      console.error("Failed to add teams:", error);
    },
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TeamRequestDTO) => {
      const { data } = await axiosInstance.post<TeamResponseDTO>("/teams", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", "search"] });
      queryClient.invalidateQueries({ queryKey: ["teams", "summary"] });
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: TeamRequestDTO }) => {
      const { data } = await axiosInstance.put<TeamResponseDTO>(`/teams/${id}`, payload);
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["teams", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["teams", "search"] });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/teams/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["teams", "search"] });
      queryClient.removeQueries({ queryKey: ["teams", "detail", id] });
    },
  });
}



export function useTeamResults(
  teamId: number,
  filters: GetTeamResultsParams = {},
  options?: UseQueryOptions<PageResponse<Result>>
) {
  return useQuery({
    queryKey: ["teams", "detail", teamId, "results", filters],
    queryFn: async () => {
      const { data } = await axiosInstance.get<PageResponse<Result>>(`/teams/${teamId}/results`, {
        params: filters,
      });
      return data;
    },
    enabled: !!teamId,
    ...options,
  });
}
export function useTeamFixtures(
  teamId: number,
  filters: GetTeamFixturesParams = {},
  options?: UseQueryOptions<PageResponse<Fixture>>
) {
  return useQuery({
    queryKey: ["teams", "detail", teamId, "fixtures", filters],
    queryFn: async () => {
      const { data } = await axiosInstance.get<PageResponse<Fixture>>(`/teams/${teamId}/fixtures`, {
        params: filters,
      });
      return data;
    },
    enabled: !!teamId,
    ...options,
  });
}



export function useTeamSquad(
  teamId: number,
  filters: GetTeamSquadParams = {},
  options?: UseQueryOptions<TeamSquadAndManager>
) {
  return useQuery({
    queryKey: ["teams", "detail", teamId, "squad", filters],
    queryFn: async () => {
      const { data } = await axiosInstance.get<TeamSquadAndManager>(`/teams/${teamId}/squad`, {
        params: {
          status: filters.status,
          position: filters.position,
        },
      });
      return data;
    },
    enabled: !!teamId,
    ...options,
  });
}
