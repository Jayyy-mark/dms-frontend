import PageMeta from "../../components/common/PageMeta";
import StaffTable from "../../components/staffs/StaffTable";
import { useEffect, useState } from "react";
import { Staff } from "../../interfaces/staff";
import { staffApi } from "../../api/staffApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { Download, Plus, Users as UsersIcon, Briefcase, UserCheck, Venus } from "lucide-react";

export default function Staffs() {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const navigate = useNavigate();

  const fetchAll = async () => {
    try {
      const data = await staffApi.all();
      setStaffs(data.staffs || data);
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch lists");
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Stats
  const total = staffs.length;
  const maleCount = staffs.filter(s => s.staff_gender?.toLowerCase() === 'male').length;
  const femaleCount = staffs.filter(s => s.staff_gender?.toLowerCase() === 'female').length;

  // Unique departments count
  const deptSet = new Set(staffs.map(s => s.department_id).filter(Boolean));
  const deptCount = deptSet.size;

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
              onClick={() => navigate("/staff/add")}
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
              <h3 className="text-[28px] font-extrabold text-[#0f172a] mt-0.5 leading-none">{total}</h3>
            </div>
          </div>
          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] flex items-center gap-5">
            <div className="p-3.5 bg-[#eff6ff] rounded-full text-[#3b82f6]"><Briefcase size={22} /></div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Departments</p>
              <h3 className="text-[28px] font-extrabold text-[#0f172a] mt-0.5 leading-none">{deptCount}</h3>
            </div>
          </div>
          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] flex items-center gap-5">
            <div className="p-3.5 bg-[#f0fdf4] rounded-full text-[#22c55e]"><UserCheck size={22} /></div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Male</p>
              <h3 className="text-[28px] font-extrabold text-[#0f172a] mt-0.5 leading-none">{maleCount}</h3>
            </div>
          </div>
          {/* Card 4 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] flex items-center gap-5">
            <div className="p-3.5 bg-[#fdf4ff] rounded-full text-[#a855f7]"><Venus size={22} /></div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Female</p>
              <h3 className="text-[28px] font-extrabold text-[#0f172a] mt-0.5 leading-none">{femaleCount}</h3>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div>
          <StaffTable staffs={staffs} setStaffs={setStaffs} />
        </div>
      </div>
    </div>
  );
}
