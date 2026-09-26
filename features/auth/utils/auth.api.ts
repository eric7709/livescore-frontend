import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UseQueryOptions } from "@tanstack/react-query";
import {
  AuthResponse,
  CreateInviteRequest,
  InviteResponse,
  LoginRequest,
  ProfileDetailsResponse,
  RefreshRequest,
  RegisterRequest,
} from "./auth.types";
import { axiosInstance } from "@/features/shared/utils/axiosInstance";
import { useAuthStore } from "./auth.store";

// ================= QUERIES =================

export function useMe(
  options?: Omit<UseQueryOptions<ProfileDetailsResponse>, "queryKey" | "queryFn">
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ProfileDetailsResponse>("/auth/me");
      setUser(data);
      return data;
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
// ================= MUTATIONS =================

export function useRegister() {
  return useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      await axiosInstance.post("/auth/register", payload);
    },
    onError: (error) => {
      console.error("Failed to register:", error);
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      // 1. Authenticate and save tokens
      const { data: authData } = await axiosInstance.post<AuthResponse>("/auth/login", payload);
      setTokens(authData.accessToken, authData.refreshToken);

      // 2. Fetch the logged-in user's profile details
      const { data: userProfile } = await axiosInstance.get<ProfileDetailsResponse>("/auth/me");
      setUser(userProfile);

      return userProfile;
    },
    onSuccess: (userProfile) => {
      // Seed React Query cache with the profile response
      queryClient.setQueryData(["auth", "me"], userProfile);
    },
    onError: (error) => {
      console.error("Failed to log in:", error);
    },
  });
}

export function useRefreshToken() {
  const setTokens = useAuthStore((s) => s.setTokens);

  return useMutation({
    mutationFn: async (payload: RefreshRequest) => {
      const { data } = await axiosInstance.post<AuthResponse>("/auth/refresh", payload);
      return data;
    },
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
    },
    onError: (error) => {
      console.error("Failed to refresh token:", error);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: async (payload: RefreshRequest) => {
      await axiosInstance.post("/auth/logout", payload);
    },
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Failed to log out:", error);
    },
  });
}

export function useCreateInvite() {
  return useMutation({
    mutationFn: async (payload: CreateInviteRequest) => {
      const { data } = await axiosInstance.post<InviteResponse>("/auth/invites", payload);
      return data;
    },
    onError: (error) => {
      console.error("Failed to create invite:", error);
    },
  });
}