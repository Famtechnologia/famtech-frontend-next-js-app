"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Modal from "../ui/Modal";
import { useProfile } from "@/lib/hooks/useProfile";
import toast from "react-hot-toast";

import { 
  ListFilter, 
  Plus, 
  Search, 
  FolderOpen, 
  Trash2, 
  Calendar, 
  Sprout, 
  MapPin, 
  Activity, 
  FileText, 
  Scale, 
  Copy, 
  Check, 
  ShieldAlert, 
  Info 
} from "lucide-react";
import { AddCropForm, UpdateCropForm } from "./Crops";
import { AddLivestockForm, UpdateLivestockForm } from "./Livestocks";
import {
  getCropRecords,
  getLivestockRecords,
  deleteCropRecord,
  deleteLivestockRecord,
  RecordImage,
  CropRecord as BaseCropRecord,
  LivestockRecord as BaseLivestockRecord,
} from "@/lib/services/croplivestock";
import RecordsListSkeletonLoader from "@/components/skeleton/farm-operation/Record";
import AddYieldForm from "@/components/farm-operation/AddYieldForm";

interface CropRecord extends Omit<BaseCropRecord, "image"> {
  cropImages: RecordImage[];
  image: RecordImage | null;
}

interface LivestockRecord extends BaseLivestockRecord {
  image: RecordImage | null;
}

interface RecordDetailsProps {
  record: CropRecord | LivestockRecord | null;
  type: "Crops" | "Livestock";
  onClose: () => void;
}

const getImageUrl = (
  imageSource: RecordImage | null | undefined
): string | null => {
  if (imageSource && typeof imageSource === "object" && "url" in imageSource) {
    return imageSource.url ?? null;
  }
  return null;
};

const getGrowthPercentageFromStage = (
  stage: string | null | undefined
): number => {
  if (!stage) return 0;

  const normalizedStage = stage.trim().toLowerCase();

  if (
    normalizedStage.includes("seeding") ||
    normalizedStage.includes("planting")
  )
    return 20;
  if (
    normalizedStage.includes("vegetative") ||
    normalizedStage.includes("early growth")
  )
    return 40;
  if (
    normalizedStage.includes("flowering") ||
    normalizedStage.includes("tasseling")
  )
    return 60;
  if (
    normalizedStage.includes("fruiting") ||
    normalizedStage.includes("maturation") ||
    normalizedStage.includes("ripening")
  )
    return 80;
  if (
    normalizedStage.includes("maturity") ||
    normalizedStage.includes("completed")
  )
    return 100;

  return 0;
};

const RecordDetails: React.FC<RecordDetailsProps> = ({ record, type }) => {
  const [copied, setCopied] = useState(false);
  if (!record) return null;

  const isCrop = type === "Crops";
  const crop = record as CropRecord;
  const livestock = record as LivestockRecord;
  const images: RecordImage[] = isCrop
    ? crop.cropImages || []
    : livestock.livestockImages || [];

  const handleCopyId = () => {
    navigator.clipboard.writeText(record.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusLabel = isCrop ? crop.healthStatus : livestock.healthStatus;
  const statusColor = (status: string | null | undefined) => {
    const lower = status?.toLowerCase() || "good";
    if (lower.includes("poor") || lower.includes("sick")) return "text-red-700 bg-red-50 border-red-200";
    if (lower.includes("fair") || lower.includes("moderate")) return "text-amber-700 bg-amber-50 border-amber-200";
    if (lower.includes("excellent")) return "text-indigo-700 bg-indigo-50 border-indigo-200";
    return "text-emerald-700 bg-emerald-50 border-emerald-200";
  };

  return (
    <div className="space-y-6">
      {/* Horizontal Image Gallery */}
      <div className="w-full flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
        {images.length > 0 ? (
          images.map((img, idx) => {
            const url = getImageUrl(img);
            if (!url) return null;
            return (
              <div key={idx} className="w-44 h-32 relative flex-shrink-0 rounded-xl overflow-hidden border border-slate-100 shadow-sm group">
                <Image
                  src={url}
                  alt={isCrop ? `${crop.cropName} image ${idx + 1}` : `${livestock.specie} image`}
                  fill
                  sizes="176px"
                  style={{ objectFit: "cover" }}
                  className="transition duration-300 group-hover:scale-105"
                />
              </div>
            );
          })
        ) : (
          <div className="w-full h-32 flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 text-slate-400 rounded-xl">
            <Sprout className="w-8 h-8 mb-1.5 text-slate-300" />
            <span className="text-xs">No media uploaded</span>
          </div>
        )}
      </div>

      {/* Basic Info Header */}
      <div className="flex justify-between items-start border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 capitalize flex items-center gap-2">
            {isCrop ? crop.cropName : livestock.specie}
            {isCrop && crop.variety && (
              <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full capitalize">
                {crop.variety}
              </span>
            )}
          </h2>
          <p className="text-slate-500 text-xs mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {isCrop ? crop.location : `Breed: ${livestock.breed || "N/A"}`}
          </p>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${statusColor(statusLabel)}`}>
          {statusLabel || "Good"}
        </div>
      </div>

      {/* Structured details grid */}
      <div className="grid grid-cols-2 gap-4">
        {isCrop ? (
          <>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/60 flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Planting Date</p>
                <p className="text-xs font-semibold text-slate-800">{new Date(crop.plantingDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/60 flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Expected Harvest</p>
                <p className="text-xs font-semibold text-slate-800">{new Date(crop.expectedHarvestDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/60 flex items-center space-x-3">
              <Sprout className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Growth Stage</p>
                <p className="text-xs font-semibold text-slate-800 capitalize">{crop.currentGrowthStage}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/60 flex items-center space-x-3">
              <Scale className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Seed Quantity</p>
                <p className="text-xs font-semibold text-slate-800">{crop.seedQuantity?.value} {crop.seedQuantity?.unit}</p>
              </div>
            </div>

            <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100/60 flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Land Area Used</p>
                <p className="text-xs font-semibold text-slate-800">{crop.area?.value} {crop.area?.unit}</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/60 flex items-center space-x-3">
              <Activity className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Number of Animals</p>
                <p className="text-xs font-semibold text-slate-800">{livestock.numberOfAnimal}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/60 flex items-center space-x-3">
              <Sprout className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Age Group</p>
                <p className="text-xs font-semibold text-slate-800">{livestock.ageGroup}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/60 flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Acquisition Date</p>
                <p className="text-xs font-semibold text-slate-800">{new Date(livestock.acquisitionDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/60 flex items-center space-x-3">
              <FileText className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Feed Schedule</p>
                <p className="text-xs font-semibold text-slate-800">{livestock.feedSchedule || "N/A"}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Custom notes */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
        <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5 flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" /> Notes & Remarks
        </h4>
        <p className="text-xs text-slate-700 leading-relaxed italic">
          {record.note || "No custom notes or operations logs added to this record yet."}
        </p>
      </div>

      {/* Copyable ID footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 w-full justify-between">
          <span className="truncate">ID: {record.id}</span>
          <button
            onClick={handleCopyId}
            className="text-slate-400 hover:text-green-600 ml-2 p-1 hover:bg-slate-100 rounded transition-all flex-shrink-0"
            title="Copy Record ID"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600 animate-pulse" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

const CropLivestockRecords: React.FC = () => {
  const [activeRecordTab, setActiveRecordTab] = useState<"Crops" | "Livestock">(
    "Crops"
  );
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState<boolean>(false);
  const [isAddLivestockModalOpen, setIsAddLivestockModalOpen] =
    useState<boolean>(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<
    CropRecord | LivestockRecord | null
  >(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [cropRecords, setCropRecords] = useState<CropRecord[]>([]);
  const [livestockRecords, setLivestockRecords] = useState<LivestockRecord[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isYieldModalOpen, setIsYieldModalOpen] = useState(false);
  const [selectedYieldCrop, setSelectedYieldCrop] = useState<CropRecord | null>(null);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [healthFilter, setHealthFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Extract user ID once
  const { profile } = useProfile();

  const fetchCropData = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data: BaseCropRecord[] = await getCropRecords(profile?.id);
      const mappedData: CropRecord[] = data.map((r) => {
        const images: RecordImage[] = Array.isArray(r.cropImages)
          ? r.cropImages.filter((img) => img.url)
          : r.cropImages
            ? [r.cropImages]
            : [];
        return {
          ...r,
          cropImages: images,
          image: images.length > 0 ? images[0] : null,
        };
      }) as CropRecord[];
      setCropRecords(mappedData);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error("Failed to fetch crop records:", err);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  const fetchLivestockData = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data: BaseLivestockRecord[] = await getLivestockRecords(
        profile?.id
      );

      const mappedData: LivestockRecord[] = data.map((r) => {
        const images: RecordImage[] = Array.isArray(r.livestockImages)
          ? r.livestockImages.filter((img) => img.url)
          : [];
        return {
          ...r,
          image: images.length > 0 ? images[0] : null,
        };
      }) as LivestockRecord[];

      setLivestockRecords(mappedData);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error("Failed to fetch livestock records:", err);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (activeRecordTab === "Crops") {
      fetchCropData();
    } else {
      fetchLivestockData();
    }
  }, [activeRecordTab, fetchCropData, fetchLivestockData]);

  // Determine current active records
  const currentRecords =
    activeRecordTab === "Crops" ? cropRecords : livestockRecords;

  // Reactively filter records by Search & selected Filters
  const filteredRecords = currentRecords.filter((record) => {
    const isCurrentCrop = activeRecordTab === "Crops";
    if (isCurrentCrop) {
      const crop = record as CropRecord;
      const matchesSearch =
        crop.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (crop.variety && crop.variety.toLowerCase().includes(searchQuery.toLowerCase())) ||
        crop.location.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesHealth =
        healthFilter === "all" ||
        crop.healthStatus?.toLowerCase() === healthFilter.toLowerCase();
        
      const matchesStage =
        stageFilter === "all" ||
        crop.currentGrowthStage?.toLowerCase() === stageFilter.toLowerCase();
        
      return matchesSearch && matchesHealth && matchesStage;
    } else {
      const livestock = record as LivestockRecord;
      const matchesSearch =
        livestock.specie.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (livestock.breed && livestock.breed.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (livestock.ageGroup && livestock.ageGroup.toLowerCase().includes(searchQuery.toLowerCase()));
        
      const matchesHealth =
        healthFilter === "all" ||
        livestock.healthStatus?.toLowerCase() === healthFilter.toLowerCase();
        
      const matchesAge =
        ageFilter === "all" ||
        livestock.ageGroup?.toLowerCase() === ageFilter.toLowerCase();
        
      return matchesSearch && matchesHealth && matchesAge;
    }
  });

  const openNewRecordModal = () => {
    if (activeRecordTab === "Crops") {
      setIsAddCropModalOpen(true);
    } else {
      setIsAddLivestockModalOpen(true);
    }
  };

  const openViewRecordModal = (record: CropRecord | LivestockRecord) => {
    setSelectedRecord(record);
    setIsRecordModalOpen(true);
  };

  const handleDeleteClick = (record: CropRecord | LivestockRecord) => {
    setSelectedRecord(record);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRecord) return;
    setIsDeleting(true);

    try {
      if (activeRecordTab === "Crops") {
        await deleteCropRecord(selectedRecord.id);
        toast.success("Crop record deleted successfully!");
        fetchCropData();
      } else {
        await deleteLivestockRecord(selectedRecord.id);
        toast.success("Livestock record deleted successfully!");
        fetchLivestockData();
      }
      setIsConfirmDeleteOpen(false);
    } catch (err) {
      console.error("Failed to delete record:", err);
      toast.error("Failed to delete record.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = (record: CropRecord | LivestockRecord) => {
    setSelectedRecord(record);
    setIsUpdateModalOpen(true);
  };

  const getHealthStatusColor = (status: string | null | undefined): string => {
    const lowerStatus = status?.toLowerCase() || "good";
    if (lowerStatus.includes("poor") || lowerStatus.includes("sick"))
      return "bg-rose-500/90 text-white backdrop-blur-sm border border-rose-400/20";
    if (lowerStatus.includes("fair") || lowerStatus.includes("moderate"))
      return "bg-amber-500/90 text-white backdrop-blur-sm border border-amber-400/20";
    if (lowerStatus.includes("excellent"))
      return "bg-indigo-500/90 text-white backdrop-blur-sm border border-indigo-400/20";
    return "bg-emerald-500/90 text-white backdrop-blur-sm border border-emerald-400/20";
  };

  if (loading) {
    return <RecordsListSkeletonLoader />;
  }

  return (
    <div className="p-2 lg:p-6">
      <div className="flex items-center justify-start border-b border-gray-200 mb-6 -mt-2">
        <button
          onClick={() => {
            setActiveRecordTab("Crops");
            setSearchQuery("");
            setHealthFilter("all");
            setStageFilter("all");
            setAgeFilter("all");
          }}
          className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200
            ${
              activeRecordTab === "Crops"
                ? "border-b-2 border-green-600 text-green-700"
                : "text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-400"
            }`}
        >
          <span className="text-2xl mr-2">🌿</span> Crops
        </button>
        <button
          onClick={() => {
            setActiveRecordTab("Livestock");
            setSearchQuery("");
            setHealthFilter("all");
            setStageFilter("all");
            setAgeFilter("all");
          }}
          className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200
            ${
              activeRecordTab === "Livestock"
                ? "border-b-2 border-green-600 text-green-700"
                : "text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-400"
            }`}
        >
          <span className="text-2xl mr-2">🐄</span> Livestock
        </button>
      </div>

      <div className="md:flex justify-between space-y-4 items-center mb-6">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeRecordTab.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm text-gray-800"
          />
        </div>
        <div className="flex items-center justify-end space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md border transition-all ${
              showFilters
                ? "bg-green-50 border-green-600 text-green-700 shadow-sm"
                : "text-green-600 border-green-600 hover:bg-green-50"
            }`}
          >
            <ListFilter className="h-4 w-4 mr-2" /> Filter
          </button>
          <button
            className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-md bg-green-600 hover:bg-green-700 shadow-sm transition-colors"
            onClick={openNewRecordModal}
          >
            <Plus className="h-4 w-4 mr-2" /> Add{" "}
            {activeRecordTab === "Crops" ? "Crop" : "Livestock"}
          </button>
        </div>
      </div>

      {/* Collapsible Filter Panel */}
      {showFilters && (
        <div className="bg-slate-50 border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center text-xs animate-fadeIn shadow-sm">
          <div className="flex flex-col gap-1 min-w-[120px]">
            <label className="font-semibold text-gray-700">Health Status</label>
            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="p-2 border border-gray-300 bg-white rounded-md text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500 text-xs"
            >
              <option value="all">All Health</option>
              <option value="good">Good</option>
              <option value="excellent">Excellent</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          {activeRecordTab === "Crops" ? (
            <div className="flex flex-col gap-1 min-w-[120px]">
              <label className="font-semibold text-gray-700">Growth Stage</label>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="p-2 border border-gray-300 bg-white rounded-md text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500 text-xs"
              >
                <option value="all">All Stages</option>
                <option value="seeding">Seeding</option>
                <option value="vegetative">Vegetative</option>
                <option value="flowering">Flowering</option>
                <option value="fruiting">Fruiting</option>
                <option value="maturity">Maturity</option>
              </select>
            </div>
          ) : (
            <div className="flex flex-col gap-1 min-w-[120px]">
              <label className="font-semibold text-gray-700">Age Group</label>
              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="p-2 border border-gray-300 bg-white rounded-md text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500 text-xs"
              >
                <option value="all">All Ages</option>
                <option value="adult">Adult</option>
                <option value="young">Young</option>
                <option value="juvenile">Juvenile</option>
              </select>
            </div>
          )}

          {(healthFilter !== "all" || stageFilter !== "all" || ageFilter !== "all" || searchQuery !== "") && (
            <button
              onClick={() => {
                setHealthFilter("all");
                setStageFilter("all");
                setAgeFilter("all");
                setSearchQuery("");
              }}
              className="mt-5 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent rounded-md transition-all font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Status Messages */}
      {loading && (
        <div className="text-center py-8 text-gray-500">Loading records...</div>
      )}
      {error && (
        <div className="text-center py-8 text-red-500">
          Error: Could not fetch records. Please check your network and try again.
        </div>
      )}
      {!loading && !error && filteredRecords.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No matches found for your current search or filter.
        </div>
      )}

      {/* Records Grid */}
      {!loading && !error && filteredRecords.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => {
            const isCurrentCrop = activeRecordTab === "Crops";
            const cropRecord = record as CropRecord;
            const livestockRecord = record as LivestockRecord;

            const recordTitle = isCurrentCrop
              ? cropRecord.cropName
              : livestockRecord.specie;
            const recordStatus = isCurrentCrop
              ? cropRecord.healthStatus
              : livestockRecord.healthStatus;
            const recordImageSource = isCurrentCrop
              ? cropRecord.image
              : livestockRecord.image;
            const imageUrl = getImageUrl(recordImageSource);

            return (
              <div
                key={record.id}
                className="bg-white rounded-xl border border-slate-200/80 overflow-hidden cursor-pointer flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                onClick={() => openViewRecordModal(record)}
              >
                <div>
                  <div className="relative w-full h-48 overflow-hidden bg-slate-50">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={recordTitle}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        style={{ objectFit: "cover" }}
                        className="transition duration-500 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <Sprout className="w-8 h-8 mb-1 text-slate-300" />
                        <span className="text-xs">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="relative p-4 pb-2">
                    {/* Health Status Badge */}
                    <div
                      className={`absolute top-0 right-4 -translate-y-1/2 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm capitalize border border-white/20 ${getHealthStatusColor(recordStatus)}`}
                    >
                      {recordStatus || "Good"}
                    </div>

                    <h3 className="font-bold text-slate-800 text-base capitalize truncate">
                      {recordTitle}
                    </h3>
                    <p className="text-slate-500 text-xs mt-1 truncate">
                      {isCurrentCrop
                        ? `${cropRecord.variety || "N/A"} • ${cropRecord.location}`
                        : `${livestockRecord.breed || "N/A"} • ${livestockRecord.numberOfAnimal} animals`}
                    </p>

                    {/* Progress/Details Section */}
                    {isCurrentCrop ? (
                      <>
                        {(() => {
                          const growthPercentage = getGrowthPercentageFromStage(
                            cropRecord.currentGrowthStage
                          );
                          return (
                            <>
                              <div className="mt-4">
                                <p className="text-xs text-slate-500 mb-1 flex justify-between items-center">
                                  <span>Growth:</span>
                                  <span className="text-slate-800 font-bold capitalize">
                                    {cropRecord.currentGrowthStage}
                                  </span>
                                </p>
                                <div className="flex items-center">
                                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-2 bg-gradient-to-r from-emerald-400 to-green-600 rounded-full transition-all duration-300"
                                      style={{ width: `${growthPercentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-slate-800 font-bold text-xs ml-2">
                                    {growthPercentage}%
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2">
                                {growthPercentage >= 100 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedYieldCrop(cropRecord);
                                      setIsYieldModalOpen(true);
                                    }}
                                    className="mt-2 w-full bg-green-50 text-green-700 border border-green-600/30 py-1.5 rounded-lg font-bold hover:bg-green-600 hover:text-white transition-all text-xs shadow-sm"
                                  >
                                    Add Crop Yield
                                  </button>
                                )}
                              </div>
                            </>
                          );
                        })()}
                        <div className="mt-4 text-[10px] text-slate-400 border-t border-slate-50 pt-2 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Planted:</span>
                          <span className="text-slate-600 font-semibold">
                            {new Date(cropRecord.plantingDate).toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="mt-4 text-xs text-slate-600 space-y-1.5 border-t border-slate-50 pt-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Age:</span>
                          <span className="font-semibold text-slate-700">{livestockRecord.ageGroup}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Feed:</span>
                          <span className="font-semibold text-slate-700 truncate max-w-[120px]">{livestockRecord.feedSchedule || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Checkup:</span>
                          <span className="font-semibold text-slate-700">
                            {new Date(livestockRecord.acquisitionDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions bottom bar */}
                <div className="p-4 pt-0">
                  <div className="mt-4 border-t border-slate-100 pt-4 flex justify-between items-center">
                    <div className="flex space-x-2 text-slate-400">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openViewRecordModal(record);
                        }}
                        className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-green-600 rounded-lg transition-all"
                        title="View Details"
                      >
                        <FolderOpen className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(record);
                        }}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all"
                        title="Delete Record"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdate(record);
                      }}
                      className="text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100/80 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    >
                      Update Record
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <Modal
        show={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title={
          activeRecordTab === "Crops"
            ? (selectedRecord as CropRecord)?.cropName || "Crop Details"
            : (selectedRecord as LivestockRecord)?.specie || "Livestock Details"
        }
      >
        <RecordDetails
          record={selectedRecord}
          type={activeRecordTab}
          onClose={() => setIsRecordModalOpen(false)}
        />
      </Modal>

      <Modal
        show={isAddCropModalOpen}
        onClose={() => setIsAddCropModalOpen(false)}
        title="Add New Crop Record"
      >
        <AddCropForm
          onClose={() => setIsAddCropModalOpen(false)}
          onRecordAdded={fetchCropData}
        />
      </Modal>

      <Modal
        show={isAddLivestockModalOpen}
        onClose={() => setIsAddLivestockModalOpen(false)}
        title="Add New Livestock Record"
      >
        <AddLivestockForm
          onClose={() => setIsAddLivestockModalOpen(false)}
          onRecordAdded={fetchLivestockData}
        />
      </Modal>

      <Modal
        show={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={`Update ${activeRecordTab === "Crops" ? (selectedRecord as CropRecord)?.cropName : (selectedRecord as LivestockRecord)?.specie}`}
      >
        {activeRecordTab === "Crops" ? (
          <UpdateCropForm
            record={selectedRecord as BaseCropRecord}
            onClose={() => setIsUpdateModalOpen(false)}
            onRecordUpdated={fetchCropData}
          />
        ) : (
          <UpdateLivestockForm
            record={selectedRecord as BaseLivestockRecord}
            onClose={() => setIsUpdateModalOpen(false)}
            onRecordUpdated={fetchLivestockData}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        title="Confirm Deletion"
      >
        <div className="p-6">
          <h3 className="text-lg font-bold mb-3 text-gray-800">
            Are you sure you want to delete this record?
          </h3>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            This action cannot be undone. All data and associated media for this record
            will be permanently deleted from the farm inventory.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsConfirmDeleteOpen(false)}
              className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Yield Modal */}
      <Modal
        show={isYieldModalOpen}
        onClose={() => setIsYieldModalOpen(false)}
        title={`Add Yield`}
      >
        {selectedYieldCrop && (
          <AddYieldForm
            cropName={selectedYieldCrop.cropName}
            onSave={() => {
              // Refresh crop lists on yield saved
              fetchCropData();
            }}
            onClose={() => setIsYieldModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default CropLivestockRecords;
