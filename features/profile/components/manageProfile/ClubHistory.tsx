"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { ClubHistoryResponseDTO, Role, TransferType } from "../../utils/profile.types";

interface ClubHistoryProps {
  history: ClubHistoryResponseDTO[];
  /** When the profile is a MANAGER, the heading and columns adapt — a
   * manager's move history is still relevant, but "Appearances" is a
   * player-only stat and doesn't apply. */
  role?: Role;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Renders a club logo, falling back to a letter avatar if there's no URL
 * or the image fails to load — so a bad/missing logo never blanks out
 * the club name sitting next to it.
 */
function ClubLogo({
  logoUrl,
  name,
  size = 24,
}: {
  logoUrl: string | null;
  name: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  if (!logoUrl || failed) {
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500"
        style={{ width: size, height: size }}
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={name}
      width={size}
      height={size}
      className="shrink-0 rounded-full object-contain"
      onError={() => setFailed(true)}
    />
  );
}

function TypeBadge({ type }: { type: TransferType }) {
  const styles: Record<TransferType, string> = {
    TRANSFER: "bg-slate-100 text-slate-700",
    LOAN: "bg-blue-100 text-blue-700",
    FREE: "bg-emerald-100 text-emerald-700",
  };

  const labels: Record<TransferType, string> = {
    TRANSFER: "Transfer (Purchase)",
    LOAN: "Loan",
    FREE: "Free Transfer",
  };

  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${styles[type]}`}
    >
      {labels[type]}
    </span>
  );
}

export default function ClubHistory({ history, role }: ClubHistoryProps) {
  const isManager = role === "MANAGER";
  const columnCount = isManager ? 5 : 6;

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-center gap-2">
        <ArrowLeftRight className="h-5 w-5 text-slate-700" />
        <h2 className="text-sm font-bold text-slate-900">
          {isManager ? "Career History" : "Club History"}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-160 border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2 pr-4 font-medium">Club</th>
              <th className="py-2 pr-4 font-medium">From</th>
              <th className="py-2 pr-4 font-medium">To</th>
              <th className="py-2 pr-4 font-medium">Fee</th>
              <th className="py-2 pr-4 font-medium">Type</th>
              {!isManager && (
                <th className="py-2 pr-4 text-right font-medium">Appearances</th>
              )}
            </tr>
          </thead>
          <tbody>
            {history.map((entry) => (
              <tr
                key={entry.id}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <ClubLogo logoUrl={entry.toClubLogoUrl} name={entry.toClubName} />
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">
                        {entry.toClubName}
                      </span>
                      {entry.fromClubName && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          from
                          <ClubLogo
                            logoUrl={entry.fromClubLogoUrl}
                            name={entry.fromClubName}
                            size={12}
                          />
                          {entry.fromClubName}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4 text-slate-600">
                  {formatDate(entry.from)}
                </td>
                <td className="py-3 pr-4 text-slate-600">
                  {entry.to ? formatDate(entry.to) : "-"}
                </td>
                <td className="py-3 pr-4 text-slate-600">
                  {entry.fee ?? entry.loanFeeLabel ?? "-"}
                </td>
                <td className="py-3 pr-4">
                  <TypeBadge type={entry.type} />
                </td>
                {!isManager && (
                  <td className="py-3 pr-4 text-right font-medium text-slate-900">
                    {entry.appearances}
                  </td>
                )}
              </tr>
            ))}

            {history.length === 0 && (
              <tr>
                <td colSpan={columnCount} className="py-6 text-center text-slate-400">
                  No {isManager ? "career" : "club"} history available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}