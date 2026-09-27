"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Trophy,
  Users,
  UserCircle,
  Swords,
  ChevronRight,
  Settings,
  LogOut,
  ArrowLeftRight,
} from "lucide-react";
import Logo from "./Logo";

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  highlight?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { name: "Matches", href: "/admin/matches", icon: Swords },
  {
    name: "Competitions",
    href: "/admin/competitions",
    icon: Trophy,
    highlight: true,
  },
  { name: "Teams", href: "/admin/teams", icon: Users },
  { name: "Profiles", href: "/admin/profiles", icon: UserCircle },
  { name: "Transfer", href: "/admin/transfers", icon: ArrowLeftRight },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-linear-to-b from-[#071a12] via-[#0a2418] to-[#0d3020] flex flex-col select-none relative shadow-2xl border-r border-emerald-400/10">
      
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Header */}
      <div className="relative px-5 pt-6 pb-5 border-b border-emerald-400/10">
        <Logo variant="dark" subtitle="Admin Panel" href="/admin" />
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-emerald-400/10 text-white shadow-lg shadow-emerald-950/20"
                  : "text-white/55 hover:text-white hover:bg-emerald-400/5"
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <>
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-linear-to-b from-emerald-300 to-green-500 rounded-r-full shadow-lg shadow-emerald-500/40" />

                  <span className="absolute inset-0 rounded-xl bg-linear-to-r from-emerald-400/5 to-transparent pointer-events-none" />
                </>
              )}

              {/* Icon */}
              <span
                className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-linear-to-br from-emerald-400/20 to-green-500/20 text-emerald-300"
                    : "bg-white/5 text-white/45 group-hover:bg-emerald-400/10 group-hover:text-emerald-300"
                }`}
              >
                <Icon size={15} className="relative z-10" />

                {isActive && (
                  <span className="absolute inset-0 rounded-lg bg-emerald-400/10 blur-sm" />
                )}
              </span>

              {/* Label */}
              <span className="flex-1 text-left font-medium tracking-wide">
                {item.name}
              </span>

              {/* New badge */}
              {item.highlight && !isActive && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold leading-tight text-emerald-300 bg-emerald-500/15 border border-emerald-400/20">
                  NEW
                </span>
              )}

              {/* Chevron */}
              <ChevronRight
                size={14}
                className={`transition-all duration-200 ${
                  isActive
                    ? "opacity-100 translate-x-0 text-emerald-300/50"
                    : "opacity-0 -translate-x-2 text-white/20 group-hover:opacity-60 group-hover:translate-x-0"
                }`}
              />
            </Link>
          );
        })}

        {/* Divider */}
        <div className="my-4 border-t border-emerald-400/10" />

        {/* Settings */}
        <Link
          href="/admin/settings"
          className={`group w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-xl transition-all duration-200 ${
            pathname.startsWith("/admin/settings")
              ? "bg-emerald-400/10 text-white"
              : "text-white/40 hover:text-white hover:bg-emerald-400/5"
          }`}
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 text-white/40 group-hover:bg-emerald-400/10 group-hover:text-emerald-300 transition-all">
            <Settings size={15} />
          </span>

          <span className="flex-1 text-left font-medium">
            Settings
          </span>
        </Link>

        {/* Logout */}
        <button
          className="group w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-xl transition-all duration-200 text-white/30 hover:text-red-400 hover:bg-red-500/10"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 text-white/30 group-hover:bg-red-500/20 group-hover:text-red-400 transition-all">
            <LogOut size={15} />
          </span>

          <span className="flex-1 text-left font-medium">
            Logout
          </span>
        </button>
      </nav>
    </aside>
  );
}