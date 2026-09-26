"use client";

import ProfilesTable from "../components/tableAndToolbars/ProfileTable";
import ProfilePagination from "../components/filterSearchPagination/ProfilePagination";
import ProfileToolbar from "../components/tableAndToolbars/ProfileToolbar";
import ProfileModal from "../components/manageProfile/ProfileModal";
import { useProfiles } from "../utils/profile.api";
import { useState } from "react";
import { ProfileResponseDTO } from "../utils/profile.types";
import DeleteProfileModal from "../components/manageProfile/DeleteProfileModal";

export default function ProfileListPage() {
  const [modal, setModal] = useState<"CREATE" | "UPDATE" | "DELETE" | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<ProfileResponseDTO>();
  const { data, isLoading } = useProfiles();
  console.log(data, "PAGINATION")
  

  return (
    <div className="space-y-4 p-4 overflow-y-auto h-[calc(100vh-68px)] flex flex-col">
      <ProfileToolbar openModal={() => setModal("CREATE")} />
      <ProfilesTable
        profiles={data?.content}
        isLoading={isLoading}
        setProfile={(p) => setSelectedProfile(p)}
        openModal={(m) => setModal(m)}
      />
      <ProfileModal
        onClose={() => setModal(null)}
        modal={modal}
        selectedProfile={selectedProfile}
      />
      <DeleteProfileModal
        closeModal={() => setModal(null)}
        modal={modal}
        selectedProfile={selectedProfile}
      />
      <ProfilePagination total={data?.totalElements ?? 0} />
    </div>
  );
}