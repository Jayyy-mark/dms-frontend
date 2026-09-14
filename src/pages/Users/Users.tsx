import PageMeta from "../../components/common/PageMeta";
import UserTable from "../../components/admin/UserTable";
import { useEffect, useState } from "react";
import { User } from "../../interfaces/user";
import { userApi } from "../../api/userApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { Download, Plus, Users as UsersIcon, ShieldCheck, UserCheck, UserX } from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  const fetchAllUsers = async () => {
    try {
      const data = await userApi.all();
      setUsers(data.users);
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Stats
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'Admin').length;
  const activeUsers = users.filter(u => u.is_active !== false).length;
  const inactiveUsers = users.filter(u => u.is_active === false).length;

  return (
    <div className="bg-[#fcfdff] min-h-screen pb-10">
      <PageMeta title="Users Management | MOGE" description="Users Management Page" />
      <div className="px-4 sm:px-8 py-8 max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#0f172a] tracking-tight">Users</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition shadow-sm">
              <Download size={16} /> Export
            </button>
            <button
              onClick={() => navigate("/users/add")}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#B88E2F] rounded-full hover:bg-[#997524] transition shadow-sm"
            >
              <Plus size={16} /> Add User
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] flex items-center gap-5">
            <div className="p-3.5 bg-[#FEF3C7] rounded-full text-[#B88E2F]"><UsersIcon size={22} /></div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total Users</p>
              <h3 className="text-[28px] font-extrabold text-[#0f172a] mt-0.5 leading-none">{totalUsers}</h3>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] flex items-center gap-5">
            <div className="p-3.5 bg-[#eff6ff] rounded-full text-[#3b82f6]"><ShieldCheck size={22} /></div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Admins</p>
              <h3 className="text-[28px] font-extrabold text-[#0f172a] mt-0.5 leading-none">{adminUsers}</h3>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] flex items-center gap-5">
            <div className="p-3.5 bg-[#f0fdf4] rounded-full text-[#22c55e]"><UserCheck size={22} /></div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Active</p>
              <h3 className="text-[28px] font-extrabold text-[#0f172a] mt-0.5 leading-none">{activeUsers}</h3>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] flex items-center gap-5">
            <div className="p-3.5 bg-[#fef2f2] rounded-full text-[#ef4444]"><UserX size={22} /></div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Inactive</p>
              <h3 className="text-[28px] font-extrabold text-[#0f172a] mt-0.5 leading-none">{inactiveUsers}</h3>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <UserTable users={users} setUsers={setUsers} />
      </div>
    </div>
  );
}
