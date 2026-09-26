"use client";

import { TeamResponseDTO } from "@/features/team/utils/team.types";
import { useTeamForm } from "@/features/team/utils/useTeamForm";
import { Upload, X, Loader2, Users } from "lucide-react";

interface TeamFormProps {
  team?: TeamResponseDTO;
  onClose: () => void;
}

export function TeamForm({ team, onClose }: TeamFormProps) {
  const {
    form: {
      register,
      formState: { errors },
    },
    isEditMode,
    isBusy,
    isUploading,
    imagePreviewUrl,
    onChangeImage,
    onClearImage,
    handleSubmit,
  } = useTeamForm({ team, onClose });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Team Logo Upload Field */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Team Logo
        </label>
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {imagePreviewUrl ? (
              <img
                src={imagePreviewUrl}
                alt="Logo Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <Users size={24} className="text-slate-400" />
            )}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                <Loader2 size={16} className="animate-spin" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300">
              <Upload size={13} />
              <span>Upload Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={onChangeImage}
                disabled={isBusy}
                className="hidden"
              />
            </label>

            {imagePreviewUrl && (
              <button
                type="button"
                onClick={onClearImage}
                disabled={isBusy}
                className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
              >
                <X size={13} />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Team Name Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Team Name
        </label>
        <input
          {...register("name")}
          type="text"
          placeholder="e.g. Manchester City"
          disabled={isBusy}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
        />
        {errors.name && (
          <p className="mt-1 text-[11px] font-medium text-rose-500">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Team Code Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Team Code
        </label>
        <input
          {...register("teamCode")}
          type="text"
          placeholder="e.g. MCI"
          disabled={isBusy}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium uppercase text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
        />
        {errors.teamCode && (
          <p className="mt-1 text-[11px] font-medium text-rose-500">
            {errors.teamCode.message}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isBusy}
          className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isBusy}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50"
        >
          {isBusy && <Loader2 size={13} className="animate-spin" />}
          <span>
            {isUploading
              ? "Uploading..."
              : isBusy
              ? "Saving..."
              : isEditMode
              ? "Update Team"
              : "Create Team"}
          </span>
        </button>
      </div>
    </form>
  );
}