'use client';

import { DataTable } from "../tables/data-table";
import { useNavigate } from "react-router";
import { Location } from "../../interfaces/location";
import { LocationColumns } from "../columns/LocationColumns";
import { locationApi } from "../../api/locationApi";
import { usePaginatedLocations, LocationStats } from "../../hooks/useLocations";
import { toast } from "react-toastify";
import ConfirmModal from "../common/ConfirmModal";
import LocationDetailDrawer from "./LocationDetailDrawer";
import { useEffect, useState } from "react";

export default function LocationTable({
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
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [snapshotId, setSnapshotId] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  const requestedOffset = (currentPage - 1) * itemsPerPage;
  const swr = usePaginatedLocations({
    limit: itemsPerPage,
    offset: requestedOffset,
    search: searchQuery.trim() || undefined,
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
  }, [swr.stats, isLoading]);

  const locations = propLocations !== undefined ? propLocations : localLocations;
  const setlocations = propSetLocations || setLocalLocations;

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);

  const handleDeleteClick = (location: Location) => {
    setDeleteTarget(location);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const data = await locationApi.delete(deleteTarget.id);
      toast.success(data.message);
      setlocations((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      swr.mutate();
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message || "Delete failed!");
    }
  };

  const handleEditlocation = async (location: Location) => {
    navigate(`/locations/edit/${location.id}`);
  };

  const handleExportPDF = async (search?: string) => {
    try {
      toast.info("Generating PDF report...");
      const blob = await locationApi.exportPdf(search);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "locations.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("PDF exported successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to export PDF");
    }
  };

  const totalEntries = swr.pagination?.total ?? locations.length;
  const totalPages = Math.max(1, swr.pagination?.total_pages ?? 1);
  const isCurrentPageData =
    swr.pagination?.offset === requestedOffset && swr.pagination?.limit === itemsPerPage;
  const isPageLoading = swr.isValidating && !isCurrentPageData;

  return (
    <>
      <div className="overflow-x-auto w-full">
        <DataTable
          data={locations}
          isLoading={isLoading}
          columns={LocationColumns(handleEditlocation, handleDeleteClick)}
          onExportPDF={handleExportPDF}
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
            <LocationDetailDrawer location={location} onClose={onClose} />
          )}
        />
      </div>
      <ConfirmModal
        isOpen={deleteOpen}
        title="Delete location"
        message={`Are you sure you want to delete "${deleteTarget?.location_name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}
