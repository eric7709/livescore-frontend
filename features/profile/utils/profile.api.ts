import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { axiosInstance } from "@/features/shared/utils/axiosInstance";
import { PageResponse } from "@/features/shared/types/pages.types";
import {
    ProfileResponseDTO, ProfileRequestDTO,
    ProfileSummaryResponseDTO, ProfileQueryParams, ProfileStatsDTO,
    PlayerStatus,
    ClubHistoryResponseDTO,
    CompetitionStatResponseDTO,
    AddRosterMemberRequest,
} from "./profile.types";
import { useProfileParams } from "./useProfileParams";

/* ─── Queries ─── */

export function useProfiles(options?: UseQueryOptions<PageResponse<ProfileResponseDTO>>) {
    const {filters, page, pageSize: size} = useProfileParams()
    const params: ProfileQueryParams = {
        search:    filters.search || undefined,
        role:      filters.role === "ALL"           ? undefined : filters.role,
        position:  filters.position === "ALL"       ? undefined : filters.position,
        teamId:    filters.teamId === "ALL"         ? undefined : Number(filters.teamId),
        isStarter: filters.starterStatus === "ALL"  ? undefined : filters.starterStatus === "STARTER",
        page,
        size,
    };

    return useQuery({
        queryKey: ["profiles", "list", params],
        queryFn: async () => {
            const { data } = await axiosInstance.get<PageResponse<ProfileResponseDTO>>("/profiles", { params });
            return data;
        },
        placeholderData: (old) => old,
        ...options,
    });
}

export function useProfileStats(options?: UseQueryOptions<ProfileStatsDTO>) {
    return useQuery({
        queryKey: ["profiles", "stats"],
        queryFn: async () => {
            const { data } = await axiosInstance.get<ProfileStatsDTO>("/profiles/stats");
            return data;
        },
        ...options,
    });
}

export function useProfile(id: number, options?: UseQueryOptions<ProfileResponseDTO>) {
    return useQuery({
        queryKey: ["profiles", "detail", id],
        queryFn: async () => {
            const { data } = await axiosInstance.get<ProfileResponseDTO>(`/profiles/${id}`);
            return data;
        },
        enabled:  !!id,
        ...options,
    });
}

export function useProfileSummariesByTeam(teamId: number, options?: UseQueryOptions<ProfileSummaryResponseDTO[]>) {
    return useQuery({
        queryKey: ["profiles", "summary", teamId],
        queryFn: async () => {
            const { data } = await axiosInstance.get<ProfileSummaryResponseDTO[]>(`/profiles/summary/team/${teamId}`);
            return data;
        },
        enabled:  !!teamId,
        ...options,
    });
}

export function useProfilesByTeam(
    teamId: number,
    options?: Omit<UseQueryOptions<ProfileResponseDTO[]>, "queryKey" | "queryFn">
) {
    return useQuery({
        queryKey: ["profiles", "team", teamId],
        queryFn: async () => {
            const { data } = await axiosInstance.get<ProfileResponseDTO[]>(`/profiles/team/${teamId}`);
            return data;
        },
        enabled:  !!teamId,
        ...options,
    });
}

/** Player-profile page: club-history table (GET /profiles/{id}/transfer-history) */
export function useClubHistory(playerId: number, options?: UseQueryOptions<ClubHistoryResponseDTO[]>) {
    return useQuery({
        queryKey: ["profiles", "club-history", playerId],
        queryFn: async () => {
            const { data } = await axiosInstance.get<ClubHistoryResponseDTO[]>(`/profiles/${playerId}/transfer-history`);
            return data;
        },
        enabled:  !!playerId,
        ...options,
    });
}

/** Player-profile page: statistics-by-competition table (GET /profiles/{id}/competition-stats) */
export function useCompetitionStats(playerId: number, options?: UseQueryOptions<CompetitionStatResponseDTO[]>) {
    return useQuery({
        queryKey: ["profiles", "competition-stats", playerId],
        queryFn: async () => {
            const { data } = await axiosInstance.get<CompetitionStatResponseDTO[]>(`/profiles/${playerId}/competition-stats`);
            return data;
        },
        enabled:  !!playerId,
        ...options,
    });
}

/* ─── Mutations ─── */

export function useCreateProfile() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (dto: ProfileRequestDTO) => {
            const { data } = await axiosInstance.post<ProfileResponseDTO>("/profiles", dto);
            return data;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ["profiles", "list"] });
            client.invalidateQueries({ queryKey: ["profiles", "stats"] });
        },
    });
}

export function useCreateProfiles() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (dtos: ProfileRequestDTO[]) => {
            const { data } = await axiosInstance.post<ProfileResponseDTO[]>("/profiles/bulk", dtos);
            return data;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ["profiles", "list"] });
            client.invalidateQueries({ queryKey: ["profiles", "stats"] });
        },
    });
}

export function useUpdateProfile() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: ProfileRequestDTO }) => {
            const { data } = await axiosInstance.put<ProfileResponseDTO>(`/profiles/${id}`, payload);
            return data;
        },
        onSuccess: (data) => {
            client.invalidateQueries({ queryKey: ["profiles", "list"] });
            client.invalidateQueries({ queryKey: ["profiles", "detail", data.id] });
            client.invalidateQueries({ queryKey: ["profiles", "stats"] });
        },
    });
}

export function useDeleteProfile() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await axiosInstance.delete(`/profiles/${id}`);
        },
        onSuccess: (_, id) => {
            client.invalidateQueries({ queryKey: ["profiles", "list"] });
            client.removeQueries({ queryKey: ["profiles", "detail", id] });
            client.invalidateQueries({ queryKey: ["profiles", "stats"] });
        },
    });
}


export function useUpdatePlayerStatus(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ playerId, status }: { playerId: string; status: PlayerStatus }) => {
      const { data } = await axiosInstance.patch(`/profiles/${playerId}/status`, {
        status,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", "detail", teamId, "squad"] });
    },
  });
}

export function useMakeCaptain(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (playerId: string) => {
      const { data } = await axiosInstance.patch(`/profiles/${playerId}/captain`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", "detail", teamId, "squad"] });
    },
  });
}

export function useMakeViceCaptain(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (playerId: string) => {
      const { data } = await axiosInstance.patch(`/profiles/${playerId}/vice-captain`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", "detail", teamId, "squad"] });
    },
  });
}

/** Add a PLAYER or STAFF member directly to a team's roster (POST /profiles/roster) */
export function useAddRosterMember(teamId?: number) {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (payload: AddRosterMemberRequest) => {
            const { data } = await axiosInstance.post("/profiles/roster", payload);
            return data;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ["profiles", "list"] });
            client.invalidateQueries({ queryKey: ["profiles", "stats"] });
            if (teamId) {
                client.invalidateQueries({ queryKey: ["profiles", "team", teamId] });
            }
        },
    });
}
