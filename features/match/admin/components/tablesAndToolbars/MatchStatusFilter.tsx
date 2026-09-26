"use client";

import { CustomSelect } from "@/features/shared/components/CustomComponents";
import { MatchStatus } from "../../../utils/match.types";
import { useMatchParams } from "../../../utils/useMatchParams";

const STATUS_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: "All Statuses", value: "ALL" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Live", value: "LIVE" },
  { label: "Finished", value: "FINISHED" },
  { label: "Postponed", value: "POSTPONED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Abandoned", value: "ABANDONED" },
  { label: "Suspended", value: "SUSPENDED" },
];

export function MatchStatusFilter() {
  const { filters, setFilter } = useMatchParams();

  return (
    <div className="w-40">
      <CustomSelect
        options={STATUS_FILTER_OPTIONS}
        value={filters.status || "ALL"}
        placeholder="Filter status"
        onSelect={(val) => setFilter("status", val)}
      />
    </div>
  );
}