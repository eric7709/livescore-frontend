import { uploadImage } from '@/features/shared/services/uploadImage'
import { useState, useCallback } from 'react'

interface ImageState {
    file: File | null
    previewUrl: string
    isUploading: boolean
    isExistingImage: boolean
}

export function useProfileImage() {
    const [image, setImageState] = useState<ImageState>({
        file: null,
        previewUrl: '',
        isUploading: false,
        isExistingImage: false,
    })

    const setImage = useCallback((file: File) => {
        if (image.previewUrl && !image.isExistingImage) {
            URL.revokeObjectURL(image.previewUrl)
        }

        setImageState({
            file,
            previewUrl: URL.createObjectURL(file),
            isUploading: false,
            isExistingImage: false,
        })
    }, [image.previewUrl, image.isExistingImage])

    const loadImageFromUrl = useCallback((url: string) => {
        if (image.previewUrl && !image.isExistingImage) {
            URL.revokeObjectURL(image.previewUrl)
        }

        setImageState({
            file: null,
            previewUrl: url,
            isUploading: false,
            isExistingImage: true,
        })
    }, [image.previewUrl, image.isExistingImage])

    const clearImage = useCallback(() => {
        if (image.previewUrl && !image.isExistingImage) {
            URL.revokeObjectURL(image.previewUrl)
        }
        setImageState({
            file: null,
            previewUrl: '',
            isUploading: false,
            isExistingImage: false,
        })
    }, [image.previewUrl, image.isExistingImage])

    const setImageUploading = useCallback((isUploading: boolean) => {
        setImageState((prev) => ({ ...prev, isUploading }))
    }, [])

    const setImageFromEvent = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (!file) return
            setImage(file)
            // Reset input to allow re-uploading same file
            e.target.value = ''
        },
        [setImage]
    )

    const clearImageAndField = useCallback(
        (clearFieldCallback?: () => void) => {
            clearImage()
            if (clearFieldCallback) {
                clearFieldCallback()
            }
        },
        [clearImage]
    )

    const uploadProfileImage = useCallback(async (file: File): Promise<string> => {
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
        uploadProfileImage,
    }
}