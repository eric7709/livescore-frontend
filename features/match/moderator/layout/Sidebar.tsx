"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  ChevronRight,
  ChevronDown,
  Radio,
  type LucideIcon,
} from "lucide-react";
import { NAV_ITEMS } from "./nav";
import { useGetAllMatches } from "@/features/match/utils/match.api";
import Logo from "@/features/shared/components/Logo";

function isActive(pathname: string, href: string) {
  if (href === "/moderator") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* ── Live block ───────────────────────────────── */

function LiveBlock() {
  const { data } = useGetAllMatches(["LIVE"]);
  const liveCount =
    data?.reduce((sum, group) => sum + group.matches.length, 0) ?? 0;
  const isLive = liveCount > 0;

  return (
    <Link
      href="/moderator/matches?status=LIVE"
      className={`group relative mx-3 mb-4 flex items-center gap-3 overflow-hidden rounded-lg border px-3 py-2.5 transition-all ${
        isLive
          ? "border-[#F0454B]/25 bg-[#F0454B]/[0.06] hover:border-[#F0454B]/40 hover:bg-[#F0454B]/[0.09]"
          : "border-[#262B33] bg-[#1A1E24] hover:border-[#2F8F5B]/30 hover:bg-[#1D232A]"
      }`}
    >
      {/* Icon tile */}
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors ${
          isLive
            ? "bg-[#F0454B]/15 text-[#F0454B]"
            : "bg-[#262B33] text-[#5A616B]"
        }`}
      >
        <Radio className="h-3.5 w-3.5" />
      </span>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
            isLive ? "text-[#F0454B]" : "text-[#5A616B]"
          }`}
        >
          {isLive ? "Live now" : "No live"}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-[#8B93A1]">
          {isLive
            ? `${liveCount} match${liveCount === 1 ? "" : "es"} in play`
            : "All quiet on the pitch"}
        </p>
      </div>

      {/* Count */}
      <span
        className={`shrink-0 font-mono text-lg font-medium tabular-nums transition-colors ${
          isLive ? "text-[#F5F6F7]" : "text-[#4A515B]"
        }`}
      >
        {liveCount}
      </span>

      {/* Live pulse in corner */}
      {isLive && (
        <span className="absolute right-1.5 top-1.5 flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F0454B] opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#F0454B]" />
        </span>
      )}
    </Link>
  );
}

/* ── Section ──────────────────────────────────── */

function Section({
  label,
  children,
  defaultOpen = true,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1 px-4 pb-1 pt-3 text-left"
      >
        <ChevronDown
          className={`h-3 w-3 text-[#4A515B] transition-transform duration-200 ${
            open ? "rotate-0" : "-rotate-90"
          }`}
          aria-hidden
        />
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4A515B]">
          {label}
        </span>
      </button>

      {open && <div className="space-y-0.5">{children}</div>}
    </div>
  );
}

/* ── Nav row ──────────────────────────────────── */

function NavRow({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`group relative mx-2 flex items-center gap-3 rounded-md py-2 pl-3 pr-2 text-sm transition-colors ${
        active
          ? "bg-[#1D232A] text-[#F5F6F7]"
          : "text-[#8B93A1] hover:bg-[#1A1E24] hover:text-[#F5F6F7]"
      }`}
    >
      {/* Left rail */}
      <span
        aria-hidden
        className={`absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full transition-colors ${
          active
            ? "bg-[#2F8F5B]"
            : "bg-transparent group-hover:bg-[#262B33]"
        }`}
      />

      <Icon
        className={`h-4 w-4 shrink-0 transition-colors ${
          active
            ? "text-[#2F8F5B]"
            : "text-[#5A616B] group-hover:text-[#8B93A1]"
        }`}
      />

      <span className="flex-1 truncate">{label}</span>

      <ChevronRight
        aria-hidden
        className={`h-3.5 w-3.5 shrink-0 transition-all ${
          active
            ? "translate-x-0 text-[#2F8F5B] opacity-100"
            : "-translate-x-1 text-[#8B93A1] opacity-0 group-hover:translate-x-0 group-hover:opacity-40"
        }`}
      />
    </Link>
  );
}

/* ── Sidebar content ──────────────────────────── */

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-[#15181D] text-[#8B93A1]">
      {/* Brand */}
      <div className="border-b border-[#1F242B] px-4 py-4">
        <Logo variant="dark" subtitle="Moderator" href="/moderator" />
      </div>

      {/* Live block */}
      <div className="pt-4">
        <LiveBlock />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto pb-3">
        <Section label="Manage">
          {NAV_ITEMS.map(({ label, href, icon }) => (
            <NavRow
              key={href}
              href={href}
              label={label}
              icon={icon}
              active={isActive(pathname, href)}
              onNavigate={onNavigate}
            />
          ))}
        </Section>
      </nav>

      {/* Footer */}
      <div className="border-t border-[#1F242B] px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#4A515B]">
            v1.0
          </p>
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-[#4A515B]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2F8F5B]" />
            Connected
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Root ─────────────────────────────────────── */

interface SidebarProps {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

export function Sidebar({ mobileOpen, onMobileOpenChange }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-60 shrink-0 md:block">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={() => onMobileOpenChange(false)}
            aria-hidden
          />

          <aside className="absolute left-0 top-0 h-full w-64 shadow-2xl">
            <button
              type="button"
              onClick={() => onMobileOpenChange(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-4 z-10 rounded-md p-1 text-[#8B93A1] transition-colors hover:bg-[#1F242B] hover:text-[#F5F6F7]"
            >
              <X className="h-4 w-4" />
            </button>

            <SidebarContent
              pathname={pathname}
              onNavigate={() => onMobileOpenChange(false)}
            />
          </aside>
        </div>
      )}
    </>
  );
}