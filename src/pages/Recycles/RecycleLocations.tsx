import { useState } from "react";
import { MapPin, Trash2 } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import RecycleLocationTable from "../../components/locations/RecycleLocationTable";
import { LocationStats } from "../../hooks/useLocations";

export default function RecycleLocations() {
  const [stats, setStats] = useState<LocationStats>({
    total: 0,
    folders: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="bg-[#fcfdff] min-h-screen pb-10">
      <PageMeta
        title="Recycle Locations | MOEE"
        description="Recycle Bin Locations Management Page"
      />

      <div className="px-4 sm:px-8 py-8 max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#0f172a] tracking-tight">Recycle Locations</h1>
            <p className="text-xs text-gray-500 mt-1">
              Click any row to view all photos &amp; details or restore the location.
            </p>
          </div>
        </div>

        {/* Stat Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] flex items-center gap-5">
            <div className="p-3.5 bg-[#FEF3C7] rounded-full text-[#B88E2F]">
              <Trash2 size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Total Recycled Locations
              </p>
              <h3 className="text-[28px] font-extrabold text-[#0f172a] mt-0.5 leading-none">
                {isLoading ? (
                  <span className="inline-block h-7 w-16 rounded-lg bg-gray-200 animate-pulse" />
                ) : (
                  stats.total.toLocaleString()
                )}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] flex items-center gap-5">
            <div className="p-3.5 bg-[#eff6ff] rounded-full text-[#3b82f6]">
              <MapPin size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Location Status
              </p>
              <h3 className="text-sm font-bold text-[#0f172a] mt-1">
                Soft-Deleted (Restorable)
              </h3>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <RecycleLocationTable
            onStatsChange={(newStats, loading) => {
              if (newStats) setStats(newStats);
              setIsLoading(loading);
            }}
          />
        </div>
      </div>
    </div>
  );
}

