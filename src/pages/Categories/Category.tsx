import PageMeta from "../../components/common/PageMeta";
import CategoryTable from "../../components/categories/CategoryTable";
import { useEffect, useState } from "react";
import { Category, AddCategory } from "../../interfaces/category";
import { categoryApi } from "../../api/categoryApi";
import { toast } from "react-toastify";
import { Download, Plus, FolderTree, Folder, FolderOpen, X, Loader2 } from "lucide-react";
import { parseApiError } from "../../helpers/parseApiError";
import Select from "react-select";

export default function Categories() {
  const [categorys, setCategories] = useState<Category[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<AddCategory>({ category_name: "", parent_id: "" });

  const fetchAll = async () => {
    try {
      const data = await categoryApi.all();
      let items = data?.categorys || data?.categories || data;
      if (!Array.isArray(items)) {
        items = Array.isArray(data?.data) ? data.data : [];
      }
      setCategories(items);
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch lists");
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Stats (Ensure categorys is an array)
  const safeCategories = Array.isArray(categorys) ? categorys : [];
  const total = safeCategories.length;
  const parentCount = safeCategories.filter(c => !c.parent_id).length;
  const subCount = safeCategories.filter(c => !!c.parent_id).length;

  return (
    <div className="bg-[#fcfdff] min-h-screen pb-10">
      <PageMeta title="Categories Management | MOEE" description="Categories Management Page" />

      <div className="px-4 sm:px-8 py-8 max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#0f172a] tracking-tight">Categories</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition shadow-sm">
              <Download size={16} /> Export
            </button>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#B88E2F] rounded-full hover:bg-[#997524] transition shadow-sm">
              <Plus size={16} /> Add Category
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] flex items-center gap-5">
            <div className="p-3.5 bg-[#FEF3C7] rounded-full text-[#B88E2F]"><FolderTree size={22} /></div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total Categories</p>
              <h3 className="text-[28px] font-extrabold text-[#0f172a] mt-0.5 leading-none">{total}</h3>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] flex items-center gap-5">
            <div className="p-3.5 bg-[#eff6ff] rounded-full text-[#3b82f6]"><Folder size={22} /></div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Main Categories</p>
              <h3 className="text-[28px] font-extrabold text-[#0f172a] mt-0.5 leading-none">{parentCount}</h3>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] flex items-center gap-5">
            <div className="p-3.5 bg-[#f0fdf4] rounded-full text-[#22c55e]"><FolderOpen size={22} /></div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Subcategories</p>
              <h3 className="text-[28px] font-extrabold text-[#0f172a] mt-0.5 leading-none">{subCount}</h3>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div>
          <CategoryTable categorys={safeCategories} setCategories={setCategories} />
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsAddModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h2 className="text-[17px] font-extrabold text-gray-900">Add New Category</h2>
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
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">Category Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.category_name}
                    onChange={(e) => setForm({ ...form, category_name: e.target.value })}
                    disabled={isSubmitting}
                    placeholder="Enter category name"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/30 focus:border-[#B88E2F] transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">Parent Category (Optional)</label>
                  <Select
                    options={[
                      { value: "", label: "None (Main Category)" },
                      ...safeCategories.map(parent => ({ value: String(parent.id), label: parent.category_name }))
                    ]}
                    value={
                      form.parent_id
                        ? { value: String(form.parent_id), label: safeCategories.find(c => String(c.id) === String(form.parent_id))?.category_name || "Unknown" }
                        : { value: "", label: "None (Main Category)" }
                    }
                    onChange={(selected: any) => setForm({ ...form, parent_id: selected ? selected.value : "" })}
                    isDisabled={isSubmitting}
                    isSearchable
                    placeholder="Search parent category..."
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
                    if (!form.category_name.trim()) {
                      toast.error("Category name is required.");
                      return;
                    }
                    setIsSubmitting(true);
                    try {
                      await categoryApi.create(form);
                      toast.success("Category created successfully!");
                      setForm({ category_name: "", parent_id: "" });
                      setIsAddModalOpen(false);
                      fetchAll(); // Refresh list
                    } catch (error: any) {
                      toast.error(parseApiError(error, "Failed to create category!"));
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B88E2F] hover:bg-[#997524] text-white text-[13px] font-bold transition-colors shadow-sm disabled:opacity-70"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  Save Category
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
