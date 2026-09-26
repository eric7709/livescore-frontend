import { z } from 'zod'
import { TransferFormData, TransferRequestDTO, TransferResponseDTO } from './transfer.types'

export const transferSchema = z
  .object({
    playerId: z.string().min(1, 'Player is required'),
    fromTeamId: z.string(),
    fromTeamName: z.string(),
    toTeamId: z.string().min(1, 'To team is required'),
    toTeamName: z.string(),
    transferType: z.enum(['PERMANENT', 'LOAN', 'FREE']),
    fee: z.string(),
    transferDate: z.string().min(1, 'Transfer date is required'),
  })
  .superRefine((data, ctx) => {
    if (data.fromTeamId && data.fromTeamId === data.toTeamId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['toTeamId'], message: 'From team and to team must be different' })
    }
    if (data.fee.trim()) {
      const value = Number(data.fee)
      if (!Number.isFinite(value) || value < 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['fee'], message: 'Fee must be a valid non-negative number' })
      }
    }
  })

export type TransferFormInput = z.infer<typeof transferSchema>

export const defaultTransferFormValues: TransferFormData = {
  playerId: '', fromTeamId: '', fromTeamName: '', toTeamId: '', toTeamName: '',
  transferType: 'PERMANENT', fee: '', transferDate: '',
}

export function toTransferFormValues(transfer?: TransferResponseDTO): TransferFormData {
  if (!transfer) return { ...defaultTransferFormValues }
  return {
    playerId: String(transfer.playerId),
    fromTeamId: transfer.fromTeamId == null ? '' : String(transfer.fromTeamId),
    fromTeamName: transfer.fromTeamName ?? '',
    toTeamId: String(transfer.toTeamId),
    toTeamName: transfer.toTeamName ?? '',
    transferType: transfer.transferType,
    fee: transfer.fee == null ? '' : String(transfer.fee),
    transferDate: transfer.transferDate,
  }
}

export function toTransferPayload(data: TransferFormData): TransferRequestDTO {
  return {
    playerId: Number(data.playerId),
    toTeamId: Number(data.toTeamId),
    transferType: data.transferType,
    fee: data.transferType === 'FREE' || !data.fee.trim() ? null : Number(data.fee),
    transferDate: data.transferDate,
  }
}
