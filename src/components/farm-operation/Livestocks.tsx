import { useState, useEffect } from 'react';


import { Camera, X} from 'lucide-react';
import Image from 'next/image';

import {
    UpdateLivestockPayload,
     updateLivestockRecord,
    createLivestockRecord, LivestockRecord,
} from '../../lib/services/croplivestock';




// Define the shape of the component's state

interface LivestockFormData {
    specie: string;
    breed: string;
    numberOfAnimal: number;
    ageGroup: string;
    acquisitionDate: string;
    healthStatus: 'good' | 'excellent' | 'fair' | 'poor';
    feedSchedule: string;
    note: string;
}

interface AddLivestockFormProps {
    onClose: () => void;
    onRecordAdded: () => void;
}



export const AddLivestockForm: React.FC<AddLivestockFormProps> = ({ onClose, onRecordAdded }) => {
    
    const [formData, setFormData] = useState<LivestockFormData>({
        specie: '',
        breed: '',
        numberOfAnimal: 1, 
        ageGroup: 'Adult',
        acquisitionDate: '',
        healthStatus: 'good',
        feedSchedule: '',
        note: '',
    });
    
    // 🚀 FIX: State now holds an array of files for multiple images
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 🚀 FIX: Effect now handles multiple preview URLs
    useEffect(() => {
        if (imageFiles.length === 0) {
            setImagePreviewUrls([]);
            return;
        }
        const objectUrls = imageFiles.map(file => URL.createObjectURL(file));
        setImagePreviewUrls(objectUrls);

        // Cleanup function to revoke all object URLs
        return () => {
            objectUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imageFiles]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
        const { id, value, type } = e.target;
        
        setFormData(prev => {
            if (type === 'number') {
                const numValue = parseFloat(value) || 0; 
                return { ...prev, [id]: numValue };
            } 
            
            if (id === 'healthStatus') {
                const healthValue = value.toLowerCase() as LivestockFormData['healthStatus'];
                return { ...prev, [id]: healthValue };
            }

            return { ...prev, [id]: value };
        });
    };

    // 🚀 FIX: File handler now accepts multiple files
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (e.target.files) {
            setImageFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (formData.numberOfAnimal <= 0) {
            setError('The number of animals must be greater than zero.');
            setLoading(false);
            return;
        }
        
        const data: FormData = new FormData();
        data.append('specie', formData.specie);
        data.append('breed', formData.breed);
        data.append('numberOfAnimal', formData.numberOfAnimal.toFixed());
        data.append('ageGroup', formData.ageGroup);
        data.append('acquisitionDate', formData.acquisitionDate);
        data.append('healthStatus', formData.healthStatus);
        data.append('feedSchedule', formData.feedSchedule);
        data.append('note', formData.note);

        // 🚀 FIX: Correctly loop over the array of files and append them
        imageFiles.forEach((file) => {
          data.append("livestockImages", file, file.name);
        });

        try {
            await createLivestockRecord(data);
            onClose();
            onRecordAdded();
        } catch (err: unknown) {
            const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred.';
            console.error('Failed to add livestock record:', errorMessage);
            setError('Failed to add livestock record. Check required fields and network connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 🚀 FIX: Image preview now maps over multiple URLs */}
            {imagePreviewUrls.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 mb-4">
                    {imagePreviewUrls.map((url, index) => (
                        <Image
                            key={index}
                            src={url}
                            alt={`New image preview ${index + 1}`}
                            width={120} // Smaller size for multiple previews
                            height={120}
                            className="rounded-lg object-cover"
                        />
                    ))}
                </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="sm:col-span-2">
                    <label htmlFor="specie" className="block text-sm font-medium text-gray-700 mb-1">Livestock Species<span className="text-red-500">*</span></label>
                    <input type="text" id="specie" placeholder="E.g., Cattle, Chicken, Goat" value={formData.specie} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
                </div>
                
                <div>
                    <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                    <input type="text" id="breed" placeholder="E.g., Holstein, Leghorn" value={formData.breed} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
                </div>
                
                <div>
                    <label htmlFor="numberOfAnimal" className="block text-sm font-medium text-gray-700 mb-1">Number of Animals<span className="text-red-500">*</span></label>
                    <input type="number" id="numberOfAnimal" placeholder="E.g., 10" value={formData.numberOfAnimal} onChange={handleChange} required min="1" className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
                </div>
                
                <div>
                    <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                    <select id="ageGroup" value={formData.ageGroup} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md text-gray-800">
                        <option value="Adult">Adult</option>
                        <option value="Young">Young</option>
                        <option value="Juvenile">Juvenile</option>
                    </select>
                </div>
                
                <div>
                    <label htmlFor="acquisitionDate" className="block text-sm font-medium text-gray-700 mb-1">Acquisition Date<span className="text-red-500">*</span></label>
                    <input type="date" id="acquisitionDate" value={formData.acquisitionDate} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
                </div>
                
                <div>
                    <label htmlFor="healthStatus" className="block text-sm font-medium text-gray-700 mb-1">Health Status</label>
                    <select id="healthStatus" value={formData.healthStatus} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md text-gray-800">
                        <option value="good">Good</option>
                        <option value="excellent">Excellent</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="feedSchedule" className="block text-sm font-medium text-gray-700 mb-1">Feed Schedule<span className="text-red-500">*</span></label>
                    <input type="text" id="feedSchedule" placeholder="E.g twice a day, grass" value={formData.feedSchedule} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
                </div>
                
                <div className="sm:col-span-2">
                    <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                        id="note"
                        rows={3}
                        placeholder="Additional information about this livestock group..."
                        value={formData.note}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md resize-none text-gray-800"
                    ></textarea>
                </div>

                <div className="sm:col-span-2">
                    <div className="text-sm font-medium text-gray-700 mb-2">Livestock Image</div>
                    <div className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-gray-300 rounded-md text-gray-500">
                        <Camera className="h-8 w-8 mb-2" />
                        {/* 🚀 FIX: Text updated for multiple files */}
                        <p className="text-center">Select image for this record.</p>
                        <input 
                            type="file" 
                            id="image" 
                            accept="image/*"
                            onChange={handleFileChange} 
                            className="hidden" 
                            multiple // 🚀 FIX: Added multiple attribute
                        />
                        <label htmlFor="image" className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer">
                            {imageFiles.length > 0 ? `${imageFiles.length} image selected` : 'Select Image'}
                        </label>
                    </div>
                </div>

            </div> 

            {error && <div className="text-center text-red-500 mt-4">{error}</div>}
            {loading && <div className="text-center text-green-600">Adding record...</div>}
            
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
                <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100" onClick={onClose} disabled={loading}>
                    Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white rounded-md bg-green-600 hover:bg-green-700" disabled={loading}>
                    Add Livestock Record
                </button>
            </div>
        </form>
    );
};






// Helper function to format date to YYYY-MM-DD
const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${day}-${month}-${year}`;
};

// 🚀 Type for the component's props
interface UpdateLivestockFormProps {
    record: LivestockRecord;
    onClose: () => void;
    onRecordUpdated: () => void;
}

// --- Component ---
export const UpdateLivestockForm: React.FC<UpdateLivestockFormProps> = ({ record, onClose, onRecordUpdated }) => {
    // State for form data (non-file fields)
    const [formData, setFormData] = useState<UpdateLivestockPayload>({
        specie: record.specie || '',
        breed: record.breed || '',
        numberOfAnimal: record.numberOfAnimal || 1,
        ageGroup: record.ageGroup || 'Adult',
        feedSchedule: record.feedSchedule || '',
        acquisitionDate: formatDate(record.acquisitionDate.toString()) || '',
        healthStatus: (record.healthStatus?.toLowerCase() || 'good') as UpdateLivestockPayload['healthStatus'],
        note: record.note || '',
    });

    // State for existing image (for display, no deletion handler needed as the new image replaces it)
    // We treat the single existing image as an array of 0 or 1 for consistent UI logic
    const [existingImage, setExistingImage] = useState(record.livestockImages?.[0] || null);
    // State for newly selected file (to be uploaded)
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    // State for new image preview URL
    const [newImagePreviewUrl, setNewImagePreviewUrl] = useState<string | null>(null);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Sync form data state if the record prop changes (Important for modal usage)
    useEffect(() => {
        setFormData({
            specie: record.specie || '',
            breed: record.breed || '',
            numberOfAnimal: record.numberOfAnimal || 1,
            ageGroup: record.ageGroup || 'Adult',
            feedSchedule: record.feedSchedule || '',
            acquisitionDate: formatDate(record.acquisitionDate.toString()) || '',
            healthStatus: (record.healthStatus?.toLowerCase() || 'good') as UpdateLivestockPayload['healthStatus'],
            note: record.note || '',
        });
        setExistingImage(record.livestockImages?.[0] || null); // Sync existing image
        setNewImageFile(null); // Clear new file on record change
    }, [record]);

    // Effect to create and clean up the new image preview URL
    useEffect(() => {
        if (!newImageFile) {
            setNewImagePreviewUrl(null);
            return;
        }
        const objectUrl = URL.createObjectURL(newImageFile);
        setNewImagePreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [newImageFile]);


    // Handler for non-file field changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
        const { id, value, type } = e.target;

        setFormData(prev => {
            if (type === 'number') {
                const numValue = parseInt(value, 10) || 0;
                return { ...prev, [id]: numValue };
            }

            if (id === 'healthStatus') {
                const healthValue = value.toLowerCase() as UpdateLivestockPayload['healthStatus'];
                return { ...prev, [id]: healthValue };
            }

            return { ...prev, [id]: value };
        });
    };

    // Handler to accept a single file (Replaces existing image file state)
    const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (e.target.files && e.target.files.length > 0) {
            setNewImageFile(e.target.files[0]);
        }
    };
    
    // Handler to remove the newly selected image file from the preview list
    const handleRemoveNewImage = () => {
        setNewImageFile(null);
    };

    // The logic to remove an EXISTING image is removed because the livestock endpoint
    // appears to support a single image that is replaced on update.

    // 🚀 Strictly Typed Submit Handler
    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (formData.numberOfAnimal <= 0) {
            setError('The number of animals must be greater than zero.');
            setLoading(false);
            return;
        }

        try {
            let submissionData: FormData | UpdateLivestockPayload;

            if (newImageFile) {
                // If a new image is selected, use FormData (as it was in the original livestock logic)
                // This covers both updating data and replacing the image in one call.
                const data = new FormData();
                data.append('specie', formData.specie);
                data.append('breed', formData.breed);
                data.append('numberOfAnimal', formData.numberOfAnimal.toString());
                data.append('ageGroup', formData.ageGroup);
                data.append('acquisitionDate', formData.acquisitionDate);
                data.append('healthStatus', formData.healthStatus);
                data.append('feedSchedule', formData.feedSchedule || '');
                data.append('note', formData.note || '');
                // Assumes the backend endpoint accepts the file under the key 'image'
                data.append('image', newImageFile, newImageFile.name);
                submissionData = data;
            } else {
                // If no new image, send the data as JSON payload
                submissionData = formData;
            }

            // NOTE: The crop form separated JSON update and image POST.
            // The original livestock form merged them using FormData. We maintain the merged logic for consistency with the livestock API.
            await updateLivestockRecord(record.id, submissionData);

            onClose();
            onRecordUpdated();

        } catch (err: unknown) {
            console.error('Update failed:', err);
            setError('Failed to update livestock record. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* --- Existing Image Display (Style adopted from Crop Form) --- */}
            {existingImage && (
                <div className="mb-6 border p-4 rounded-lg bg-gray-50">
                    <p className="text-sm font-medium text-gray-700 mb-3">Current Image</p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <div className="relative group">
                            <Image
                                src={existingImage.url}
                                alt={record.specie}
                                width={100}
                                height={100}
                                className="rounded-lg object-cover border border-gray-200"
                            />
                            {/* NOTE: No delete button, as the new image replaces it */}
                        </div>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* specie */}
                <div className="sm:col-span-2">
                    <label htmlFor="specie" className="block text-sm font-medium text-gray-700 mb-1">Livestock Species<span className="text-red-500">*</span></label>
                    <input type="text" id="specie" placeholder="E.g., Cattle, Chicken, Goat" value={formData.specie} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
                </div>
                {/* breed */}
                <div>
                    <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                    <input type="text" id="breed" placeholder="E.g., Holstein, Leghorn" value={formData.breed} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
                </div>
                {/* numberOfAnimal */}
                <div>
                    <label htmlFor="numberOfAnimal" className="block text-sm font-medium text-gray-700 mb-1">Number of Animals<span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        id="numberOfAnimal"
                        placeholder="E.g., 10"
                        value={formData.numberOfAnimal}
                        onChange={handleChange}
                        required
                        min="1"
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                    />
                </div>
                {/* ageGroup */}
                <div>
                    <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                    <select id="ageGroup" value={formData.ageGroup} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md text-gray-800">
                        <option>Adult</option>
                        <option>Young</option>
                        <option>Juvenile</option>
                    </select>
                </div>
                {/* acquisitionDate */}
                <div>
                    <label htmlFor="acquisitionDate" className="block text-sm font-medium text-gray-700 mb-1">Last Checkup<span className="text-red-500">*</span></label>
                    <input type="date" id="acquisitionDate" value={formData.acquisitionDate} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
                </div>
                {/* healthStatus */}
                <div>
                    <label htmlFor="healthStatus" className="block text-sm font-medium text-gray-700 mb-1">Health Status</label>
                    <select id="healthStatus" value={formData.healthStatus} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md text-gray-800">
                        <option value="good">Good</option>
                        <option value="excellent">Excellent</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                    </select>
                </div>
                {/* feedSchedule */}
                <div>
                    <label htmlFor="feedSchedule" className="block text-sm font-medium text-gray-700 mb-1">Feed Schedule<span className="text-red-500">*</span></label>
                    <input type="text" id="feedSchedule" placeholder="E.g twice a week" value={formData.feedSchedule} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
                </div>
            </div>
            
            {/* note */}
            <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                    id="note"
                    rows={3}
                    placeholder="Additional information about this livestock group..."
                    value={formData.note}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md resize-none text-gray-800"
                ></textarea>
            </div>

            {/* --- New Image Upload (Style adopted from Crop Form) --- */}
            <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Update Livestock Image (Replaces existing image)</div>
                <div className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-gray-300 rounded-md text-gray-500">
                    <Camera className="h-8 w-8 mb-2" />
                    <p className="text-center">
                        Select a new image to replace the current one.
                    </p>
                    <input
                        type="file"
                        id="newImage" // Changed ID for clarity
                        accept="image/*"
                        onChange={handleNewFileChange}
                        className="hidden"
                    />
                    <label
                        htmlFor="newImage"
                        className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer"
                    >
                        {newImageFile ? `Change Image: ${newImageFile.name}` : 'Select New Image'}
                    </label>
                </div>
            </div>

            {/* --- New Image Preview (Style adopted from Crop Form) --- */}
            {newImagePreviewUrl && newImageFile && (
                <div className="mt-4 flex flex-wrap gap-4 items-center justify-center border p-4 rounded-lg bg-yellow-50">
                    <p className="w-full text-center text-sm font-medium text-gray-600 mb-2">New Image Preview (Will replace current image on update):</p>
                    <div className="relative group">
                        <Image
                            src={newImagePreviewUrl}
                            alt={`New Image Preview`}
                            width={100}
                            height={100}
                            className="rounded-md object-cover border border-gray-300"
                        />
                        <button
                            type="button"
                            onClick={handleRemoveNewImage}
                            className="absolute top-0 right-0 -mt-2 -mr-2 p-1 bg-gray-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove new image"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}

            {loading && <div className="text-center text-green-600">Updating...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}

            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100"
                    onClick={onClose}
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white rounded-md bg-green-600 hover:bg-green-700"
                    disabled={loading}
                >
                    Update Livestock Record
                </button>
            </div>
        </form>
    );
};