import PageMeta from "../../components/common/PageMeta";
import BuildingTable from "../../components/buildings/BuildingTable";
import { useEffect, useState } from "react";
import { Building, AddBuilding } from "../../interfaces/building";
import { buildingApi } from "../../api/buildingApi";
import { toast } from "react-toastify";
import { Download, Plus, Building2 as EntityIcon, X, Loader2 } from "lucide-react";
import { parseApiError } from "../../helpers/parseApiError";

export default function Buildings() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<AddBuilding>({ building_name: "" });

  const fetchAll = async () => {
    try {
      const data = await buildingApi.all();
      setBuildings(data.buildings || data);
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch lists");
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const total = buildings.length;

  return (
    <div className="bg-[#fcfdff] min-h-screen pb-10">
      <PageMeta title="Buildings Management | MOGE" description="Buildings Management Page" />

      <div className="px-4 sm:px-8 py-8 max-w-[1400px] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#0f172a] tracking-tight">Buildings</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition shadow-sm">
              <Download size={16} /> Export
            </button>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#B88E2F] rounded-full hover:bg-[#997524] transition shadow-sm">
              <Plus size={16} /> Add building
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center gap-5">
            <div className="p-3.5 bg-[#FEF3C7] rounded-full text-[#B88E2F]"><EntityIcon size={22} /></div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total Buildings</p>
              <h3 className="text-[28px] font-extrabold text-[#0f172a] mt-0.5 leading-none">{total}</h3>
            </div>
          </div>
        </div>

        <div>
          <BuildingTable buildings={buildings} setBuildings={setBuildings} />
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsAddModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h2 className="text-[17px] font-extrabold text-gray-900">Add New Building</h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">Building Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.building_name}
                    onChange={(e) => setForm({ ...form, building_name: e.target.value })}
                    disabled={isSubmitting}
                    placeholder="Enter building name"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/30 focus:border-[#B88E2F] transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    autoFocus
                  />
                </div>
              </div>

              <div className="px-6 py-5 border-t border-gray-100 flex gap-3 justify-end bg-gray-50/50 rounded-b-2xl">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!form.building_name.trim()) {
                      toast.error("Building name is required.");
                      return;
                    }
                    setIsSubmitting(true);
                    try {
                      await buildingApi.create(form);
                      toast.success("Building created successfully!");
                      setForm({ building_name: "" });
                      setIsAddModalOpen(false);
                      fetchAll(); // Refresh list
                    } catch (error: any) {
                      toast.error(parseApiError(error, "Failed to create building!"));
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B88E2F] hover:bg-[#997524] text-white text-[13px] font-bold transition-colors shadow-sm disabled:opacity-70"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  Save Building
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
