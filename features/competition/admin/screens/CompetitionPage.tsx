"use client";
import { useState } from "react";
import CompetitionToolbar from "../components/tableAndToolbars/CompetitionToolbar";
import CompetitionTable from "../components/tableAndToolbars/CompetitionTable";
import CompetitionModal from "../components/manageCompetition/CompetitionModal";
import DeleteCompetitionModal from "../components/manageCompetition/DeleteCompetitionModal";
import { CompetitionDTO } from "@/features/competition/utils/competition.types";
import { useSearchCompetitions } from "../../utils/competition.api";

type ModalMode = "CREATE" | "UPDATE" | "DELETE" | null;

export default function CompetitionPage() {
  const [modal, setModal] = useState<ModalMode>(null);
  const [selectedCompetition, setSelectedCompetition] = useState<CompetitionDTO>();

  const { data, isLoading } = useSearchCompetitions({});
  const competitions = data?.content ?? [];
  const total = data?.totalPages ?? 0;

  const openModal = (mode: ModalMode, competition?: CompetitionDTO) => {
    setSelectedCompetition(competition);
    setModal(mode);
  };

  const closeModal = () => {
    setModal(null);
    setSelectedCompetition(undefined);
  };

  return (
    <div className="flex h-[calc(100vh-68px)] flex-col gap-4 p-4 overflow-hidden">
      <CompetitionToolbar onAdd={() => openModal("CREATE")} />
      <CompetitionTable
        competitions={competitions}
        isLoading={isLoading}
        onEdit={(c) => openModal("UPDATE", c)}
        onDelete={(c) => openModal("DELETE", c)}
      />
      <CompetitionModal
        modal={modal}
        selectedCompetition={selectedCompetition}
        closeModal={closeModal}
      />
      <DeleteCompetitionModal
        isOpen={modal === "DELETE"}
        competition={selectedCompetition}
        onClose={closeModal}
      />
    </div>
  );
}