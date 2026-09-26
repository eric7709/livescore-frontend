"use client";

import { useMemo, useState } from "react";
import { MatchDTO, MatchSearchRequest, MatchStatus } from "@/features/match/utils/match.types";
import MatchToolbar from "../components/tablesAndToolbars/MatchToolbar";
import MatchTable from "../components/tablesAndToolbars/MatchTable";
import MatchPagination from "../components/filterSearchPagination/MatchPagination";
import MatchModal from "../components/manageMatch/MatchModal";
import DeleteMatchModal from "../components/manageMatch/DeleteMatchModal";
import { useSearchMatches } from "../../utils/match.api";
import { useMatchParams } from "../../utils/useMatchParams";

type ModalMode = "CREATE" | "UPDATE" | "DELETE" | null;

export default function MatchesPage() {
  const [modal, setModal] = useState<ModalMode>(null);
  const [selectedMatch, setSelectedMatch] = useState<MatchDTO>();

  const { filters, page, pageSize } = useMatchParams();

  const queryParams: MatchSearchRequest = useMemo(() => {
    return {
      teamId: typeof filters.teamId === "number" ? filters.teamId : undefined,
      competitionId:
        typeof filters.competitionId === "number"
          ? filters.competitionId
          : undefined,
      status:
        filters.status && filters.status !== "ALL"
          ? (filters.status as MatchStatus)
          : undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
    };
  }, [filters]);

  const pageParams = useMemo(() => {
    return {
      page,
      size: pageSize,
    };
  }, [page, pageSize]);

  const { data, isLoading } = useSearchMatches(queryParams, pageParams);

  const openModal = (mode: ModalMode, match?: MatchDTO) => {
    setSelectedMatch(match);
    setModal(mode);
  };

  const closeModal = () => {
    setModal(null);
    setSelectedMatch(undefined);
  };

  return (
    <div className="flex h-[calc(100vh-68px)] p-3 flex-col space-y-3 overflow-hidden">
      <MatchToolbar onAdd={() => openModal("CREATE")} />

      <div className="flex-1 min-h-0 flex flex-col">
        <MatchTable
          matches={data?.content ?? []}
          isLoading={isLoading}
          onEdit={(m) => openModal("UPDATE", m)}
          onDelete={(m) => openModal("DELETE", m)}
        />
      </div>

      <MatchPagination total={data?.totalElements ?? 0} />

      <MatchModal
        modal={modal}
        selectedMatch={selectedMatch}
        onClose={closeModal}
      />
      <DeleteMatchModal
        isOpen={modal === "DELETE"}
        match={selectedMatch}
        onClose={closeModal}
      />
    </div>
  );
}