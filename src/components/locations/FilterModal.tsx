import { useTranslation } from "react-i18next";
import React, { useRef, useState } from "react";
import { X, FilterX, Search } from "lucide-react";
import { SpinnerIcon } from "../ui/button/ActionButton";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClear: () => unknown | Promise<unknown>;
  onSearch: () => unknown | Promise<unknown>;
  children: React.ReactNode;
  hasActiveFilters?: boolean;
}

export default function FilterModal({
  isOpen,
  onClose,
  onClear,
  onSearch,
  children,
  hasActiveFilters = false,
}: FilterModalProps) {
  const { t } = useTranslation();
  const [isSearching, setIsSearching] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const busyRef = useRef(false);

  const isBusy = isSearching || isClearing;

  const handleSearchClick = async () => {
    if (isBusy || busyRef.current) return;
    busyRef.current = true;
    setIsSearching(true);
    try {
      await Promise.resolve(onSearch());
    } finally {
      busyRef.current = false;
      setIsSearching(false);
    }
  };

  const handleClearClick = async () => {
    if (isBusy || busyRef.current) return;
    busyRef.current = true;
    setIsClearing(true);
    try {
      await Promise.resolve(onClear());
    } finally {
      busyRef.current = false;
      setIsClearing(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0 ${
        isOpen ? "visible opacity-100 pointer-events-auto" : "invisible opacity-0 pointer-events-none"
      } transition-all duration-200`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={() => !isBusy && onClose()}
      ></div>

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
          <h2 className="text-xl font-extrabold text-[#0f172a]">Advanced Filters</h2>
          <button
            type="button"
            disabled={isBusy}
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body - using overflow-visible to prevent datepicker clipping */}
        <div className="flex-1 overflow-visible p-8">{children}</div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center rounded-b-3xl">
          <button
            type="button"
            disabled={isBusy}
            onClick={handleClearClick}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${
              hasActiveFilters
                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            {isClearing ? <SpinnerIcon className="h-4 w-4" /> : <FilterX size={16} />}
            {t("Clear all filters")}
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={handleSearchClick}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#B88E2F] hover:bg-[#997524] text-white text-sm font-bold rounded-xl transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSearching ? <SpinnerIcon className="h-4 w-4 text-white" /> : <Search size={16} />}
            <span>{isSearching ? t("Searching...") : "Apply Filters"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
