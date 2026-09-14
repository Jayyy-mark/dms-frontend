import { useState } from "react";
import { FileText, FileType2, Download, X } from "lucide-react";
import { Staff } from "../../interfaces/staff";
import { exportStaffToPDF } from "../exports/pdf/StaffPDF";
import { exportStaffToWord } from "../exports/word/StaffWord";

interface StaffExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    staff: Staff | null;
}

const CATEGORIES = [
    { id: 1, title: "ပုံစံ (၁) ကိုယ်ရေးမှတ်တမ်း (၅၅ ချက်)", desc: "ရာထူးတိုး/ပြောင်းရွှေ့ခြင်းစသည့်ကိစ္စရပ်များ" },
    { id: 2, title: "ကိုယ်ရေးမှတ်တမ်း (၂၁ ချက်)", desc: "ရာထူးတိုးကိစ္စရပ်နှင့်အခြားဝန်ထမ်းရေးရာကိစ္စများ" },
    { id: 3, title: "ကိုယ်ရေးမှတ်တမ်း (၁၈ ချက်)", desc: "ပြည်ထောင်စုရာထူးဝန်အဖွဲ့သို့ Civil Service Personal Database Management System ပုံစံ" },
    { id: 4, title: "နိုင်ငံခြားသွားမည့်သူ၏ ကိုယ်ရေးမှတ်တမ်း (၃၀ ချက်)", desc: "နိုင်ငံခြားခရီးသွားကိစ္စရပ်များအတွက် ဝန်ကြီးဌာနသို့ ကနဦး တင်ပြရန်" },
    { id: 5, title: "ကိုယ်ရေးမှတ်တမ်း (၁၇ ချက်)", desc: "Secondee/ နိုင်ငံခြားခရီးသွားကိစ္စရပ်များ" },
];

const StaffExportModal: React.FC<StaffExportModalProps> = ({ isOpen, onClose, staff }) => {
    const [loading, setLoading] = useState<"pdf" | "word" | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<number>(1);

    if (!isOpen || !staff) return null;

    const handleExport = async (type: "pdf" | "word") => {
        setLoading(type);
        try {
            if (type === "pdf") {
                await exportStaffToPDF(staff, selectedCategory);
            } else {
                await exportStaffToWord(staff, selectedCategory);
            }
        } finally {
            setLoading(null);
            onClose();
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[99998] bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                <div
                    className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-5 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                <Download size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">Export Staff Profile</h3>
                                <p className="text-xs text-white/70 mt-0.5 truncate max-w-[300px]">
                                    {staff.staff_name}
                                </p>
                            </div>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5 overflow-y-auto">
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold mb-3">
                            1. Select Form Category
                        </p>
                        <div className="space-y-2 mb-6">
                            {CATEGORIES.map((cat) => (
                                <label
                                    key={cat.id}
                                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                        selectedCategory === cat.id
                                            ? "border-[#B88E2F] bg-[#FEF3C7] dark:bg-blue-900/20"
                                            : "border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-blue-200 dark:hover:border-gray-600"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="exportCategory"
                                        className="mt-1 flex-shrink-0 w-4 h-4 text-[#997524] border-gray-300 focus:ring-[#B88E2F] dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        checked={selectedCategory === cat.id}
                                        onChange={() => setSelectedCategory(cat.id)}
                                    />
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-semibold ${selectedCategory === cat.id ? 'text-amber-700 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                            {cat.title}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                                            {cat.desc}
                                        </span>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold mb-3">
                            2. Choose Export Format
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {/* PDF Option */}
                            <button
                                onClick={() => handleExport("pdf")}
                                disabled={loading !== null}
                                className="group relative flex flex-col items-center gap-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 hover:border-red-400 hover:bg-red-50 dark:hover:border-red-500 dark:hover:bg-red-900/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                                    <FileText size={20} className="text-red-500" />
                                </div>
                                <div className="text-center">
                                    <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Export as PDF</span>
                                </div>
                                {loading === "pdf" && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70 dark:bg-gray-800/70">
                                        <div className="h-5 w-5 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
                                    </div>
                                )}
                            </button>

                            {/* Word Option */}
                            <button
                                onClick={() => handleExport("word")}
                                disabled={loading !== null}
                                className="group relative flex flex-col items-center gap-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 hover:border-blue-400 hover:bg-[#FEF3C7] dark:hover:border-[#B88E2F] dark:hover:bg-blue-900/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                                    <FileType2 size={20} className="text-[#B88E2F]" />
                                </div>
                                <div className="text-center">
                                    <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Export as Word</span>
                                </div>
                                {loading === "word" && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70 dark:bg-gray-800/70">
                                        <div className="h-5 w-5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
                        <button
                            onClick={onClose}
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StaffExportModal;
