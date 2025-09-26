import React from 'react';
import Image from 'next/image';
import Modal from '../ui/Modal';
import { useState, useEffect } from 'react';

import { ListFilter, Plus, Search, FolderOpen, Trash2 } from 'lucide-react';
import { AddCropForm, UpdateCropForm } from './Crops';
import { AddLivestockForm, UpdateLivestockForm } from './Livestocks';
import {
    getCropRecords,
    getLivestockRecords,
    deleteCropRecord,
    deleteLivestockRecord,
    CropRecord,
    LivestockRecord,
} from '@/lib/services/croplivestock';

// 1. New Interface for Crop Images (Inferred from usage)
interface CropImage {
    id: string;
    url?: string;
    file?: File; // Assuming it can also be a File object before upload
}

// 2. Interface for the Record Details component props
interface RecordDetailsProps {
    record: CropRecord | LivestockRecord | null;
    type: 'Crops' | 'Livestock';
    onClose: () => void;
}

const RecordDetails: React.FC<RecordDetailsProps> = ({ record, type }) => {
    if (!record) return null;

    // Narrow types
    const isCrop = type === 'Crops';
    // Cast record to the appropriate type. The key issue is handling cropImages/image property
    const crop = record as CropRecord & { cropImages?: (CropImage | File)[] }; // Temporary cast to include cropImages
    const livestock = record as LivestockRecord;

    // Helper to get image array for crops
    const cropImages = isCrop ? crop.cropImages : [];

    return (
        <div className="space-y-4">
            {/* Image(s) */}
            <div className="w-full flex flex-wrap gap-2">
                {/* Handle cropImages vs image */}
                {isCrop && cropImages && cropImages.length > 0 ? (
                    cropImages.map((img: CropImage | File, idx: number) => {
                        // Determine the image source, but skip if it's not a valid URL or File
                        const url = (img as CropImage).url 
                                ? (img as CropImage).url 
                                : img instanceof File 
                                    ? URL.createObjectURL(img) 
                                    : typeof img === 'string'
                                        ? img
                                        : null; // Set to null if no valid source is found

                        if (!url) {
                            return (
                                // Render simple placeholder for individual missing crop images
                                <div key={idx} className="w-32 h-32 flex items-center justify-center bg-gray-100 text-gray-400 rounded-md text-xs">
                                    No image
                                </div>
                            );
                        }

                        return (
                            <div key={(img as CropImage).id || idx} className="w-32 h-32 relative">
                                <Image
                                    src={url} // Guaranteed to be a string here
                                    alt="Crop image"
                                    fill
                                    sizes="128px"
                                    style={{ objectFit: 'cover' }}
                                    className="rounded-md"
                                />
                            </div>
                        );
                    })
                ) : livestock.image ? (
                    // This block handles single livestock image
                    <div className="w-32 h-32 relative">
                        <Image
                            src={typeof livestock.image === 'string'
                                ? livestock.image
                                : URL.createObjectURL(livestock.image)
                            }
                            alt="Livestock image"
                            fill
                            sizes="128px"
                            style={{ objectFit: 'cover' }}
                            className="rounded-md"
                        />
                    </div>
                ) : (
                    // This block is for when there are no images for the entire record
                    <div className="w-32 h-32 flex items-center justify-center bg-gray-100 text-gray-400 rounded-md">
                        No image
                    </div>
                )}
            </div>

            {/* Basic info */}
            <div>
                <h2 className="text-xl font-semibold">
                    {isCrop ? crop.cropName : livestock.specie}
                </h2>
                <p className="text-gray-600 text-sm">
                    {isCrop
                        ? `${crop.variety} • ${crop.location}`
                        : `${livestock.numberOfAnimal} animals • ${livestock.ageGroup}`}
                </p>
            </div>

            {/* Details */}
            {isCrop ? (
                <div className="text-sm space-y-2">
                    <p><b>Planting Date:</b> {new Date(crop.plantingDate).toLocaleDateString()}</p>
                    <p><b>Expected Harvest:</b> {new Date(crop.expectedHarvestDate).toLocaleDateString()}</p>
                    <p><b>Growth Stage:</b> {crop.currentGrowthStage}</p>
                    <p><b>Health Status:</b> {crop.healthStatus}</p>
                    <p><b>Area:</b> {crop.area.value} {crop.area.unit}</p>
                    <p><b>Seed Quantity:</b> {crop.seedQuantity.value} {crop.area.unit}</p>
                    <p><b>Note:</b> {crop.note}</p>
                </div>
            ) : (
                <div className="text-sm space-y-2">
                    <p><b>Acquisition Date:</b> {new Date(livestock.acquisitionDate).toLocaleDateString()}</p>
                    <p><b>Health Status:</b> {livestock.healthStatus ?? 'N/A'}</p>
                    <p><b>Number of Animals:</b> {livestock.numberOfAnimal}</p>
                </div>
            )}
        </div>
    );
};

// ----------------------------------------------------------------------
// CROP LIVESTOCK RECORDS COMPONENT
// ----------------------------------------------------------------------

const CropLivestockRecords: React.FC = () => {
    // State to manage active tab and modals
    const [activeRecordTab, setActiveRecordTab] = useState<'Crops' | 'Livestock'>('Crops');
    const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
    const [isAddCropModalOpen, setIsAddCropModalOpen] = useState<boolean>(false);
    const [isAddLivestockModalOpen, setIsAddLivestockModalOpen] = useState<boolean>(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
    const [selectedRecord, setSelectedRecord] = useState<CropRecord | LivestockRecord | null>(null);

    // State to store data fetched from API
    const [cropRecords, setCropRecords] = useState<CropRecord[]>([]);
    const [livestockRecords, setLivestockRecords] = useState<LivestockRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchCropData = async () => {
        setLoading(true);
        try {
            const data = await getCropRecords();
            setCropRecords(data);
            setError(null);
        } catch (err) {
            setError(err as Error);
            console.error('Failed to fetch crop records:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLivestockData = async () => {
        setLoading(true);
        try {
            const data = await getLivestockRecords();
            setLivestockRecords(data);
            setError(null);
        } catch (err) {
            setError(err as Error);
            console.error('Failed to fetch livestock records:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeRecordTab === 'Crops') {
            fetchCropData();
        } else {
            fetchLivestockData();
        }
    }, [activeRecordTab]);

    const currentRecords = activeRecordTab === 'Crops' ? cropRecords : livestockRecords;

    const openNewRecordModal = () => {
        if (activeRecordTab === 'Crops') {
            setIsAddCropModalOpen(true);
        } else {
            setIsAddLivestockModalOpen(true);
        }
    };

    const openViewRecordModal = (record: CropRecord | LivestockRecord) => {
        setSelectedRecord(record);
        setIsRecordModalOpen(true);
    };

    const handleDelete = async (record: CropRecord | LivestockRecord) => {
        try {
            if (activeRecordTab === 'Crops') {
                await deleteCropRecord(record.id);
                fetchCropData();
            } else {
                await deleteLivestockRecord(record.id);
                fetchLivestockData();
            }
        } catch (err) {
            console.error('Failed to delete record:', err);
        }
    };

    const handleUpdate = (record: CropRecord | LivestockRecord) => {
        setSelectedRecord(record);
        setIsUpdateModalOpen(true);
    };

    return (
        <div className="p-2 lg:p-6">
            <div className="flex items-center justify-start border-b border-gray-200 mb-6 -mt-2">
                <button
                    onClick={() => setActiveRecordTab('Crops')}
                    className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200
                        ${activeRecordTab === 'Crops'
                            ? 'border-b-2 border-green-600 text-green-700'
                            : 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-400'}`}
                >
                    <span className="text-2xl mr-2">🌿</span> Crops
                </button>
                <button
                    onClick={() => setActiveRecordTab('Livestock')}
                    className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200
                        ${activeRecordTab === 'Livestock'
                            ? 'border-b-2 border-green-600 text-green-700'
                            : 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-400'}`}
                >
                    <span className="text-2xl mr-2">🐄</span>Livestock
                </button>
            </div>

            <div className="md:flex justify-between space-y-4 items-center mb-6">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" placeholder={`Search ${activeRecordTab.toLowerCase()}...`} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500" />
                </div>
                <div className="flex items-center justify-end space-x-4">
                    <button className="flex items-center px-4 py-2 text-sm font-medium text-green-600 rounded-md border border-green-600 hover:bg-green-50">
                        <ListFilter className="h-4 w-4 mr-2" /> Filter
                    </button>
                    <button className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-md bg-green-600 hover:bg-green-700" onClick={openNewRecordModal}>
                        <Plus className="h-4 w-4 mr-2" /> Add {activeRecordTab === 'Crops' ? 'Crop' : 'Livestock'}
                    </button>
                </div>
            </div>

            {loading && (
                <div className="text-center py-8 text-gray-500">Loading records...</div>
            )}
            {error && (
                <div className="text-center py-8 text-red-500">Error: Could not fetch records. Please check your network and try again.</div>
            )}

            {!loading && !error && currentRecords.length === 0 && (
                <div className="text-center py-8 text-gray-500">No {activeRecordTab.toLowerCase()} records found.</div>
            )}

            {!loading && !error && currentRecords.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentRecords.map(record => (
                        <div key={record.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden cursor-pointer" onClick={() => openViewRecordModal(record)}>
                            <div className="relative w-full h-48">
                                {/* FIX: Conditional render to show Image or "No Image" div */}
                                {record.image ? (
                                    <Image
                                        src={typeof record.image === 'string'
                                            ? record.image
                                            : URL.createObjectURL(record.image)
                                        }
                                        alt={activeRecordTab === 'Crops' ? (record as CropRecord).cropName : (record as LivestockRecord).specie}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        style={{ objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <div className="relative p-4">
                                <div className="absolute top-0 right-4 -translate-y-1/2 px-2 py-1 rounded-full text-xs font-semibold text-white
                                        bg-green-500">
                                    Good
                                </div>
                                <h3 className="font-semibold text-gray-800 text-lg">
                                    {activeRecordTab === 'Crops' ? (record as CropRecord).cropName : (record as LivestockRecord).specie}
                                </h3>
                                <p className="text-gray-500 text-sm mt-1">
                                    {activeRecordTab === 'Crops' ?
                                        `${(record as CropRecord).variety || ''} • ${(record as CropRecord).location}` :
                                        `${(record as LivestockRecord).breed || ''} • ${(record as LivestockRecord).numberOfAnimal} animals`
                                    }
                                </p>

                                {/* Progress bar and planted date */}
                                {activeRecordTab === 'Crops' ? (
                                    <>
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-600 mb-1">Growth Stage: <span className="text-black font-semibold">Mature</span></p>
                                            <div className="flex items-center">
                                                <div className="w-full h-2 bg-gray-200 rounded-full">
                                                    <div className="h-2 bg-green-500 rounded-full" style={{ width: `${(record as CropRecord).currentGrowthStage}%` }}></div>
                                                </div>
                                                <span className="text-gray-800 text-xs ml-2">{(record as CropRecord).currentGrowthStage}%</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 text-sm text-gray-600">
                                            <p>Planted: <span className="text-gray-800 font-semibold">{new Date((record as CropRecord).plantingDate).toLocaleDateString()}</span></p>
                                             <p><b>Note:</b>{(record as CropRecord).note}</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="mt-4 text-sm text-gray-600 space-y-2">
                                        <p><b>Age Group:</b> {(record as LivestockRecord).ageGroup}</p>
                                        <p><b>Last Health Checkup:</b> {new Date((record as LivestockRecord).acquisitionDate).toLocaleDateString()}</p>

                                         <p><b>Note:</b>{(record as LivestockRecord).note}</p>
                                    </div>
                                )}
                                <div className="mt-4 border-t border-gray-200 pt-4 flex justify-between items-center">
                                     <div className="flex space-x-2 md:space-x-4 text-gray-400">
                                         <button onClick={(e) => { e.stopPropagation(); openViewRecordModal(record); }} className="hover:text-green-600">
                                             <FolderOpen className="h-5 w-5" />
                                         </button>
                                         <button onClick={(e) => { e.stopPropagation(); handleDelete(record); }} className="hover:text-red-600">
                                             <Trash2 className="h-5 w-5" />
                                         </button>
                                     </div>

                                     <button
                                         onClick={(e) => { e.stopPropagation(); handleUpdate(record); }}
                                         className="text-green-600 hover:text-green-700 text-sm font-semibold"
                                     >
                                         Update Record
                                     </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals remain unchanged */}
            <Modal
                show={isRecordModalOpen}
                onClose={() => setIsRecordModalOpen(false)}
                title={activeRecordTab === 'Crops' ? (selectedRecord as CropRecord)?.cropName || 'Crop Details' : (selectedRecord as LivestockRecord)?.specie || 'Livestock Details'}
            >
                <RecordDetails record={selectedRecord} type={activeRecordTab} onClose={() => setIsRecordModalOpen(false)} />
            </Modal>
            <Modal
                show={isAddCropModalOpen}
                onClose={() => setIsAddCropModalOpen(false)}
                title="Add New Crop Record"
            >
                <AddCropForm onClose={() => setIsAddCropModalOpen(false)} onRecordAdded={fetchCropData} />
            </Modal>
            <Modal
                show={isAddLivestockModalOpen}
                onClose={() => setIsAddLivestockModalOpen(false)}
                title="Add New Livestock Record"
            >
                <AddLivestockForm onClose={() => setIsAddLivestockModalOpen(false)} onRecordAdded={fetchLivestockData} />
            </Modal>
            <Modal
                show={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                title={`Update ${activeRecordTab === 'Crops' ? (selectedRecord as CropRecord)?.cropName : (selectedRecord as LivestockRecord)?.specie}`}
            >
                {activeRecordTab === 'Crops' ? (
                    <UpdateCropForm
                        record={selectedRecord as CropRecord}
                        onClose={() => setIsUpdateModalOpen(false)}
                        onRecordUpdated={fetchCropData}
                    />
                ) : (
                    <UpdateLivestockForm
                        record={{
                            ...(selectedRecord as LivestockRecord),
                            healthStatus: (selectedRecord as LivestockRecord)?.healthStatus ?? "good",
                            image:
                                typeof (selectedRecord as LivestockRecord)?.image === "string"
                                    ? (selectedRecord as LivestockRecord)?.image
                                    : (selectedRecord as LivestockRecord)?.image instanceof File
                                        ? URL.createObjectURL((selectedRecord as LivestockRecord)?.image as File)
                                        : undefined
                        } as Omit<LivestockRecord, "image"> & { image?: string }}
                        onClose={() => setIsUpdateModalOpen(false)}
                        onRecordUpdated={fetchLivestockData}
                    />
                )}
            </Modal>
        </div>
    );
};

export default CropLivestockRecords;