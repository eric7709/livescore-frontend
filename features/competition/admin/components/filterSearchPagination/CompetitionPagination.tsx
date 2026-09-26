"use client";

import Pagination from "@/features/shared/components/Pagination";
import { useCompetitionParams } from "@/features/competition/utils/useCompetitionParams";

export default function CompetitionPagination({ total }: { total: number }) {
  const { page, pageSize, setPage } = useCompetitionParams();

  return (
    <Pagination
      currentPage={page}
      pageSize={pageSize}
      total={total}
      onPageChange={setPage}
      itemLabel="competitions"
    />
  );
}