"use client";

import Link from "next/link";
import { teko, inter, scoreMono } from "@/public/fonts/fonts";
import { Shield, ChevronRight } from "lucide-react";

interface TeamBadgeProps {
  id: number | string;
  name: string;
  crestUrl?: string;
  shortCode?: string;
}

export default function TeamBadge({ id, name, crestUrl, shortCode }: TeamBadgeProps) {
  return (
    <Link
      href={`/team/${id}`}
      className={`${inter.variable} group relative flex items-center justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-md active:translate-y-0`}
    >
      {/* Background Accent Mesh */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl transition-all duration-300 group-hover:bg-emerald-500/10" />

      {/* Left Content: Crest & Team Info */}
      <div className="flex items-center gap-4 z-10 min-w-0">
        {/* Crest Container */}
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50 p-2 shadow-2xs transition-transform duration-200 group-hover:scale-105 group-hover:border-emerald-500/30">
          {crestUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={crestUrl}
              alt={`${name} crest`}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <Shield size={24} />
            </div>
          )}
        </div>

        {/* Team Details */}
        <div className="min-w-0">
          {shortCode && (
            <span className={`${scoreMono.className} text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-emerald-600 transition-colors`}>
              {shortCode}
            </span>
          )}
          <h3 className={`${teko.className} truncate text-2xl font-bold uppercase leading-none tracking-wide text-slate-800 transition-colors group-hover:text-slate-900 md:text-3xl`}>
            {name}
          </h3>
        </div>
      </div>

      {/* Right Arrow Icon */}
      <div className="z-10 ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-all duration-200 group-hover:bg-emerald-50 group-hover:text-emerald-600">
        <ChevronRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}