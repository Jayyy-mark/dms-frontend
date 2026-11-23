import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Plus, Minus, Compass, MapPin, X, Layers } from "lucide-react";
import { LocationMapPoint } from "../../interfaces/location";
import { MYANMAR_REGIONS } from "./myanmarRegionsData";

interface MyanmarVectorMapProps {
  points: LocationMapPoint[];
  selectedId: number | null;
  onSelectLocation: (id: number) => void;
  loading?: boolean;
}

/* Geographic coordinate bounding box for Myanmar */
const MAP_BOUNDS = {
  minLat: 9.3,
  maxLat: 28.8,
  minLng: 92.0,
  maxLng: 101.5,
  svgWidth: 500,
  svgHeight: 800,
};

/* Convert GPS (Latitude, Longitude) to SVG Canvas Coordinates (X, Y) */
function projectGPS(lat: number, lng: number) {
  const { minLat, maxLat, minLng, maxLng, svgWidth, svgHeight } = MAP_BOUNDS;
  const clampedLat = Math.max(minLat, Math.min(maxLat, lat));
  const clampedLng = Math.max(minLng, Math.min(maxLng, lng));
  const x = ((clampedLng - minLng) / (maxLng - minLng)) * svgWidth;
  const y = ((maxLat - clampedLat) / (maxLat - minLat)) * svgHeight;
  return { x, y };
}

/* Myanmar region name translations */
const REGION_NAMES_MY: Record<string, string> = {
  kachin: "ကချင်ပြည်နယ်",
  kayah: "ကယားပြည်နယ်",
  kayin: "ကရင်ပြည်နယ်",
  chin: "ချင်းပြည်နယ်",
  mon: "မွန်ပြည်နယ်",
  rakhine: "ရခိုင်ပြည်နယ်",
  shan: "ရှမ်းပြည်နယ်",
  sagaing: "စစ်ကိုင်းတိုင်းဒေသကြီး",
  mandalay: "မန္တလေးတိုင်းဒေသကြီး",
  magway: "မကွေးတိုင်းဒေသကြီး",
  bago: "ပဲခူးတိုင်းဒေသကြီး",
  yangon: "ရန်ကုန်တိုင်းဒေသကြီး",
  ayeyarwady: "ဧရာဝတီတိုင်းဒေသကြီး",
  tanintharyi: "တနင်္သာရီတိုင်းဒေသကြီး",
};

function getPinFillColor(locationType?: string): string {
  const t = (locationType || "").toLowerCase();
  if (t.includes("offshore")) return "#e11d48"; // rose-600
  if (t.includes("onshore")) return "#d97706";  // amber-600
  if (t.includes("pipeline")) return "#4f46e5"; // indigo-600
  if (t.includes("office")) return "#0d9488";   // teal-600
  return "#059669";                             // emerald-600
}

interface ProjectedPoint {
  point: LocationMapPoint;
  x: number;
  y: number;
}

interface MapCluster {
  id: string;
  x: number;
  y: number;
  items: LocationMapPoint[];
  spread: number;
}

export default function MyanmarVectorMap({
  points,
  selectedId,
  onSelectLocation,
  loading = false,
}: MyanmarVectorMapProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [hoveredPin, setHoveredPin] = useState<{
    title: string;
    subtitle?: string;
    badge?: string;
  } | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [activeCluster, setActiveCluster] = useState<MapCluster | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setActiveCluster(null);
    setZoomLevel((prev) => Math.min(prev + 0.5, 5));
  };
  const handleZoomOut = () => {
    setActiveCluster(null);
    setZoomLevel((prev) => Math.max(prev - 0.5, 0.7));
  };
  const handleReset = () => {
    setActiveCluster(null);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-cluster-popover]")) return;
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    },
    [panOffset]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  /* Mouse wheel zoom */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest("[data-cluster-popover]")) return;
      e.preventDefault();
      setActiveCluster(null);
      const delta = e.deltaY > 0 ? -0.25 : 0.25;
      setZoomLevel((prev) => Math.min(5, Math.max(0.7, Number((prev + delta).toFixed(2)))));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  /* Pre-project all points once when points change */
  const projectedPoints = useMemo<ProjectedPoint[]>(() => {
    return points
      .filter((p) => !isNaN(Number(p.latitude)) && !isNaN(Number(p.longitude)))
      .map((point) => {
        const { x, y } = projectGPS(Number(point.latitude), Number(point.longitude));
        return { point, x, y };
      });
  }, [points]);

  /* Dynamic zoom-aware spatial clustering (prevents overlapping pins & SVG lag) */
  const clusters = useMemo<MapCluster[]>(() => {
    if (projectedPoints.length === 0) return [];

    // Cluster radius in SVG units shrinks as user zooms in
    const radius = zoomLevel >= 4.2 ? 5.5 : 24 / zoomLevel;
    const radiusSq = radius * radius;
    const result: MapCluster[] = [];

    for (let i = 0; i < projectedPoints.length; i++) {
      const p = projectedPoints[i];
      let matched: MapCluster | null = null;

      for (let j = 0; j < result.length; j++) {
        const c = result[j];
        const dx = p.x - c.x;
        const dy = p.y - c.y;
        if (dx * dx + dy * dy <= radiusSq) {
          matched = c;
          break;
        }
      }

      if (matched) {
        const n = matched.items.length;
        const nextX = (matched.x * n + p.x) / (n + 1);
        const nextY = (matched.y * n + p.y) / (n + 1);
        const dist = Math.hypot(p.x - matched.x, p.y - matched.y);
        matched.x = nextX;
        matched.y = nextY;
        matched.spread = Math.max(matched.spread, dist);
        matched.items.push(p.point);
      } else {
        result.push({
          id: `c-${p.point.id}`,
          x: p.x,
          y: p.y,
          items: [p.point],
          spread: 0,
        });
      }
    }

    return result;
  }, [projectedPoints, zoomLevel]);

  const handleClusterClick = (cluster: MapCluster, e: React.MouseEvent) => {
    e.stopPropagation();

    if (cluster.items.length === 1) {
      setActiveCluster(null);
      onSelectLocation(cluster.items[0].id);
      return;
    }

    // If pins inside cluster have distinct positions and we can still zoom in, zoom into the cluster
    if (zoomLevel < 3.6 && cluster.spread > 1.5) {
      const nextZoom = Math.min(4.5, Number((zoomLevel + 1.15).toFixed(2)));
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        // Map SVG coordinates (500x800 centered in container) to pan offset
        const svgRenderHeight = rect.height * 0.95;
        const scaleToPx = svgRenderHeight / MAP_BOUNDS.svgHeight;
        const offsetX = (MAP_BOUNDS.svgWidth / 2 - cluster.x) * scaleToPx * nextZoom;
        const offsetY = (MAP_BOUNDS.svgHeight / 2 - cluster.y) * scaleToPx * nextZoom;
        setZoomLevel(nextZoom);
        setPanOffset({ x: offsetX, y: offsetY });
      } else {
        setZoomLevel(nextZoom);
      }
      setActiveCluster(null);
      return;
    }

    // At high zoom or identical GPS coordinates, open clean site picker popover
    setActiveCluster(cluster);
  };

  const selectedPoint = useMemo(
    () => projectedPoints.find((p) => p.point.id === selectedId) || null,
    [projectedPoints, selectedId]
  );

  const updateTooltipFromEvent = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  // Inverse scale so pins & clusters stay crisp and reasonably sized when zoomed in
  const invScale = 1 / Math.pow(zoomLevel, 0.55);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        handleMouseUp();
        setHoveredRegion(null);
        setHoveredPin(null);
      }}
      onClick={() => setActiveCluster(null)}
      className="relative w-full h-[420px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#E8F4F0] via-[#EEF7F4] to-[#E3F0EC] dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 border border-[#C8DDD6] dark:border-gray-700 select-none cursor-grab active:cursor-grabbing"
    >
      {/* Subtle dot grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #0D9488 0.8px, transparent 0.8px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* Map watermark & live cluster stats (top-left) */}
      <div className="absolute left-3.5 top-3.5 z-20 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-1.5 backdrop-blur-md shadow-2xs border border-emerald-100/80 dark:bg-gray-800/95 dark:border-gray-700">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
        </span>
        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
          Myanmar Vector Map
        </span>
        <span className="text-[10px] font-bold text-gray-400 border-l border-gray-200 dark:border-gray-700 pl-2">
          {points.length} sites
        </span>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 rounded-xl bg-white dark:bg-gray-800 px-4 py-2 shadow-md border border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-[#006B2F] border-t-transparent animate-spin" />
            Loading map sites...
          </div>
        </div>
      )}

      {/* Floating Hover Tooltip (for Pin, Cluster, or Region) */}
      {(hoveredPin || hoveredRegion) && !activeCluster && (
        <div
          className="absolute z-30 px-3 py-1.5 rounded-xl bg-gray-900/92 text-white text-[11px] font-semibold backdrop-blur-md shadow-lg pointer-events-none max-w-[240px]"
          style={{
            left: Math.min(tooltipPos.x + 14, (containerRef.current?.clientWidth || 500) - 210),
            top: Math.max(8, tooltipPos.y - 12),
          }}
        >
          {hoveredPin ? (
            <div className="space-y-0.5">
              <div className="font-bold leading-snug truncate">{hoveredPin.title}</div>
              {hoveredPin.subtitle && (
                <div className="text-[10px] text-gray-300 truncate">{hoveredPin.subtitle}</div>
              )}
              {hoveredPin.badge && (
                <div className="text-[9px] text-emerald-300 font-bold uppercase tracking-wider">
                  {hoveredPin.badge}
                </div>
              )}
            </div>
          ) : (
            <span className="whitespace-nowrap">{hoveredRegion}</span>
          )}
        </div>
      )}

      {/* Cluster Picker Popover (when clicking a cluster at max zoom or identical coordinates) */}
      {activeCluster && (
        <div
          data-cluster-popover
          onClick={(e) => e.stopPropagation()}
          className="absolute right-3.5 top-14 z-40 w-64 max-h-[290px] flex flex-col rounded-2xl bg-white/98 dark:bg-gray-900/98 backdrop-blur-md shadow-xl border border-gray-200/90 dark:border-gray-700 overflow-hidden"
        >
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/60">
            <div className="flex items-center gap-1.5">
              <Layers size={13} className="text-[#006B2F]" />
              <span className="text-xs font-extrabold text-gray-800 dark:text-white">
                {activeCluster.items.length} Sites in Cluster
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveCluster(null)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 dark:hover:bg-gray-700 transition"
            >
              <X size={13} />
            </button>
          </div>
          <div className="overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {activeCluster.items.map((item) => {
              const isSelected = item.id === selectedId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectLocation(item.id);
                    setActiveCluster(null);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 transition ${
                    isSelected
                      ? "bg-amber-50/80 dark:bg-amber-500/10"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  }`}
                >
                  <span
                    className="mt-1 h-2.5 w-2.5 rounded-full shrink-0 ring-2 ring-white dark:ring-gray-900"
                    style={{ backgroundColor: getPinFillColor(item.location_type) }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-gray-900 dark:text-white truncate">
                      {item.location_name}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                      {item.city || item.state_division || "—"}
                      {item.location_type ? ` • ${item.location_type}` : ""}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SVG Canvas with Pan & Zoom Transform */}
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: "center center",
          transition: isDragging ? "none" : "transform 0.18s ease-out",
        }}
      >
        <svg
          viewBox="0 0 500 800"
          className="w-auto h-[95%] max-h-full"
          style={{ filter: "drop-shadow(0 2px 8px rgba(13, 148, 136, 0.06))" }}
        >
          {/* Myanmar State & Division regions */}
          <g className="myanmar-regions">
            {MYANMAR_REGIONS.map((reg) => {
              const isHovered = hoveredRegion?.includes(reg.name);
              return (
                <g key={reg.id}>
                  <path
                    d={reg.path}
                    onMouseEnter={(e) => {
                      const myName = REGION_NAMES_MY[reg.id] || "";
                      setHoveredRegion(`${reg.name} ${reg.type} — ${myName}`);
                      updateTooltipFromEvent(e);
                    }}
                    onMouseMove={updateTooltipFromEvent}
                    onMouseLeave={() => setHoveredRegion(null)}
                    className={`transition-colors duration-150 cursor-pointer ${
                      isHovered
                        ? "fill-[#A7D8CB] dark:fill-teal-800/60 stroke-[#0D9488] dark:stroke-teal-500"
                        : "fill-[#C5E3DA] dark:fill-gray-800 hover:fill-[#B3DBC5] dark:hover:fill-teal-900/40 stroke-[#9EC9BD] dark:stroke-gray-700"
                    }`}
                    strokeWidth={isHovered ? 1.5 : 0.8}
                    strokeLinejoin="round"
                  />
                  {zoomLevel >= 1.5 && (
                    <text
                      x={reg.center.x}
                      y={reg.center.y}
                      textAnchor="middle"
                      className="fill-emerald-900/50 dark:fill-emerald-400/45 pointer-events-none"
                      style={{
                        fontSize: `${7 * invScale}px`,
                        fontWeight: 700,
                        letterSpacing: "0.4px",
                      }}
                    >
                      {reg.name}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Clustered Pins Layer (Zero Overlapping Labels) */}
          <g className="location-clusters">
            {clusters.map((cluster) => {
              const isMulti = cluster.items.length > 1;
              const containsSelected = cluster.items.some((item) => item.id === selectedId);

              if (isMulti) {
                const count = cluster.items.length;
                const baseRadius = count >= 50 ? 15 : count >= 15 ? 13 : 11;
                const r = baseRadius * invScale;
                return (
                  <g
                    key={cluster.id}
                    transform={`translate(${cluster.x}, ${cluster.y})`}
                    onClick={(e) => handleClusterClick(cluster, e)}
                    onMouseEnter={(e) => {
                      setHoveredPin({
                        title: `${count} Activity Locations`,
                        subtitle:
                          cluster.items[0]?.city ||
                          cluster.items[0]?.state_division ||
                          "Clustered Area",
                        badge:
                          zoomLevel < 3.6 && cluster.spread > 1.5
                            ? "Click to zoom in"
                            : "Click to view list",
                      });
                      updateTooltipFromEvent(e);
                    }}
                    onMouseMove={updateTooltipFromEvent}
                    onMouseLeave={() => setHoveredPin(null)}
                    className="cursor-pointer"
                  >
                    {/* Outer translucent halo */}
                    <circle
                      r={r + 4 * invScale}
                      fill={containsSelected ? "rgba(184, 142, 47, 0.28)" : "rgba(0, 107, 47, 0.2)"}
                    />
                    {/* Cluster bubble */}
                    <circle
                      r={r}
                      fill={containsSelected ? "#B88E2F" : "#006B2F"}
                      stroke="#FFFFFF"
                      strokeWidth={2 * invScale}
                    />
                    <text
                      y={3.2 * invScale}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      className="pointer-events-none"
                      style={{ fontSize: `${8.5 * invScale}px`, fontWeight: 800 }}
                    >
                      {count}
                    </text>
                  </g>
                );
              }

              const loc = cluster.items[0];
              const isSelected = loc.id === selectedId;
              const fill = isSelected ? "#B88E2F" : getPinFillColor(loc.location_type);
              const r = (isSelected ? 7.5 : 5.5) * invScale;

              return (
                <g
                  key={loc.id}
                  transform={`translate(${cluster.x}, ${cluster.y})`}
                  onClick={(e) => handleClusterClick(cluster, e)}
                  onMouseEnter={(e) => {
                    setHoveredPin({
                      title: loc.location_name,
                      subtitle: [loc.city, loc.location_type].filter(Boolean).join(" • "),
                      badge: loc.location_id,
                    });
                    updateTooltipFromEvent(e);
                  }}
                  onMouseMove={updateTooltipFromEvent}
                  onMouseLeave={() => setHoveredPin(null)}
                  className="cursor-pointer"
                >
                  {isSelected && (
                    <circle
                      r={14 * invScale}
                      fill="rgba(184, 142, 47, 0.28)"
                      className="animate-ping"
                    />
                  )}
                  <circle
                    r={r}
                    fill={fill}
                    stroke="#FFFFFF"
                    strokeWidth={(isSelected ? 2.4 : 1.6) * invScale}
                  />
                  {isSelected && <circle r={2.5 * invScale} fill="#FFFFFF" />}
                </g>
              );
            })}

            {/* Single compact SVG callout ONLY for the currently selected pin (when not inside a multi-cluster) */}
            {selectedPoint &&
              clusters.some(
                (c) => c.items.length === 1 && c.items[0].id === selectedPoint.point.id
              ) && (
                <g
                  transform={`translate(${selectedPoint.x}, ${selectedPoint.y - 14 * invScale})`}
                  className="pointer-events-none"
                >
                  <rect
                    x={-58 * invScale}
                    y={-15 * invScale}
                    width={116 * invScale}
                    height={16 * invScale}
                    rx={5 * invScale}
                    fill="#0f172a"
                    fillOpacity="0.9"
                    stroke="#B88E2F"
                    strokeWidth={1 * invScale}
                  />
                  <text
                    y={-4.5 * invScale}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    style={{ fontSize: `${7 * invScale}px`, fontWeight: 700 }}
                  >
                    {selectedPoint.point.location_name.length > 18
                      ? `${selectedPoint.point.location_name.slice(0, 17)}…`
                      : selectedPoint.point.location_name}
                  </text>
                </g>
              )}
          </g>
        </svg>
      </div>

      {/* Bottom-left: Compact Legend + Zoom % */}
      <div className="absolute left-3.5 bottom-3.5 z-20 flex flex-wrap items-center gap-2">
        <div className="px-2 py-1 rounded-lg bg-white/95 backdrop-blur-md shadow-2xs border border-gray-200/60 text-[10px] font-bold text-gray-600 dark:bg-gray-800/95 dark:border-gray-700 dark:text-gray-300">
          {Math.round(zoomLevel * 100)}%
        </div>
        <div className="hidden sm:flex items-center gap-2.5 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md shadow-2xs border border-gray-200/60 text-[10px] font-semibold text-gray-600 dark:bg-gray-800/95 dark:border-gray-700 dark:text-gray-300">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-600" /> Offshore
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-600" /> Onshore
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-indigo-600" /> Pipeline
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#006B2F]" /> Cluster
          </span>
        </div>
      </div>

      {/* Bottom-right: Floating Zoom & Reset Controls */}
      <div className="absolute right-3.5 bottom-3.5 z-20 flex items-center gap-1.5">
        <div className="flex items-center overflow-hidden rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-gray-200/70 dark:bg-gray-800/95 dark:border-gray-700">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
            title="Zoom Out"
            className="flex h-8 w-8 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <Minus size={15} />
          </button>
          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            title="Zoom In"
            className="flex h-8 w-8 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <Plus size={15} />
          </button>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleReset();
          }}
          title="Reset View"
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-gray-200/70 text-gray-500 transition hover:bg-gray-50 hover:text-gray-800 dark:bg-gray-800/95 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          <Compass size={15} />
        </button>
      </div>
    </div>
  );
}
