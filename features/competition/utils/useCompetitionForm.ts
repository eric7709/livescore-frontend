import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateCompetition, useUpdateCompetition } from './competition.api'
import { useCompetitionImage } from './useCompetitionImage'
import { CompetitionDTO, CompetitionRequest } from './competition.types'

// ─── Schema ───────────────────────────────────────────────────────

export const competitionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  competitionCode: z.string().min(1, 'Code is required'),
  competitionType: z.enum(['LEAGUE', 'CUP', 'FRIENDLY', 'TOURNAMENT']),
  scope: z.enum(['LOCAL', 'NATIONAL', 'INTERNATIONAL', "CONTINENTAL"]),
  legFormat: z.enum(['SINGLE', 'DOUBLE', 'MIXED']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  status: z.enum(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED']),
  logoUrl: z.string().catch(''),
}).refine(
  (data) => !data.startDate || !data.endDate || data.endDate >= data.startDate,
  { message: 'End date must be after start date', path: ['endDate'] }
)

export type CompetitionFormInput = z.infer<typeof competitionSchema>

// ─── Converters ───────────────────────────────────────────────────

export function toFormValues(c: CompetitionDTO): CompetitionFormInput {
  return {
    name: c.name,
    competitionCode: c.competitionCode,
    competitionType: c.competitionType,
    scope: c.scope,
    legFormat: c.legFormat,
    startDate: c.startDate?.split('T')[0] ?? '',
    endDate: c.endDate?.split('T')[0] ?? '',
    status: c.status,
    logoUrl: c.logoUrl ?? '',
  }
}

export function toRequestPayload(
  data: CompetitionFormInput,
  resolvedLogoUrl?: string
): CompetitionRequest{
  const startDate = new Date(data.startDate);
  startDate.setHours(0, 0, 0, 0); // 12:00 AM (midnight)
  const endDate = new Date(data.endDate);
  endDate.setHours(23, 59, 59, 999); // 11:59:59.999 PM
  return {
    name: data.name.trim(),
    competitionCode: data.competitionCode.trim().toUpperCase(),
    competitionType: data.competitionType,
    scope: data.scope,
    legFormat: data.legFormat,
    startDate: startDate.toISOString(), // or .toJSON()
    endDate: endDate.toISOString(), // or .toJSON()
    status: data.status,
    logoUrl: String(resolvedLogoUrl) ?? (data.logoUrl || null),
  }
}

const defaultValues: CompetitionFormInput = {
  name: '',
  competitionCode: '',
  competitionType: 'LEAGUE',
  scope: 'LOCAL',
  legFormat: 'SINGLE',
  startDate: '',
  endDate: '',
  status: 'SCHEDULED',
  logoUrl: '',
}

// ─── Hook ─────────────────────────────────────────────────────────

type Props = {
  competition?: CompetitionDTO
  onClose: () => void
}

export function useCompetitionForm({ competition, onClose }: Props) {
  const {
    image,
    setImageFromEvent,
    clearImageAndField,
    loadImageFromUrl,
    uploadCompetitionImage,
    setImageUploading
  } = useCompetitionImage()

  const { mutateAsync: createCompetition, isPending: isCreating } = useCreateCompetition()
  const { mutateAsync: updateCompetition, isPending: isUpdating } = useUpdateCompetition()

  const isEditMode = !!competition
  const isBusy = isCreating || isUpdating || image.isUploading
  const imagePreviewUrl = image.previewUrl || competition?.logoUrl || ''

  // Load existing image when editing
  useEffect(() => {
    if (isEditMode && competition?.logoUrl) {
      loadImageFromUrl(competition.logoUrl)
    }
  }, [isEditMode, competition?.logoUrl, loadImageFromUrl])

  const form = useForm<CompetitionFormInput>({
    resolver: zodResolver(competitionSchema),
    defaultValues: competition ? toFormValues(competition) : defaultValues,
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      let resolvedLogoUrl = data.logoUrl

      // Upload new image if selected
      if (image.file) {
        resolvedLogoUrl = await uploadCompetitionImage(image.file)
      }

      const payload = toRequestPayload(data, resolvedLogoUrl)

      if (isEditMode && competition) {
        await updateCompetition({ id: competition.id, payload })
      } else {
        await createCompetition(payload)
      }

      clearImageAndField()
      onClose()
    } catch (err) {
      console.error('Competition form error:', err)
      setImageUploading(false)
    }
  })

  const onChangeImage = setImageFromEvent

  const onClearImage = () => {
    clearImageAndField()
    form.setValue('logoUrl', '')
  }

  return {
    form,
    isEditMode,
    isBusy,
    imagePreviewUrl,
    onChangeImage,
    onClearImage,
    handleSubmit,
  }
}