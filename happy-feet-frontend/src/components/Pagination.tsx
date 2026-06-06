import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  itemsPerPage: number;
  setPage: (page: number) => void;
  setItemsPerPage: (size: number) => void;
  pageNumbers: number[];
  hasPrev: boolean;
  hasNext: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  itemsPerPage,
  setPage,
  setItemsPerPage,
  pageNumbers,
  hasPrev,
  hasNext,
}) => {
  return (
    <div className="p-5 border-t bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-slate-500">
        Page {page} of {totalPages}
      </div>

      <div className="flex items-center gap-3">
        {/* Items per page selector */}
        <select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          className="border border-slate-200 rounded-2xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#7f1d1d] focus:outline-none"
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n} per page
            </option>
          ))}
        </select>

        {/* Pagination Controls */}
        <div className="flex items-center gap-1">
          <button
            disabled={!hasPrev}
            onClick={() => setPage(page - 1)}
            className="p-3 border border-slate-200 rounded-2xl hover:bg-white disabled:opacity-50 transition-all"
          >
            <ChevronLeft size={20} />
          </button>

          {pageNumbers.map((p, i) =>
            p < 0 ? (
              <span key={i} className="px-4 text-slate-400 font-medium">⋯</span>
            ) : (
              <button
                key={i}
                onClick={() => setPage(p)}
                className={`min-w-[40px] h-10 flex items-center justify-center rounded-2xl font-medium transition-all ${
                  p === page
                    ? 'bg-[#7f1d1d] text-white shadow-sm'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            disabled={!hasNext}
            onClick={() => setPage(page + 1)}
            className="p-3 border border-slate-200 rounded-2xl hover:bg-white disabled:opacity-50 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};