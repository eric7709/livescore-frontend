import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { MatchDTO } from './match.types'
import {
  useCreateMatch,
  useUpdateMatch,
} from './match.api'
import { MatchForm, MatchFormInput } from './MatchForm'

type Props = {
  match?: MatchDTO
  onClose: () => void
}

export function useMatchForm({
  match,
  onClose,
}: Props) {

  const isEditMode = !!match

  const form = useForm<MatchFormInput>({
    resolver: zodResolver(MatchForm.schema),
    defaultValues: match
      ? MatchForm.fromMatch(match)
      : MatchForm.defaultValues(),
  })

  const {
    mutateAsync: createMatch,
    isPending: isCreating,
  } = useCreateMatch()

  const {
    mutateAsync: updateMatch,
    isPending: isUpdating,
  } = useUpdateMatch()

  const isBusy = isCreating || isUpdating


  const handleSubmit = form.handleSubmit(
    async (data) => {
      const payload = MatchForm.toPayload(data)
      try {
        if (isEditMode && match) {
          await updateMatch({
            id: match.id,
            payload,
          })
        } else {
          await createMatch(payload)
        }
        onClose()
      } catch (error) {

        console.error(
          'Match form error:',
          error
        )

      }
    }
  )
  return {
    form,
    isEditMode,
    isBusy,
    handleSubmit,
  }
}