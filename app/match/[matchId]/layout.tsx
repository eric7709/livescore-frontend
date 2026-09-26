import MatchCard from "@/features/match/user/components/viewMatchCard/MatchCard";
import MatchTabs from "@/features/match/user/components/viewMatchCard/MatchTabs";
import type { ReactNode } from "react";

export default function MatchLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,#f5faf7_0%,#eef3f1_42%,#e8eeeb_100%)] px-3 py-4 sm:px-5 sm:py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <MatchCard />
      <MatchTabs />
        <div>{children}</div>
      </div>
    </div>
  );
}