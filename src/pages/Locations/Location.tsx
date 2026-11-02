import PageMeta from "../../components/common/PageMeta";
import SearchLocation from "../../components/locations/SearchLocation";
import Button from "../../components/ui/button/Button";
import { Search, MapPin, Edit, ImagePlus, Folder, Download, Link, Filter } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { Location, LocationSearch } from "../../interfaces/location";
import { usePaginatedLocations, LocationStats } from "../../hooks/useLocations";
import ServerPaginationBar from "../../components/common/ServerPaginationBar";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { helper } from "../../helpers/utils";
import { API_SERVER } from "../../helpers/api";
import FilterModal from "../../components/locations/FilterModal";
import LocationTable from "../../components/locations/LocationTable";

export default function Locations() {
  const searchRef = useRef<any>(null);
  const navigate = useNavigate();

  // Stats from DB-level aggregation
  const [rootStats, setRootStats] = useState<LocationStats>({
    total: 0,
    folders: [],
  });
  const [isRootLoading, setIsRootLoading] = useState(true);

  // File Manager UI states
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Inside-folder DB pagination states
  const [folderPage, setFolderPage] = useState(1);
  const [folderItemsPerPage, setFolderItemsPerPage] = useState(25);
  const [folderSnapshotId, setFolderSnapshotId] = useState<number | undefined>(undefined);
  const [advFolderFilters, setAdvFolderFilters] = useState<Partial<LocationSearch>>({});

  const folderOffset = (folderPage - 1) * folderItemsPerPage;
  const folderSwr = usePaginatedLocations({
    ...advFolderFilters,
    limit: folderItemsPerPage,
    offset: folderOffset,
    folder: selectedFolder || undefined,
    search: selectedFolder ? (searchTerm.trim() || undefined) : undefined,
    snapshot_id: folderPage > 1 ? folderSnapshotId : undefined,
  });

  useEffect(() => {
    if (folderPage === 1 && folderSwr.pagination?.snapshot_id) {
      setFolderSnapshotId(folderSwr.pagination.snapshot_id);
    }
  }, [folderPage, folderSwr.pagination?.snapshot_id]);

  useEffect(() => {
    if (!selectedFolder && folderSwr.stats && rootStats.total === 0) {
      setRootStats(folderSwr.stats);
      setIsRootLoading(folderSwr.isLoading);
    }
  }, [selectedFolder, folderSwr.stats, folderSwr.isLoading]);

  const filteredFolders = useMemo(() => {
    const allFolders = rootStats.folders || [];
    if (!searchTerm) return allFolders;
    return allFolders.filter((f) => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [rootStats.folders, searchTerm]);

  const handleSearch = async (data: LocationSearch) => {
    setAdvFolderFilters(helper.cleanSearchParams(data));
    setFolderPage(1);
    setFolderSnapshotId(undefined);
    setIsFilterModalOpen(false);
  };

  const handleClearSearch = async () => {
    searchRef.current?.reset?.();
    setAdvFolderFilters({});
    setFolderPage(1);
    setFolderSnapshotId(undefined);
    setIsFilterModalOpen(false);
    toast.info("Search cleared");
  };

  const handleEditlocation = (location: Location) => {
    navigate(`/locations/edit/${location.id}`);
  };

  const handleDownload = (location: Location) => {
    if (!location.photo) return;
    fetch(`${API_SERVER}${location.photo}`)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        const ext = (location.photo as any as string)?.split(".").pop() || "jpg";
        a.download = `${location.location_name || "download"}.${ext}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => window.open(`${API_SERVER}${location.photo}`, "_blank"));
  };

  const folderTotalEntries = folderSwr.pagination?.total ?? folderSwr.locations.length;
  const folderTotalPages = Math.max(1, folderSwr.pagination?.total_pages ?? 1);

  return (
    <>
      <PageMeta
        title="Gallery"
        description="Manage your files and locations"
      />

      <div className="space-y-6">
        {!selectedFolder ? (
          /* ROOT VIEW */
          <>
            {/* Folders Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {/* Top Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-gray-100 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[#1a4a98] font-bold">Public</span>
                  <span className="bg-[#1a4a98] text-white text-xs font-bold px-2.5 py-0.5 rounded-md">
                    {rootStats.total.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-64">
                    <input
                      type="text"
                      placeholder="Search with item name"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a98]/20 focus:border-[#1a4a98] transition-all"
                    />
                    <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>

                  <Button
                    onClick={() => navigate("/locations/add")}
                    className="flex items-center gap-2"
                  >
                    <ImagePlus size={16} /> Add Image
                  </Button>
                </div>
              </div>

              {/* Folders Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-x-4 gap-y-8">
                {isRootLoading ? (
                  Array.from({ length: 8 }).map((_, idx) => (
                    <div key={`loc-folder-skel-${idx}`} className="flex flex-col items-center justify-center animate-pulse">
                      <div className="w-20 h-16 rounded-xl bg-gray-200" />
                      <div className="mt-3 space-y-1.5 flex flex-col items-center">
                        <div className="h-3.5 w-16 rounded bg-gray-200" />
                        <div className="h-2.5 w-12 rounded bg-gray-100" />
                      </div>
                    </div>
                  ))
                ) : filteredFolders.map((folder) => (
                  <div
                    key={folder.name}
                    onClick={() => {
                      setSelectedFolder(folder.name);
                      setSearchTerm("");
                      setFolderPage(1);
                      setFolderSnapshotId(undefined);
                    }}
                    className="flex flex-col items-center justify-center cursor-pointer group"
                  >
                    <div className="relative transition-transform duration-200 group-hover:-translate-y-1 group-active:scale-95">
                      <svg width="80" height="70" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
                        <path d="M0 12C0 5.37258 5.37258 0 12 0H35.5C39.5 0 43 2 45 5.5L50 14H88C94.6274 14 100 19.3726 100 26V68C100 74.6274 94.6274 80 88 80H12C5.37258 80 0 74.6274 0 68V12Z" fill="#ffb822" />
                        <path d="M0 26C0 19.3726 5.37258 14 12 14H88C94.6274 14 100 19.3726 100 26V68C100 74.6274 94.6274 80 88 80H12C5.37258 80 0 74.6274 0 68V26Z" fill="#ffc107" />
                        <path d="M15 22H45V30H15V22Z" fill="#ffffff" fillOpacity="0.4" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center">
                      <h3 className="text-[13px] font-bold text-gray-800 leading-tight mb-0.5 truncate w-full max-w-[80px]">{folder.name}</h3>
                      <p className="text-[11px] text-gray-500 font-medium">{folder.count} {folder.count === 1 ? "Item" : "Items"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently Added Table Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Locations </h2>
              <LocationTable
                onStatsChange={(newStats, loading) => {
                  if (newStats) setRootStats(newStats);
                  setIsRootLoading(loading);
                }}
              />
            </div>
          </>
        ) : (
          /* INSIDE FOLDER VIEW */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[calc(100vh-120px)]">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-gray-100 gap-4">
              <div className="flex items-center gap-2">
                <span
                  className="text-[#1a4a98] font-bold cursor-pointer hover:underline"
                  onClick={() => {
                    setSelectedFolder(null);
                    setSearchTerm("");
                    setAdvFolderFilters({});
                    setFolderPage(1);
                  }}
                >
                  Public
                </span>
                <span className="text-gray-400">/</span>
                <span className="text-[#1a4a98] font-bold">{selectedFolder}</span>
                <span className="bg-[#1a4a98] text-white text-xs font-bold px-2.5 py-0.5 rounded-md">
                  {folderTotalEntries.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Search with item name"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setFolderPage(1);
                      setFolderSnapshotId(undefined);
                    }}
                    className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a98]/20 focus:border-[#1a4a98] transition-all"
                  />
                  <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                <Button
                  variant="outline"
                  onClick={() => setIsFilterModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Filter size={16} /> Add filter
                </Button>

                <Button
                  onClick={() => navigate("/locations/add")}
                  className="flex items-center gap-2"
                >
                  <ImagePlus size={16} /> Add Image
                </Button>
              </div>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
              {folderSwr.isLoading ? (
                Array.from({ length: 12 }).map((_, idx) => (
                  <div
                    key={`loc-item-skel-${idx}`}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs animate-pulse"
                  >
                    <div className="w-full aspect-[4/3] bg-gray-200" />
                    <div className="px-3 py-2.5 border-t border-gray-100 flex justify-center">
                      <div className="h-3 w-24 rounded bg-gray-200" />
                    </div>
                  </div>
                ))
              ) : folderSwr.locations.map((location: Location) => (
                <div
                  key={location.id}
                  className="group relative flex flex-col items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Image Container */}
                  <div className="relative w-full aspect-[4/3] bg-gray-50 flex items-center justify-center overflow-hidden">
                    {location.photo ? (
                      <img
                        src={`${API_SERVER}${location.photo}`}
                        alt={location.location_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MapPin size={32} className="text-gray-300" />
                    )}

                    {/* Hover Buttons */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => window.open(`${API_SERVER}${location.photo}`, "_blank")}
                        className="p-1.5 bg-white rounded shadow-sm text-[#B88E2F] hover:bg-[#FEF3C7] transition-colors"
                        title="View"
                      >
                        <Link size={14} />
                      </button>
                      <button
                        onClick={() => handleDownload(location)}
                        className="p-1.5 bg-white rounded shadow-sm text-yellow-500 hover:bg-yellow-50 transition-colors"
                        title="Download"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => handleEditlocation(location)}
                        className="p-1.5 bg-white rounded shadow-sm text-green-500 hover:bg-green-50 transition-colors"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Label */}
                  <div className="w-full px-3 py-2 border-t border-gray-100 text-center">
                    <p className="text-[11px] font-medium text-gray-600 truncate">
                      {location.location_name || (location.date ? helper.formatDate(new Date(location.date)) : "Untitled")}
                      {location.photo ? ` .${(location.photo as any as string).split(".").pop()}` : ""}
                    </p>
                  </div>
                </div>
              ))}

              {!folderSwr.isLoading && folderSwr.locations.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500">
                  <Folder size={48} className="mx-auto text-gray-300 mb-3" />
                  <p>No items found in this folder.</p>
                </div>
              )}
            </div>

            {!folderSwr.isLoading && folderTotalEntries > 0 && (
              <ServerPaginationBar
                currentPage={folderPage}
                itemsPerPage={folderItemsPerPage}
                totalEntries={folderTotalEntries}
                totalPages={folderTotalPages}
                remainingEntries={folderSwr.pagination?.remaining}
                remainingPages={folderSwr.pagination?.remaining_pages}
                currentCount={folderSwr.locations.length}
                onPageChange={(page) => setFolderPage(page)}
                onItemsPerPageChange={(limit) => {
                  setFolderItemsPerPage(limit);
                  setFolderPage(1);
                }}
                className="mt-6 rounded-xl border border-gray-200 shadow-sm"
              />
            )}
          </div>
        )}
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onClear={handleClearSearch}
        onSearch={() => searchRef.current?.submit()}
      >
        <SearchLocation ref={searchRef} onSearch={handleSearch} />
      </FilterModal>
    </>
  );
}
