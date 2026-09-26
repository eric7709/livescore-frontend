"use client";

import { Trash2, Edit, ArrowLeftRight } from "lucide-react";
import { TransferResponseDTO } from "../utils/transfer.types";

interface TransferTableProps {
  onEdit: (transfer: TransferResponseDTO) => void;
  transfers: TransferResponseDTO[];
  isLoading?: boolean;
  onDelete: (transfer: TransferResponseDTO) => void;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatFee(fee: number | null): string {
  if (fee == null) return "-";
  return `€${(fee / 1_000_000).toFixed(1)}M`;
}

const TYPE_STYLES: Record<TransferResponseDTO["transferType"], string> = {
  PERMANENT: "bg-slate-100 text-slate-700 border-slate-200",
  LOAN: "bg-blue-100 text-blue-700 border-blue-200",
  FREE: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function TransferTable({
  onEdit,
  onDelete,
  transfers,
  isLoading,
}: TransferTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl flex-1 overflow-y-auto border border-gray-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" style={{ tableLayout: "fixed", minWidth: "700px" }}>
          <colgroup>
            <col style={{ width: "25%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-100 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="px-6 py-3.5">Player</th>
              <th className="px-4 py-3.5">Club</th>
              <th className="px-4 py-3.5">Type</th>
              <th className="px-4 py-3.5">Fee</th>
              <th className="px-4 py-3.5">Date</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableSkeletonRow key={idx} />
              ))
            ) : !transfers?.length ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50/80">
                    <ArrowLeftRight size={20} className="text-blue-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">No transfers found</p>
                  <p className="mt-1 text-xs text-gray-400">Try adjusting your search or filters</p>
                </td>
              </tr>
            ) : (
              transfers.map((transfer) => (
                <TransferTableRow
                  key={transfer.id}
                  transfer={transfer}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableSkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-200 shrink-0" />
          <div className="h-4 w-28 rounded bg-slate-200" />
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-32 rounded bg-slate-200" />
      </td>
      <td className="px-4 py-4">
        <div className="h-5 w-16 rounded-full bg-slate-200" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-14 rounded bg-slate-200" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-20 rounded bg-slate-200" />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <div className="h-8 w-8 rounded-lg bg-slate-200" />
          <div className="h-8 w-8 rounded-lg bg-slate-200" />
        </div>
      </td>
    </tr>
  );
}

function TransferTableRow({
  transfer,
  onEdit,
  onDelete,
}: {
  transfer: TransferResponseDTO;
  onEdit: (transfer: TransferResponseDTO) => void;
  onDelete: (transfer: TransferResponseDTO) => void;
}) {
  return (
    <tr className="group transition-colors duration-150 hover:bg-slate-50/70">
      {/* Player */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-600">
            {(transfer.playerName ?? "?").charAt(0)}
          </div>
          <span className="truncate text-[13px] font-semibold text-slate-800">
            {transfer.playerName ?? `Player #${transfer.playerId}`}
          </span>
        </div>
      </td>

      {/* From -> To */}
      <td className="px-4 py-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className={transfer.fromTeamName ? "" : "italic text-slate-400"}>
            {transfer.fromTeamName ?? "Free agent"}
          </span>
          <ArrowLeftRight size={11} className="shrink-0 text-slate-300" />
          <span className="font-semibold text-slate-700">{transfer.toTeamName}</span>
        </div>
      </td>

      {/* Type */}
      <td className="px-4 py-4">
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${TYPE_STYLES[transfer.transferType]}`}
        >
          {transfer.transferType}
        </span>
      </td>

      {/* Fee */}
      <td className="px-4 py-4 text-xs font-medium text-slate-600">
        {formatFee(transfer.fee)}
      </td>

      {/* Date */}
      <td className="px-4 py-4 text-xs font-medium text-slate-600">
        {formatDate(transfer.transferDate)}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            aria-label="Edit transfer"
            onClick={() => onEdit(transfer)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            <Edit size={14} />
          </button>
          <button
            type="button"
            aria-label="Delete transfer"
            onClick={() => onDelete(transfer)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
