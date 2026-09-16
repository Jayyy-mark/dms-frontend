import { useState, useEffect, useRef, useCallback } from "react";
import { X, MapPin, Navigation, Globe, Check, HardDrive } from "lucide-react";
import { useTranslation } from "react-i18next";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LocationModalProps {
  onClose: () => void;
  onSelect: (position: { lat: string; lng: string }) => void;
  initialLat?: string | number;
  initialLng?: string | number;
}

// Major Myanmar cities and key oil/gas operation regions for quick offline navigation
const MYANMAR_CITIES = [
  { name: "Yangon (ရန်ကုန်)", lat: 16.8409, lng: 96.1735, zoom: 12 },
  { name: "Mandalay (မန္တလေး)", lat: 21.9588, lng: 96.0891, zoom: 12 },
  { name: "Naypyidaw (နေပြည်တော်)", lat: 19.7633, lng: 96.0785, zoom: 12 },
  { name: "Bago (ပဲခူး)", lat: 17.3221, lng: 96.4664, zoom: 12 },
  { name: "Magway (မကွေး)", lat: 20.1544, lng: 94.9455, zoom: 12 },
  { name: "Chauk [Oil Field] (ချောက်)", lat: 20.8986, lng: 94.8219, zoom: 12 },
  { name: "Yenangyaung [Oil Field] (ရေနံချောင်း)", lat: 20.4633, lng: 94.8778, zoom: 12 },
  { name: "Taunggyi (တောင်ကြီး)", lat: 20.7888, lng: 97.0378, zoom: 12 },
  { name: "Mawlamyine (မော်လမြိုင်)", lat: 16.4905, lng: 97.6283, zoom: 12 },
  { name: "Pathein (ပုသိမ်)", lat: 16.7792, lng: 94.7324, zoom: 12 },
  { name: "Monywa (မုံရွာ)", lat: 22.1086, lng: 95.1354, zoom: 12 },
  { name: "Sittwe (စစ်တွေ)", lat: 20.1528, lng: 92.8683, zoom: 12 },
  { name: "Myitkyina (မြစ်ကြီးနား)", lat: 25.3833, lng: 97.4000, zoom: 12 },
  { name: "Dawei (ထားဝယ်)", lat: 14.0828, lng: 98.1942, zoom: 12 },
  { name: "Pyay (ပြည်)", lat: 18.8242, lng: 95.2147, zoom: 12 },
];

// Custom vector map pin icon (crisp SVG, completely offline, no external assets)
const createCustomPin = () => {
  return L.divIcon({
    className: "moge-map-pin",
    html: `
      <div style="position: relative; width: 34px; height: 42px; transform: translate(-17px, -42px);">
        <svg viewBox="0 0 34 42" width="34" height="42" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));">
          <defs>
            <linearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#2563EB" />
              <stop offset="100%" stop-color="#1D4ED8" />
            </linearGradient>
          </defs>
          <path d="M17 0C7.6 0 0 7.6 0 17c0 12.8 17 25 17 25s17-12.2 17-25C34 7.6 26.4 0 17 0z" fill="url(#pinGrad)" stroke="#FFFFFF" stroke-width="2"/>
          <circle cx="17" cy="16" r="6" fill="#FFFFFF"/>
          <circle cx="17" cy="16" r="3" fill="#2563EB"/>
        </svg>
      </div>
    `,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
  });
};

// SVG fallback tile if an uncached coordinate is requested (in-memory data URI, zero network request)
const OFFLINE_FALLBACK_TILE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
      <rect width="256" height="256" fill="#F8FAFC"/>
      <path d="M0 0h256v256H0z" fill="none" stroke="#E2E8F0" stroke-width="1"/>
      <line x1="0" y1="0" x2="256" y2="256" stroke="#F1F5F9" stroke-width="1"/>
      <circle cx="128" cy="128" r="4" fill="#CBD5E1"/>
      <text x="128" y="145" text-anchor="middle" fill="#94A3B8" font-size="10" font-family="system-ui, sans-serif">MOGE Offline Map</text>
    </svg>`
  );

export default function LocationModal({
  onClose,
  onSelect,
  initialLat,
  initialLng,
}: LocationModalProps) {
  const { t } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Coordinate parsing helper
  const parseCoord = (val: string | number | undefined, fallback: number): number => {
    if (val === undefined || val === null || val === "") return fallback;
    const num = typeof val === "number" ? val : parseFloat(val);
    return isNaN(num) ? fallback : num;
  };

  const initLatNum = initialLat ? parseCoord(initialLat, 16.8409) : null;
  const initLngNum = initialLng ? parseCoord(initialLng, 96.1735) : null;

  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(
    initLatNum !== null && initLngNum !== null ? { lat: initLatNum, lng: initLngNum } : null
  );

  // Manual inputs for direct typing/pasting
  const [inputLat, setInputLat] = useState<string>(
    initLatNum !== null ? initLatNum.toFixed(6) : ""
  );
  const [inputLng, setInputLng] = useState<string>(
    initLngNum !== null ? initLngNum.toFixed(6) : ""
  );

  // Update marker on the map
  const updateMarker = useCallback((lat: number, lng: number, panTo: boolean = false) => {
    setMarkerPos({ lat, lng });
    setInputLat(lat.toFixed(6));
    setInputLng(lng.toFixed(6));

    const map = mapInstanceRef.current;
    if (!map) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const pin = L.marker([lat, lng], {
        icon: createCustomPin(),
        draggable: true,
      }).addTo(map);

      pin.on("dragend", () => {
        const pos = pin.getLatLng();
        setMarkerPos({ lat: pos.lat, lng: pos.lng });
        setInputLat(pos.lat.toFixed(6));
        setInputLng(pos.lng.toFixed(6));
      });

      markerRef.current = pin;
    }

    if (panTo) {
      map.panTo([lat, lng], { animate: true });
    }
  }, []);

  // Initialize Leaflet map (100% OFFLINE ONLY)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const startLat = markerPos?.lat ?? 16.8409;
    const startLng = markerPos?.lng ?? 96.1735;
    const startZoom = markerPos ? 13 : 11;

    // Constrain map to Myanmar territory bounds so it never wanders off
    const map = L.map(mapContainerRef.current, {
      center: [startLat, startLng],
      zoom: startZoom,
      minZoom: 5,
      maxZoom: 18,
      zoomControl: true,
      maxBounds: [
        [8.5, 91.0],   // Southwest corner of Myanmar region
        [29.0, 102.5], // Northeast corner of Myanmar region
      ],
      maxBoundsViscosity: 0.9,
    });

    mapInstanceRef.current = map;

    // Pure 100% offline tile layer:
    // ONLY loads from local directory "/tiles/{z}/{x}/{y}.jpg" (ESRI World Topo tiles)
    // NO internet requests, NO external CDN, NO OSM/CartoDB server calls
    // maxNativeZoom: 13 ensures deeper zooms (14-18) are smoothly scaled locally
    const offlineTileLayer = L.tileLayer("/tiles/{z}/{x}/{y}.jpg", {
      minZoom: 4,
      maxZoom: 18,
      maxNativeZoom: 13,
      errorTileUrl: OFFLINE_FALLBACK_TILE,
      attribution: "MOGE Local Offline Map",
    });

    offlineTileLayer.addTo(map);

    // If we have an initial position, place the marker
    if (markerPos) {
      updateMarker(markerPos.lat, markerPos.lng, false);
    }

    // Map click handler: place or move pin
    map.on("click", (e: L.LeafletMouseEvent) => {
      updateMarker(e.latlng.lat, e.latlng.lng, false);
    });

    // Ensure map container renders properly inside modal
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(resizeTimer);
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Handle manual coordinate apply
  const handleApplyManualCoords = () => {
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      updateMarker(lat, lng, true);
    }
  };

  // Handle city quick-jump
  const handleCitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [latStr, lngStr, zoomStr] = val.split(",");
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    const zoom = parseInt(zoomStr, 10);

    const map = mapInstanceRef.current;
    if (map) {
      map.setView([lat, lng], zoom, { animate: true });
    }
  };

  // Format numbers to 6 decimal places
  const formatCoord = (value: number) => value.toFixed(6);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl dark:bg-gray-900 overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {t("Select Location on Map")}
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  (မြေပုံပေါ်တွင် တည်နေရာရွေးပါ)
                </span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("Click on map or drag marker to set GPS coordinates")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 100% Offline Status Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
              <HardDrive size={13} className="text-emerald-600" />
              <span>{t("Offline Map (Local Storage)") || "Offline Map (Local Storage)"}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              title={t("Close") || "Close"}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Toolbar: City Jump & Manual Coordinates */}
        <div className="p-4 bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-3 text-xs">
          
          {/* Quick Jump Selector */}
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Globe size={15} className="text-gray-500 dark:text-gray-400 shrink-0" />
            <select
              onChange={handleCitySelect}
              defaultValue=""
              className="w-full h-9 px-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                {t("Quick Jump to Region / City...") || "Quick Jump to Region / City..."}
              </option>
              {MYANMAR_CITIES.map((c, idx) => (
                <option key={idx} value={`${c.lat},${c.lng},${c.zoom}`}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Direct Coordinate Inputs */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-600 dark:text-gray-300">Lat:</span>
            <input
              type="number"
              step="0.000001"
              value={inputLat}
              placeholder="16.840900"
              onChange={(e) => setInputLat(e.target.value)}
              className="w-24 h-9 px-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="font-semibold text-gray-600 dark:text-gray-300">Lng:</span>
            <input
              type="number"
              step="0.000001"
              value={inputLng}
              placeholder="96.173500"
              onChange={(e) => setInputLng(e.target.value)}
              className="w-24 h-9 px-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleApplyManualCoords}
              className="h-9 px-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <Navigation size={13} /> {t("Set")}
            </button>
          </div>
        </div>

        {/* Leaflet Map Viewport */}
        <div className="relative flex-1 min-h-[460px] w-full bg-slate-100 dark:bg-gray-950">
          <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: "460px" }} />
          
          {/* Subtle guide badge over the map */}
          <div className="absolute top-3 right-3 z-[1000] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-sm text-[11px] text-gray-600 dark:text-gray-300 flex items-center gap-2 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{t("Offline map loaded locally (No internet required)")}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              {t("Selected GPS")}:
            </span>
            {markerPos ? (
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900">
                {formatCoord(markerPos.lat)}, {formatCoord(markerPos.lng)}
              </span>
            ) : (
              <span className="text-gray-400 italic">
                {t("Click anywhere on the map to place a pin")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {t("Cancel")}
            </button>

            <button
              type="button"
              disabled={!markerPos}
              onClick={() => {
                if (!markerPos) return;
                onSelect({
                  lat: formatCoord(markerPos.lat),
                  lng: formatCoord(markerPos.lng),
                });
                onClose();
              }}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xl transition shadow-md shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Check size={16} /> {t("Select Location")}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}