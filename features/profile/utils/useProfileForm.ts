import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useCreateProfile, useUpdateProfile } from './profile.api'
import { useTeamSummary } from '@/features/team/utils/team.api'

import {
  ProfileResponseDTO,
  ROLE_OPTIONS,
  POSITION_OPTIONS,
  STATUS_OPTIONS,
  CAPTAIN_STATUS_OPTIONS,
  PREFERRED_FOOT_OPTIONS,
  Role,
  Position,
  PlayerStatus,
  CaptainStatus,
  PreferredFoot,
} from './profile.types'

import { useProfileImage } from './useProfileImage'

import {
  profileSchema,
  toProfileFormValues,
  toProfilePayload,
  defaultValues,
  type ProfileFormInput,
} from './profile.schema'

type Props = {
  profile?: ProfileResponseDTO
  onClose: () => void
}

export function useProfileForm({ profile, onClose }: Props) {
  const {
    image,
    setImageFromEvent,
    clearImageAndField,
    loadImageFromUrl,
    uploadProfileImage,
    setImageUploading,
  } = useProfileImage()

  const {
    mutateAsync: createProfile,
    isPending: isCreating,
  } = useCreateProfile()

  const {
    mutateAsync: updateProfile,
    isPending: isUpdating,
  } = useUpdateProfile()

  const { data: teams } = useTeamSummary()

  const isEditMode = !!profile

  const isBusy =
    isCreating ||
    isUpdating ||
    image.isUploading

  const imagePreviewUrl =
    image.previewUrl ||
    profile?.avatarUrl ||
    ''

  const form = useForm<ProfileFormInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile
      ? toProfileFormValues(profile)
      : defaultValues,
  })

  const role = form.watch('role')

  const isPlayer = role === 'PLAYER'

  /*
  Reset the complete form and image state.
  */
  const resetFormState = () => {
    form.reset(defaultValues)
    clearImageAndField()
  }

  /*
  Sync form whenever the selected profile changes.
  */
  useEffect(() => {
    if (profile) {
      form.reset(toProfileFormValues(profile))

      if (profile.avatarUrl) {
        loadImageFromUrl(profile.avatarUrl)
      }
    } else {
      resetFormState()
    }
  }, [
    profile,
    form,
    loadImageFromUrl,
    clearImageAndField,
  ])

  /*
  When the role changes away from PLAYER,
  clear player-specific fields including height and dateOfBirth.
  */
  useEffect(() => {
    if (!isPlayer) {
      form.setValue('position', '')
      form.setValue('squadNumber', '')
      form.setValue('status', '')
      form.setValue('captainStatus', 'NONE')
      form.setValue('preferredFoot', '')
      form.setValue('height', '')
      form.setValue('dateOfBirth', '')
    } else {
      if (!form.getValues('status')) {
        form.setValue('status', 'ACTIVE')
      }

      if (!form.getValues('captainStatus')) {
        form.setValue('captainStatus', 'NONE')
      }
    }
  }, [isPlayer, form])

  /*
  Team options for the searchable team dropdown.
  */
  const TEAM_OPTIONS = useMemo(
    () => [
      {
        value: '',
        label: 'None',
      },

      ...(teams?.map((team) => ({
        value: String(team.teamId),
        label: team.teamName,
      })) ?? []),
    ],
    [teams]
  )

  /*
  Submit profile.
  */
  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      let resolvedAvatarUrl = data.avatarUrl

      /*
      Upload a new avatar if the user selected one.
      */
      if (image.file) {
        resolvedAvatarUrl = await uploadProfileImage(image.file)
      }

      /*
      Convert form values to backend DTO.
      DOB remains optional. Empty DOB becomes null
      inside toProfilePayload.
      */
      const payload = toProfilePayload(
        data,
        resolvedAvatarUrl
      )

      if (isEditMode && profile) {
        await updateProfile({
          id: profile.id,
          payload,
        })
      } else {
        await createProfile(payload)
      }

      resetFormState()
      onClose()
    } catch (err: any) {
      console.error('Profile form error:', err)

      setImageUploading(false)

      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong'

      /*
      Backend phone-number validation error.
      */
      if (
        errorMessage
          .toLowerCase()
          .includes('phone number')
      ) {
        form.setError('phoneNumber', {
          type: 'manual',
          message: errorMessage,
        })

        return
      }

      /*
      General backend error.
      */
      form.setError('root', {
        type: 'manual',
        message: errorMessage,
      })
    }
  })

  /*
  Clear avatar.
  */
  const onClearImage = () => {
    clearImageAndField()
    form.setValue('avatarUrl', '')
  }

  return {
    form,

    isEditMode,

    isBusy,

    isPlayer,

    imagePreviewUrl,

    onChangeImage: setImageFromEvent,

    onClearImage,

    handleSubmit,

    TEAM_OPTIONS,

    ROLE_OPTIONS,

    POSITION_OPTIONS,

    STATUS_OPTIONS,

    CAPTAIN_STATUS_OPTIONS,

    PREFERRED_FOOT_OPTIONS,
  }
}