import { ModeratorShell } from "@/features/match/moderator/layout/ModeratorShell";

export default function ModeratorLayout({ children }: { children: React.ReactNode }) {
  return <ModeratorShell>{children}</ModeratorShell>;
}