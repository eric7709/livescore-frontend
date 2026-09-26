// src/features/shared/utils/axiosInstance.ts
import { useAuthStore } from "@/features/auth/utils/auth.store";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Separate, bare instance for the refresh call itself — never goes through
// these interceptors, or a failed refresh would trigger another refresh attempt.
const refreshClient = axios.create({ baseURL: BASE_URL });

// ─── Single shared refresh flow ─────────────────────────────────────
// Both the proactive timer (useTokenRefresh) and the reactive 401 handler
// below call this same function, so there is ever only one in-flight
// /auth/refresh call and one refresh token gets consumed at a time.

let refreshPromise: Promise<string | null> | null = null;

export function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise; // dedupe concurrent callers

  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return Promise.resolve(null);

  refreshPromise = refreshClient
    .post("/auth/refresh", { refreshToken })
    .then(({ data }) => {
      useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
      return data.accessToken as string;
    })
    .catch(() => {
      useAuthStore.getState().clearAuth();
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

// ─── Request interceptor: attach access token ──────────────────────

axiosInstance.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ─── Response interceptor: on 401, refresh (shared) once, retry ────

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Don't try to refresh on the auth endpoints themselves — avoids loops
    // if login/refresh/logout return a 401 for a genuinely bad credential.
    const authPaths = ["/auth/login", "/auth/refresh", "/auth/register"];
    if (authPaths.some((path) => originalRequest.url?.includes(path))) {
      return Promise.reject(error);
    }

    // Already retried once — refresh didn't help, give up.
    if (originalRequest._retry) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    const newToken = await refreshAccessToken(); // shares the same in-flight call as the timer
    if (!newToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return axiosInstance(originalRequest);
  }
);