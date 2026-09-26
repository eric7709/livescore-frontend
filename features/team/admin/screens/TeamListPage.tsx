"use client";

import { useState } from "react";
import { useSearchTeams } from "../../utils/team.api";
import { useTeamParams } from "../../utils/useTeamParams";
import TeamToolbar from "../components/tableAndToolbars/TeamToolbar";
import TeamTable from "../components/tableAndToolbars/TeamTable";
import TeamPagination from "../components/filterSearchPagination/TeamPagination";
import DeleteTeamModal from "../components/manageTeam/DeleteTeamModal";
import { TeamResponseDTO } from "../../utils/team.types";
import TeamModal from "../components/manageTeam/TeamModal";

export default function TeamsPage() {
  const [modal, setModal] = useState<"CREATE" | "UPDATE" | "DELETE" | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamResponseDTO | undefined>();

  const { filters, page, pageSize } = useTeamParams();
  const { data, isLoading } = useSearchTeams(filters.search, page, pageSize);

  const teams = data?.content ?? [];
  const total = data?.totalElements ?? 0;

  const openCreate = () => {
    setSelectedTeam(undefined);
    setModal("CREATE");
  };

  const openUpdate = (team: TeamResponseDTO) => {
    setSelectedTeam(team);
    setModal("UPDATE");
  };

  const openDelete = (team: TeamResponseDTO) => {
    setSelectedTeam(team);
    setModal("DELETE");
  };

  const onClose = () => {
    setModal(null);
    setSelectedTeam(undefined);
  };

  return (
    <div className="flex h-[calc(100vh-68px)] flex-col gap-4 p-4 overflow-hidden">
      <TeamToolbar onOpenCreate={openCreate} />
      <TeamTable
        teams={teams}
        isLoading={isLoading}
        onEdit={openUpdate}
        onDelete={openDelete}
      />
      <TeamModal modal={modal} selectedTeam={selectedTeam} onClose={onClose} />
      <DeleteTeamModal modal={modal} selectedTeam={selectedTeam} onClose={onClose} />
      <TeamPagination total={total} />
    </div>
  );
}