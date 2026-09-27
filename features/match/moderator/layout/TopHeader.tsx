"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronRight, Search, Bell } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { NAV_ITEMS } from "./nav";

function useCurrentPage() {
  const pathname = usePathname();
  const item = [...NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find(
      (nav) => pathname === nav.href || pathname.startsWith(`${nav.href}/`)
    );

  let sub: string | null = null;
  if (item && pathname.startsWith(`${item.href}/`)) {
    const rest = pathname.slice(item.href.length + 1);
    if (rest) sub = rest.split("/")[0];
  }

  return {
    label: item?.label ?? "Moderator",
    href: item?.href ?? "/moderator",
    sub,
    isRoot: !item || pathname === item.href,
  };
}

interface TopHeaderProps {
  onMenuClick: () => void;
}

export function TopHeader({ onMenuClick }: TopHeaderProps) {
  const { label, href, sub, isRoot } = useCurrentPage();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-gray-200 bg-white/90 px-3 backdrop-blur-md sm:px-5">
      {/* Mobile menu */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="-ml-1 rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 flex-1 items-center gap-1 text-sm"
      >
        {/* Root crumb (hidden on mobile) */}
        <Link
          href="/moderator"
          className="hidden shrink-0 rounded-md px-1.5 py-1 font-medium text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 sm:inline"
        >
          Moderator
        </Link>

        {!isRoot && (
          <>
            <ChevronRight
              className="hidden h-3.5 w-3.5 shrink-0 text-gray-300 sm:block"
              aria-hidden
            />

            {/* Parent crumb — clickable if we have a sub, plain if it's the current page */}
            {sub ? (
              <Link
                href={href}
                className="hidden shrink-0 rounded-md px-1.5 py-1 font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:inline"
              >
                {label}
              </Link>
            ) : (
              <span className="hidden shrink-0 px-1.5 py-1 font-semibold text-gray-900 sm:inline">
                {label}
              </span>
            )}
          </>
        )}

        {/* Sub crumb (deep pages) */}
        {sub && (
          <>
            <ChevronRight
              className="hidden h-3.5 w-3.5 shrink-0 text-gray-300 sm:block"
              aria-hidden
            />
          </>
        )}

        {/* Mobile: single-line fallback */}
        <span className="truncate font-semibold text-gray-900 sm:hidden">
          {sub ? `Match ID: ${sub}` : isRoot ? "Moderator" : label}
        </span>
      </nav>

      {/* Right cluster */}
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          aria-label="Search"
          className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <Search className="h-4 w-4" />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#F0454B] ring-2 ring-white" />
        </button>

        <span className="mx-1 hidden h-5 w-px bg-gray-200 sm:block" aria-hidden />

        <UserMenu />
      </div>
    </header>
  );
}