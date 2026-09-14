import PageMeta from "../../components/common/PageMeta";
import RoomTable from "../../components/rooms/RoomTable";
import { useEffect, useState } from "react";
import { Room, AddRoom } from "../../interfaces/room";
import { roomApi } from "../../api/roomApi";
import { buildingApi } from "../../api/buildingApi";
import { Building } from "../../interfaces/building";
import { toast } from "react-toastify";
import { Download, Plus, DoorOpen as EntityIcon, X, Loader2 } from "lucide-react";
import { parseApiError } from "../../helpers/parseApiError";
import Select from "react-select";

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<AddRoom>({ room_name: "", room_no: "", building_id: "" });

  const fetchAll = async () => {
    try {
      const data = await roomApi.all();
      setRooms(data.rooms || data);
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch lists");
    }
  };

  const fetchBuildings = async () => {
    try {
      const data = await buildingApi.all();
      setBuildings(data.buildings || data);
    } catch (error: any) {
      console.error("Failed to fetch buildings", error);
    }
  };

  useEffect(() => {
    fetchAll();
    fetchBuildings();
  }, []);

  const total = rooms.length;

  return (
    <div className="bg-[#fcfdff] min-h-screen pb-10">
      <PageMeta title="Rooms Management | MOGE" description="Rooms Management Page" />

      <div className="px-4 sm:px-8 py-8 max-w-[1400px] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#0f172a] tracking-tight">Rooms</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition shadow-sm">
              <Download size={16} /> Export
            </button>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#B88E2F] rounded-full hover:bg-[#997524] transition shadow-sm">
              <Plus size={16} /> Add room
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center gap-5">
            <div className="p-3.5 bg-[#FEF3C7] rounded-full text-[#B88E2F]"><EntityIcon size={22} /></div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total Rooms</p>
              <h3 className="text-[28px] font-extrabold text-[#0f172a] mt-0.5 leading-none">{total}</h3>
            </div>
          </div>
        </div>

        <div>
          <RoomTable rooms={rooms} setRooms={setRooms} buildings={buildings} />
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsAddModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h2 className="text-[17px] font-extrabold text-gray-900">Add New Room</h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">Room Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.room_name}
                    onChange={(e) => setForm({ ...form, room_name: e.target.value })}
                    disabled={isSubmitting}
                    placeholder="Enter room name"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/30 focus:border-[#B88E2F] transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">Room No. <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.room_no}
                    onChange={(e) => setForm({ ...form, room_no: e.target.value })}
                    disabled={isSubmitting}
                    placeholder="Enter room number"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/30 focus:border-[#B88E2F] transition-all disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">Building <span className="text-red-500">*</span></label>
                  <Select
                    options={buildings.map(b => ({ value: String(b.id), label: b.building_name }))}
                    value={
                      form.building_id
                        ? { value: String(form.building_id), label: buildings.find(b => String(b.id) === String(form.building_id))?.building_name || "Unknown" }
                        : null
                    }
                    onChange={(selected: any) => setForm({ ...form, building_id: selected ? selected.value : "" })}
                    isDisabled={isSubmitting}
                    isSearchable
                    placeholder="Select a building..."
                    maxMenuHeight={170}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderRadius: '0.75rem',
                        padding: '0.2rem',
                        borderColor: state.isFocused ? '#B88E2F' : '#e5e7eb',
                        boxShadow: state.isFocused ? '0 0 0 4px rgba(14, 165, 233, 0.3)' : 'none',
                        fontSize: '14px',
                        backgroundColor: state.isDisabled ? '#f9fafb' : '#ffffff',
                        cursor: state.isDisabled ? 'not-allowed' : 'default'
                      }),
                      option: (base, state) => ({
                        ...base,
                        fontSize: '14px',
                        backgroundColor: state.isSelected ? '#eff6ff' : state.isFocused ? '#f3f4f6' : 'white',
                        color: state.isSelected ? '#1d4ed8' : '#374151',
                        padding: '10px 16px',
                        cursor: 'pointer'
                      }),
                      menu: (base) => ({
                        ...base,
                        borderRadius: '0.75rem',
                        overflow: 'hidden',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      })
                    }}
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
                    if (!form.room_name.trim() || !form.room_no.trim() || !form.building_id) {
                      toast.error("Please fill in all required fields.");
                      return;
                    }
                    setIsSubmitting(true);
                    try {
                      await roomApi.create(form);
                      toast.success("Room created successfully!");
                      setForm({ room_name: "", room_no: "", building_id: "" });
                      setIsAddModalOpen(false);
                      fetchAll(); // Refresh list
                    } catch (error: any) {
                      toast.error(parseApiError(error, "Failed to create room!"));
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B88E2F] hover:bg-[#997524] text-white text-[13px] font-bold transition-colors shadow-sm disabled:opacity-70"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  Save Room
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
