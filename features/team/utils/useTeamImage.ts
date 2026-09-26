// src/team/hooks/useTeamImage.ts
import { useState, useCallback } from "react";

interface ImageState {
  file: File | null;
  previewUrl: string;
  isUploading: boolean;
}

export function useTeamImage() {
  const [image, setImageState] = useState<ImageState>({
    file: null,
    previewUrl: "",
    isUploading: false,
  });

  const setImage = useCallback((file: File) => {
    setImageState({
      file,
      previewUrl: URL.createObjectURL(file),
      isUploading: false,
    });
  }, []);

  const clearImage = useCallback(() => {
    setImageState({
      file: null,
      previewUrl: "",
      isUploading: false,
    });
  }, []);

  const setImageUploading = useCallback((isUploading: boolean) => {
    setImageState((prev) => ({ ...prev, isUploading }));
  }, []);

  const setImageFromEvent = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setImage(file);
    },
    [setImage]
  );

  const clearImageAndField = useCallback(
    (clearFieldCallback?: () => void) => {
      clearImage();
      if (clearFieldCallback) {
        clearFieldCallback();
      }
    },
    [clearImage]
  );

  return {
    image,
    setImage,
    clearImage,
    setImageUploading,
    setImageFromEvent,
    clearImageAndField,
  };
}