"use client";

import { FormEvent, useState } from "react";
import { useCreateInvite } from "../utils/auth.api";
import { useSearchTeams } from "@/features/team/utils/team.api";
import { CustomInput, CustomSelect } from "@/features/shared/components/CustomComponents";
import { CustomSearch } from "@/features/shared/components/CustomSearch";
import { Role } from "@/features/profile/utils/profile.types";

const ROLE_OPTIONS: { label: string; value: Role }[] = [
  { label: "Player", value: "PLAYER" },
  { label: "Manager", value: "MANAGER" },
  { label: "Staff", value: "STAFF" },
  { label: "Moderator", value: "MODERATOR" },
  { label: "Admin", value: "ADMIN" },
];

export function CreateInviteForm() {
  const createInvite = useCreateInvite();
  const [role, setRole] = useState<Role>("PLAYER");
  const [teamId, setTeamId] = useState<string>("");
  const [teamQuery, setTeamQuery] = useState("");
  const [teamLabel, setTeamLabel] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsTeam = role === "PLAYER" || role === "MANAGER" || role === "STAFF";

  const { data: teamResults, isFetching: isSearchingTeams } = useSearchTeams(teamQuery, 0, 10);

  const teamOptions =
    teamResults?.content.map((team) => ({ label: team.name, value: team.id.toString() })) ?? [];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setCopied(false);

    try {
      const invite = await createInvite.mutateAsync({
        role,
        teamId: needsTeam && teamId ? Number(teamId) : undefined,
        expiresInDays,
      });
      setInviteLink(`${window.location.origin}/signup?code=${invite.code}`);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to create invite.");
    }
  };

  const handleCopy = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <h2 className="text-lg font-semibold text-gray-800">Invite someone</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <CustomSelect
            options={ROLE_OPTIONS}
            value={role}
            onSelect={(value) => {
              setRole(value as Role);
              setTeamId("");
              setTeamQuery("");
              setTeamLabel("");
            }}
            alignPosition="left"
          />
        </div>

        {needsTeam && (
          <CustomSearch
            label="Team"
            options={teamOptions}
            value={teamLabel}
            onQueryChange={(q) => {
              setTeamQuery(q);
              setTeamLabel(q);
              setTeamId(""); // clear selection while typing a new query
            }}
            onSelect={(option) => {
              setTeamId(option.value);
              setTeamLabel(option.label);
            }}
            isLoading={isSearchingTeams}
            placeholder="Search for a team…"
            minChars={2}
          />
        )}

        <CustomInput
          type="number"
          label="Expires in (days)"
          min={1}
          max={30}
          value={expiresInDays}
          onChange={(e) => setExpiresInDays(Number(e.target.value))}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={createInvite.isPending}
          className="bg-black text-white rounded-lg h-10 px-4 text-sm font-medium disabled:opacity-50 transition-opacity"
        >
          {createInvite.isPending ? "Generating…" : "Generate invite link"}
        </button>
      </form>

      {inviteLink && (
        <div className="border border-gray-200 rounded-xl p-3 flex flex-col gap-2 bg-gray-50">
          <p className="text-sm text-gray-500">Share this link — it works once:</p>
          <div className="flex gap-2">
            <CustomInput
              readOnly
              widthStyle="flex-1"
              value={inviteLink}
              onFocus={(e) => e.currentTarget.select()}
              className="bg-white text-xs"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="border border-gray-200 rounded-lg px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}