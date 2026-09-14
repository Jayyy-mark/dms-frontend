import PageMeta from "../../components/common/PageMeta";
import ArchiveDocumentTable from "../../components/archives/ArchiveDocTable";
import { useEffect, useRef, useState } from "react";
import { Document, DocumentSearch } from "../../interfaces/document";
import { documentApi } from "../../api/documentApi";
import { toast } from "react-toastify";
import { FileText, Clock, Archive, AlertCircle } from "lucide-react";

export default function Archives() {
  const searchRef = useRef<any>(null);
  const [Documents, setDocuments] = useState<Document[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const fetchAllArchiveDocuments = async () => {
    try {
      const data = await documentApi.getAllArchiveDocument();
      setDocuments(data.documents);
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch Document lists");
    }
  };

  useEffect(() => {
    fetchAllArchiveDocuments();
  }, []);

  useEffect(() => {
    const autoScrollPage = async () => {
      if (isSearching) {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    };
    autoScrollPage();
  }, [isSearching]);

  const handleSearch = async (data: DocumentSearch) => {
    try {
      const resultDocuments = await documentApi.searchArchiveDocument(data);
      setDocuments(resultDocuments);
      setIsSearching(true);
    } catch (error: any) {
      console.log(error);
      toast.error(error?.message || "Failed to fetch Document lists");
    }
  };

  const handleClearSearch = async () => {
    searchRef.current?.reset?.();
    await fetchAllArchiveDocuments();
    setIsSearching(false);
    toast.info("Search cleared");
  };

  // Stats calculation
  const totalDocs = Documents.length;
  const tempDocs = Documents.filter(d => d.dtype?.dtype_name === 'Temporary').length;
  const permDocs = Documents.filter(d => d.dtype?.dtype_name === 'Permanent').length;
  const expiredDocs = Documents.filter(d => {
    if (d.dtype?.dtype_name !== 'Temporary') return false;
    if (!d.expired_at) return false;
    const diff = new Date(d.expired_at).getTime() - new Date().getTime();
    return diff < 0;
  }).length;

  return (
    <div className="bg-[#fcfdff] min-h-screen pb-10">
      <PageMeta
        title="Archive Documents | MOEE"
        description="Archive Document Management Page"
      />

      <div className="px-4 sm:px-8 py-8 max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#0f172a] tracking-tight">Archives</h1>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] flex items-center gap-5">
            <div className="p-3.5 bg-[#FEF3C7] rounded-full text-[#B88E2F]"><FileText size={22} /></div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total Archived</p>
              <h3 className="text-[28px] font-extrabold text-[#0f172a] mt-0.5 leading-none">{totalDocs}</h3>
            </div>
          </div>
          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] flex items-center gap-5">
            <div className="p-3.5 bg-[#eff6ff] rounded-full text-[#3b82f6]"><Clock size={22} /></div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Temporary</p>
              <h3 className="text-[28px] font-extrabold text-[#0f172a] mt-0.5 leading-none">{tempDocs}</h3>
            </div>
          </div>
          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] flex items-center gap-5">
            <div className="p-3.5 bg-[#f0fdf4] rounded-full text-[#22c55e]"><Archive size={22} /></div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Permanent</p>
              <h3 className="text-[28px] font-extrabold text-[#0f172a] mt-0.5 leading-none">{permDocs}</h3>
            </div>
          </div>
          {/* Card 4 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] flex items-center gap-5">
            <div className="p-3.5 bg-[#fef2f2] rounded-full text-[#ef4444]"><AlertCircle size={22} /></div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Expired</p>
              <h3 className="text-[28px] font-extrabold text-[#0f172a] mt-0.5 leading-none">{expiredDocs}</h3>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div ref={scrollRef}>
          <ArchiveDocumentTable
            documents={Documents}
            setDocuments={setDocuments}
            searchRef={searchRef}
            onSearch={handleSearch}
            onClearSearch={handleClearSearch}
          />
        </div>
      </div>
    </div>
  );
}
