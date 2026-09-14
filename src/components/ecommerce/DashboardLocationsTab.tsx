import { useEffect, useState } from "react";
import {
  MapPin, Building2, RefreshCw, Navigation,
  Globe, Search
} from "lucide-react";
import { locationApi } from "../../api/locationApi";
import { buildingApi } from "../../api/buildingApi";
import { Location } from "../../interfaces/location";
import { Building } from "../../interfaces/building";
import { API_SERVER } from "../../helpers/api";

import MyanmarVectorMap from "../locations/MyanmarVectorMap";

/* ── helpers ── */
const TYPE_COLORS: Record<string, string> = {
  offshore: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  onshore: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  office: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20",
  pipeline: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
  default: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600",
};

function typeBadge(t?: string) {
  const label = t ?? "—";
  const key = Object.keys(TYPE_COLORS).find(k => label.toLowerCase().includes(k)) ?? "default";
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] ${TYPE_COLORS[key]}`}>
      {label}
    </span>
  );
}

/* PIN COLORS */
const PIN_PALETTE = [
  "bg-red-500", "bg-amber-500", "bg-teal-500",
  "bg-indigo-500", "bg-purple-500", "bg-cyan-500",
  "bg-rose-500", "bg-emerald-500",
];

/* ══════════════ COMPONENT ══════════════ */
export default function DashboardLocationsTab() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  /* fetch both */
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [locData, bldData] = await Promise.all([
        locationApi.all(),
        buildingApi.all(),
      ]);
      const locs: Location[] = locData.locations ?? locData ?? [];
      const blds: Building[] = bldData.buildings ?? bldData ?? [];
      setLocations(locs);
      setBuildings(blds);
      if (locs.length > 0) setSelectedIdx(0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = locations.filter(l =>
    l.location_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.city?.toLowerCase().includes(search.toLowerCase()) ||
    l.location_type?.toLowerCase().includes(search.toLowerCase())
  );

  const selected = selectedIdx !== null ? locations[selectedIdx] : null;

  return (
    <div className="space-y-6 pb-10">
      {/* ── Top Header Banner (Small, Compact & Elegant) ── */}
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
            Monitor field locations, building facilities, and map coordinates
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 rounded-xl transition cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Map</span>
          </button>
        </div>
      </div>

      {/* ── Top Analytics Card Container 1 (Matching Reference Template Kit) ── */}
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
            {locations.length} Active Sites
          </span>
        </div>

        {/* 4 Top KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
            <p className="text-[11px] font-bold uppercase text-gray-400">Total Locations</p>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">{locations.length}</h3>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
            <p className="text-[11px] font-bold uppercase text-gray-400">Office Buildings</p>
            <h3 className="text-xl font-extrabold text-[#B88E2F] dark:text-amber-400 mt-1">{buildings.length}</h3>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
            <p className="text-[11px] font-bold uppercase text-gray-400">Offshore Fields</p>
            <h3 className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
              {locations.filter(l => l.location_type?.toLowerCase().includes("offshore")).length}
            </h3>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
            <p className="text-[11px] font-bold uppercase text-gray-400">Onshore Fields</p>
            <h3 className="text-xl font-extrabold text-teal-600 dark:text-teal-400 mt-1">
              {locations.filter(l => l.location_type?.toLowerCase().includes("onshore")).length}
            </h3>
          </div>
        </div>
      </div>

      {/* ════ ROW 1: Full-Width Interactive Map & Selected Site Showcase ════ */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-500/10">
              <Globe className="h-4.5 w-4.5 text-teal-500" />
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-800 dark:text-white/90">
              ကွင်းဆင်းတည်နေရာနှင့် မြေပုံ (Locations Map)
            </h2>
          </div>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:bg-gray-50 hover:text-gray-600 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Map viewport (ExpressVPN Vector Map of Myanmar) */}
          <div className="lg:col-span-7">
            <MyanmarVectorMap
              locations={locations}
              selectedIdx={selectedIdx}
              onSelectLocation={(idx) => setSelectedIdx(idx)}
              pinPalette={PIN_PALETTE}
            />
          </div>

          {/* Selected location detail */}
          <div className="lg:col-span-5 flex flex-col rounded-2xl border border-gray-100 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-800/40 overflow-hidden" style={{ height: "400px" }}>
            {selected ? (
              <div className="flex flex-col h-full overflow-y-auto p-4 space-y-3">
                {/* Photo / avatar */}
                <div>
                  {selected.photo ? (
                    <img
                      src={`${API_SERVER}${selected.photo}`}
                      alt={selected.location_name}
                      className="h-36 w-full rounded-xl object-cover shadow-2xs"
                    />
                  ) : (
                    <div
                      className={`flex h-36 w-full items-center justify-center rounded-xl text-white text-4xl font-black shadow-2xs ${PIN_PALETTE[
                        locations.indexOf(selected) % PIN_PALETTE.length
                      ]}`}
                    >
                      {selected.location_name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div>
                    {typeBadge(selected.location_type)}
                    <h4 className="mt-1.5 text-base font-extrabold text-gray-900 dark:text-white">
                      {selected.location_name}
                    </h4>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] font-bold text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-700">
                    {selected.location_id}
                  </span>
                </div>

                {selected.description && (
                  <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                    {selected.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {selected.city && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700">
                      <Navigation className="h-4 w-4 shrink-0 text-teal-500" />
                      <span className="truncate"><strong>မြို့:</strong> {selected.city}</span>
                    </div>
                  )}
                  {(selected.latitude || selected.longitude) && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700">
                      <MapPin className="h-4 w-4 shrink-0 text-amber-500" />
                      <span className="font-mono truncate">
                        {selected.latitude}°N, {selected.longitude}°E
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

      {/* ════ ROW 2: Balanced 2-Column Grid (Locations Catalog & Buildings Directory) ════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ── Left Column (6 Cols): Locations Catalog Grid ── */}
        <div className="lg:col-span-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900 flex flex-col">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-[#B88E2F] dark:bg-amber-500/10">
                <MapPin size={18} />
              </div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-800 dark:text-white/90">
                တည်နေရာများ စာရင်း ({filtered.length})
              </h3>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ရှာဖွေရန်..."
                className="rounded-xl border border-gray-200 bg-gray-50/80 py-1.5 pl-8 pr-3 text-xs focus:border-[#B88E2F] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-teal-400" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-xs text-gray-400">တည်နေရာများ မတွေ့ရှိပါ</p>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {filtered.map((loc, idx) => {
                const realIdx = locations.indexOf(loc);
                return (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedIdx(realIdx)}
                    className={`group w-full flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all
                      ${selectedIdx === realIdx
                        ? "border-[#B88E2F] bg-amber-50/50 shadow-2xs dark:border-amber-500/40 dark:bg-amber-500/10"
                        : "border-gray-100 bg-gray-50/60 hover:border-[#B88E2F]/30 dark:border-gray-800 dark:bg-gray-800/40 dark:hover:border-amber-500/30"
                      }`}
                  >
                    {loc.photo ? (
                      <img 
                        src={`${API_SERVER}${loc.photo}`} 
                        alt={loc.location_name} 
                        className="h-12 w-12 shrink-0 rounded-xl object-cover shadow-2xs border border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white text-lg font-black shadow-2xs ${PIN_PALETTE[idx % PIN_PALETTE.length]}`}>
                        {loc.location_name.charAt(0)}
                      </div>
                    )}
                    
                    <div className="flex flex-1 flex-col justify-center min-w-0">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="text-xs font-extrabold text-gray-900 dark:text-white truncate">{loc.location_name}</p>
                        {typeBadge(loc.location_type)}
                      </div>
                      <p className="text-[11px] text-gray-500 truncate">{loc.city || "—"}</p>
                      {(loc.latitude && loc.longitude) && (
                        <p className="mt-0.5 font-mono text-[10px] text-gray-400 truncate">{loc.latitude}°N, {loc.longitude}°E</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
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

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          ) : buildings.length === 0 ? (
            <p className="py-12 text-center text-xs text-gray-400">ရုံးအဆောက်အဦးများ မရှိသေးပါ</p>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {buildings.map((b, idx) => (
                <div
                  key={b.id}
                  className="flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 transition-all hover:border-indigo-200 dark:border-gray-800 dark:bg-gray-800/40"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white text-xs font-black shadow-2xs ${PIN_PALETTE[(idx + 2) % PIN_PALETTE.length]}`}>
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-extrabold text-gray-900 dark:text-white">{b.building_name}</p>
                    <p className="font-mono text-[11px] text-gray-400 mt-0.5">{b.building_id}</p>
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
