import Link from "next/link";
import { Activity } from "lucide-react";
import { teko } from "@/public/fonts/fonts";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs sm:h-9 sm:w-9">
        <Activity size={18} className="sm:hidden" />
        <Activity size={20} className="hidden sm:block" />
      </div>
      <span className={`${teko.className} text-2xl font-bold uppercase tracking-wider text-slate-900 sm:text-3xl`}>
        Kick<span className="text-emerald-600">Pulse</span>
      </span>
    </Link>
  );
}