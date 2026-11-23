'use client';

import { DataTable } from "../tables/data-table";
import { Location } from "../../interfaces/location";
import { LocationColumns } from "../columns/LocationColumns";
import { locationApi } from "../../api/locationApi";
import { usePaginatedRecycledLocations, LocationStats } from "../../hooks/useLocations";
import { toast } from "react-toastify";
import ConfirmModal from "../common/ConfirmModal";
import LocationDetailDrawer from "./LocationDetailDrawer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Eye, RotateCcw, Trash2 } from "lucide-react";
import { API_SERVER } from "../../helpers/api";

const resolveMediaUrl = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_SERVER}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default function RecycleLocationTable({
  locations: propLocations,
  setlocations: propSetLocations,
  onStatsChange,
  isLoading: propIsLoading,
}: {
  locations?: Location[];
  setlocations?: React.Dispatch<React.SetStateAction<Location[]>>;
  onStatsChange?: (stats: LocationStats | undefined, isLoading: boolean) => void;
  isLoading?: boolean;
} = {}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [snapshotId, setSnapshotId] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const requestedOffset = (currentPage - 1) * itemsPerPage;
  const swr = usePaginatedRecycledLocations({
    limit: itemsPerPage,
    offset: requestedOffset,
    search: debouncedSearch || undefined,
    snapshot_id: currentPage > 1 ? snapshotId : undefined,
  });

  const isLoading = propIsLoading !== undefined ? propIsLoading : swr.isLoading;
  const [localLocations, setLocalLocations] = useState<Location[]>([]);

  useEffect(() => {
    if (propLocations !== undefined) {
      setLocalLocations(propLocations);
    } else if (swr.locations) {
      setLocalLocations(swr.locations);
    }
  }, [propLocations, swr.locations]);

  useEffect(() => {
    if (currentPage === 1 && swr.pagination?.snapshot_id) {
      setSnapshotId(swr.pagination.snapshot_id);
    }
  }, [currentPage, swr.pagination?.snapshot_id]);

  useEffect(() => {
    onStatsChange?.(swr.stats, isLoading);
  }, [swr.stats, isLoading, onStatsChange]);

  const locations = propLocations !== undefined ? propLocations : localLocations;
  const setlocations = propSetLocations || setLocalLocations;

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);
  const [openDropdown, setOpenDropdown] = useState<{
    id: number;
    top: number;
    right: number;
  } | null>(null);

  const closeDropdown = useCallback(() => {
    setOpenDropdown(null);
  }, []);

  const toggleDropdown = useCallback(
    (location: Location, e: React.MouseEvent<HTMLButtonElement>) => {
      const target = e.currentTarget;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow < 210 ? Math.max(8, rect.top - 196) : rect.bottom + 4;
      const right = Math.max(8, window.innerWidth - rect.right);

      setOpenDropdown((prev) =>
        prev?.id === location.id ? null : { id: location.id, top, right }
      );
    },
    []
  );

  useEffect(() => {
    if (!openDropdown) return;
    window.addEventListener("scroll", closeDropdown, true);
    window.addEventListener("resize", closeDropdown);
    return () => {
      window.removeEventListener("scroll", closeDropdown, true);
      window.removeEventListener("resize", closeDropdown);
    };
  }, [openDropdown, closeDropdown]);

  const getPrimaryPhoto = (location: Location) => {
    if (location.photo && typeof location.photo === "string") return location.photo;
    if (Array.isArray(location.photos) && location.photos[0]?.photo) {
      return location.photos[0].photo;
    }
    return "";
  };

  const handleViewLocation = (location: Location) => {
    closeDropdown();
    void locationApi.logView(location.id).catch(() => {});
    const primaryPhoto = getPrimaryPhoto(location);
    if (primaryPhoto) {
      window.open(resolveMediaUrl(primaryPhoto), "_blank");
    } else if (location.latitude && location.longitude) {
      window.open(
        `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
        "_blank"
      );
    } else {
      toast.info("No photo or map coordinates available for this location.");
    }
  };

  const handleDownloadLocation = (location: Location) => {
    closeDropdown();
    const primaryPhoto = getPrimaryPhoto(location);
    if (!primaryPhoto) {
      toast.info("No photo available to download for this location.");
      return;
    }
    const fullUrl = resolveMediaUrl(primaryPhoto);
    void locationApi.logDownload(location.id).catch(() => {});
    fetch(fullUrl)
      .then((response) => {
        if (!response.ok) throw new Error("Download failed");
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        const ext = primaryPhoto.split(".").pop() || "jpg";
        a.download = `${location.location_name || "download"}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch(() => window.open(fullUrl, "_blank"));
  };

  const adjustPageIfEmpty = (removedCount: number) => {
    if (currentPage > 1 && locations.length <= removedCount) {
      setCurrentPage((p) => Math.max(1, p - 1));
    }
  };

  const handleRestoreLocation = async (location: Location) => {
    closeDropdown();
    try {
      const data = await locationApi.restoreRecycle(location.id);
      toast.success(data?.message || `${location.location_name} has been restored!`);
      setlocations((prev) => prev.filter((l) => l.id !== location.id));
      adjustPageIfEmpty(1);
      swr.mutate();
    } catch (err: any) {
      toast.error(err?.message || "Restore failed!");
      throw err;
    }
  };

  const handleBulkRestore = async (selectedLocations: Location[]) => {
    if (selectedLocations.length === 0) return;

    const results = await Promise.allSettled(
      selectedLocations.map((loc) => locationApi.restoreRecycle(loc.id))
    );
    const restoredIds = new Set(
      selectedLocations
        .filter((_, idx) => results[idx].status === "fulfilled")
        .map((loc) => loc.id)
    );
    const failedCount = results.length - restoredIds.size;

    if (restoredIds.size > 0) {
      setlocations((prev) => prev.filter((loc) => !restoredIds.has(loc.id)));
      adjustPageIfEmpty(restoredIds.size);
      swr.mutate();
      toast.success(`${restoredIds.size} location(s) restored.`);
    }
    if (failedCount > 0) {
      toast.error(`Failed to restore ${failedCount} location(s).`);
    }
  };

  const handleDeleteClick = (location: Location) => {
    closeDropdown();
    setDeleteTarget(location);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const data = await locationApi.deleteRecycle(deleteTarget.id);
      toast.success(data.message);
      setlocations((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      adjustPageIfEmpty(1);
      swr.mutate();
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message || "Delete failed!");
    }
  };

  const handleBulkDelete = async (selectedLocations: Location[]) => {
    if (selectedLocations.length === 0) return;

    const results = await Promise.allSettled(
      selectedLocations.map((loc) => locationApi.deleteRecycle(loc.id))
    );
    const deletedIds = new Set(
      selectedLocations
        .filter((_, idx) => results[idx].status === "fulfilled")
        .map((loc) => loc.id)
    );
    const failedCount = results.length - deletedIds.size;

    if (deletedIds.size > 0) {
      setlocations((prev) => prev.filter((loc) => !deletedIds.has(loc.id)));
      adjustPageIfEmpty(deletedIds.size);
      swr.mutate();
      toast.success(`${deletedIds.size} location(s) permanently deleted.`);
    }
    if (failedCount > 0) {
      toast.error(`Failed to delete ${failedCount} location(s).`);
      if (deletedIds.size === 0) {
        throw new Error("Bulk delete failed");
      }
    }
  };

  const columns = useMemo(
    () => LocationColumns(toggleDropdown, { mode: "recycle", offset: requestedOffset }),
    [toggleDropdown, requestedOffset]
  );

  const totalEntries = swr.pagination?.total ?? locations.length;
  const totalPages = Math.max(1, swr.pagination?.total_pages ?? 1);
  const isCurrentPageData =
    swr.pagination?.offset === requestedOffset && swr.pagination?.limit === itemsPerPage;
  const isPageLoading = swr.isValidating && !isCurrentPageData;

  return (
    <>
      <DataTable
        data={locations}
        isLoading={isLoading}
        columns={columns}
        hideExportPDF
        onBulkRestore={handleBulkRestore}
        onBulkDelete={handleBulkDelete}
        serverPagination={{
          currentPage,
          itemsPerPage,
          totalEntries,
          totalPages,
          remainingEntries: swr.pagination?.remaining,
          remainingPages: swr.pagination?.remaining_pages,
          isPageLoading,
          searchValue: searchQuery,
          onSearchChange: (val) => {
            setSearchQuery(val);
            setCurrentPage(1);
            setSnapshotId(undefined);
          },
          onPageChange: (page) => setCurrentPage(page),
          onItemsPerPageChange: (limit) => {
            setItemsPerPage(limit);
            setCurrentPage(1);
            setSnapshotId(undefined);
          },
        }}
        renderDetailPanel={(location, onClose) => (
          <LocationDetailDrawer
            location={location}
            onClose={onClose}
            mode="recycle"
            onRestore={async (loc) => {
              await handleRestoreLocation(loc);
              onClose();
            }}
          />
        )}
      />

      {openDropdown && (() => {
        const activeLoc = locations.find((l) => l.id === openDropdown.id);
        if (!activeLoc) return null;
        return (
          <>
            <div className="fixed inset-0 z-40" onClick={closeDropdown} />
            <div
              className="fixed z-50 w-44 bg-white rounded-xl shadow-[0_8px_24px_-4px_rgba(0,0,0,0.15)] border border-gray-100 py-1.5"
              style={{ top: openDropdown.top, right: openDropdown.right }}
            >
              <button
                type="button"
                onClick={() => handleViewLocation(activeLoc)}
                className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors group/item"
              >
                <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] flex items-center justify-center group-hover/item:bg-blue-100 transition-colors">
                  <Eye size={14} className="text-[#B88E2F]" />
                </div>
                View
              </button>
              <button
                type="button"
                onClick={() => handleDownloadLocation(activeLoc)}
                className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors group/item"
              >
                <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center group-hover/item:bg-green-100 transition-colors">
                  <Download size={14} className="text-green-600" />
                </div>
                Download
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleRestoreLocation(activeLoc).catch(() => {});
                }}
                className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors group/item"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center group-hover/item:bg-emerald-100 transition-colors">
                  <RotateCcw size={14} className="text-emerald-600" />
                </div>
                Restore
              </button>
              <div className="h-px bg-gray-100 my-1 mx-3" />
              <button
                type="button"
                onClick={() => handleDeleteClick(activeLoc)}
                className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors group/item"
              >
                <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center group-hover/item:bg-red-100 transition-colors">
                  <Trash2 size={14} className="text-red-500" />
                </div>
                Delete
              </button>
            </div>
          </>
        );
      })()}

      <ConfirmModal
        isOpen={deleteOpen}
        title="Permanently delete location"
        message={`Are you sure you want to permanently delete "${deleteTarget?.location_name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}

