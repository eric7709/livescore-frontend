import { create } from "zustand";

type FileStoreState = {
    file: File | null;
    previewUrl: string;
    isUploading: boolean;
    setFile: (file: File | null) => void;
    setIsUploading: (uploading: boolean) => void;
    clearStore: () => void;
};

export const useFileStore = create<FileStoreState>((set, get) => ({
    file: null,
    previewUrl: "",
    isUploading: false,

    setFile: (file) => {
        const currentPreview = get().previewUrl;
        // Clean up previous blob URL to prevent browser memory leaks
        if (currentPreview.startsWith("blob:")) {
            URL.revokeObjectURL(currentPreview);
        }

        if (!file) {
            set({ file: null, previewUrl: "" });
            return;
        }

        set({
            file,
            previewUrl: URL.createObjectURL(file),
        });
    },

    setIsUploading: (isUploading) => set({ isUploading }),

    clearStore: () => {
        const currentPreview = get().previewUrl;
        if (currentPreview.startsWith("blob:")) {
            URL.revokeObjectURL(currentPreview);
        }
        set({ file: null, previewUrl: "", isUploading: false });
    },
}));