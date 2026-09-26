"use client";

import Pagination from "@/features/shared/components/Pagination";
import { useTeamParams } from "../../../utils/useTeamParams";
export default function TeamPagination({ total }: { total: number }) {
  const { page, setPage, pageSize, } = useTeamParams();

  return (
    <Pagination
      currentPage={page}
      pageSize={pageSize}
      total={total}
      onPageChange={setPage}
      itemLabel="teams"
    />
  );
}