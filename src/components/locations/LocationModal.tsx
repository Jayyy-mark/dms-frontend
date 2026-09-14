
import {
  GoogleMap,
  Marker,
  useJsApiLoader
} from "@react-google-maps/api";
import { useState } from "react";
import { X } from "lucide-react";
import { t } from "i18next";

interface LocationModalProps {
  onClose: () => void;
  onSelect: (position: { lat: string; lng: string }) => void;
}

function LocationModal({ onClose, onSelect }: LocationModalProps) {
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_KEY || ""
  });

  const center = {
    lat: 16.8409,
    lng: 96.1735
  };

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    const latLng = event.latLng;
    if (!latLng) return;

    setMarker({
      lat: latLng.lat(),
      lng: latLng.lng()
    });
  };

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        Loading Map...
      </div>
    );
  }

  const format = (value: number) => value.toFixed(6);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-lg dark:bg-gray-900 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Select Location
          </h3>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Map */}
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "500px" }}
          center={center}
          zoom={13}
          onClick={handleMapClick}
        >
          {marker && (
            <Marker
              position={marker}
              draggable
              onDragEnd={(e) => {
                const latLng = e.latLng;
                if (!latLng) return;

                setMarker({
                  lat: latLng.lat(),
                  lng: latLng.lng()
                });
              }}
            />
          )}
        </GoogleMap>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t px-6 py-4 dark:border-gray-800">

          <button onClick={onClose}>
            {t("Cancel")}
          </button>

          <button
            disabled={!marker}
            onClick={() => {
              if (!marker) return;

              onSelect({
                lat: format(marker.lat),
                lng: format(marker.lng)
              });

              onClose();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Add Location
          </button>

        </div>
      </div>
    </div>
  );
}

export default LocationModal;