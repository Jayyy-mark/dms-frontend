import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export interface ServerPaginationMeta {
    total: number;
    limit: number;
    offset: number;
    page: number;
    total_pages: number;
    remaining: number;
    remaining_pages: number;
    has_next: boolean;
    has_previous: boolean;
    snapshot_id: number;
}

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export const getPageNumbers = (current: number, total: number): (number | "ellipsis")[] => {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    if (start > 2) pages.push("ellipsis");
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < total - 1) pages.push("ellipsis");

    pages.push(total);
    return pages;
};

interface ServerPaginationBarProps {
    currentPage: number;
    itemsPerPage: number;
    totalEntries: number;
    totalPages: number;
    remainingEntries?: number;
    remainingPages?: number;
    currentCount: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (limit: number) => void;
    className?: string;
}

export default function ServerPaginationBar({
    currentPage,
    itemsPerPage,
    totalEntries,
    totalPages,
    remainingEntries: propRemaining,
    remainingPages: propRemainingPages,
    currentCount,
    onPageChange,
    onItemsPerPageChange,
    className = "mt-4 rounded-xl border border-gray-200 shadow-sm",
}: ServerPaginationBarProps) {
    const safeTotalPages = Math.max(1, totalPages);
    const showingFrom = totalEntries > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const showingTo = totalEntries > 0 ? Math.min((currentPage - 1) * itemsPerPage + currentCount, totalEntries) : 0;
    const remainingEntries = propRemaining ?? Math.max(totalEntries - showingTo, 0);
    const remainingPages = propRemainingPages ?? Math.max(safeTotalPages - currentPage, 0);

    const pageNumbers = getPageNumbers(currentPage, safeTotalPages);

    const goToPage = (page: number) => {
        const clamped = Math.max(1, Math.min(page, safeTotalPages));
        if (clamped !== currentPage) {
            onPageChange(clamped);
        }
    };

    return (
        <div className={`flex flex-col lg:flex-row items-center justify-between px-6 py-4 bg-white gap-4 ${className}`}>
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-500">
                    <span>Show</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                        className="rounded border border-gray-200 px-2 py-1 focus:ring-[#B88E2F] focus:border-[#B88E2F] outline-none bg-white transition-all hover:border-gray-300 cursor-pointer"
                    >
                        {PAGE_SIZE_OPTIONS.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                    <span>entries</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 text-[13px] font-semibold text-gray-700">
                    <p>
                        Showing {showingFrom.toLocaleString()} to {showingTo.toLocaleString()} of {totalEntries.toLocaleString()} entries
                    </p>
                    <p className="text-[11px] font-semibold text-gray-400">
                        Page {currentPage} of {safeTotalPages}
                        {remainingEntries > 0
                            ? ` · ${remainingEntries.toLocaleString()} entries remaining in ${remainingPages} more page${remainingPages > 1 ? "s" : ""}`
                            : " · No more entries"}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-center w-full lg:w-auto">
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                        type="button"
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        title="First page"
                        className="rounded-l-md border border-gray-200 px-2 py-1.5 text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition"
                    >
                        <ChevronsLeft size={14} />
                    </button>
                    <button
                        type="button"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        title="Previous page"
                        className="border border-gray-200 px-2 py-1.5 text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition"
                    >
                        <ChevronLeft size={14} />
                    </button>
                    {pageNumbers.map((p, idx) =>
                        p === "ellipsis" ? (
                            <span
                                key={`ellipsis-${idx}`}
                                className="border border-gray-200 px-3 py-1.5 text-[13px] font-semibold text-gray-400 select-none"
                            >
                                …
                            </span>
                        ) : (
                            <button
                                type="button"
                                key={p}
                                onClick={() => goToPage(p)}
                                aria-current={p === currentPage ? "page" : undefined}
                                className={`border px-3 py-1.5 font-semibold text-[13px] transition ${
                                    p === currentPage
                                        ? "relative z-10 bg-[#B88E2F] border-[#B88E2F] text-white"
                                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                {p}
                            </button>
                        )
                    )}
                    <button
                        type="button"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage >= safeTotalPages}
                        title="Next page"
                        className="border border-gray-200 px-2 py-1.5 text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition"
                    >
                        <ChevronRight size={14} />
                    </button>
                    <button
                        type="button"
                        onClick={() => goToPage(safeTotalPages)}
                        disabled={currentPage >= safeTotalPages}
                        title="Last page"
                        className="rounded-r-md border border-gray-200 px-2 py-1.5 text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition"
                    >
                        <ChevronsRight size={14} />
                    </button>
                </nav>
            </div>
        </div>
    );
}

