import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/utils/auth.store";
import { refreshAccessToken } from "../utils/axiosInstance";

function getExpiryMs(token: string): number | null {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function useTokenRefresh() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!hasHydrated || !accessToken) return;
    const exp = getExpiryMs(accessToken);
    if (!exp) return;

    const delay = Math.max(exp - Date.now() - 60_000, 5_000); // never faster than 5s
    const id = setTimeout(() => void refreshAccessToken(), delay);
    return () => clearTimeout(id);
  }, [hasHydrated, accessToken]);
}