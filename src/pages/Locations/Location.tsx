import PageMeta from "../../components/common/PageMeta";
import SearchLocation from "../../components/locations/SearchLocation";
import Button from "../../components/ui/button/Button";
import {
  Search,
  MapPin,
  Edit,
  ImagePlus,
  Folder,
  Download,
  ExternalLink,
  Filter,
  ArrowLeft,
  Image as ImageIcon,
  Calendar,
} from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { Location, LocationSearch } from "../../interfaces/location";
import { usePaginatedLocations, LocationStats } from "../../hooks/useLocations";
import ServerPaginationBar from "../../components/common/ServerPaginationBar";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { helper } from "../../helpers/utils";
import { API_SERVER } from "../../helpers/api";
import { locationApi } from "../../api/locationApi";
import FilterModal from "../../components/locations/FilterModal";
import LocationTable from "../../components/locations/LocationTable";

interface ResolvedPhoto {
  key: string;
  path: string;
  url: string;
  fileName: string;
}

const resolveMediaUrl = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_SERVER}${path.startsWith("/") ? "" : "/"}${path}`;
};

const getLocationPhotos = (location: Location): ResolvedPhoto[] => {
  const seen = new Set<string>();
  const items: ResolvedPhoto[] = [];

  const addPath = (rawPath: string, keyPrefix: string) => {
    const trimmed = rawPath.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    const segments = trimmed.split("/");
    const fileName = segments[segments.length - 1] || `photo-${items.length + 1}.jpg`;
    items.push({
      key: `${keyPrefix}-${items.length}`,
      path: trimmed,
      url: resolveMediaUrl(trimmed),
      fileName,
    });
  };

  if (location.photo && typeof location.photo === "string") {
    addPath(location.photo, `primary-${location.id}`);
  }
  if (Array.isArray(location.photos)) {
    location.photos.forEach((p, idx) => {
      if (p?.photo && typeof p.photo === "string") {
        addPath(p.photo, `photo-${p.id ?? idx}`);
      }
    });
  }

  return items;
};

function ActivityPhotoCard({
  photo,
  index,
  activityName,
  onView,
  onDownload,
}: {
  photo: ResolvedPhoto;
  index: number;
  activityName: string;
  onView: () => void;
  onDownload: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group relative flex flex-col items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative w-full aspect-[4/3] bg-gray-50 flex items-center justify-center overflow-hidden">
        {!imgError ? (
          <img
            src={photo.url}
            alt={`${activityName} - Photo ${index + 1}`}
            onError={() => setImgError(true)}
            onClick={onView}
            className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 p-4 text-center">
            <ImageIcon size={28} className="mb-1.5 opacity-50" />
            <span className="text-[11px] font-medium">Image unavailable</span>
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onView}
            className="p-1.5 bg-white rounded-lg shadow-sm text-[#B88E2F] hover:bg-[#FEF3C7] transition-colors"
            title="View Original"
          >
            <ExternalLink size={14} />
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="p-1.5 bg-white rounded-lg shadow-sm text-emerald-600 hover:bg-emerald-50 transition-colors"
            title="Download Photo"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      <div className="w-full px-3 py-2 border-t border-gray-100 text-center">
        <p className="text-[11px] font-medium text-gray-600 truncate" title={photo.fileName}>
          Photo {index + 1} · {photo.fileName}
        </p>
      </div>
    </div>
  );
}

export default function Locations() {
  const searchRef = useRef<any>(null);
  const navigate = useNavigate();

  // Stats from DB-level aggregation
  const [rootStats, setRootStats] = useState<LocationStats>({
    total: 0,
    folders: [],
  });
  const [isRootLoading, setIsRootLoading] = useState(true);

  // 3-Level File Manager UI states:
  // Level 1: Root (selectedFolder === null) -> Activity Type folders
  // Level 2: Inside Activity Type (selectedFolder !== null && selectedActivity === null) -> Activity Name folders
  // Level 3: Inside Activity Name (selectedActivity !== null) -> Photos belonging ONLY to that activity
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Location | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [photoSearchTerm, setPhotoSearchTerm] = useState("");
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
  }, [selectedFolder, folderSwr.stats, folderSwr.isLoading, rootStats.total]);

  const filteredFolders = useMemo(() => {
    const allFolders = rootStats.folders || [];
    if (!searchTerm) return allFolders;
    return allFolders.filter((f) => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [rootStats.folders, searchTerm]);

  const selectedActivityPhotos = useMemo(() => {
    if (!selectedActivity) return [];
    const all = getLocationPhotos(selectedActivity);
    const q = photoSearchTerm.trim().toLowerCase();
    if (!q) return all;
    return all.filter((p) => p.fileName.toLowerCase().includes(q));
  }, [selectedActivity, photoSearchTerm]);

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

  const handleViewPhoto = (location: Location, photo: ResolvedPhoto) => {
    void locationApi.logView(location.id).catch(() => {});
    window.open(photo.url, "_blank");
  };

  const handleDownloadPhoto = (location: Location, photo: ResolvedPhoto, index: number) => {
    void locationApi.logDownload(location.id).catch(() => {});
    fetch(photo.url)
      .then((response) => {
        if (!response.ok) throw new Error("Download failed");
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        const ext = photo.path.split(".").pop() || "jpg";
        a.download = `${location.location_name || "activity"}_${index + 1}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch(() => window.open(photo.url, "_blank"));
  };

  const goToRoot = () => {
    setSelectedFolder(null);
    setSelectedActivity(null);
    setSearchTerm("");
    setPhotoSearchTerm("");
    setAdvFolderFilters({});
    setFolderPage(1);
    setFolderSnapshotId(undefined);
  };

  const goToActivityTypeFolder = () => {
    setSelectedActivity(null);
    setPhotoSearchTerm("");
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
          /* LEVEL 1: ROOT VIEW — Activity Type Folders */
          <>
            {/* Folders Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {/* Top Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-gray-100 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[#1a4a98] font-bold">Photos</span>
                  <span className="bg-[#1a4a98] text-white text-xs font-bold px-2.5 py-0.5 rounded-md">
                    {rootStats.total.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-64">
                    <input
                      type="text"
                      placeholder="Search activity type..."
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

              {/* Activity Type Folders Grid */}
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
                    title={folder.name}
                    onClick={() => {
                      setSelectedFolder(folder.name);
                      setSelectedActivity(null);
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
                      <h3 className="text-[13px] font-bold text-gray-800 leading-tight mb-0.5 truncate w-full max-w-[88px]">{folder.name}</h3>
                      <p className="text-[11px] text-gray-500 font-medium">{folder.count} {folder.count === 1 ? "Activity" : "Activities"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently Added Table Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Locations</h2>
              <LocationTable
                onStatsChange={(newStats, loading) => {
                  if (newStats) setRootStats(newStats);
                  setIsRootLoading(loading);
                }}
              />
            </div>
          </>
        ) : !selectedActivity ? (
          /* LEVEL 2: INSIDE ACTIVITY TYPE FOLDER — Activity Name Subfolders */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[calc(100vh-120px)]">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-gray-100 gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={goToRoot}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-[#1a4a98] hover:bg-gray-100 transition-colors"
                  title="Back to Activity Types"
                >
                  <ArrowLeft size={18} />
                </button>
                <span
                  className="text-[#1a4a98] font-bold cursor-pointer hover:underline"
                  onClick={goToRoot}
                >
                  Photos
                </span>
                <span className="text-gray-400">/</span>
                <span className="text-[#1a4a98] font-bold">{selectedFolder}</span>
                <span className="bg-[#1a4a98] text-white text-xs font-bold px-2.5 py-0.5 rounded-md">
                  {folderTotalEntries.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Search activity name..."
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

            {/* Activity Name Subfolders Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-x-4 gap-y-7">
              {folderSwr.isLoading ? (
                Array.from({ length: 12 }).map((_, idx) => (
                  <div
                    key={`loc-sub-skel-${idx}`}
                    className="flex flex-col items-center justify-center p-3 animate-pulse"
                  >
                    <div className="w-20 h-16 rounded-xl bg-gray-200" />
                    <div className="mt-3 space-y-1.5 flex flex-col items-center">
                      <div className="h-3.5 w-24 rounded bg-gray-200" />
                      <div className="h-2.5 w-14 rounded bg-gray-100" />
                    </div>
                  </div>
                ))
              ) : folderSwr.locations.map((location: Location) => {
                const activityPhotos = getLocationPhotos(location);
                const photoCount = activityPhotos.length;
                const displayName =
                  location.location_name ||
                  (location.date ? helper.formatDate(new Date(location.date)) : "Untitled Activity");

                return (
                  <div
                    key={location.id}
                    title={displayName}
                    onClick={() => {
                      setSelectedActivity(location);
                      setPhotoSearchTerm("");
                    }}
                    className="group relative flex flex-col items-center justify-start p-3 rounded-2xl border border-transparent hover:border-amber-200/80 hover:bg-amber-50/40 cursor-pointer transition-all"
                  >
                    {/* Quick Edit button on hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditlocation(location);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-lg border border-gray-200 shadow-xs text-gray-500 hover:text-emerald-600 hover:border-emerald-200 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Edit Activity"
                    >
                      <Edit size={13} />
                    </button>

                    {/* Folder Icon with Photo Count Badge */}
                    <div className="relative transition-transform duration-200 group-hover:-translate-y-1 group-active:scale-95">
                      <svg width="78" height="66" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
                        <path d="M0 12C0 5.37258 5.37258 0 12 0H35.5C39.5 0 43 2 45 5.5L50 14H88C94.6274 14 100 19.3726 100 26V68C100 74.6274 94.6274 80 88 80H12C5.37258 80 0 74.6274 0 68V12Z" fill="#eab308" />
                        <path d="M0 26C0 19.3726 5.37258 14 12 14H88C94.6274 14 100 19.3726 100 26V68C100 74.6274 94.6274 80 88 80H12C5.37258 80 0 74.6274 0 68V26Z" fill="#facc15" />
                        <path d="M15 22H45V30H15V22Z" fill="#ffffff" fillOpacity="0.4" />
                      </svg>
                      <span
                        className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-xs border ${
                          photoCount > 0
                            ? "bg-[#1a4a98] text-white border-white"
                            : "bg-gray-200 text-gray-600 border-white"
                        }`}
                      >
                        {photoCount}
                      </span>
                    </div>

                    {/* Activity Name & Meta */}
                    <div className="mt-3 text-center w-full">
                      <h3 className="text-[12px] font-bold text-gray-800 leading-snug line-clamp-2 break-words">
                        {displayName}
                      </h3>
                      <p className="text-[11px] text-gray-500 font-medium mt-1">
                        {photoCount} {photoCount === 1 ? "Photo" : "Photos"}
                      </p>
                      {location.city && (
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">
                          {location.city}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {!folderSwr.isLoading && folderSwr.locations.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500">
                  <Folder size={48} className="mx-auto text-gray-300 mb-3" />
                  <p>No activity folders found in this category.</p>
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
        ) : (
          /* LEVEL 3: INSIDE ACTIVITY NAME FOLDER — Photos Only For This Activity */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[calc(100vh-120px)]">
            {/* Top Bar with 3-Level Breadcrumb */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 pb-4 border-b border-gray-100 gap-4">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <button
                  type="button"
                  onClick={goToActivityTypeFolder}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-[#1a4a98] hover:bg-gray-100 transition-colors shrink-0"
                  title={`Back to ${selectedFolder}`}
                >
                  <ArrowLeft size={18} />
                </button>
                <span
                  className="text-[#1a4a98] font-bold cursor-pointer hover:underline shrink-0"
                  onClick={goToRoot}
                >
                  Photos
                </span>
                <span className="text-gray-400">/</span>
                <span
                  className="text-[#1a4a98] font-bold cursor-pointer hover:underline shrink-0"
                  onClick={goToActivityTypeFolder}
                >
                  {selectedFolder}
                </span>
                <span className="text-gray-400">/</span>
                <span
                  className="text-[#0f172a] font-bold truncate max-w-[320px]"
                  title={selectedActivity.location_name}
                >
                  {selectedActivity.location_name || "Untitled Activity"}
                </span>
                <span className="bg-[#1a4a98] text-white text-xs font-bold px-2.5 py-0.5 rounded-md shrink-0">
                  {selectedActivityPhotos.length}{" "}
                  {selectedActivityPhotos.length === 1 ? "Photo" : "Photos"}
                </span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative w-56">
                  <input
                    type="text"
                    placeholder="Filter photos..."
                    value={photoSearchTerm}
                    onChange={(e) => setPhotoSearchTerm(e.target.value)}
                    className="w-full pl-4 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4a98]/20 focus:border-[#1a4a98] transition-all"
                  />
                  <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                <Button
                  variant="outline"
                  onClick={() => handleEditlocation(selectedActivity)}
                  className="flex items-center gap-2"
                >
                  <Edit size={15} /> Edit Activity
                </Button>
              </div>
            </div>

            {/* Activity Context Strip */}
            <div className="mb-6 flex flex-wrap items-center gap-4 px-4 py-3 rounded-xl bg-gray-50/80 border border-gray-100 text-xs text-gray-600">
              {selectedActivity.location_id && (
                <span className="font-mono font-semibold text-gray-500">
                  ID: {selectedActivity.location_id}
                </span>
              )}
              {selectedActivity.city && (
                <span className="inline-flex items-center gap-1 font-medium">
                  <MapPin size={13} className="text-[#B88E2F]" />
                  {selectedActivity.city}
                  {selectedActivity.state_division ? `, ${selectedActivity.state_division}` : ""}
                </span>
              )}
              {selectedActivity.date && (
                <span className="inline-flex items-center gap-1 font-medium">
                  <Calendar size={13} className="text-[#1a4a98]" />
                  {helper.formatDate(new Date(selectedActivity.date))}
                </span>
              )}
            </div>

            {/* Photos Grid (ONLY photos belonging to selectedActivity) */}
            {selectedActivityPhotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {selectedActivityPhotos.map((photo, idx) => (
                  <ActivityPhotoCard
                    key={photo.key}
                    photo={photo}
                    index={idx}
                    activityName={selectedActivity.location_name || "Activity"}
                    onView={() => handleViewPhoto(selectedActivity, photo)}
                    onDownload={() => handleDownloadPhoto(selectedActivity, photo, idx)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-gray-500 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <ImageIcon size={44} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-semibold text-gray-600">
                  {photoSearchTerm
                    ? "No photos match your filter."
                    : "No photos attached to this activity yet."}
                </p>
                {!photoSearchTerm && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      onClick={() => handleEditlocation(selectedActivity)}
                      className="flex items-center gap-2"
                    >
                      <ImagePlus size={15} /> Add Photos to This Activity
                    </Button>
                  </div>
                )}
              </div>
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
