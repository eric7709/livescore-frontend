"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  CalendarDays,
  BarChart3,
  Users,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Activity,
  Shield,
  MoreVertical,
} from "lucide-react";

import { useTeam } from "@/features/team/utils/team.api";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const pathname = usePathname();
  const params = useParams();

  const teamId = params.teamId as string;
  const numericTeamId = Number(teamId);

  const { data: team, isLoading: isTeamLoading } = useTeam(numericTeamId);

  const navItems = [
    {
      label: "Fixtures",
      description: "Upcoming matches",
      icon: CalendarDays,
      href: `/manager/${teamId}/fixtures`,
    },
    {
      label: "Results",
      description: "Match history",
      icon: BarChart3,
      href: `/manager/${teamId}/results`,
    },
    {
      label: "Players",
      description: "Squad management",
      icon: Users,
      href: `/manager/${teamId}/players`,
    },
  ];

  const getPageTitle = () => {
    const item = navItems.find(
      (item) =>
        pathname === item.href ||
        pathname?.startsWith(`${item.href}/`)
    );

    return item?.label || "Overview";
  };

  const getManagerInitials = () => {
    if (!team?.managerName) return "M";

    return team.managerName
      .split(" ")
      .filter(Boolean)
      .map((name) => name.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f5f8f6] text-slate-800">

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ========================================================= */}
      {/* SIDEBAR */}
      {/* ========================================================= */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-68 flex-col
          bg-linear-to-b from-[#071a12] via-[#0a2418] to-[#0d3020]
          border-r border-emerald-400/10
          shadow-2xl
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        {/* Background Pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        {/* ===================================================== */}
        {/* CLUB HEADER */}
        {/* ===================================================== */}

        <div className="relative border-b border-white/5 px-5 py-5">

          <div className="flex items-start justify-between">

            <Link
              href={`/manager/${teamId}`}
              onClick={() => setIsSidebarOpen(false)}
              className="flex min-w-0 items-center gap-3"
            >

              {/* Club Logo */}
              <div className="relative shrink-0">

                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-500/20">

                  {team?.logoUrl ? (
                    <img
                      src={team.logoUrl}
                      alt={team.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Shield
                      size={20}
                      className="text-white"
                    />
                  )}

                </div>

                {/* Online indicator */}
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#071a12] bg-emerald-300" />
              </div>

              {/* Club Details */}
              <div className="min-w-0">

                <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-300/50">
                  Club Manager
                </p>

                <h1 className="truncate text-sm font-bold tracking-tight text-white">
                  {isTeamLoading
                    ? "Loading..."
                    : team?.name || "Your Club"}
                </h1>

                {team?.teamCode && (
                  <p className="mt-0.5 text-[10px] font-medium text-white/35">
                    {team.teamCode}
                  </p>
                )}

              </div>
            </Link>

            {/* Mobile Close */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="rounded-lg p-1.5 text-white/30 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
            >
              <X size={18} />
            </button>

          </div>
        </div>

        {/* ===================================================== */}
        {/* NAVIGATION */}
        {/* ===================================================== */}

        <div className="relative flex-1 overflow-y-auto px-3 py-5">

          <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-white/25">
            Club Management
          </p>

          <nav className="space-y-1">

            {navItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                pathname === item.href ||
                pathname?.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    group relative flex w-full items-center gap-3
                    rounded-xl px-3 py-2.5
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-emerald-400/10 text-white"
                        : "text-white hover:bg-white/5 hover:text-white"
                    }
                  `}
                >

                  {/* Active bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-linear-to-b from-emerald-300 to-green-500 shadow-lg shadow-emerald-500/40" />
                  )}

                  {/* Icon */}
                  <span
                    className={`
                      flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
                      transition-all duration-200
                      ${
                        isActive
                          ? "bg-linear-to-br from-emerald-400/20 to-green-500/20 text-emerald-300"
                          : "bg-white/5 text-white/40 group-hover:bg-emerald-400/10 group-hover:text-emerald-300"
                      }
                    `}
                  >
                    <Icon size={16} />
                  </span>

                  {/* Text */}
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-xs font-semibold ${
                        isActive ? "text-white" : "text-white/60"
                      }`}
                    >
                      {item.label}
                    </span>

                    <span className="mt-0.5 block truncate text-[9px] text-white/25">
                      {item.description}
                    </span>
                  </span>

                  {/* Arrow */}
                  <ChevronRight
                    size={14}
                    className={`
                      transition-all duration-200
                      ${
                        isActive
                          ? "translate-x-0 text-emerald-300/50 opacity-100"
                          : "-translate-x-1 text-white/20 opacity-0 group-hover:translate-x-0 group-hover:opacity-70"
                      }
                    `}
                  />

                </Link>
              );
            })}

          </nav>

          {/* Divider */}
          <div className="my-5 border-t border-white/5" />

          {/* Club Status Card */}
          <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/5 p-3">

            <div className="flex items-center gap-2">

              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/10">
                <Activity
                  size={13}
                  className="text-emerald-300"
                />
              </div>

              <div>
                <p className="text-[10px] font-semibold text-white/70">
                  Club Status
                </p>

                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[9px] text-emerald-300/60">
                    Active
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ===================================================== */}
        {/* MANAGER PROFILE */}
        {/* ===================================================== */}

        <div className="relative border-t border-white/5 bg-black/10 p-3">

          <div className="flex items-center gap-3">

            {/* Avatar */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-green-600 text-[10px] font-bold text-white shadow-sm">
              {getManagerInitials()}
            </div>

            {/* Details */}
            <div className="min-w-0 flex-1">

              <p className="truncate text-xs font-semibold text-white">
                {team?.managerName || "Manager"}
              </p>

              <p className="mt-0.5 truncate text-[9px] text-white/35">
                Club Manager
              </p>

            </div>

            {/* More */}
            <button
              className="rounded-lg p-1.5 text-white/25 transition-colors hover:bg-white/5 hover:text-white"
              title="Account options"
            >
              <MoreVertical size={15} />
            </button>

          </div>

          {/* Logout */}
          <button
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[10px] font-medium text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={13} />
            Logout
          </button>

        </div>

      </aside>

      {/* ========================================================= */}
      {/* MAIN AREA */}
      {/* ========================================================= */}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-68">

        {/* ===================================================== */}
        {/* TOP HEADER */}
        {/* ===================================================== */}

        <header className="flex h-16 shrink-0 items-center justify-between border-b border-emerald-100 bg-white px-4 sm:px-7">

          <div className="flex items-center gap-3">

            {/* Mobile Menu */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg border border-emerald-100 p-2 text-gray-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={17} />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2">

              <div className="hidden sm:flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
                <Shield
                  size={13}
                  className="text-emerald-600"
                />
              </div>

              <span className="text-xs text-gray-400">
                {team?.name || "Club"}
              </span>

              <ChevronRight
                size={12}
                className="text-gray-300"
              />

              <span className="text-xs font-semibold text-gray-900">
                {getPageTitle()}
              </span>

            </div>
          </div>

          {/* Header Right */}
          <div className="flex items-center gap-3">

            {team?.stadium && (
              <div className="hidden md:block">
                <span className="text-[10px] text-gray-400">
                  {team.stadium}
                </span>
              </div>
            )}

            {team?.teamCode && (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1.5">
                <span className="text-[9px] font-bold tracking-wider text-emerald-600">
                  {team.teamCode}
                </span>
              </div>
            )}

          </div>

        </header>

        {/* ===================================================== */}
        {/* CONTENT */}
        {/* ===================================================== */}

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
}