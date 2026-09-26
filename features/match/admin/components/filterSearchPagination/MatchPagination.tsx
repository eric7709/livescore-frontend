"use client";
import Pagination from "@/features/shared/components/Pagination";
import { useMatchParams } from "../../../utils/useMatchParams";

export default function MatchPagination({ total }: { total: number }) {
  const { page, pageSize, setPage } = useMatchParams();

  return (
    <Pagination
      currentPage={page} // or page + 1 if your UI component is 1-indexed
      pageSize={pageSize}
      total={total}
      onPageChange={(newPage) => setPage(newPage)}
      itemLabel="matches"
    />
  );
}