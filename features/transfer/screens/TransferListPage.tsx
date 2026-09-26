"use client";

import { useState } from "react";
import { TransferResponseDTO } from "../utils/transfer.types";
import { useTransferParams } from "../utils/useTransferParams";
import { useTransfers } from "../utils/transfer.api";
import TransferToolbar from "../components/TransferToolbar";
import TransferTable from "../components/TransferTable";
import TransferModal from "../components/TransferModal";
import DeleteTransferModal from "../components/DeleteTransferModal";
import TransferPagination from "../components/TransferPagination";

export default function TransfersPage() {
  const [modal, setModal] = useState<"CREATE" | "UPDATE" | "DELETE" | null>(null);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferResponseDTO | undefined>();

  const { filters, page, pageSize } = useTransferParams();
  const { data, isLoading } = useTransfers(filters, page, pageSize);

  const transfers = data?.content ?? [];
  const total = data?.totalElements ?? 0;

  const openCreate = () => {
    setSelectedTransfer(undefined);
    setModal("CREATE");
  };

  const openUpdate = (transfer: TransferResponseDTO) => {
    setSelectedTransfer(transfer);
    setModal("UPDATE");
  };

  const openDelete = (transfer: TransferResponseDTO) => {
    setSelectedTransfer(transfer);
    setModal("DELETE");
  };

  const onClose = () => {
    setModal(null);
    setSelectedTransfer(undefined);
  };

  return (
    <div className="flex h-[calc(100vh-68px)] flex-col gap-4 p-4 overflow-hidden">
      <TransferToolbar onOpenCreate={openCreate} />
      <TransferTable
        transfers={transfers}
        isLoading={isLoading}
        onEdit={openUpdate}
        onDelete={openDelete}
      />
      <TransferModal modal={modal} selectedTransfer={selectedTransfer} onClose={onClose} />
      <DeleteTransferModal modal={modal} selectedTransfer={selectedTransfer} onClose={onClose} />
      <TransferPagination total={total} />
    </div>
  );
}
