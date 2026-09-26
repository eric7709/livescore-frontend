"use client";

import { useMe } from "@/features/auth/utils/auth.api";
import { useAuthStore } from "@/features/auth/utils/auth.store";
import { ReactNode } from "react";
import { useTokenRefresh } from "./token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);

  useMe({ enabled: hasHydrated && !!accessToken });
  useTokenRefresh();

  if (!hasHydrated) return null;
  return <>{children}</>;
}