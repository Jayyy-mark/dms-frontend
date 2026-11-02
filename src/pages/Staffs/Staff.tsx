import PageMeta from "../../components/common/PageMeta";
import StaffTable from "../../components/staffs/StaffTable";
import { useState } from "react";
import { StaffStats } from "../../hooks/useStaffs";
import { useNavigate } from "react-router";
import { Download, Plus, Users as UsersIcon, Briefcase, UserCheck, Venus } from "lucide-react";

export default function Staffs() {
  const [stats, setStats] = useState<StaffStats>({
    all: 0,
    male: 0,
    female: 0,
    departments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="bg-[#fcfdff] min-h-screen pb-10">
      <PageMeta title="Staffs Management | MOEE" description="Staffs Management Page" />

      <div className="px-4 sm:px-8 py-8 max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#0f172a] tracking-tight">Staffs</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition shadow-sm">
              <Download size={16} /> Export
            </button>
            <button
              onClick={() => navigate("/staffs/add/")}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#B88E2F] rounded-full hover:bg-[#997524] transition shadow-sm"
            >
              <Plus size={16} /> Add Staff
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] flex items-center gap-5">
            <div className="p-3.5 bg-[#FEF3C7] rounded-full text-[#B88E2F]"><UsersIcon size={22} /></div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total Staffs</p>
              <h3 className="text-[28px] font-extrabold text-[#0f172a] mt-0.5 leading-none">{isLoading ? <span className="inline-block h-7 w-16 rounded-lg bg-gray-200 animate-pulse" /> : stats.all.toLocaleString()}</h3>
            </div>
          </div>
          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] flex items-center gap-5">
            <div className="p-3.5 bg-[#eff6ff] rounded-full text-[#3b82f6]"><Briefcase size={22} /></div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Departments</p>
              <h3 className="text-[28px] font-extrabold text-[#0f172a] mt-0.5 leading-none">{isLoading ? <span className="inline-block h-7 w-16 rounded-lg bg-gray-200 animate-pulse" /> : stats.departments.toLocaleString()}</h3>
            </div>
          </div>
          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] flex items-center gap-5">
            <div className="p-3.5 bg-[#f0fdf4] rounded-full text-[#22c55e]"><UserCheck size={22} /></div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Male</p>
              <h3 className="text-[28px] font-extrabold text-[#0f172a] mt-0.5 leading-none">{isLoading ? <span className="inline-block h-7 w-16 rounded-lg bg-gray-200 animate-pulse" /> : stats.male.toLocaleString()}</h3>
            </div>
          </div>
          {/* Card 4 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] flex items-center gap-5">
            <div className="p-3.5 bg-[#fdf4ff] rounded-full text-[#a855f7]"><Venus size={22} /></div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Female</p>
              <h3 className="text-[28px] font-extrabold text-[#0f172a] mt-0.5 leading-none">{isLoading ? <span className="inline-block h-7 w-16 rounded-lg bg-gray-200 animate-pulse" /> : stats.female.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div>
          <StaffTable
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
