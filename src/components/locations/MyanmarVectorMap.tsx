import React, { useState, useRef, useCallback, useEffect } from "react";
import { Plus, Minus, Compass, MapPin } from "lucide-react";
import { Location } from "../../interfaces/location";
import { MYANMAR_REGIONS } from "./myanmarRegionsData";

interface MyanmarVectorMapProps {
  locations: Location[];
  selectedIdx: number | null;
  onSelectLocation: (idx: number) => void;
  pinPalette: string[];
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

export default function MyanmarVectorMap({
  locations,
  selectedIdx,
  onSelectLocation,
}: MyanmarVectorMapProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.3, 4));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.3, 0.5));
  const handleReset = () => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  }, [panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  /* Mouse wheel zoom */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      setZoomLevel((prev) => Math.min(4, Math.max(0.5, prev + delta)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  /* Count locations per region (for badge counts on the map) */
  const regionLocationCounts: Record<string, number> = {};
  locations.forEach((loc) => {
    const lat = parseFloat(String(loc.latitude ?? 0));
    const lng = parseFloat(String(loc.longitude ?? 0));
    // Find which region this location belongs to (by nearest center)
    let minDist = Infinity;
    let nearestId = "";
    MYANMAR_REGIONS.forEach((reg) => {
      const dist = Math.sqrt(
        Math.pow(lat - reg.centerGPS.lat, 2) + Math.pow(lng - reg.centerGPS.lng, 2)
      );
      if (dist < minDist) { minDist = dist; nearestId = reg.id; }
    });
    if (nearestId) regionLocationCounts[nearestId] = (regionLocationCounts[nearestId] || 0) + 1;
  });

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative w-full h-[420px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#E8F4F0] via-[#EEF7F4] to-[#E3F0EC] dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 border border-[#C8DDD6] dark:border-gray-700 select-none cursor-grab active:cursor-grabbing"
    >
      {/* Subtle dot grid pattern overlay (ExpressVPN style) */}
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #0D9488 0.8px, transparent 0.8px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* Map watermark label (top-left) */}
      <div className="absolute left-3.5 top-3.5 z-20 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-1.5 backdrop-blur-md shadow-2xs border border-emerald-100/80 dark:bg-gray-800/95 dark:border-gray-700">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
        </span>
        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
          Myanmar Vector Map
        </span>
      </div>

      {/* Hovered Region Tooltip */}
      {hoveredRegion && (
        <div
          className="absolute z-30 px-3 py-1.5 rounded-xl bg-gray-900/90 text-white text-[11px] font-semibold backdrop-blur-md shadow-lg pointer-events-none whitespace-nowrap"
          style={{ left: tooltipPos.x + 16, top: tooltipPos.y - 8 }}
        >
          {hoveredRegion}
        </div>
      )}

      {/* SVG Canvas with Pan & Zoom Transform */}
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: "center center",
          transition: isDragging ? "none" : "transform 0.15s ease-out",
        }}
      >
        <svg
          viewBox="0 0 500 800"
          className="w-auto h-[95%] max-h-full"
          style={{ filter: "drop-shadow(0 2px 8px rgba(13, 148, 136, 0.06))" }}
        >
          {/* Render all Myanmar State & Division regions */}
          <g className="myanmar-regions">
            {MYANMAR_REGIONS.map((reg) => {
              const isHovered = hoveredRegion?.includes(reg.name);
              const locCount = regionLocationCounts[reg.id] || 0;
              return (
                <g key={reg.id}>
                  <path
                    d={reg.path}
                    onMouseEnter={(e) => {
                      const myName = REGION_NAMES_MY[reg.id] || "";
                      setHoveredRegion(`${reg.name} ${reg.type} — ${myName}`);
                      const rect = containerRef.current?.getBoundingClientRect();
                      if (rect) setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                    }}
                    onMouseMove={(e) => {
                      const rect = containerRef.current?.getBoundingClientRect();
                      if (rect) setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                    }}
                    onMouseLeave={() => setHoveredRegion(null)}
                    className={`transition-all duration-200 cursor-pointer ${isHovered
                      ? "fill-[#A7D8CB] dark:fill-teal-800/60 stroke-[#0D9488] dark:stroke-teal-500"
                      : "fill-[#C5E3DA] dark:fill-gray-800 hover:fill-[#B3DBC5] dark:hover:fill-teal-900/40 stroke-[#9EC9BD] dark:stroke-gray-700"
                      }`}
                    strokeWidth={isHovered ? 1.8 : 0.8}
                    strokeLinejoin="round"
                  />
                  {/* Region name label (shown when zoomed in) */}
                  {zoomLevel >= 1.5 && (
                    <text
                      x={reg.center.x}
                      y={reg.center.y}
                      textAnchor="middle"
                      className="fill-emerald-800/60 dark:fill-emerald-400/50 pointer-events-none"
                      style={{ fontSize: "7px", fontWeight: 700, letterSpacing: "0.5px" }}
                    >
                      {reg.name}
                    </text>
                  )}
                  {/* Location count badge on region (if locations exist) */}
                  {locCount > 0 && zoomLevel < 1.5 && (
                    <g>
                      <circle
                        cx={reg.center.x}
                        cy={reg.center.y}
                        r="11"
                        className="fill-[#006B2F]/90 stroke-white"
                        strokeWidth="1.5"
                      />
                      <text
                        x={reg.center.x}
                        y={reg.center.y + 3.5}
                        textAnchor="middle"
                        className="fill-white pointer-events-none"
                        style={{ fontSize: "8px", fontWeight: 800 }}
                      >
                        {locCount}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* Location GPS Pins */}
          <g className="location-pins">
            {locations.map((loc, idx) => {
              const lat = parseFloat(String(loc.latitude ?? 21.0));
              const lng = parseFloat(String(loc.longitude ?? 96.0));
              const pos = projectGPS(lat, lng);
              const isSelected = selectedIdx === idx;

              return (
                <g
                  key={loc.id || idx}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLocation(idx);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Pulsing ring for selected */}
                  {isSelected && (
                    <circle r="14" className="fill-emerald-400/30 animate-ping" />
                  )}
                  {/* Shadow underneath */}
                  <ellipse
                    rx={isSelected ? 5 : 4}
                    ry={isSelected ? 2 : 1.5}
                    cy={isSelected ? 8 : 6}
                    className="fill-black/10"
                  />
                  {/* Pin dot */}
                  <circle
                    r={isSelected ? 7 : 5}
                    className={`transition-all duration-200 ${isSelected
                      ? "fill-[#006B2F] stroke-white stroke-[2.5]"
                      : "fill-[#0D9488] hover:fill-[#006B2F] stroke-white stroke-[1.8]"
                      }`}
                  />
                  {/* Inner dot for selected */}
                  {isSelected && (
                    <circle r="2.5" className="fill-white" />
                  )}
                  {/* Label badge */}
                  <foreignObject
                    x="-55"
                    y="-28"
                    width="110"
                    height="22"
                    className="overflow-visible pointer-events-none"
                  >
                    <div className="flex items-center justify-center">
                      <span
                        className={`inline-flex items-center gap-0.5 px-1.5 py-px rounded-md text-[8px] font-extrabold tracking-tight shadow-sm border whitespace-nowrap transition-all duration-200 ${isSelected
                          ? "bg-[#006B2F] text-white border-emerald-600 scale-110"
                          : "bg-white/95 text-gray-800 border-gray-200/80 group-hover:scale-105 dark:bg-gray-900/95 dark:text-white dark:border-gray-700"
                          }`}
                      >
                        <MapPin size={8} className={isSelected ? "text-amber-300" : "text-emerald-600"} />
                        {loc.location_name}
                      </span>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Floating Zoom & Compass Controls (bottom-right, ExpressVPN style) */}
      <div className="absolute right-3.5 bottom-3.5 z-20 flex items-center gap-1.5">
        {/* Zoom pill [-|+] */}
        <div className="flex items-center overflow-hidden rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-gray-200/70 dark:bg-gray-800/95 dark:border-gray-700">
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="flex h-8 w-8 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <Minus size={15} />
          </button>
          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="flex h-8 w-8 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <Plus size={15} />
          </button>
        </div>
        {/* Reset button */}
        <button
          onClick={handleReset}
          title="Reset View"
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-gray-200/70 text-gray-500 transition hover:bg-gray-50 hover:text-gray-800 dark:bg-gray-800/95 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          <Compass size={15} />
        </button>
      </div>

      {/* Zoom level indicator */}
      <div className="absolute left-3.5 bottom-3.5 z-20 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md shadow-2xs border border-gray-200/60 text-[9px] font-bold text-gray-500 dark:bg-gray-800/90 dark:border-gray-700 dark:text-gray-400">
        {Math.round(zoomLevel * 100)}%
      </div>
    </div>
  );
}
