"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRegister } from "../utils/auth.api";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const register = useRegister();

  const codeFromLink = searchParams.get("code");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState(codeFromLink ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await register.mutateAsync({ firstName, lastName, phoneNumber, password, inviteCode });
      router.push("/login?registered=1");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Registration failed. Check your invite code.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold">Create your account</h1>

      {!codeFromLink && (
        <p className="text-sm text-neutral-500">
          You need an invite code from your team admin or manager to sign up.
        </p>
      )}

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          className="flex-1 border rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          className="flex-1 border rounded px-3 py-2"
        />
      </div>

      <input
        type="tel"
        placeholder="Phone number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
        className="border rounded px-3 py-2"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        className="border rounded px-3 py-2"
      />

      <input
        type="text"
        placeholder="Invite code"
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value)}
        required
        readOnly={!!codeFromLink}
        className="border rounded px-3 py-2 read-only:bg-neutral-100"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={register.isPending}
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {register.isPending ? "Creating account…" : "Sign up"}
      </button>
    </form>
  );
}