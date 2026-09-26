"use client";

import { useMemo } from "react";
import { Controller } from "react-hook-form";
import Modal from "@/features/shared/components/Modal";
import { CustomInput, CustomSelect } from "@/features/shared/components/CustomComponents";
import { MatchDTO, MatchStatus, MatchType } from "../../../utils/match.types";
import { useMatchForm } from "../../../utils/useMatchForm";
import { TeamSearchSelect } from "./TeamSearchSelect";
import { CompetitionSearchSelect } from "./CompetitionSearchSelect";
import { MATCH_STATUS_FORM_OPTIONS, MATCH_TYPE_FORM_OPTIONS } from "@/features/shared/lib/options";
import Spinner from "./Spinner";

interface MatchFormProps {
  match?: MatchDTO;
  onClose: () => void;
  title: string;
}

// 12:00 to 20:00 hourly presets
const HOURLY_KICKOFF_PRESETS = [
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

function MatchForm({ match, onClose, title }: MatchFormProps) {
  const { form, isBusy, handleSubmit } = useMatchForm({ match, onClose });
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const homeTeamId = watch("homeTeamId");
  const awayTeamId = watch("awayTeamId");
  const rawMatchDate = watch("matchDate");

  // Derive isolated date and time strings from form state
  const { dateValue, timeValue } = useMemo(() => {
    if (!rawMatchDate) return { dateValue: "", timeValue: "" };
    const [d, t] = rawMatchDate.split("T");
    return {
      dateValue: d ?? "",
      timeValue: t ? t.substring(0, 5) : "",
    };
  }, [rawMatchDate]);

  // Combine isolate changes back to single ISO format
  const handleDateOrTimeChange = (newDate?: string, newTime?: string) => {
    const targetDate = newDate !== undefined ? newDate : dateValue;
    const targetTime = newTime !== undefined ? newTime : timeValue;

    if (targetDate && targetTime) {
      setValue("matchDate", `${targetDate}T${targetTime}`, { shouldValidate: true });
    } else if (targetDate) {
      setValue("matchDate", `${targetDate}T12:00`, { shouldValidate: true });
    } else {
      setValue("matchDate", "", { shouldValidate: true });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>

      {/* Competition Selection */}
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-700">Competition</label>
        <Controller
          name="competitionId"
          control={control}
          render={({ field }) => (
            <CompetitionSearchSelect
              value={field.value}
              selectedName={watch("competitionName")}
              onSelect={(id, name) => {
                field.onChange(id != null ? String(id) : "");
                setValue("competitionName", name ?? "");
              }}
              placeholder="Search competition..."
              disabled={isBusy}
              error={errors.competitionId?.message}
            />
          )}
        />
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">Home Team</label>
          <Controller
            name="homeTeamId"
            control={control}
            render={({ field }) => (
              <TeamSearchSelect
                value={field.value}
                selectedName={watch("homeTeamName")}
                onSelect={(id, name) => {
                  field.onChange(id != null ? String(id) : "");
                  setValue("homeTeamName", name ?? "");
                }}
                placeholder="Search home team..."
                disabled={isBusy}
                error={errors.homeTeamId?.message}
                excludeTeamId={awayTeamId ? Number(awayTeamId) : undefined}
              />
            )}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">Away Team</label>
          <Controller
            name="awayTeamId"
            control={control}
            render={({ field }) => (
              <TeamSearchSelect
                value={field.value}
                selectedName={watch("awayTeamName")}
                onSelect={(id, name) => {
                  field.onChange(id != null ? String(id) : "");
                  setValue("awayTeamName", name ?? "");
                }}
                placeholder="Search away team..."
                disabled={isBusy}
                error={errors.awayTeamId?.message}
                excludeTeamId={homeTeamId ? Number(homeTeamId) : undefined}
              />
            )}
          />
        </div>
      </div>

      {/* Date & Time Field Wrapper */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 space-y-2.5">
        <label className="block text-xs font-semibold text-slate-700">Kickoff Schedule</label>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <CustomInput
              label=""
              type="date"
              value={dateValue}
              onChange={(e) => handleDateOrTimeChange(e.target.value, timeValue)}
              disabled={isBusy}
            />
          </div>
          <div>
            <CustomInput
              label=""
              type="time"
              value={timeValue}
              onChange={(e) => handleDateOrTimeChange(dateValue, e.target.value)}
              disabled={isBusy}
            />
          </div>
        </div>

        {/* Quick Hourly Presets (12:00 to 20:00) */}
        <div className="space-y-1 pt-0.5">
          <span className="block text-[10px] font-medium text-slate-400">Quick Kickoff:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {HOURLY_KICKOFF_PRESETS.map((time) => (
              <button
                key={time}
                type="button"
                disabled={isBusy}
                onClick={() => handleDateOrTimeChange(dateValue, time)}
                className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                  timeValue === time
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {errors.matchDate?.message && (
          <p className="text-[11px] font-medium text-rose-500">{errors.matchDate.message}</p>
        )}
      </div>

      {/* Stadium Input */}
      <CustomInput
        label="Stadium"
        placeHolder="e.g. Wembley Stadium"
        disabled={isBusy}
        error={errors.stadium?.message}
        {...register("stadium")}
      />

      {/* Status & Match Type */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">Status</label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <CustomSelect
                options={MATCH_STATUS_FORM_OPTIONS}
                value={field.value}
                placeholder="Select status"
                onSelect={(val) => field.onChange(val as MatchStatus)}
                disabled={isBusy}
                error={errors.status?.message}
              />
            )}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">Match Type</label>
          <Controller
            name="matchType"
            control={control}
            render={({ field }) => (
              <CustomSelect
                options={MATCH_TYPE_FORM_OPTIONS}
                value={field.value}
                placeholder="Select type"
                onSelect={(val) => field.onChange(val as MatchType)}
                disabled={isBusy}
                error={errors.matchType?.message}
              />
            )}
          />
        </div>
      </div>

      {/* Modal Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isBusy}
          className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isBusy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 transition"
        >
          {isBusy && <Spinner className="h-3.5 w-3.5" />}
          {isBusy ? "Saving..." : match ? "Save changes" : "Create"}
        </button>
      </div>
    </form>
  );
}

type MatchModalProps = {
  modal: "CREATE" | "UPDATE" | "DELETE" | null;
  selectedMatch?: MatchDTO;
  onClose: () => void;
};

export default function MatchModal({ modal, selectedMatch, onClose }: MatchModalProps) {
  return (
    <Modal isOpen={modal === "CREATE" || modal === "UPDATE"} onClose={onClose}>
      {modal === "CREATE" && <MatchForm onClose={onClose} title="Create Match" />}
      {modal === "UPDATE" && selectedMatch && (
        <MatchForm match={selectedMatch} onClose={onClose} title="Edit Match" />
      )}
    </Modal>
  );
}