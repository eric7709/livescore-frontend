"use client";

import { ArrowLeftRight } from "lucide-react";
import { AddButton } from "@/features/shared/components/AddButton";
import { useTransferParams } from "../utils/useTransferParams";
import { TransferSearch } from "./TransferSearch";

interface TransferToolbarProps {
  onOpenCreate: () => void;
}

const TRANSFER_TYPE_OPTIONS = [
  { value: "ALL", label: "All types" },
  { value: "PERMANENT", label: "Permanent" },
  { value: "LOAN", label: "Loan" },
  { value: "FREE", label: "Free" },
];

export default function TransferToolbar({
  onOpenCreate,
}: TransferToolbarProps) {
  const { filters, setFilter } = useTransferParams();

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm shadow-emerald-200">
            <ArrowLeftRight size={16} />
          </div>

          <div>
            <h1 className="text-sm font-semibold text-gray-900">
              Transfers
            </h1>

            <p className="text-xs text-gray-400">
              Manage all player transfers in the system
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filters.transferType}
            onChange={(e) => setFilter("transferType", e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            {TRANSFER_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <TransferSearch />

          <div className="h-5 w-px bg-emerald-100" />

          <AddButton
            onClick={onOpenCreate}
            label="Add transfer"
          />
        </div>
      </div>
    </div>
  );
}
