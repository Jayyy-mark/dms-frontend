import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  ChevronDown,
  ChevronUp,
  Filter
} from "lucide-react";

import { Category } from "../../interfaces/category";
import { categoryApi } from "../../api/categoryApi";
import { helper } from "../../helpers/utils";

export interface FilterState {
  sortBy: "recent" | "older" | "popular" | "alphabetical";
  docTypes: string[]; // "permanent", "temporary"
  statuses: string[]; // "active", "expired"
  staffIds: string[];
  categoryIds: number[];
}

export const initialFilterState: FilterState = {
  sortBy: "recent",
  docTypes: [],
  statuses: [],
  staffIds: [],
  categoryIds: [],
};

interface DocumentFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filterState: FilterState;
  onApplyFilter: (state: FilterState) => void;
  onClearFilter: () => void;
}

export default function DocumentFilterDrawer({
  isOpen,
  onClose,
  filterState,
  onApplyFilter,
  onClearFilter,
}: DocumentFilterDrawerProps) {
  const { t } = useTranslation();

  // Local draft state for persistent editing inside drawer
  const [draftState, setDraftState] = useState<FilterState>(filterState);

  // Sync draftState when drawer opens or filterState changes
  useEffect(() => {
    setDraftState(filterState);
  }, [filterState, isOpen]);

  // Categories & Staff Data
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [showMoreStaff, setShowMoreStaff] = useState(false);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<number[]>([]);

  useEffect(() => {
    categoryApi
      .all()
      .then((data) => setAllCategories(data.categories || []))
      .catch(console.error);

    helper
      .fetchStaffs()
      .then((data) => setStaffList(data || []))
      .catch(console.error);
  }, []);

  if (!isOpen) return null;

  // Toggle helpers
  const handleSortChange = (sortBy: FilterState["sortBy"]) => {
    setDraftState((prev) => ({ ...prev, sortBy }));
  };

  const toggleDocType = (type: string) => {
    setDraftState((prev) => {
      const exists = prev.docTypes.includes(type);
      return {
        ...prev,
        docTypes: exists
          ? prev.docTypes.filter((t) => t !== type)
          : [...prev.docTypes, type],
      };
    });
  };

  const toggleStatus = (status: string) => {
    setDraftState((prev) => {
      const exists = prev.statuses.includes(status);
      return {
        ...prev,
        statuses: exists
          ? prev.statuses.filter((s) => s !== status)
          : [...prev.statuses, status],
      };
    });
  };

  const toggleStaff = (staffId: string) => {
    setDraftState((prev) => {
      const exists = prev.staffIds.includes(staffId);
      return {
        ...prev,
        staffIds: exists
          ? prev.staffIds.filter((id) => id !== staffId)
          : [...prev.staffIds, staffId],
      };
    });
  };

  const toggleCategory = (catId: number) => {
    setDraftState((prev) => {
      const exists = prev.categoryIds.includes(catId);
      return {
        ...prev,
        categoryIds: exists
          ? prev.categoryIds.filter((id) => id !== catId)
          : [...prev.categoryIds, catId],
      };
    });
  };

  // User requirement for Category Tree:
  // "once parent category is open it will be auto select or select on checkbox will be selected, and only for category with no child will be select in one way via checking check box"
  const renderCategoryNode = (category: Category, level: number = 0) => {
    const children = allCategories.filter(
      (c) => c.parent_id === category.id?.toString() || c.parent?.id === category.id
    );
    const hasChildren = children.length > 0;
    const isChecked = draftState.categoryIds.includes(category.id);
    const isExpanded = expandedCategoryIds.includes(category.id);

    const handleExpandToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isExpanded) {
        setExpandedCategoryIds((prev) => prev.filter((id) => id !== category.id));
      } else {
        setExpandedCategoryIds((prev) => [...prev, category.id]);
        // Auto-select category when expanded
        if (!draftState.categoryIds.includes(category.id)) {
          toggleCategory(category.id);
        }
      }
    };

    return (
      <div
        key={category.id}
        className={`rounded-xl transition ${
          level === 0
            ? "border border-gray-100 bg-white mb-2.5 overflow-hidden shadow-2xs"
            : "mt-1.5"
        }`}
      >
        {/* Category Header Row */}
        <div
          className={`flex items-center justify-between p-3 transition-colors ${
            level === 0
              ? "bg-white"
              : "bg-gray-50/80 rounded-lg hover:bg-gray-100/70 border border-gray-100/60"
          }`}
          style={{ paddingLeft: level > 0 ? `${level * 16 + 12}px` : "12px" }}
        >
          <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-800 cursor-pointer select-none flex-1 min-w-0">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => {
                toggleCategory(category.id);
                if (hasChildren && !isExpanded) {
                  setExpandedCategoryIds((prev) => [...prev, category.id]);
                }
              }}
              className="w-4 h-4 rounded border-gray-300 text-[#B88E2F] focus:ring-[#B88E2F] cursor-pointer shrink-0"
            />
            <span className={`truncate ${level === 0 ? "font-extrabold text-gray-900" : "text-gray-700"}`}>
              {category.category_name}
            </span>
          </label>

          {hasChildren && (
            <button
              type="button"
              onClick={handleExpandToggle}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 rounded-lg transition shrink-0 ml-1"
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>

        {/* Child Subcategories Recursion */}
        {hasChildren && isExpanded && (
          <div className={`space-y-1 ${level === 0 ? "p-3 bg-gray-50/50 border-t border-gray-100" : "pt-1"}`}>
            {children.map((child) => renderCategoryNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleApply = () => {
    onApplyFilter(draftState);
    onClose();
  };

  const handleClear = () => {
    setDraftState(initialFilterState);
    setExpandedCategoryIds([]);
    onClearFilter();
    onClose();
  };

  // Top level categories (parent_id is null/empty or parent object is missing)
  const parentCategories = allCategories.filter((c) => !c.parent_id && !c.parent);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Right Offcanvas Panel */}
      <div className="fixed top-0 right-0 h-full w-[420px] max-w-[92vw] bg-[#f8fafc] shadow-2xl z-50 overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
          <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <Filter size={18} className="text-[#B88E2F]" />
            {t("Filter")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body Content with Cards */}
        <div className="p-6 space-y-5 flex-1">
          {/* SECTION 1: SORTING */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-3">
            <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">
              {t("Sorting")}
            </h4>
            <div className="grid grid-cols-2 gap-3 pt-1">
              {[
                { id: "recent", label: t("Default (Recent Created)") },
                { id: "older", label: t("Show Older First") },
                { id: "popular", label: t("Most Viewed / Popular") },
                { id: "alphabetical", label: t("Alphabetical (A-Z)") },
              ].map((opt) => {
                const isSelected = draftState.sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSortChange(opt.id as any)}
                    className="flex items-center gap-2 text-[12.5px] font-semibold text-gray-700 hover:text-gray-900 cursor-pointer text-left"
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                        isSelected
                          ? "border-[#B88E2F] bg-white ring-2 ring-[#B88E2F]/20"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-[#B88E2F]" />}
                    </div>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: DOCUMENT TYPE */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-3">
            <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">
              {t("Document Type")}
            </h4>
            <div className="grid grid-cols-2 gap-3 pt-1">
              {[
                { id: "permanent", label: t("Permanent") },
                { id: "temporary", label: t("Temporary") },
              ].map((opt) => {
                const isChecked = draftState.docTypes.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className="flex items-center gap-2.5 text-[13px] font-semibold text-gray-700 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleDocType(opt.id)}
                      className="w-4 h-4 rounded border-gray-300 text-[#B88E2F] focus:ring-[#B88E2F] cursor-pointer"
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: STATUS */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-3">
            <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">
              {t("Status")}
            </h4>
            <div className="grid grid-cols-2 gap-3 pt-1">
              {[
                { id: "active", label: t("Active") },
                { id: "expired", label: t("Expired") },
              ].map((opt) => {
                const isChecked = draftState.statuses.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className="flex items-center gap-2.5 text-[13px] font-semibold text-gray-700 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleStatus(opt.id)}
                      className="w-4 h-4 rounded border-gray-300 text-[#B88E2F] focus:ring-[#B88E2F] cursor-pointer"
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: STAFF / PERSONNEL */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-3">
            <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">
              {t("Staff Member")}
            </h4>
            <div className="grid grid-cols-2 gap-3 pt-1">
              {(showMoreStaff ? staffList : staffList.slice(0, 6)).map((staff) => {
                const idStr = String(staff.id);
                const isChecked = draftState.staffIds.includes(idStr);
                return (
                  <label
                    key={staff.id}
                    className="flex items-center gap-2.5 text-[12.5px] font-semibold text-gray-700 cursor-pointer select-none truncate"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleStaff(idStr)}
                      className="w-4 h-4 rounded border-gray-300 text-[#B88E2F] focus:ring-[#B88E2F] cursor-pointer shrink-0"
                    />
                    <span className="truncate">{staff.staff_name || staff.name}</span>
                  </label>
                );
              })}
            </div>

            {staffList.length > 6 && (
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setShowMoreStaff(!showMoreStaff)}
                  className="text-xs font-bold text-[#B88E2F] hover:text-[#997524] transition cursor-pointer"
                >
                  {showMoreStaff ? t("See Less") : t("See More")}
                </button>
              </div>
            )}
          </div>

          {/* SECTION 5: RECURSIVE N-LEVEL CATEGORY TREE */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-3">
            <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">
              {t("Category")}
            </h4>

            <div className="space-y-1 pt-1">
              {parentCategories.map((parent) => renderCategoryNode(parent, 0))}
            </div>
          </div>
        </div>

        {/* Footer Actions (Matching Screenshots) */}
        <div className="p-4 bg-white border-t border-gray-200 sticky bottom-0 z-10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition text-center"
          >
            {t("Clear Filter")}
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-2.5 bg-[#B88E2F] hover:bg-[#997524] text-white text-xs font-bold rounded-xl transition shadow-md text-center"
          >
            {t("Apply")}
          </button>
        </div>
      </div>
    </div>
  );
}
