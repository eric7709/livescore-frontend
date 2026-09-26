import { uploadImage } from '@/features/shared/services/uploadImage'
import { useState, useCallback } from 'react'

interface ImageState {
  file: File | null
  previewUrl: string
  isUploading: boolean
  isExistingImage: boolean
}

export function useCompetitionImage() {
  const [image, setImageState] = useState<ImageState>({
    file: null,
    previewUrl: '',
    isUploading: false,
    isExistingImage: false,
  })
  const setImage = useCallback((file: File) => {
    setImageState((prev) => {
      if (prev.previewUrl && !prev.isExistingImage) {
        URL.revokeObjectURL(prev.previewUrl)
      }
      return {
        file,
        previewUrl: URL.createObjectURL(file),
        isUploading: false,
        isExistingImage: false,
      }
    })
  }, [])

  const loadImageFromUrl = useCallback((url: string) => {
    setImageState((prev) => {
      if (prev.previewUrl && !prev.isExistingImage) {
        URL.revokeObjectURL(prev.previewUrl)
      }
      return {
        file: null,
        previewUrl: url,
        isUploading: false,
        isExistingImage: true,
      }
    })
  }, [])

  const clearImage = useCallback(() => {
    setImageState((prev) => {
      if (prev.previewUrl && !prev.isExistingImage) {
        URL.revokeObjectURL(prev.previewUrl)
      }
      return { file: null, previewUrl: '', isUploading: false, isExistingImage: false }
    })
  }, [])

  const setImageUploading = useCallback((isUploading: boolean) => {
    setImageState((prev) => ({ ...prev, isUploading }))
  }, [])

  const setImageFromEvent = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      setImage(file)
      e.target.value = ''
    },
    [setImage]
  )

  const clearImageAndField = useCallback(
    (clearFieldCallback?: () => void) => {
      clearImage()
      if (clearFieldCallback) clearFieldCallback()
    },
    [clearImage]
  )

  const uploadCompetitionImage = useCallback(async (file: File): Promise<string> => {
    try {
      setImageUploading(true)
      const url = await uploadImage(file)
      setImageUploading(false)
      return url
    } catch (error) {
      setImageUploading(false)
      throw error
    }
  }, [setImageUploading])

  return {
    image,
    setImage,
    loadImageFromUrl,
    clearImage,
    setImageUploading,
    setImageFromEvent,
    clearImageAndField,
    uploadCompetitionImage,
  }
}