"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLogin } from "../utils/auth.api";
import { Role } from "@/features/profile/utils/profile.types";
import CustomInput from "@/features/shared/components/CustomInput";

// Role-based route mapping


export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();

  const justRegistered = searchParams.get("registered") === "1";
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      // mutateAsync now resolves to the ProfileDetailsResponse
      const userProfile = await login.mutateAsync({ phoneNumber, password });

      const ROLE_ROUTES: Record<Role, string> = {
        ADMIN: "/admin/matches",
        MANAGER: `/manager/${userProfile.teamId}`,
        STAFF: "/staff/dashboard",
        PLAYER: "/player",
        MODERATOR: "/moderator",
      };


      // Resolve redirect route based on role, fallback to default dashboard
      const targetRoute = ROLE_ROUTES[userProfile.role] || "/dashboard";
      router.push(targetRoute);
    } catch (err: any) {
      setError(
        err?.response?.status === 401
          ? "Invalid phone number or password"
          : "Something went wrong. Try again."
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-sm mx-auto bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
    >
      <h1 className="text-xl font-semibold text-gray-900">Log in</h1>

      {justRegistered && (
        <p className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
          Account created — log in to continue.
        </p>
      )}

      <CustomInput
        label="Phone number"
        type="tel"
        placeholder="Enter your phone number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
      />

      <CustomInput
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={login.isPending}
        className="bg-black text-white rounded-lg h-10 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {login.isPending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}