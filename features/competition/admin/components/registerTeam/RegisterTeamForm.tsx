"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Plus, Check, Users, Trophy, Loader2, Save, ArrowLeft } from "lucide-react";
import { TeamResponseDTO } from "@/features/team/utils/team.types";
import { useSearchTeams, useBatchTeams } from "@/features/team/utils/team.api";
import { CompetitionDTO } from "../../../utils/competition.types";
import { useAddTeamsBatch, useRemoveTeamsBatch } from "@/features/competition/utils/competition.api";
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import Image from "next/image";

type SelectedTeam = TeamResponseDTO & { color: string };

const COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#84CC16",
  "#06B6D4", "#A855F7", "#EAB308", "#22C55E", "#E11D48",
  "#0EA5E9", "#D946EF", "#F43F5E", "#64748B", "#7C3AED",
  "#059669", "#DC2626", "#2563EB", "#D97706", "#0891B2",
];

const getColor = (id: number): string => COLORS[id % COLORS.length];

const getSeasonFromDate = (dateString?: string): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  const year = date.getFullYear();
  const month = date.getMonth();
  return month >= 6 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
};

interface RegisterTeamFormProps {
  competition: CompetitionDTO;
}

export default function RegisterTeamForm({ competition }: RegisterTeamFormProps) {
  const router = useRouter();
  const hasLoaded = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const initialTeamIds = useRef<number[]>(
    competition.teamIds ? Array.from(competition.teamIds) : []
  );

  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<Map<number, SelectedTeam>>(new Map());
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());
  const [showModal, setShowModal] = useState<boolean>(false);

  const { data: preselectedTeams, isLoading: isLoadingBatch } = useBatchTeams(initialTeamIds.current);

  const debouncedQuery = useDebounce(search, 300);
  const [isSearchFetching, setIsSearchFetching] = useState(false);

  const { mutate: addTeams, isPending: isAdding } = useAddTeamsBatch();
  const { mutate: removeTeams, isPending: isRemoving } = useRemoveTeamsBatch();
  const isBusy = isAdding || isRemoving;

  useEffect(() => {
    if (preselectedTeams && !hasLoaded.current) {
      const preselected = preselectedTeams
        .filter((team) => initialTeamIds.current.includes(team.id))
        .map((team) => ({ ...team, color: getColor(team.id) }));

      if (preselected.length > 0) {
        setSelected((prev) => {
          const newMap = new Map(prev);
          preselected.forEach((team) => newMap.set(team.id, team));
          return newMap;
        });
      }
      hasLoaded.current = true;
    }
  }, [preselectedTeams]);

  const removeSelected = (team: TeamResponseDTO) => {
    setSelected((prev) => {
      const next = new Map(prev);
      next.delete(team.id);
      return next;
    });
    if (initialTeamIds.current.includes(team.id)) {
      setRemovedIds((prev) => new Set(prev).add(team.id));
    }
  };

  const toggleTeam = (team: TeamResponseDTO) => {
    if (selected.has(team.id)) {
      removeSelected(team);
      return;
    }
    if (removedIds.has(team.id)) {
      setRemovedIds((prev) => {
        const next = new Set(prev);
        next.delete(team.id);
        return next;
      });
    }
    setSelected((prev) => {
      const next = new Map(prev);
      next.set(team.id, { ...team, color: getColor(team.id) });
      return next;
    });
    setSearch("");
    searchInputRef.current?.focus();
  };

  const handleSubmit = async () => {
    const newTeamIds = [...selected.keys()].filter(
      (id) => !initialTeamIds.current.includes(id)
    );
    const teamIdsToRemove = [...removedIds];

    const tasks: Promise<void>[] = [];

    if (teamIdsToRemove.length > 0) {
      tasks.push(
        new Promise<void>((resolve, reject) =>
          removeTeams(
            { compId: competition.id, teamIds: teamIdsToRemove },
            { onSuccess: () => resolve(), onError: reject }
          )
        )
      );
    }

    if (newTeamIds.length > 0) {
      tasks.push(
        new Promise<void>((resolve, reject) =>
          addTeams(
            { compId: competition.id, teamIds: newTeamIds },
            { onSuccess: () => resolve(), onError: reject }
          )
        )
      );
    }

    if (tasks.length === 0) return;

    await Promise.all(tasks);
    router.push("/admin/competitions");
  };

  const selectedTeams = [...selected.values()];
  const newTeamCount = selectedTeams.filter((t) => !initialTeamIds.current.includes(t.id)).length;
  const hasRemovals = removedIds.size > 0;
  const hasChanges = newTeamCount > 0 || hasRemovals;
  const isSaveMode = hasRemovals && newTeamCount === 0;
  const seasonString = getSeasonFromDate(competition.startDate);
  const isDataReady = !isLoadingBatch;

  const registeredTeamCount = competition.registeredTeamCount ?? initialTeamIds.current.length;
  const totalTeamsRequired = competition.totalTeams ?? 0;

  const buttonLabel = (() => {
    if (isBusy) return "Saving...";
    if (isSaveMode) return "Save changes";
    if (newTeamCount === 0) return "Register teams";
    const hasExisting = initialTeamIds.current.length > 0;
    const suffix = newTeamCount !== 1 ? "s" : "";
    return hasExisting
      ? `Register ${newTeamCount} new team${suffix}`
      : `Register ${newTeamCount} team${suffix}`;
  })();

  return (
    <div className="flex h-[calc(100vh-68px)] flex-col gap-4 p-4 lg:p-6 overflow-hidden bg-gray-50/50">
      {/* Consolidated Header Card */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-purple-100 bg-purple-50 text-purple-600 shadow-sm">
              {competition.logoUrl ? (
                <Image
                  fill
                  src={competition.logoUrl}
                  alt={competition.name}
                  className="object-cover"
                />
              ) : (
                <Trophy size={22} strokeWidth={1.8} />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-gray-900">{competition.name}</h1>
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                  {competition.competitionCode}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Season {seasonString} • {registeredTeamCount} of {totalTeamsRequired} teams registered
                {hasChanges && <span className="ml-1 text-blue-600 font-medium">({selected.size} total active)</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3.5 py-2">
              <Users size={14} className="text-blue-600" />
              <span className="text-xs font-semibold text-blue-800">
                {selected.size} / {totalTeamsRequired} Selected
              </span>
            </div>
            {selected.size > 0 && (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                View list
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace Card */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
        {/* Search Bar */}
        <div className="border-b border-gray-100 px-5 py-3 shrink-0 bg-white">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teams by name or code..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/80 py-2.5 pl-9 pr-9 text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {debouncedQuery && isSearchFetching ? (
                <Loader2 size={13} className="animate-spin text-blue-500" />
              ) : search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={13} />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Selected Team Chips */}
        {selectedTeams.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-b border-gray-100 bg-gray-50/30 px-5 py-2.5 shrink-0 max-h-28 overflow-y-auto">
            {selectedTeams.map((team) => (
              <div
                key={team.id}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white py-1 pl-2 pr-1 shadow-2xs"
              >
                <div
                  className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full text-[8px] font-black text-white"
                  style={{ backgroundColor: team.color }}
                >
                  {team.teamCode[0]}
                </div>
                <span className="text-[11px] font-semibold text-gray-700">{team.teamCode}</span>
                <button
                  type="button"
                  onClick={() => removeSelected(team)}
                  className="flex h-4 w-4 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-red-500 transition"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Results / Empty View */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {!isDataReady ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 size={22} className="animate-spin text-blue-500" />
            </div>
          ) : !debouncedQuery ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-6">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <Search size={20} />
              </div>
              <p className="text-sm font-semibold text-gray-700">Find teams to register</p>
              <p className="text-xs text-gray-400 max-w-xs mt-1">
                Type a team name or code into the search bar above to look through available teams.
              </p>
            </div>
          ) : (
            <TeamSearchResults
              query={debouncedQuery}
              selected={selected}
              onToggleTeam={toggleTeam}
              onFetchingChange={setIsSearchFetching}
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 shrink-0 bg-white">
          {selected.size > 0 ? (
            <button
              type="button"
              onClick={() => {
                const newRemovals = [...selected.keys()].filter((id) =>
                  initialTeamIds.current.includes(id)
                );
                setRemovedIds((prev) => {
                  const next = new Set(prev);
                  newRemovals.forEach((id) => next.add(id));
                  return next;
                });
                setSelected(new Map());
              }}
              className="text-xs font-semibold text-gray-500 hover:text-red-600 transition"
            >
              Deselect all
            </button>
          ) : (
            <span className="text-xs text-gray-400">No teams pending save</span>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!hasChanges || isBusy}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isBusy ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isSaveMode ? (
              <Save size={14} strokeWidth={2.5} />
            ) : (
              <Plus size={14} strokeWidth={2.5} />
            )}
            {buttonLabel}
          </button>
        </div>
      </div>

      {/* Selected Teams Modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900">Selected Teams ({selectedTeams.length})</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-2">
              {selectedTeams.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">No teams selected</p>
              ) : (
                selectedTeams.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                        style={{ backgroundColor: team.color }}
                      >
                        {team.teamCode[0]}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{team.name}</p>
                        <p className="text-[10px] text-gray-400">{team.teamCode}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSelected(team)}
                      className="p-1 text-gray-400 hover:text-red-500 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-gray-100 px-5 py-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type TeamSearchResultsProps = {
  query: string;
  selected: Map<number, SelectedTeam>;
  onToggleTeam: (team: TeamResponseDTO) => void;
  onFetchingChange: (isFetching: boolean) => void;
};

function TeamSearchResults({ query, selected, onToggleTeam, onFetchingChange }: TeamSearchResultsProps) {
  const { data: searchResults, isFetching } = useSearchTeams(query);
  const results = searchResults?.content ?? [];

  useEffect(() => {
    onFetchingChange(isFetching);
  }, [isFetching, onFetchingChange]);

  if (results.length === 0 && !isFetching) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center p-6">
        <p className="text-xs font-medium text-gray-500">No teams found matching &quot;{query}&quot;</p>
        <p className="text-[11px] text-gray-400 mt-0.5">Double check spelling or try a different term</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {results.map((team) => {
        const isSelected = selected.has(team.id);
        const color = selected.get(team.id)?.color ?? getColor(team.id);
        return (
          <button
            key={team.id}
            type="button"
            onClick={() => onToggleTeam(team)}
            className={`group flex items-center gap-3 rounded-xl p-3 text-left transition border ${
              isSelected
                ? "bg-blue-50/70 border-blue-200"
                : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/60"
            }`}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-black"
              style={{
                backgroundColor: `${color}18`,
                color,
                border: `1.5px solid ${color}30`,
              }}
            >
              {team.teamCode}
            </div>
            <span className={`flex-1 text-xs font-semibold truncate ${isSelected ? "text-blue-900" : "text-gray-800"}`}>
              {team.name}
            </span>
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                isSelected
                  ? "border-blue-600 bg-blue-600 text-white scale-105"
                  : "border-gray-300 group-hover:border-gray-400 bg-white"
              }`}
            >
              {isSelected && <Check size={10} strokeWidth={3} />}
            </div>
          </button>
        );
      })}
    </div>
  );
}