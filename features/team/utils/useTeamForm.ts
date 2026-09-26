"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTeam, useUpdateTeam } from "./team.api";
import { TeamRequestDTO, TeamResponseDTO } from "./team.types";
import { uploadImage } from "@/features/shared/services/uploadImage";

// ─── Schema ───────────────────────────────────────────────────────

export const teamSchema = z.object({
  name: z.string().min(1, "Name is required"),
  teamCode: z.string().min(1, "Team code is required"),
  logoUrl: z.string().catch(""),
});

export type TeamFormInput = z.infer<typeof teamSchema>;

// ─── Helpers ──────────────────────────────────────────────────────

const defaultValues: TeamFormInput = {
  name: "",
  teamCode: "",
  logoUrl: "",
};

export function toTeamFormValues(team?: TeamResponseDTO): TeamFormInput {
  if (!team) return defaultValues;
  return {
    name: team.name ?? "",
    teamCode: team.teamCode ?? "",
    logoUrl: team.logoUrl ?? "",
  };
}

export function toTeamPayload(
  data: TeamFormInput,
  resolvedLogoUrl?: string
): TeamRequestDTO {
  return {
    name: data.name.trim(),
    teamCode: data.teamCode.trim().toUpperCase(),
    logoUrl: resolvedLogoUrl ?? (data.logoUrl || null),
  };
}

// ─── Hook ─────────────────────────────────────────────────────────

type UseTeamFormProps = {
  team?: TeamResponseDTO;
  onClose: () => void;
};

export function useTeamForm({ team, onClose }: UseTeamFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const { mutateAsync: createTeam, isPending: isCreating } = useCreateTeam();
  const { mutateAsync: updateTeam, isPending: isUpdating } = useUpdateTeam();

  const isEditMode = !!team;
  const isBusy = isCreating || isUpdating || isUploading;

  const form = useForm<TeamFormInput>({
    resolver: zodResolver(teamSchema),
    defaultValues: toTeamFormValues(team),
  });

  // Re-sync form state and previews whenever selected team changes
  useEffect(() => {
    form.reset(toTeamFormValues(team));
    setSelectedFile(null);
    setFilePreview("");
  }, [team, form]);

  const imagePreviewUrl = filePreview || form.watch("logoUrl") || team?.logoUrl || "";

  const onChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const onClearImage = useCallback(() => {
    setSelectedFile(null);
    setFilePreview("");
    form.setValue("logoUrl", "");
  }, [form]);

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      let finalLogoUrl = data.logoUrl;

      if (selectedFile) {
        setIsUploading(true);
        finalLogoUrl = await uploadImage(selectedFile);
        setIsUploading(false);
      }

      const payload = toTeamPayload(data, finalLogoUrl);

      if (isEditMode && team) {
        await updateTeam({ id: team.id, payload });
      } else {
        await createTeam(payload);
      }

      setSelectedFile(null);
      setFilePreview("");
      onClose();
    } catch (err) {
      console.error("Team submit error:", err);
      setIsUploading(false);
    }
  });

  return {
    form,
    isEditMode,
    isBusy,
    isUploading,
    imagePreviewUrl,
    onChangeImage,
    onClearImage,
    handleSubmit,
  };
}