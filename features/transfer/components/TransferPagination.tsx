"use client";

import Pagination from "@/features/shared/components/Pagination";
import { useTransferParams } from "../utils/useTransferParams";

export default function TransferPagination({ total }: { total: number }) {
  const { page, setPage, pageSize } = useTransferParams();

  return (
    <Pagination
      currentPage={page}
      pageSize={pageSize}
      total={total}
      onPageChange={setPage}
      itemLabel="transfers"
    />
  );
}
