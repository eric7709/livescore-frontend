"use client";

import { Users } from "lucide-react";
import ProfileFilter from "../filterSearchPagination/ProfileFilter";
import { ProfileSearch } from "../filterSearchPagination/ProfileSearch";
import { AddButton } from "@/features/shared/components/AddButton";

type Props = {
  openModal: () => void;
};

export default function ProfileToolbar({ openModal }: Props) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm shadow-emerald-200">
            <Users size={16} />
          </div>

          <div>
            <h1 className="text-sm font-semibold text-gray-900">
              Profiles
            </h1>

            <p className="text-xs text-gray-400">
              Manage players, staff and managers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ProfileSearch />

          <div className="h-5 w-px bg-emerald-100" />

          <ProfileFilter />

          <AddButton onClick={openModal} />
        </div>
      </div>
    </div>
  );
}