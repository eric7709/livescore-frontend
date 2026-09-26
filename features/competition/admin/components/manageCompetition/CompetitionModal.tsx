'use client';

import { useRef } from 'react'
import { Controller } from 'react-hook-form'
import { Upload, Trash2 } from 'lucide-react'
import Modal from '@/features/shared/components/Modal'
import { CustomInput, CustomSelect } from '@/features/shared/components/CustomComponents'
import { useCompetitionForm } from '../../../utils/useCompetitionForm'
import { CompetitionDTO } from '../../../utils/competition.types'
import { COMPETITION_LEG_FORMAT_FORM_OPTIONS, COMPETITION_SCOPE_FORM_OPTIONS, COMPETITION_STATUS_FORM_OPTIONS, COMPETITION_TYPE_FORM_OPTIONS } from '@/features/shared/lib/options';


interface CompetitionFormProps {
  competition?: CompetitionDTO
  onClose: () => void
  title: string
}

function CompetitionForm({ competition, onClose, title }: CompetitionFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    form, isEditMode, isBusy,
    imagePreviewUrl, onChangeImage, onClearImage, handleSubmit,
  } = useCompetitionForm({ competition, onClose })

  const { register, control, formState: { errors } } = form

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-gray-800">
      <h2 className="text-xl font-bold tracking-tight text-gray-900">{title}</h2>

      {/* Logo */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50 flex items-center justify-center">
          {imagePreviewUrl
            ? <img src={imagePreviewUrl} alt="Logo preview" className="h-full w-full object-cover" />
            : <span className="text-[9px] text-gray-400">No logo</span>}
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

      <CustomInput
        label="Competition Name"
        placeHolder="e.g. Champions League"
        error={errors.name?.message}
        disabled={isBusy}
        {...register('name')}
      />

      <div className="grid grid-cols-2 gap-4">
        <CustomInput
          label="Code"
          placeHolder="e.g. UCL"
          error={errors.competitionCode?.message}
          disabled={isBusy}
          {...register('competitionCode')}
        />
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
          <Controller name="competitionType" control={control}
            render={({ field }) => (
              <CustomSelect options={COMPETITION_TYPE_FORM_OPTIONS} value={field.value}
                onSelect={field.onChange} error={errors.competitionType?.message} disabled={isBusy} />
            )} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Scope</label>
          <Controller name="scope" control={control}
            render={({ field }) => (
              <CustomSelect options={COMPETITION_SCOPE_FORM_OPTIONS} value={field.value}
                onSelect={field.onChange} error={errors.scope?.message} disabled={isBusy} />
            )} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Leg Format</label>
          <Controller name="legFormat" control={control}
            render={({ field }) => (
              <CustomSelect options={COMPETITION_LEG_FORMAT_FORM_OPTIONS} value={field.value}
                onSelect={field.onChange} error={errors.legFormat?.message} disabled={isBusy} />
            )} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CustomInput label="Start Date" type="date"
          error={errors.startDate?.message} disabled={isBusy}
          {...register('startDate')} />
        <CustomInput label="End Date" type="date"
          error={errors.endDate?.message} disabled={isBusy}
          {...register('endDate')} />
      </div>

      {isEditMode && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <Controller name="status" control={control}
            render={({ field }) => (
              <CustomSelect options={COMPETITION_STATUS_FORM_OPTIONS} value={field.value}
                onSelect={field.onChange} error={errors.status?.message} disabled={isBusy} />
            )} />
        </div>
      )}

      <div className="pt-2 flex justify-end">
        <button type="submit" disabled={isBusy}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition">
          {isBusy ? 'Saving...' : isEditMode ? 'Save changes' : 'Create'}
        </button>
      </div>
    </form>
  )
}

type CompetitionModalProps = {
  modal: 'CREATE' | 'UPDATE' | 'DELETE' | null
  selectedCompetition?: CompetitionDTO
  closeModal: () => void
}

export default function CompetitionModal({ modal, selectedCompetition, closeModal }: CompetitionModalProps) {
  return (
    <Modal isOpen={modal === 'CREATE' || modal === 'UPDATE'} onClose={closeModal}>
      {modal === 'CREATE' && <CompetitionForm onClose={closeModal} title="Create Competition" />}
      {modal === 'UPDATE' && selectedCompetition && (
        <CompetitionForm competition={selectedCompetition} onClose={closeModal} title="Edit Competition" />
      )}
    </Modal>
  )
}