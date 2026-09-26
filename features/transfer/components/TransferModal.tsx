"use client";

import { X, ArrowLeftRight } from "lucide-react";
import { TransferForm } from "./TransferForm";
import { TransferResponseDTO } from "@/features/transfer/utils/transfer.types";

interface TransferModalProps {
  modal: "CREATE" | "UPDATE" | "DELETE" | null;
  selectedTransfer?: TransferResponseDTO;
  onClose: () => void;
}

export default function TransferModal({ modal, selectedTransfer, onClose }: TransferModalProps) {
  if (modal !== "CREATE" && modal !== "UPDATE") return null;

  const isCreate = modal === "CREATE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="relative w-full max-w-105 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100/80">
              <ArrowLeftRight size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                {isCreate ? "Create New Transfer" : "Edit Transfer Details"}
              </h2>
              <p className="text-[11px] font-medium text-slate-400">
                {isCreate ? "Move a player to a new team" : "Update transfer details"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Form Body */}
        <div className="p-6">
          <TransferForm transfer={selectedTransfer} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
