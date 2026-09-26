// src/team/store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { TeamStore, Filter, FormData, FormError, ImageState, ModalType, TeamPaginationState, Sort, UIState, TeamResponseDTO } from "./team.types";

// ─── Initial Values ──────────────────────────────────────────────

const initialPagination: TeamPaginationState = {
  page: 0,
  size: 15,
  totalElements: 0,
  totalPages: 0,
  last: false,
};

const initialFilter: Filter = {
  search: "",
  competitionId: "ALL",
};

const initialFormData: FormData = {
  name: "",
  logoUrl: "",
  teamCode: "",
};

const initialFormError: FormError = {
  name: "",
  logoUrl: "",
  teamCode: "",
  managerId: "",
  competitionId: "",
};

const initialSort: Sort = {
  field: "id",
  direction: "desc",
};

const initialUI: UIState = {
  loading: false,
  modalType: null,
};

const initialImage: ImageState = {
  file: null,
  previewUrl: "",
  isUploading: false,
};

// ─── Store ────────────────────────────────────────────────────────

export const useTeamStore = create<TeamStore>()(
  devtools(
    (set, get) => ({
      // ── State ────────────────────────────────────────────────────
      teams: [],
      selectedTeam: null,
      formData: { ...initialFormData },
      formError: { ...initialFormError },
      filter: { ...initialFilter },
      pagination: { ...initialPagination },
      uiState: { ...initialUI },
      sort: { ...initialSort },
      image: { ...initialImage },

      // ── Setters ──────────────────────────────────────────────────
      setTeams: (teams) => set({ teams }),

      setSelectedTeam: (team) => set({ selectedTeam: team }),

      setField: (field, value) =>
        set((state) => ({
          formData: { ...state.formData, [field]: value },
          formError: { ...state.formError, [field]: "" },
        })),

      setFormError: (error) =>
        set((state) => ({
          formError: { ...state.formError, ...error },
        })),

      setLoading: (loading) =>
        set((state) => ({
          uiState: { ...state.uiState, loading },
        })),

      openModal: (modalType) =>
        set((state) => ({
          uiState: { ...state.uiState, modalType },
        })),

      closeModal: () =>
        set((state) => ({
          uiState: { ...state.uiState, modalType: null },
          selectedTeam: null,
        })),

      resetForm: () =>
        set({
          formData: { ...initialFormData },
          formError: { ...initialFormError },
          image: { ...initialImage },
          selectedTeam: null,
        }),

      // ── Image actions ────────────────────────────────────────────
      setImage: (file) =>
        set({
          image: {
            file,
            previewUrl: URL.createObjectURL(file),
            isUploading: false,
          },
        }),

      clearImage: () =>
        set((state) => ({
          image: { ...initialImage },
          formData: { ...state.formData, logoUrl: "" },
        })),

      setImageUploading: (isUploading) =>
        set((state) => ({
          image: { ...state.image, isUploading },
        })),

      // ── Filter actions ──────────────────────────────────────────
      setSearch: (search) =>
        set((state) => ({
          filter: { ...state.filter, search },
          pagination: { ...state.pagination, page: 0 },
        })),

      setCompetitionFilter: (competitionId) =>
        set((state) => ({
          filter: { ...state.filter, competitionId },
          pagination: { ...state.pagination, page: 0 },
        })),

      resetFilters: () =>
        set({
          filter: { ...initialFilter },
          pagination: { ...initialPagination },
        }),

      // ── Pagination actions ──────────────────────────────────────
      setPage: (page) =>
        set((state) => ({
          pagination: { ...state.pagination, page },
        })),

      setTotal: (totalElements) =>
        set((state) => ({
          pagination: { ...state.pagination, totalElements },
        })),

      setPageSize: (size) =>
        set((state) => ({
          pagination: { ...state.pagination, size, page: 0 },
        })),

      setPagination: (pagination) =>
        set((state) => ({
          pagination: { ...state.pagination, ...pagination },
        })),

      // ── Sort action ──────────────────────────────────────────────
      setSort: (field, direction) =>
        set({
          sort: { field, direction },
          pagination: { ...initialPagination, page: 0 },
        }),

      loadForm: (team) =>
        set({
          selectedTeam: team,
          formData: {
            name: team.name,
            teamCode: team.teamCode,
            logoUrl: team.logoUrl ?? "",
          },
          image: { ...initialImage },
          formError: { ...initialFormError },
        }),
      buildPayload: () => {
        const { formData } = get();
        return {
          name: formData.name.trim(),
          teamCode: formData.teamCode.trim().toUpperCase(),
          logoUrl: formData.logoUrl || null,
        };
      },

      setImageFromEvent: (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        get().setImage(file);
      },
      clearImageAndField: () => {
        get().clearImage();
        get().setField("logoUrl", "");
      },

      handleCloseModal: () => {
        get().clearImage();
        get().resetForm();
        get().closeModal();
      },

      // ── Validation ──────────────────────────────────────────────
      validate: () => {
        const { formData } = get();
        const errors: Partial<FormError> = {};
        if (!formData.name.trim()) errors.name = "Name is required";
        if (!formData.teamCode.trim()) errors.teamCode = "Team code is required";
        set((state) => ({
          formError: { ...initialFormError, ...errors },
        }));

        return Object.values(errors).length === 0;
      },
    }),
    { name: "TeamStore" }
  )
);