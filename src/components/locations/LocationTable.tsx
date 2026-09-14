'use client';


import { DataTable } from "../tables/data-table";
import { useNavigate } from "react-router";
import { Location } from "../../interfaces/location";
import { LocationColumns } from "../columns/LocationColumns";
import { locationApi } from "../../api/locationApi";
import { toast } from "react-toastify";
import ConfirmModal from "../common/ConfirmModal";
import LocationDetailDrawer from "./LocationDetailDrawer";
import { useState } from "react";

export default function LocationTable({
  locations,
  setlocations
}: {
  locations: Location[];
  setlocations: React.Dispatch<React.SetStateAction<Location[]>>;
}) {
  //   const { data, error, isLoading, mutate } = useUsers();
  const navigate = useNavigate();

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
      setlocations((prev) =>
        prev.filter((b) => b.id !== deleteTarget.id)
      );

      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message || "Delete failed!");
    }
  };

  const handleEditlocation = async (location: Location) => {
    navigate(`/locations/edit/${location.id}`);
  }

  return (
    <>
      <div className="overflow-x-auto w-full">
        <DataTable
          data={locations}
          columns={LocationColumns(handleEditlocation, handleDeleteClick)}
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

      {/* <ConfirmModal
        isOpen={notificationModalOpen}
        title="Notification"
        message={`There ${pluralize(expiredlocationCount || 0, "is", "are")} ${expiredlocationCount} ${pluralize(expiredlocationCount||0, "location", "locations")} 
        which ${pluralize(expiredlocationCount||0, "is", "are")} already expired and about to be moved to recycle bin, 
        you can recheck them later!`
        }
        confirmText="Check"
        cancelText="Close"
        type="info"
        onConfirm={confirmDelete}
        onCancel={() => {
          setnotificationModalOpen(false);
        }}
      /> */}
    </>
  );
}
