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
    // Renaming the imported types to clearly separate them from the component's internal types
    CropRecord as BaseCropRecord, 
    LivestockRecord as BaseLivestockRecord,
} from '@/lib/services/croplivestock';


// --- Revised Interfaces to resolve Type Mismatches (Code 2430 & 2322) ---

/**
 * Assumed interface for an image object, based on the missing properties error.
 * This should match the 'RecordImage' type used internally by your service.
 */
interface RecordImage {
    id?: string; // Optional if not all images have an id before saving
    _id?: string; // Often MongoDB ID
    fileId?: string; // ID used by file storage
    url: string; // The public URL
}

// Use the RecordImage interface for crops
interface CropRecord extends Omit<BaseCropRecord, 'image'> {
    // cropImages holds all images fetched from the API (an array of image objects)
    cropImages: RecordImage[]; 
    // image is a computed property used only for the card thumbnail (Code 2339 fix)
    image: RecordImage | null;
}

interface LivestockRecord extends BaseLivestockRecord {
    // The base type might define this as string | File. We keep it flexible.
    image: string | File | null | undefined; 
}


// 2. Interface for the Record Details component props
interface RecordDetailsProps {
    record: CropRecord | LivestockRecord | null;
    type: 'Crops' | 'Livestock';
    onClose: () => void;
}

// --- Helper Functions ---

/**
 * Safely determines the URL for an image source (string, File, or RecordImage object).
 */
const getImageUrl = (imageSource: string | File | RecordImage | null | undefined): string | null => {
    if (!imageSource) return null;

    if (typeof imageSource === 'string') {
        return imageSource;
    }
    
    // Check if it's a RecordImage object
    if (typeof imageSource === 'object' && 'url' in imageSource) {
        return imageSource.url ?? null;
    }
    
    // Check if it's a File object (for forms)
    if (imageSource instanceof File) {
        return URL.createObjectURL(imageSource);
    }
    
    return null;
};


// --- RecordDetails Component (FIXED) ---

const RecordDetails: React.FC<RecordDetailsProps> = ({ record, type }) => {
    if (!record) return null;

    // Type narrowing
    const isCrop = type === 'Crops';
    const crop = record as CropRecord; 
    const livestock = record as LivestockRecord;

    // Get the array of images
    const images = isCrop
        ? crop.cropImages || []
        : (livestock.image ? [livestock.image] : []);

    return (
        <div className="space-y-6">
            {/* Image(s) */}
            <div className="w-full flex flex-wrap gap-3 p-2 border-b border-gray-200">
                {images.length > 0 ? (
                    images.map((img, idx) => {
                        // FIX: Use the unified RecordImage for type safety, allowing string or File as well
                        const url = getImageUrl(img as string | File | RecordImage); 

                        if (!url) {
                            return (
                                <div key={idx} className="w-32 h-32 flex items-center justify-center bg-gray-100 text-gray-400 rounded-md text-xs">
                                    No image
                                </div>
                            );
                        }

                        return (
                            <div key={idx} className="w-32 h-32 relative flex-shrink-0">
                                <Image
                                    src={url}
                                    alt={isCrop ? `${crop.cropName} image ${idx + 1}` : `${livestock.specie} image`}
                                    fill
                                    sizes="128px"
                                    style={{ objectFit: 'cover' }}
                                    className="rounded-md"
                                />
                            </div>
                        );
                    })
                ) : (
                    <div className="w-32 h-32 flex items-center justify-center bg-gray-100 text-gray-400 rounded-md">
                        No image available
                    </div>
                )}
            </div>

            {/* Basic info */}
            <div className="px-1">
                <h2 className="text-2xl font-bold text-gray-800">
                    {isCrop ? crop.cropName : livestock.specie}
                </h2>
                <p className="text-gray-600 text-sm">
                    {isCrop
                        ? `${crop.variety || 'N/A'} • ${crop.location}`
                        : `${livestock.numberOfAnimal} ${livestock.specie} • ${livestock.ageGroup}`}
                </p>
            </div>

            {/* Details (using optional chaining for safety) */}
            {isCrop ? (
                <div className="text-sm space-y-2 p-1">
                    <p><b>Variety:</b> {crop.variety}</p>
                    <p><b>Planting Date:</b> {new Date(crop.plantingDate).toLocaleDateString()}</p>
                    <p><b>Expected Harvest:</b> {new Date(crop.expectedHarvestDate).toLocaleDateString()}</p>
                    <p><b>Growth Stage:</b> {crop.currentGrowthStage}</p>
                    <p><b>Health Status:</b> <span className={`capitalize font-medium ${crop.healthStatus?.toLowerCase() === 'poor' ? 'text-red-600' : 'text-green-600'}`}>{crop.healthStatus}</span></p>
                    <p><b>Area:</b> {crop.area?.value} {crop.area?.unit}</p>
                    <p><b>Seed Quantity:</b> {crop.seedQuantity?.value} {crop.seedQuantity?.unit}</p>
                    <p><b>Note:</b> {crop.note || 'N/A'}</p>
                </div>
            ) : (
                <div className="text-sm space-y-2 p-1">
                    <p><b>Breed:</b> {livestock.breed || 'N/A'}</p>
                    <p><b>Number of Animals:</b> {livestock.numberOfAnimal}</p>
                    <p><b>Acquisition Date:</b> {new Date(livestock.acquisitionDate).toLocaleDateString()}</p>
                    <p><b>Health Status:</b> <span className={`capitalize font-medium ${livestock.healthStatus?.toLowerCase() === 'poor' ? 'text-red-600' : 'text-green-600'}`}>{livestock.healthStatus ?? 'N/A'}</span></p>
                    <p><b>Feed Schedule:</b> {livestock.feedSchedule ?? 'N/A'}</p>
                    <p><b>Note:</b> {livestock.note || 'N/A'}</p>
                </div>
            )}
            <div className="p-4 bg-gray-50 text-xs text-gray-500 rounded-md">
                Record ID: {record.id}
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// CROP LIVESTOCK RECORDS COMPONENT (FIXED)
// ----------------------------------------------------------------------

const CropLivestockRecords: React.FC = () => {
    const [activeRecordTab, setActiveRecordTab] = useState<'Crops' | 'Livestock'>('Crops');
    const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
    const [isAddCropModalOpen, setIsAddCropModalOpen] = useState<boolean>(false);
    const [isAddLivestockModalOpen, setIsAddLivestockModalOpen] = useState<boolean>(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
    const [selectedRecord, setSelectedRecord] = useState<CropRecord | LivestockRecord | null>(null);

    const [cropRecords, setCropRecords] = useState<CropRecord[]>([]);
    const [livestockRecords, setLivestockRecords] = useState<LivestockRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchCropData = async () => {
        setLoading(true);
        try {
            const data: BaseCropRecord[] = await getCropRecords(); 
            // FIX: Map the fetched data to the component's internal CropRecord interface
            const mappedData: CropRecord[] = data.map(r => {
                const images: RecordImage[] = Array.isArray(r.cropImages) ? r.cropImages.filter(img => img.url) : (r.cropImages ? [r.cropImages] : []);
                return {
                    ...r,
                    cropImages: images, 
                    image: images.length > 0 ? images[0] : null, // Set single image for card thumbnail
                }
            }) as CropRecord[];
            setCropRecords(mappedData);
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
            setLivestockRecords(data as LivestockRecord[]);
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
        // ... (Deletion logic remains unchanged) ...
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

    const getHealthStatusColor = (status: string | null | undefined): string => {
        const lowerStatus = status?.toLowerCase() || 'good';
        if (lowerStatus.includes('poor') || lowerStatus.includes('sick')) return 'bg-red-500';
        if (lowerStatus.includes('fair') || lowerStatus.includes('moderate')) return 'bg-yellow-500';
        return 'bg-green-500';
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

            {/* Status Messages */}
            {loading && (<div className="text-center py-8 text-gray-500">Loading records...</div>)}
            {error && (<div className="text-center py-8 text-red-500">Error: Could not fetch records. Please check your network and try again.</div>)}
            {!loading && !error && currentRecords.length === 0 && (
                <div className="text-center py-8 text-gray-500">No {activeRecordTab.toLowerCase()} records found.</div>
            )}

            {/* Records Grid */}
            {!loading && !error && currentRecords.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentRecords.map(record => {
                        const isCurrentCrop = activeRecordTab === 'Crops';
                        const cropRecord = record as CropRecord;
                        const livestockRecord = record as LivestockRecord;
                        
                        const recordTitle = isCurrentCrop ? cropRecord.cropName : livestockRecord.specie;
                        const recordStatus = isCurrentCrop ? cropRecord.healthStatus : livestockRecord.healthStatus;
                        // FIX: Access the 'image' property which is now explicitly on the internal interfaces
                        const recordImageSource = isCurrentCrop ? cropRecord.image : livestockRecord.image;
                        const imageUrl = getImageUrl(recordImageSource);

                        return (
                            <div key={record.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden" onClick={() => openViewRecordModal(record)}>
                                <div className="relative w-full h-48">
                                    {imageUrl ? (
                                        <Image
                                            src={imageUrl}
                                            alt={recordTitle}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            style={{ objectFit: 'cover' }}
                                            className="transition duration-300 ease-in-out hover:scale-[1.03]"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <div className="relative p-4">
                                    {/* Health Status Badge */}
                                    <div className={`absolute top-0 right-4 -translate-y-1/2 px-3 py-1 rounded-full text-xs font-semibold text-white capitalize ${getHealthStatusColor(recordStatus)}`}>
                                        {recordStatus || 'N/A'}
                                    </div>

                                    <h3 className="font-semibold text-gray-800 text-lg">
                                        {recordTitle}
                                    </h3>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {isCurrentCrop ?
                                            `${cropRecord.variety || 'N/A'} • ${cropRecord.location}` :
                                            `${livestockRecord.breed || 'N/A'} • ${livestockRecord.numberOfAnimal} animals`
                                        }
                                    </p>

                                    {/* Progress/Details Section */}
                                    {isCurrentCrop ? (
                                        <>
                                            <div className="mt-4">
                                                <p className="text-sm text-gray-600 mb-1">Growth: <span className="text-black font-semibold">{cropRecord.currentGrowthStage}</span></p>
                                                <div className="flex items-center">
                                                    <div className="w-full h-2 bg-gray-200 rounded-full">
                                                        <div className="h-2 bg-green-500 rounded-full" style={{ width: `${parseInt(cropRecord.currentGrowthStage.replace('%', '')) || 0}%` }}></div>
                                                    </div>
                                                    <span className="text-gray-800 text-xs ml-2">{parseInt(cropRecord.currentGrowthStage.replace('%', '')) || 0}%</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 text-sm text-gray-600">
                                                <p>Planted: <span className="text-gray-800 font-semibold">{new Date(cropRecord.plantingDate).toLocaleDateString()}</span></p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="mt-4 text-sm text-gray-600 space-y-2">
                                            <p><b>Age:</b> {livestockRecord.ageGroup}</p>
                                            <p><b>Last Checkup:</b> {new Date(livestockRecord.acquisitionDate).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                    
                                    {/* Actions */}
                                    <div className="mt-4 border-t border-gray-200 pt-4 flex justify-between items-center">
                                        <div className="flex space-x-2 md:space-x-4 text-gray-400">
                                            <button onClick={(e) => { e.stopPropagation(); openViewRecordModal(record); }} className="hover:text-green-600" title="View Details">
                                                <FolderOpen className="h-5 w-5" />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(record); }} className="hover:text-red-600" title="Delete Record">
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
                        );
                    })}
                </div>
            )}

            {/* Modals */}
            <Modal
                show={isRecordModalOpen}
                onClose={() => setIsRecordModalOpen(false)}
                title={activeRecordTab === 'Crops' ? (selectedRecord as CropRecord)?.cropName || 'Crop Details' : (selectedRecord as LivestockRecord)?.specie || 'Livestock Details'}
            >
                <RecordDetails record={selectedRecord} type={activeRecordTab} onClose={() => setIsRecordModalOpen(false)} />
            </Modal>
            
            <Modal show={isAddCropModalOpen} onClose={() => setIsAddCropModalOpen(false)} title="Add New Crop Record">
                <AddCropForm onClose={() => setIsAddCropModalOpen(false)} onRecordAdded={fetchCropData} />
            </Modal>
            <Modal show={isAddLivestockModalOpen} onClose={() => setIsAddLivestockModalOpen(false)} title="Add New Livestock Record">
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
                            image: getImageUrl((selectedRecord as LivestockRecord)?.image),
                        }}
                        onClose={() => setIsUpdateModalOpen(false)}
                        onRecordUpdated={fetchLivestockData}
                    />
                )}
            </Modal>
        </div>
    );
};

export default CropLivestockRecords;