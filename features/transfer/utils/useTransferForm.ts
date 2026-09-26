"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTransfer, useUpdateTransfer } from "./transfer.api";
import { useTeamSquadNumbers } from "@/features/team/utils/team.api";
import { TransferPlayerOption, TransferRequestDTO, TransferResponseDTO } from "./transfer.types";

// ─── Schema ───────────────────────────────────────────────────────

export const transferSchema = z.object({
  playerId: z.string().min(1, "Player is required"),
  toTeamId: z.string().min(1, "Destination team is required"),
  transferType: z.enum(["PERMANENT", "LOAN", "FREE"]),
  fee: z.string().optional(),
  transferDate: z.string().min(1, "Transfer date is required"),
  newSquadNumber: z.string().optional(),
});

export type TransferFormInput = z.infer<typeof transferSchema>;

// ─── Helpers ──────────────────────────────────────────────────────

function todayISODate(): string {
  return new Date().toISOString().split("T")[0];
}

const defaultValues: TransferFormInput = {
  playerId: "",
  toTeamId: "",
  transferType: "PERMANENT",
  fee: "",
  transferDate: todayISODate(),
  newSquadNumber: "",
};

export function toTransferFormValues(transfer?: TransferResponseDTO): TransferFormInput {
  if (!transfer) return defaultValues;
  return {
    playerId: String(transfer.playerId),
    toTeamId: String(transfer.toTeamId),
    transferType: transfer.transferType,
    fee: transfer.fee != null ? String(transfer.fee) : "",
    transferDate: transfer.transferDate,
    newSquadNumber: "",
  };
}

/**
 * When editing an existing transfer, the combobox needs something to
 * display before the user searches for anyone new — build it from the
 * fields already on the transfer record itself.
 */
function playerOptionFromTransfer(transfer?: TransferResponseDTO): TransferPlayerOption | null {
  if (!transfer) return null;
  return {
    id: transfer.playerId,
    name: transfer.playerName ?? `Player #${transfer.playerId}`,
    squadNumber: transfer.squadNumber ?? null,
    position: null,
    // This transfer has already been applied, so the player's real current
    // club is the destination of this record (toTeam), not the club they
    // were at before it (fromTeam).
    teamId: transfer.toTeamId,
    teamName: transfer.toTeamName,
  };
}

export function toTransferPayload(data: TransferFormInput): TransferRequestDTO {
  return {
    playerId: Number(data.playerId),
    toTeamId: Number(data.toTeamId),
    transferType: data.transferType,
    fee: data.fee ? Number(data.fee) : null,
    transferDate: data.transferDate,
    newSquadNumber: data.newSquadNumber ? Number(data.newSquadNumber) : undefined,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────

type UseTransferFormProps = {
  transfer?: TransferResponseDTO;
  onClose: () => void;
};

export function useTransferForm({ transfer, onClose }: UseTransferFormProps) {
  const { mutateAsync: createTransfer, isPending: isCreating } = useCreateTransfer();
  const { mutateAsync: updateTransfer, isPending: isUpdating } = useUpdateTransfer();

  const isEditMode = !!transfer;
  const isBusy = isCreating || isUpdating;

  const form = useForm<TransferFormInput>({
    resolver: zodResolver(transferSchema),
    defaultValues: toTransferFormValues(transfer),
  });

  const [selectedPlayer, setSelectedPlayer] = useState<TransferPlayerOption | null>(
    playerOptionFromTransfer(transfer)
  );

  useEffect(() => {
    form.reset(toTransferFormValues(transfer));
    setSelectedPlayer(playerOptionFromTransfer(transfer));
  }, [transfer, form]);

  const selectPlayer = (player: TransferPlayerOption) => {
    setSelectedPlayer(player);
    form.setValue("playerId", String(player.id), { shouldValidate: true });
  };

  const clearPlayer = () => {
    setSelectedPlayer(null);
    form.setValue("playerId", "", { shouldValidate: true });
  };

  const toTeamId = form.watch("toTeamId");
  const newSquadNumberInput = form.watch("newSquadNumber");

  // Squad numbers already taken at the destination team.
  const { data: takenNumbers = [] } = useTeamSquadNumbers(Number(toTeamId) || 0, {
    enabled: !!toTeamId,
  });

  // If the player's current number is already used at the destination,
  // they can't keep it — a new one must be supplied.
  const currentNumberConflicts =
    selectedPlayer?.squadNumber != null &&
    takenNumbers.includes(selectedPlayer.squadNumber);

  const requiresNewNumber = currentNumberConflicts && !newSquadNumberInput;

  const newNumberConflicts =
    !!newSquadNumberInput && takenNumbers.includes(Number(newSquadNumberInput));

  const handleSubmit = form.handleSubmit(async (data) => {
    if (requiresNewNumber) {
      form.setError("newSquadNumber", {
        message: `#${selectedPlayer?.squadNumber} is already taken at this team — choose a new number`,
      });
      return;
    }

    if (newNumberConflicts) {
      form.setError("newSquadNumber", {
        message: `#${data.newSquadNumber} is already taken at this team`,
      });
      return;
    }

    try {
      const payload = toTransferPayload(data);

      if (isEditMode && transfer) {
        await updateTransfer({ id: transfer.id, payload });
      } else {
        await createTransfer(payload);
      }

      onClose();
    } catch (err) {
      console.error("Transfer submit error:", err);
    }
  });

  return {
    form,
    isEditMode,
    isBusy,
    selectedPlayer,
    selectPlayer,
    clearPlayer,
    takenNumbers,
    currentNumberConflicts,
    newNumberConflicts,
    requiresNewNumber,
    handleSubmit,
  };
}