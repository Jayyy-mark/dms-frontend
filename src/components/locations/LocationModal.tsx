import { useState, useEffect, useRef, useCallback } from "react";
import { X, MapPin, Navigation, Globe, Check, Layers, HardDrive } from "lucide-react";
import { useTranslation } from "react-i18next";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { leafletLayer, labelRules } from "protomaps-leaflet";
import { namedFlavor } from "@protomaps/basemaps";
import { PMTiles } from "pmtiles";
import {
  reverseGeocodeOffline,
  MyanmarLocationInfo,
} from "../../helpers/myanmarGeocoding";

// Ensure global L is defined for protomaps-leaflet in Vite ESM builds
if (typeof window !== "undefined" && !(window as any).L) {
  (window as any).L = L;
}

interface LocationModalProps {
  onClose: () => void;
  onSelect: (position: {
    lat: string;
    lng: string;
    city: string;
    state_division: string;
  }) => void;
  initialLat?: string | number;
  initialLng?: string | number;
}

type OfflineMapMode = "streets_hd" | "satellite_hybrid" | "satellite" | "high_contrast" | "dark";
type MapLabelLang = "en" | "my";

interface MapModeOption {
  id: OfflineMapMode;
  label: string;
  shortLabel: string;
}

const OFFLINE_VECTOR_PMTILES_URL = "/maps/myanmar.pmtiles";
const OFFLINE_SATELLITE_PMTILES_URL = "/maps/myanmar-satellite.pmtiles";

const MAP_MODES: MapModeOption[] = [
  {
    id: "streets_hd",
    label: "Streets HD (Offline Vector)",
    shortLabel: "Streets HD",
  },
  {
    id: "satellite_hybrid",
    label: "Satellite + Labels (Offline Sentinel-2)",
    shortLabel: "Satellite",
  },
  {
    id: "satellite",
    label: "Satellite Clean (Offline Sentinel-2)",
    shortLabel: "Sat Clean",
  },
  {
    id: "high_contrast",
    label: "High Contrast (Offline Vector)",
    shortLabel: "Contrast",
  },
  {
    id: "dark",
    label: "Dark Mode (Offline Vector)",
    shortLabel: "Dark",
  },
];

// Major Myanmar cities and key oil/gas operation regions for quick offline navigation
const MYANMAR_CITIES = [
  { name: "Yangon (ရန်ကုန်)", lat: 16.8409, lng: 96.1735, zoom: 13 },
  { name: "Mandalay (မန္တလေး)", lat: 21.9588, lng: 96.0891, zoom: 13 },
  { name: "Naypyidaw (နေပြည်တော်)", lat: 19.7633, lng: 96.0785, zoom: 13 },
  { name: "Bago (ပဲခူး)", lat: 17.3221, lng: 96.4664, zoom: 13 },
  { name: "Taungoo (တောင်ငူ)", lat: 18.9413, lng: 96.4344, zoom: 13 },
  { name: "Magway (မကွေး)", lat: 20.1544, lng: 94.9455, zoom: 13 },
  { name: "Chauk [Oil Field] (ချောက်)", lat: 20.8986, lng: 94.8219, zoom: 13 },
  { name: "Yenangyaung [Oil Field] (ရေနံချောင်း)", lat: 20.4633, lng: 94.8778, zoom: 13 },
  { name: "Taunggyi (တောင်ကြီး)", lat: 20.7888, lng: 97.0378, zoom: 13 },
  { name: "Mawlamyine (မော်လမြိုင်)", lat: 16.4905, lng: 97.6283, zoom: 13 },
  { name: "Pathein (ပုသိမ်)", lat: 16.7792, lng: 94.7324, zoom: 13 },
  { name: "Monywa (မုံရွာ)", lat: 22.1086, lng: 95.1354, zoom: 13 },
  { name: "Sittwe (စစ်တွေ)", lat: 20.1528, lng: 92.8683, zoom: 13 },
  { name: "Myitkyina (မြစ်ကြီးနား)", lat: 25.3833, lng: 97.4000, zoom: 13 },
  { name: "Dawei (ထားဝယ်)", lat: 14.0828, lng: 98.1942, zoom: 13 },
  { name: "Pyay (ပြည်)", lat: 18.8242, lng: 95.2147, zoom: 13 },
];

// Shared PMTiles reader for offline Sentinel-2 satellite imagery
let satelliteArchiveSingleton: PMTiles | null = null;
const getSatelliteArchive = () => {
  if (!satelliteArchiveSingleton) {
    satelliteArchiveSingleton = new PMTiles(OFFLINE_SATELLITE_PMTILES_URL);
  }
  return satelliteArchiveSingleton;
};

// Custom Leaflet GridLayer that reads JPG raster tiles directly from local myanmar-satellite.pmtiles
// with seamless quadtree overzoom up to z=18 for areas where native data ends at z=11 or z=13.
const createOfflineSatelliteLayer = (): L.GridLayer => {
  const archive = getSatelliteArchive();

  const PMTilesSatelliteLayer = L.GridLayer.extend({
    createTile(coords: L.Coords, done: L.DoneCallback) {
      const tile = document.createElement("div");
      tile.className = "leaflet-tile";
      tile.style.width = "256px";
      tile.style.height = "256px";
      tile.style.overflow = "hidden";
      tile.style.backgroundColor = "#0f172a";

      const img = document.createElement("img");
      img.alt = "";
      img.setAttribute("role", "presentation");
      img.draggable = false;
      img.style.position = "absolute";
      img.style.maxWidth = "none";
      img.style.maxHeight = "none";
      img.style.display = "block";
      img.style.pointerEvents = "none";
      img.style.userSelect = "none";
      tile.appendChild(img);

      let finished = false;
      const finish = () => {
        if (!finished) {
          finished = true;
          done(undefined, tile);
        }
      };

      const loadBestTile = async () => {
        const startZ = Math.min(coords.z, 13);
        for (let candZ = startZ; candZ >= 4; candZ--) {
          const scale = 1 << (coords.z - candZ);
          const candX = Math.floor(coords.x / scale);
          const candY = Math.floor(coords.y / scale);
          try {
            const res = await archive.getZxy(candZ, candX, candY);
            if (res && res.data && res.data.byteLength > 0) {
              const subX = coords.x - candX * scale;
              const subY = coords.y - candY * scale;
              img.style.left = `${-subX * 256}px`;
              img.style.top = `${-subY * 256}px`;
              img.style.width = `${256 * scale}px`;
              img.style.height = `${256 * scale}px`;

              const blob = new Blob([res.data], { type: "image/jpeg" });
              const objUrl = URL.createObjectURL(blob);
              img.onload = () => {
                URL.revokeObjectURL(objUrl);
                finish();
              };
              img.onerror = () => {
                URL.revokeObjectURL(objUrl);
                finish();
              };
              img.src = objUrl;
              return;
            }
          } catch {
            // Try parent zoom level
          }
        }
        finish();
      };

      void loadBestTile();
      return tile;
    },
  });

  return new (PMTilesSatelliteLayer as any)({
    minZoom: 5,
    maxZoom: 18,
    tileSize: 256,
    keepBuffer: 4,
    updateWhenIdle: false,
    attribution: "Sentinel-2 Cloudless 2024 by EOX (CC BY 4.0) • Offline",
  });
};

// Custom vector map pin icon:
// Leaflet's iconAnchor: [17, 42] shifts the 34x42 container by (-17px, -42px)
// so that the bottom tip (17, 42) sits on the exact clicked GPS coordinate.
const createCustomPin = () => {
  return L.divIcon({
    className: "moge-map-pin",
    html: `
      <div style="position: relative; width: 34px; height: 42px; margin: 0; padding: 0; pointer-events: auto;">
        <span style="position: absolute; left: 17px; top: 42px; width: 10px; height: 10px; margin-left: -5px; margin-top: -5px; border-radius: 9999px; background: rgba(37, 99, 235, 0.35); border: 1.5px solid #ffffff; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);"></span>
        <svg viewBox="0 0 34 42" width="34" height="42" style="display: block; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));">
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
  const activeLayersRef = useRef<L.Layer[]>([]);

  const [mapMode, setMapMode] = useState<OfflineMapMode>("streets_hd");
  const [labelLang, setLabelLang] = useState<MapLabelLang>("en");

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

  const [detectedLocation, setDetectedLocation] = useState<MyanmarLocationInfo | null>(() => {
    if (initLatNum !== null && initLngNum !== null) {
      return reverseGeocodeOffline(initLatNum, initLngNum);
    }
    return null;
  });

  // 100% offline reverse geocoding whenever marker changes (zero external network calls)
  useEffect(() => {
    if (!markerPos) {
      setDetectedLocation(null);
      return;
    }
    setDetectedLocation(reverseGeocodeOffline(markerPos.lat, markerPos.lng));
  }, [markerPos?.lat, markerPos?.lng]);

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

  // Build layers for the selected 100% offline mode
  const buildLayersForMode = useCallback(
    (mode: OfflineMapMode, lang: MapLabelLang): L.Layer[] => {
      if (typeof window !== "undefined") {
        (window as any).L = L;
      }

      if (mode === "satellite") {
        return [createOfflineSatelliteLayer()];
      }

      if (mode === "satellite_hybrid") {
        const satLayer = createOfflineSatelliteLayer();
        const darkFlavor = namedFlavor("dark");
        const labelsOverlay = leafletLayer({
          url: OFFLINE_VECTOR_PMTILES_URL,
          paintRules: [],
          labelRules: labelRules(darkFlavor, lang),
          backgroundColor: "transparent",
          maxDataZoom: 15,
          minZoom: 5,
          maxZoom: 18,
          attribution: "© OpenStreetMap",
        }) as unknown as L.Layer;
        return [satLayer, labelsOverlay];
      }

      const flavor =
        mode === "high_contrast" ? "white" : mode === "dark" ? "dark" : "light";
      const vectorLayer = leafletLayer({
        url: OFFLINE_VECTOR_PMTILES_URL,
        flavor,
        lang,
        maxDataZoom: 15,
        minZoom: 5,
        maxZoom: 20,
        attribution: "MOGE Offline Streets HD • © OpenStreetMap",
      }) as unknown as L.Layer;
      return [vectorLayer];
    },
    []
  );

  // Initialize Leaflet map (100% offline)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const startLat = markerPos?.lat ?? 16.8409;
    const startLng = markerPos?.lng ?? 96.1735;
    const startZoom = markerPos ? 14 : 12;

    const map = L.map(mapContainerRef.current, {
      center: [startLat, startLng],
      zoom: startZoom,
      minZoom: 5,
      maxZoom: 20,
      zoomControl: true,
      maxBounds: [
        [9.0, 91.5],   // Southwest corner of Myanmar
        [28.8, 101.8], // Northeast corner of Myanmar
      ],
      maxBoundsViscosity: 0.9,
    });

    mapInstanceRef.current = map;

    if (markerPos) {
      updateMarker(markerPos.lat, markerPos.lng, false);
    }

    map.on("click", (e: L.LeafletMouseEvent) => {
      updateMarker(e.latlng.lat, e.latlng.lng, false);
    });

    const resizeTimer1 = setTimeout(() => map.invalidateSize(), 50);
    const resizeTimer2 = setTimeout(() => map.invalidateSize(), 250);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(resizeTimer1);
      clearTimeout(resizeTimer2);
      resizeObserver?.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      activeLayersRef.current = [];
    };
  }, []);

  // Mount or switch offline layers when mode or label language changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    activeLayersRef.current.forEach((layer) => {
      map.removeLayer(layer);
    });

    const nextLayers = buildLayersForMode(mapMode, labelLang);
    nextLayers.forEach((layer) => layer.addTo(map));
    activeLayersRef.current = nextLayers;
  }, [mapMode, labelLang, buildLayersForMode]);

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
              <HardDrive size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>{t("Offline Streets HD & Sentinel-2") || "Offline Streets HD & Sentinel-2"}</span>
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

        {/* Leaflet Offline Map Viewport */}
        <div className="relative flex-1 min-h-[460px] w-full bg-slate-100 dark:bg-gray-950">
          <div ref={mapContainerRef} className="w-full h-[460px] cursor-crosshair" />

          {/* Offline Mode & Label Language Switcher */}
          <div className="absolute top-3 right-3 z-[1000] flex flex-wrap items-center gap-1.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-1.5 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-md text-[11px]">
            <Layers size={12} className="text-gray-400 ml-1" />
            {MAP_MODES.map((mode) => {
              const active = mapMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setMapMode(mode.id)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    active
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  title={mode.label}
                >
                  {mode.shortLabel}
                </button>
              );
            })}

            {mapMode !== "satellite" && (
              <>
                <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-0.5" />
                <button
                  type="button"
                  onClick={() => setLabelLang((prev) => (prev === "en" ? "my" : "en"))}
                  className="px-2 py-1 rounded-lg font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  title="Toggle Map Label Language (English / Myanmar)"
                >
                  {labelLang === "en" ? "EN" : "မြန်မာ"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              {t("Selected GPS")}:
            </span>
            {markerPos ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900">
                  {formatCoord(markerPos.lat)}, {formatCoord(markerPos.lng)}
                </span>
                {detectedLocation && (
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-xs">
                    <MapPin size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{detectedLocation.city}, {detectedLocation.state_division}</span>
                  </span>
                )}
              </div>
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
                const locInfo =
                  detectedLocation || reverseGeocodeOffline(markerPos.lat, markerPos.lng);
                onSelect({
                  lat: formatCoord(markerPos.lat),
                  lng: formatCoord(markerPos.lng),
                  city: locInfo.city,
                  state_division: locInfo.state_division,
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
