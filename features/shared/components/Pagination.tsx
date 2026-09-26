"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;      // 0-indexed
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void; // 0-indexed
    itemLabel?: string;       // e.g. "members", "results" — defaults to "items"
}

export default function Pagination({
    currentPage,
    pageSize,
    total,
    onPageChange,
    itemLabel = "items",
}: PaginationProps) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = currentPage + 1;
    const start = total === 0 ? 0 : currentPage * pageSize + 1;
    const end = Math.min((currentPage + 1) * pageSize, total);

    const canGoPrev = currentPage > 0;
    const canGoNext = currentPage < totalPages - 1;

    const pageNumbers = getPageNumbers(page, totalPages);

    return (
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
            <p className="text-xs text-gray-400">
                Showing{" "}
                <span className="font-medium text-gray-800">{start}–{end}</span>
                {" of "}
                <span className="font-medium text-gray-800">{total}</span>
                {" "}{itemLabel}
            </p>

            <div className="flex items-center gap-1.5">
                <NavButton onClick={() => onPageChange(currentPage - 1)} disabled={!canGoPrev} aria-label="Previous page">
                    <ChevronLeft size={14} />
                    <span>Prev</span>
                </NavButton>

                <div className="flex items-center gap-1">
                    {pageNumbers.map((p, i) =>
                        p === "..." ? (
                            <span key={`dot-${i}`} className="w-7 text-center text-xs text-gray-300">…</span>
                        ) : (
                            <button
                                key={p}
                                type="button"
                                onClick={() => onPageChange((p as number) - 1)}
                                className={`flex h-7 w-7 items-center justify-center rounded-lg border text-xs transition-colors
                                    ${p === page
                                        ? "border-gray-200 bg-gray-100 font-medium text-gray-900"
                                        : "border-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                                    }`}
                            >
                                {p}
                            </button>
                        )
                    )}
                </div>

                <NavButton onClick={() => onPageChange(currentPage + 1)} disabled={!canGoNext} aria-label="Next page">
                    <span>Next</span>
                    <ChevronRight size={14} />
                </NavButton>
            </div>
        </div>
    );
}

function NavButton({ onClick, disabled, children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="flex h-7 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-xs text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800 disabled:opacity-35 disabled:cursor-default"
            {...rest}
        >
            {children}
        </button>
    );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | "...")[] = [1];

    if (current > 3) pages.push("...");

    const start = Math.max(2, current - 1);
    const end   = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push("...");

    pages.push(total);
    return pages;
}