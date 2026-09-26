"use client";

import { TransferResponseDTO } from "@/features/transfer/utils/transfer.types";
import { useTransferForm } from "@/features/transfer/utils/useTransferForm";
import { useTeamSummary } from "@/features/team/utils/team.api";
import { PlayerCombobox } from "./PlayerCombobox";
import { Loader2, ArrowLeftRight, AlertTriangle } from "lucide-react";

interface TransferFormProps {
  transfer?: TransferResponseDTO;
  onClose: () => void;
}

export function TransferForm({ transfer, onClose }: TransferFormProps) {
  const {
    form: {
      formState: { errors },
      register,
    },
    isEditMode,
    isBusy,
    selectedPlayer,
    selectPlayer,
    clearPlayer,
    currentNumberConflicts,
    handleSubmit,
  } = useTransferForm({ transfer, onClose });

  const { data: teams = [] } = useTeamSummary();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Player */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Player
        </label>
        <PlayerCombobox
          selected={selectedPlayer}
          onSelect={selectPlayer}
          onClear={clearPlayer}
          disabled={isBusy || isEditMode}
        />
        {errors.playerId && (
          <p className="mt-1 text-[11px] font-medium text-rose-500">
            {errors.playerId.message}
          </p>
        )}
      </div>

      {/* Current club (read-only, auto-filled from the selected player) */}
      {selectedPlayer && (
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
          <ArrowLeftRight size={13} className="shrink-0 text-slate-400" />
          <span>
            Currently at{" "}
            <span className="font-semibold text-slate-700">
              {selectedPlayer.teamName ?? "no club"}
            </span>
          </span>
        </div>
      )}

      {/* Destination team */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Destination Team
        </label>
        <select
          {...register("toTeamId")}
          disabled={isBusy}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
        >
          <option value="">Select a team…</option>
          {teams.map((team) => (
            <option key={team.teamId} value={team.teamId}>
              {team.teamName}
            </option>
          ))}
        </select>
        {errors.toTeamId && (
          <p className="mt-1 text-[11px] font-medium text-rose-500">
            {errors.toTeamId.message}
          </p>
        )}
      </div>

      {/* Transfer type */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Transfer Type
        </label>
        <select
          {...register("transferType")}
          disabled={isBusy}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
        >
          <option value="PERMANENT">Permanent</option>
          <option value="LOAN">Loan</option>
          <option value="FREE">Free</option>
        </select>
      </div>

      {/* Fee */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Fee
        </label>
        <input
          {...register("fee")}
          type="number"
          min="0"
          step="0.01"
          placeholder="e.g. 45000000"
          disabled={isBusy}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
        />
      </div>

      {/* Transfer date */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Transfer Date
        </label>
        <input
          {...register("transferDate")}
          type="date"
          disabled={isBusy}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
        />
        {errors.transferDate && (
          <p className="mt-1 text-[11px] font-medium text-rose-500">
            {errors.transferDate.message}
          </p>
        )}
      </div>

      {/* New squad number — only surfaced once we know the current one clashes */}
      {currentNumberConflicts && (
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-1">
            <AlertTriangle size={12} />
            New Squad Number
          </label>
          <p className="mb-1.5 text-[11px] text-amber-600">
            #{selectedPlayer?.squadNumber} is already taken at this team — pick a new number.
          </p>
          <input
            {...register("newSquadNumber")}
            type="number"
            min="1"
            placeholder="e.g. 27"
            disabled={isBusy}
            className="w-full rounded-xl border border-amber-200 px-3 py-2 text-xs font-medium text-slate-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:bg-slate-50"
          />
          {errors.newSquadNumber && (
            <p className="mt-1 text-[11px] font-medium text-rose-500">
              {errors.newSquadNumber.message}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isBusy}
          className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isBusy}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50"
        >
          {isBusy && <Loader2 size={13} className="animate-spin" />}
          <span>
            {isBusy
              ? "Saving..."
              : isEditMode
              ? "Update Transfer"
              : "Create Transfer"}
          </span>
        </button>
      </div>
    </form>
  );
}