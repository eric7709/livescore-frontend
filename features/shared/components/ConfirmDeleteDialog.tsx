'use client';

import { ProfileResponseDTO } from "@/features/profile/utils/profile.types";


interface ConfirmDeleteDialogProps {
  profile: ProfileResponseDTO;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteDialog({ profile, isDeleting, onConfirm, onCancel }: ConfirmDeleteDialogProps) {
  return (
    <div className="fixed inset-0 z-10000 flex items-center justify-center bg-black/40 px-4" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-medium text-gray-900">Delete profile?</h3>
        <p className="mt-2 text-sm text-gray-500">
          This removes {profile.firstName} {profile.lastName} permanently. This can't be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}