import Image from "next/image";
import { ProfileResponseDTO, PreferredFoot } from "../../utils/profile.types";

interface PageHeaderProps {
  player: ProfileResponseDTO;
}

function formatDob(dateOfBirth: string): string {
  return new Date(dateOfBirth).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }
  return age;
}

function formatFoot(foot: PreferredFoot): string {
  switch (foot) {
    case "LEFT":
      return "Left";
    case "RIGHT":
      return "Right";
    case "BOTH":
      return "Both";
  }
}

function StatBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 sm:items-start">
      <span className="text-[11px] font-semibold tracking-wide text-slate-500">
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-900">{children}</span>
    </div>
  );
}

export default function PageHeader({ player }: PageHeaderProps) {
  const isManager = player.role === "MANAGER";

  return (
    <section
      className={`border-b bg-white ${
        isManager ? "border-indigo-100" : "border-slate-200"
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-8 text-center sm:flex-row sm:items-center sm:text-left">
        <div
          className={`relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-4 sm:h-32 sm:w-32 ${
            isManager ? "ring-indigo-100" : "ring-slate-100"
          }`}
        >
          {player.avatarUrl && (
            <Image
              src={player.avatarUrl}
              alt={player.fullName}
              fill
              sizes="128px"
              className="object-cover"
              priority
            />
          )}
        </div>

        <div className="flex flex-1 flex-col items-center gap-5 sm:items-start">
          <div className="flex flex-col items-center sm:items-start">
            <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
              {player.fullName}
            </h1>

            {isManager ? (
              <span className="mt-1 inline-flex rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                Manager
              </span>
            ) : (
              player.position && (
                <span className="mt-1 inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {player.position}
                </span>
              )
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
            <StatBlock label="DATE OF BIRTH">
              {player.dateOfBirth
                ? `${formatDob(player.dateOfBirth)} (${calculateAge(player.dateOfBirth)})`
                : "-"}
            </StatBlock>

            {isManager ? (
              <>
                <StatBlock label="TEAM">{player.teamName ?? "-"}</StatBlock>
                <StatBlock label="PHONE">{player.phoneNumber ?? "-"}</StatBlock>
              </>
            ) : (
              <>
                <StatBlock label="HEIGHT">
                  {player.height != null ? `${player.height} cm` : "-"}
                </StatBlock>
                <StatBlock label="PREFERRED FOOT">
                  {player.preferredFoot ? formatFoot(player.preferredFoot) : "-"}
                </StatBlock>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}