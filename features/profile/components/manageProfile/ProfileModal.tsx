'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Upload, Trash2, Search, Check, ChevronDown } from 'lucide-react'
import { Controller } from 'react-hook-form'
import { CustomInput, CustomSelect } from '@/features/shared/components/CustomComponents'
import { CaptainStatus, PlayerStatus, Position, PreferredFoot, ProfileResponseDTO, Role } from '../../utils/profile.types'
import { useProfileForm } from '../../utils/useProfileForm'

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="mt-0.5 text-[11px] text-red-500">{error}</p>}
    </div>
  )
}

/**
 * Searchable Team Dropdown Component
 */
function SearchableTeamSelect({
  options,
  value,
  onSelect,
  placeholder = 'Select team',
}: {
  options: { value: string; label: string }[]
  value: string
  onSelect: (value: string) => void
  placeholder?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 shadow-sm transition-colors hover:bg-gray-50 focus:border-blue-500 focus:outline-none"
      >
        <span className={selectedOption?.label ? 'text-gray-900' : 'text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={14} className="text-gray-400" />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-56 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {/* Search Box */}
          <div className="flex items-center border-b border-gray-100 px-2.5 py-1.5">
            <Search size={12} className="mr-2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search team..."
              className="w-full bg-transparent text-xs text-gray-900 placeholder-gray-400 focus:outline-none"
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="max-h-40 overflow-y-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onSelect(opt.value)
                      setIsOpen(false)
                      setSearchTerm('')
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-50 font-medium text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={12} className="text-blue-600" />}
                  </button>
                )
              })
            ) : (
              <div className="p-2 text-center text-[11px] text-gray-400">No teams found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

type Props = {
  modal: 'CREATE' | 'UPDATE' | 'DELETE' | null
  selectedProfile?: ProfileResponseDTO
  onClose: () => void
}

export default function ProfileModal({ modal, selectedProfile, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isOpen = modal === 'CREATE' || modal === 'UPDATE'

  const {
    form, isEditMode, isBusy, isPlayer,
    imagePreviewUrl, onChangeImage, onClearImage,
    handleSubmit, TEAM_OPTIONS, ROLE_OPTIONS, POSITION_OPTIONS, STATUS_OPTIONS,
  } = useProfileForm({
    profile: modal === 'UPDATE' ? selectedProfile : undefined,
    onClose,
  })
  
  const { control, register, formState: { errors } } = form

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title"
        className="relative z-10 w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 id="modal-title" className="text-sm font-semibold text-gray-900">
            {isEditMode ? 'Edit Profile' : 'Create Profile'}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close"
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X size={14} />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-h-[60vh]">
            {/* General Root API Error (e.g., Duplicates) */}
            {errors.root?.message && (
              <div className="rounded-lg bg-red-50 p-2 text-xs font-medium text-red-600 border border-red-100">
                {errors.root.message}
              </div>
            )}

            {/* Avatar */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center">
                {imagePreviewUrl
                  ? <img src={imagePreviewUrl} alt="Preview" className="h-full w-full object-cover" />
                  : <span className="text-[9px] text-gray-400">No photo</span>}
              </div>
              <div className="flex gap-1.5">
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  <Upload size={10} />{imagePreviewUrl ? 'Change' : 'Upload'}
                </button>
                {imagePreviewUrl && (
                  <button type="button" onClick={onClearImage}
                    className="inline-flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-500 hover:bg-red-100 transition-colors">
                    <Trash2 size={10} />Remove
                  </button>
                )}
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={onChangeImage} className="hidden" aria-hidden="true" />
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-2.5">
              <CustomInput label="First name" placeHolder="John"
                error={errors.firstName?.message}
                {...register('firstName')} />
              <CustomInput label="Last name" placeHolder="Doe"
                error={errors.lastName?.message}
                {...register('lastName')} />
            </div>

            <CustomInput label="Phone" placeHolder="08012345678"
              error={errors.phoneNumber?.message}
              {...register('phoneNumber')} />

            {/* Searchable Team Select */}
            <Field label="Team" error={errors.teamId?.message}>
              <Controller name="teamId" control={control}
                render={({ field }) => (
                  <SearchableTeamSelect
                    options={TEAM_OPTIONS}
                    value={field.value ?? ''}
                    placeholder="Search team..."
                    onSelect={field.onChange}
                  />
                )} />
            </Field>

            <Field label="Role" error={errors.role?.message}>
              <Controller name="role" control={control}
                render={({ field }) => (
                  <CustomSelect options={ROLE_OPTIONS} value={field.value}
                    placeholder="Select role" onSelect={(val) => field.onChange(val as Role)} />
                )} />
            </Field>

            {isPlayer && (
              <>
                <div className="grid grid-cols-2 text-black gap-2.5">
                  <Field label="Position" error={errors.position?.message}>
                    <Controller name="position" control={control}
                      render={({ field }) => (
                        <CustomSelect options={POSITION_OPTIONS} value={field.value ?? ''}
                          placeholder="Position" onSelect={(val) => field.onChange(val as Position)} />
                      )} />
                  </Field>
                  <CustomInput label="Squad no." placeHolder="10"
                    error={errors.squadNumber?.message}
                    {...register('squadNumber')} />
                </div>

                <Field label="Status" error={errors.status?.message}>
                  <Controller name="status" control={control}
                    render={({ field }) => (
                      <CustomSelect
                        dropDirection="up"
                        options={STATUS_OPTIONS}
                        value={field.value ?? 'ACTIVE'}
                        placeholder="Select status"
                        onSelect={(val) => field.onChange(val as PlayerStatus)}
                      />
                    )} />
                </Field>

                <div className="grid grid-cols-2 gap-2.5">
                  <Field label="Captain status" error={errors.captainStatus?.message}>
                    <Controller name="captainStatus" control={control}
                      render={({ field }) => (
                        <CustomSelect
                          options={[
                            { label: 'None', value: 'NONE' },
                            { label: 'Captain', value: 'CAPTAIN' },
                            { label: 'Vice Captain', value: 'VICE_CAPTAIN' },
                          ]}
                          value={field.value ?? 'NONE'}
                          placeholder="Captain status"
                          onSelect={(val) => field.onChange(val as CaptainStatus)}
                        />
                      )} />
                  </Field>

                  <Field label="Preferred foot" error={errors.preferredFoot?.message}>
                    <Controller name="preferredFoot" control={control}
                      render={({ field }) => (
                        <CustomSelect
                          options={[
                            { label: 'Left', value: 'LEFT' },
                            { label: 'Right', value: 'RIGHT' },
                            { label: 'Both', value: 'BOTH' },
                          ]}
                          value={field.value ?? ''}
                          placeholder="Preferred foot"
                          onSelect={(val) => field.onChange(val as PreferredFoot)}
                        />
                      )} />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <CustomInput
                    label="Height (cm)"
                    placeHolder="180"
                    error={errors.height?.message}
                    {...register('height')}
                  />

                  <CustomInput
                    label="Date of birth (Optional)"
                    type="date"
                    error={errors.dateOfBirth?.message}
                    {...register('dateOfBirth')}
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-100 rounded-b-2xl bg-gray-50">
            <button type="button" onClick={onClose} disabled={isBusy}
              className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isBusy}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
              {isBusy && (
                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
              {isBusy ? 'Saving...' : isEditMode ? 'Save changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}