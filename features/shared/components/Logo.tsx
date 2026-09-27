"use client";

import Link from "next/link";
import { scoreMono } from "@/public/fonts/fonts";

interface LogoProps {
  /** "light" (default) for the white header bar; "dark" for dark surfaces like the admin sidebar. */
  variant?: "light" | "dark";
  /** Small label under the wordmark — "Pro" on the public site, "Admin Panel" in the sidebar, etc. */
  subtitle?: string;
  href?: string;
}

export default function Logo({ variant = "light", subtitle = "Pro", href = "/" }: LogoProps) {
  const isDark = variant === "dark";

  return (
    <Link href={href} className="group flex items-center gap-3">
      {/* Mark: rounded badge with a scoreboard pulse trace + live dot */}
      <span
        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-[1.04] ${
          isDark
            ? "bg-linear-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-500/25"
            : "bg-[#14532D]"
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden>
          <path
            d="M3 13h3.2l2-5 3.6 10 2.4-7.5 1.6 2.5H21"
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Live dot */}
        <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
              isDark ? "bg-emerald-300" : "bg-[#C93B40]"
            }`}
          />
          <span
            className={`relative inline-flex h-2.5 w-2.5 rounded-full border-2 ${
              isDark ? "border-[#071a12] bg-emerald-300" : "border-white bg-[#C93B40]"
            }`}
          />
        </span>
      </span>

      {/* Wordmark */}
      <span className="flex flex-col leading-none">
        <span
          className={`text-[15px] font-bold tracking-tight sm:text-[16px] ${
            isDark ? "text-white" : "text-[#14181C]"
          }`}
        >
          Live<span className={isDark ? "text-emerald-300" : "text-[#14532D]"}>Score</span>
        </span>
        <span
          className={`${scoreMono.className} mt-0.5 text-[8px] font-bold uppercase tracking-[0.3em] ${
            isDark ? "text-emerald-300/50" : "text-[#8B9388]"
          }`}
        >
          {subtitle}
        </span>
      </span>
    </Link>
  );
}