import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  MapPin,
  Building2,
  RefreshCw,
  Navigation,
  Globe,
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Image as ImageIcon,
} from "lucide-react";
import { locationApi } from "../../api/locationApi";
import { buildingApi } from "../../api/buildingApi";
import {
  Location,
  LocationMapPoint,
  LocationMapStats,
} from "../../interfaces/location";
import { Building } from "../../interfaces/building";
import { API_SERVER } from "../../helpers/api";
import { usePaginatedLocations } from "../../hooks/useLocations";
import MyanmarVectorMap from "../locations/MyanmarVectorMap";

/* ── helpers ── */
const TYPE_COLORS: Record<string, string> = {
  offshore:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  onshore:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  office:
    "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20",
  pipeline:
    "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
  default:
    "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600",
};

function typeBadge(t?: string) {
  const label = t || "—";
  const key =
    Object.keys(TYPE_COLORS).find((k) => label.toLowerCase().includes(k)) ??
    "default";
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] ${TYPE_COLORS[key]}`}
    >
      {label}
    </span>
  );
}

const PIN_PALETTE = [
  "bg-red-500",
  "bg-amber-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-cyan-500",
  "bg-rose-500",
  "bg-emerald-500",
];

type TypeFilterKey = "all" | "offshore" | "onshore" | "pipeline" | "office";

const TYPE_FILTERS: { key: TypeFilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "offshore", label: "Offshore" },
  { key: "onshore", label: "Onshore" },
  { key: "pipeline", label: "Pipeline" },
  { key: "office", label: "Office" },
];

const PAGE_SIZE = 10;

function getFullPhotoUrl(path?: string | File | null): string {
  if (!path || typeof path !== "string") return "";
  if (path.startsWith("http")) return path;
  return `${API_SERVER}${path.startsWith("/") ? "" : "/"}${path}`;
}

/* ══════════════ COMPONENT ══════════════ */
export default function DashboardLocationsTab() {
  const navigate = useNavigate();

  // Fast lightweight map summary state
  const [mapPoints, setMapPoints] = useState<LocationMapPoint[]>([]);
  const [stats, setStats] = useState<LocationMapStats>({
    total: 0,
    offshore: 0,
    onshore: 0,
    pipeline: 0,
    office: 0,
  });
  const [mapLoading, setMapLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<TypeFilterKey>("all");

  // Buildings state (loaded independently)
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [buildingsLoading, setBuildingsLoading] = useState(true);

  // Selected site (on-demand full detail with client cache)
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<Location | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const detailCacheRef = useRef<Map<number, Location>>(new Map());

  // Server-paginated catalog search & page state
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const {
    locations: catalogLocations,
    pagination: catalogPagination,
    isLoading: catalogLoading,
    mutate: mutateCatalog,
  } = usePaginatedLocations({
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const fetchSummaryAndBuildings = useCallback(async () => {
    setMapLoading(true);
    setBuildingsLoading(true);
    detailCacheRef.current.clear();

    const mapReq = locationApi
      .getMapSummary()
      .then((res) => {
        const pts = res.points || [];
        setMapPoints(pts);
        setStats(
          res.stats || {
            total: pts.length,
            offshore: 0,
            onshore: 0,
            pipeline: 0,
            office: 0,
          }
        );
        setSelectedId((prev) =>
          prev && pts.some((p) => p.id === prev) ? prev : pts[0]?.id ?? null
        );
      })
      .catch((e) => console.error("Failed to fetch map summary", e))
      .finally(() => setMapLoading(false));

    const bldReq = buildingApi
      .all()
      .then((bldData) => {
        const blds: Building[] = bldData.buildings ?? bldData ?? [];
        setBuildings(blds);
      })
      .catch((e) => console.error("Failed to fetch buildings", e))
      .finally(() => setBuildingsLoading(false));

    await Promise.all([mapReq, bldReq]);
    mutateCatalog();
  }, [mutateCatalog]);

  useEffect(() => {
    fetchSummaryAndBuildings();
  }, []);

  // Load full detail for selected location on demand (with cache)
  useEffect(() => {
    if (!selectedId) {
      setSelectedDetail(null);
      return;
    }

    setActivePhotoIdx(0);
    const cached = detailCacheRef.current.get(selectedId);
    if (cached) {
      setSelectedDetail(cached);
      setDetailLoading(false);
      return;
    }

    let cancelled = false;
    setDetailLoading(true);
    locationApi
      .getById(String(selectedId))
      .then((data) => {
        if (!cancelled && data?.location) {
          detailCacheRef.current.set(selectedId, data.location);
          setSelectedDetail(data.location);
        }
      })
      .catch((e) => {
        console.error("Failed to load location details", e);
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  // Filter map points client-side by activity type pill (instant, zero refetch)
  const filteredMapPoints = useMemo(() => {
    if (typeFilter === "all") return mapPoints;
    return mapPoints.filter((p) =>
      (p.location_type || "").toLowerCase().includes(typeFilter)
    );
  }, [mapPoints, typeFilter]);

  // Collect all photos for selected site
  const selectedPhotos = useMemo(() => {
    if (!selectedDetail) return [];
    const list: string[] = [];
    if (selectedDetail.photo && typeof selectedDetail.photo === "string") {
      list.push(selectedDetail.photo);
    }
    if (Array.isArray(selectedDetail.photos)) {
      selectedDetail.photos.forEach((p) => {
        if (p.photo && !list.includes(p.photo)) {
          list.push(p.photo);
        }
      });
    }
    return list;
  }, [selectedDetail]);

  const activePhotoUrl =
    selectedPhotos.length > 0
      ? getFullPhotoUrl(selectedPhotos[activePhotoIdx] || selectedPhotos[0])
      : "";

  const totalCatalog = catalogPagination?.total ?? stats.total;
  const totalPages = Math.max(1, Math.ceil(totalCatalog / PAGE_SIZE));

  return (
    <div className="space-y-6 pb-10">
      {/* ── Top Header Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-3.5 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200/40 text-[10px] font-semibold text-[#B88E2F]">
            <Globe size={12} />
            <span>MOGE Locations & Map Directory</span>
          </div>
          <h1 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">
            Locations & Oilfield Analytics
          </h1>
          <p className="text-[11px] text-gray-400 font-normal leading-normal">
            Monitor field locations, building facilities, and clustered map coordinates
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchSummaryAndBuildings}
            disabled={mapLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 rounded-xl transition cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
          >
            <RefreshCw className={`h-3 w-3 ${mapLoading ? "animate-spin" : ""}`} />
            <span>Refresh Map</span>
          </button>
        </div>
      </div>

      {/* ── Top Analytics KPI Card Container ── */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-[#B88E2F] dark:bg-amber-500/10">
              <MapPin size={18} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">
                Locations Analytics
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                Active oilfields, offices, and building facilities
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#B88E2F] bg-amber-50 px-3 py-1 rounded-full dark:bg-amber-500/10">
            {stats.total} Active Sites
          </span>
        </div>

        {/* 4 Top KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
            <p className="text-[11px] font-bold uppercase text-gray-400">
              Total Locations
            </p>
            {mapLoading ? (
              <div className="h-7 w-16 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse mt-1" />
            ) : (
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">
                {stats.total}
              </h3>
            )}
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
            <p className="text-[11px] font-bold uppercase text-gray-400">
              Office Buildings
            </p>
            {buildingsLoading ? (
              <div className="h-7 w-16 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse mt-1" />
            ) : (
              <h3 className="text-xl font-extrabold text-[#B88E2F] dark:text-amber-400 mt-1">
                {buildings.length}
              </h3>
            )}
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
            <p className="text-[11px] font-bold uppercase text-gray-400">
              Offshore Fields
            </p>
            {mapLoading ? (
              <div className="h-7 w-16 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse mt-1" />
            ) : (
              <h3 className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                {stats.offshore}
              </h3>
            )}
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
            <p className="text-[11px] font-bold uppercase text-gray-400">
              Onshore Fields
            </p>
            {mapLoading ? (
              <div className="h-7 w-16 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse mt-1" />
            ) : (
              <h3 className="text-xl font-extrabold text-teal-600 dark:text-teal-400 mt-1">
                {stats.onshore}
              </h3>
            )}
          </div>
        </div>
      </div>

      {/* ════ ROW 1: Clustered Interactive Map & Selected Site Showcase ════ */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-500/10">
              <Globe className="h-4.5 w-4.5 text-teal-500" />
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-800 dark:text-white/90">
              ကွင်းဆင်းတည်နေရာနှင့် မြေပုံ (Locations Map)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setTypeFilter(f.key)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                  typeFilter === f.key
                    ? "bg-[#B88E2F] text-white shadow-2xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {f.label}
              </button>
            ))}
            <button
              type="button"
              onClick={fetchSummaryAndBuildings}
              disabled={mapLoading}
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:bg-gray-50 hover:text-gray-600 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <RefreshCw className={`h-4 w-4 ${mapLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Map viewport */}
          <div className="lg:col-span-7">
            <MyanmarVectorMap
              points={filteredMapPoints}
              selectedId={selectedId}
              onSelectLocation={(id) => setSelectedId(id)}
              loading={mapLoading}
            />
          </div>

          {/* Selected location showcase (loaded on-demand) */}
          <div
            className="lg:col-span-5 flex flex-col rounded-2xl border border-gray-100 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-800/40 overflow-hidden"
            style={{ height: "420px" }}
          >
            {detailLoading ? (
              <div className="p-4 space-y-3 animate-pulse">
                <div className="h-40 w-full rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="h-5 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3.5 w-full rounded bg-gray-100 dark:bg-gray-800" />
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="h-9 rounded-xl bg-gray-200 dark:bg-gray-700" />
                  <div className="h-9 rounded-xl bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ) : selectedDetail ? (
              <div className="flex flex-col h-full overflow-y-auto p-4 space-y-3">
                {/* Photo / clean fallback */}
                <div>
                  {activePhotoUrl && !brokenImages[activePhotoUrl] ? (
                    <img
                      src={activePhotoUrl}
                      alt={selectedDetail.location_name}
                      loading="lazy"
                      onError={() =>
                        setBrokenImages((prev) => ({
                          ...prev,
                          [activePhotoUrl]: true,
                        }))
                      }
                      className="h-40 w-full rounded-xl object-cover shadow-2xs border border-gray-200/70 dark:border-gray-700"
                    />
                  ) : (
                    <div
                      className={`flex h-40 w-full flex-col items-center justify-center rounded-xl text-white shadow-2xs ${
                        PIN_PALETTE[selectedDetail.id % PIN_PALETTE.length]
                      }`}
                    >
                      <ImageIcon className="h-8 w-8 opacity-80 mb-1" />
                      <span className="text-2xl font-black">
                        {selectedDetail.location_name?.charAt(0) || "L"}
                      </span>
                    </div>
                  )}

                  {/* Multi-photo thumbnail strip */}
                  {selectedPhotos.length > 1 && (
                    <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-0.5">
                      {selectedPhotos.map((path, idx) => {
                        const url = getFullPhotoUrl(path);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActivePhotoIdx(idx)}
                            className={`h-10 w-10 shrink-0 rounded-lg overflow-hidden border-2 transition ${
                              activePhotoIdx === idx
                                ? "border-[#B88E2F]"
                                : "border-transparent opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={url}
                              alt={`Thumbnail ${idx + 1}`}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {typeBadge(selectedDetail.location_type)}
                    <h4 className="mt-1.5 text-base font-extrabold text-gray-900 dark:text-white leading-snug">
                      {selectedDetail.location_name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-[10px] font-bold text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-700">
                      {selectedDetail.location_id}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(`/locations/edit/${selectedDetail.id}`)}
                      className="p-1.5 rounded-lg bg-white hover:bg-amber-50 text-gray-500 hover:text-[#B88E2F] border border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition"
                      title="Edit Location"
                    >
                      <Pencil size={12} />
                    </button>
                  </div>
                </div>

                {selectedDetail.description && (
                  <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                    {selectedDetail.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1 mt-auto">
                  {selectedDetail.city && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700">
                      <Navigation className="h-4 w-4 shrink-0 text-teal-500" />
                      <span className="truncate">
                        <strong>မြို့:</strong> {selectedDetail.city}
                      </span>
                    </div>
                  )}
                  {(selectedDetail.latitude || selectedDetail.longitude) && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700">
                      <MapPin className="h-4 w-4 shrink-0 text-amber-500" />
                      <span className="font-mono truncate">
                        {selectedDetail.latitude}°N, {selectedDetail.longitude}°E
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-xs text-gray-400">တည်နေရာ ရွေးချယ်ပါ</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════ ROW 2: Paginated Locations Catalog & Buildings Directory ════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ── Left Column (6 Cols): Server-Paginated Locations Catalog ── */}
        <div className="lg:col-span-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900 flex flex-col">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-[#B88E2F] dark:bg-amber-500/10">
                <MapPin size={18} />
              </div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-800 dark:text-white/90">
                တည်နေရာများ စာရင်း ({totalCatalog})
              </h3>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="ရှာဖွေရန်..."
                className="rounded-xl border border-gray-200 bg-gray-50/80 py-1.5 pl-8 pr-3 text-xs focus:border-[#B88E2F] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          {catalogLoading ? (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={`loc-skel-${idx}`}
                  className="flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-800/40"
                >
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-3.5 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                      <div className="h-4 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                    </div>
                    <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : catalogLocations.length === 0 ? (
            <p className="py-12 text-center text-xs text-gray-400">
              တည်နေရာများ မတွေ့ရှိပါ
            </p>
          ) : (
            <>
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {catalogLocations.map((loc, idx) => {
                  const thumbUrl = getFullPhotoUrl(loc.photo);
                  const isSelected = selectedId === loc.id;
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => setSelectedId(loc.id)}
                      className={`group w-full flex items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all ${
                        isSelected
                          ? "border-[#B88E2F] bg-amber-50/50 shadow-2xs dark:border-amber-500/40 dark:bg-amber-500/10"
                          : "border-gray-100 bg-gray-50/60 hover:border-[#B88E2F]/30 dark:border-gray-800 dark:bg-gray-800/40 dark:hover:border-amber-500/30"
                      }`}
                    >
                      {thumbUrl && !brokenImages[thumbUrl] ? (
                        <img
                          src={thumbUrl}
                          alt={loc.location_name}
                          loading="lazy"
                          onError={() =>
                            setBrokenImages((prev) => ({
                              ...prev,
                              [thumbUrl]: true,
                            }))
                          }
                          className="h-12 w-12 shrink-0 rounded-xl object-cover shadow-2xs border border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white text-lg font-black shadow-2xs ${
                            PIN_PALETTE[(idx + loc.id) % PIN_PALETTE.length]
                          }`}
                        >
                          {loc.location_name?.charAt(0) || "L"}
                        </div>
                      )}

                      <div className="flex flex-1 flex-col justify-center min-w-0">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
                            {loc.location_name}
                          </p>
                          {typeBadge(loc.location_type)}
                        </div>
                        <p className="text-[11px] text-gray-500 truncate">
                          {loc.city || "—"}
                        </p>
                        {loc.latitude && loc.longitude && (
                          <p className="mt-0.5 font-mono text-[10px] text-gray-400 truncate">
                            {loc.latitude}°N, {loc.longitude}°E
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Compact Server Pagination Footer */}
              {totalPages > 1 && (
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition font-semibold"
                    >
                      <ChevronLeft size={14} /> Prev
                    </button>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition font-semibold"
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Right Column (6 Cols): Buildings Directory ── */}
        <div className="lg:col-span-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900 flex flex-col">
          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
                <Building2 className="h-4.5 w-4.5 text-indigo-500" />
              </div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-800 dark:text-white/90">
                ရုံးအဆောက်အဦးများ Directory
              </h2>
            </div>
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400">
              {buildings.length} ခု
            </span>
          </div>

          {buildingsLoading ? (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={`bldg-skel-${idx}`}
                  className="flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-800/40"
                >
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-36 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800" />
                  </div>
                  <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                </div>
              ))}
            </div>
          ) : buildings.length === 0 ? (
            <p className="py-12 text-center text-xs text-gray-400">
              ရုံးအဆောက်အဦးများ မရှိသေးပါ
            </p>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {buildings.map((b, idx) => (
                <div
                  key={b.id}
                  className="flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 transition-all hover:border-indigo-200 dark:border-gray-800 dark:bg-gray-800/40"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white text-xs font-black shadow-2xs ${
                      PIN_PALETTE[(idx + 2) % PIN_PALETTE.length]
                    }`}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-extrabold text-gray-900 dark:text-white">
                      {b.building_name}
                    </p>
                    <p className="font-mono text-[11px] text-gray-400 mt-0.5">
                      {b.building_id}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-[10px] font-bold text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-400">
                    BLDG-{String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
