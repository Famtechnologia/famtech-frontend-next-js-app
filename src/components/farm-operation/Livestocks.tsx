import { useState, useEffect } from 'react';

import { Camera, TriangleAlert} from 'lucide-react';
import Image from 'next/image';

import {
    UpdateLivestockPayload,
     updateLivestockRecord,
    createLivestockRecord,
} from '../../lib/services/croplivestock';

export interface LivestockRecord {
  specie: string;
  numberOfAnimal: number;
  ageGroup: string;
  acquisitionDate: string;
  breed: string;
  healthStatus: 'good' | 'excellent' | 'fair' | 'poor';
  feedSchedule?: string;
  note?: string;
  image: string | File;
  id: string;
}


interface AddLivestockFormProps {
    onClose: () => void;
    onRecordAdded: () => void;
}

// Define the shape of the component's state for better type safety
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

export const AddLivestockForm: React.FC<AddLivestockFormProps> = ({ onClose, onRecordAdded }) => {
    const [formData, setFormData] = useState<LivestockFormData>({
        specie: '',
        breed: '',
        numberOfAnimal: 1, // Initialize to 1 or 0, but use 1 for a required field
        ageGroup: 'Adult',
        acquisitionDate: '',
        healthStatus: 'good',
        feedSchedule: '',
        note: '',
    });
    
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Effect to create and clean up the preview URL (This part is correct)
    useEffect(() => {
        if (!imageFile) {
            setImagePreviewUrl(null);
            return;
        }
        const objectUrl = URL.createObjectURL(imageFile);
        setImagePreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;
        
        // --- Correction 1: Handle number inputs ---
        if (type === 'number') {
            // Convert to number, use 0 if conversion fails or is empty string
            const numValue = parseInt(value, 10) || 0; 
            setFormData(prev => ({ ...prev, [id]: numValue }));
        } else {
            // Ensure healthStatus is stored in lowercase to match interface
            const newValue = id === 'healthStatus' ? value.toLowerCase() as LivestockFormData['healthStatus'] : value;
            setFormData(prev => ({ ...prev, [id]: newValue }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            // NOTE: If you decide to support multiple images later, you'll need to use an array state here.
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // --- Correction 2: Ensure numberOfAnimal is not 0 (if required) ---
        if (formData.numberOfAnimal <= 0) {
            setError('The number of animals must be greater than zero.');
            setLoading(false);
            return;
        }
        
        // Prepare FormData for multipart submission
        const data = new FormData();
        data.append('specie', formData.specie.toLowerCase());
        data.append('breed', formData.breed.toLowerCase());
        
        // Append the number as a string
        data.append('numberOfAnimal', formData.numberOfAnimal.toString());
        
        data.append('ageGroup', formData.ageGroup);
        data.append('acquisitionDate', formData.acquisitionDate);
        data.append('healthStatus', formData.healthStatus);
        data.append('feedSchedule', formData.feedSchedule);
        data.append('note', formData.note);
        
        if (imageFile) {
            // Append the image file. Key name 'image' matches your interface.
            data.append('image', imageFile, imageFile.name);
        }

        try {
            // Assuming the function is correctly imported and handles FormData
            // await createLivestockRecord(data); 
            console.log('Submitting data:', Object.fromEntries(data.entries())); // Mock submission
            
            onClose();
            onRecordAdded();
        } catch (err) {
            console.error('Failed to add livestock record:', err);
            setError('Failed to add livestock record. Check required fields and network connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Preview Block: Renders only when imagePreviewUrl is available */}
            {imagePreviewUrl && (
                <div className="flex justify-center mb-4">
                    <Image
                        src={imagePreviewUrl}
                        alt="New image preview"
                        width={200}
                        height={200}
                        className="rounded-lg object-cover"
                    />
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
                    {/* Use value={formData.numberOfAnimal || ''} to prevent displaying 0 when cleared, though the initial state handles this now. */}
                    <input type="number" id="numberOfAnimal" placeholder="E.g., 10" value={formData.numberOfAnimal} onChange={handleChange} required min="1" className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
                </div>
                <div>
                    <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                    <select id="ageGroup" value={formData.ageGroup} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md text-gray-800">
                        <option>Adult</option>
                        <option>Young</option>
                        <option>Juvenile</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="acquisitionDate" className="block text-sm font-medium text-gray-700 mb-1">Acquisition Date<span className="text-red-500">*</span></label>
                    <input type="date" id="acquisitionDate" value={formData.acquisitionDate} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
                </div>
                <div>
                    <label htmlFor="healthStatus" className="block text-sm font-medium text-gray-700 mb-1">Health Status</label>
                    <select id="healthStatus" value={formData.healthStatus} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md text-gray-800">
                        <option>good</option>
                        <option>excellent</option>
                        <option>fair</option>
                        <option>poor</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="feedSchedule" className="block text-sm font-medium text-gray-700 mb-1">Feed Schedule<span className="text-red-500">*</span></label>
                    <input type="text" id="feedSchedule" placeholder="E.g twice a day, grass" value={formData.feedSchedule} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
                </div>
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
            <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Livestock Image</div>
                <div className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-gray-300 rounded-md text-gray-500">
                    <Camera className="h-8 w-8 mb-2" />
                    <p className="text-center">Select one image for this record.</p>
                    <input 
                        type="file" 
                        id="image" 
                        accept="image/*"
                        onChange={handleFileChange} 
                        className="hidden" 
                    />
                    <label htmlFor="image" className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer">
                        Select Image
                    </label>
                </div>
            </div>
            {error && <div className="text-center text-red-500 mt-4">{error}</div>}
            {loading && <div className="text-center text-green-600">Adding record...</div>}
            <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-md" role="alert">
                <div className="flex items-center">
                    <TriangleAlert className="h-5 w-5 mr-3" />
                    <p className="text-sm">
                        Regular health monitoring and proper record keeping are essential for livestock management. Use the livestock events section to track vaccinations, treatments, and other activities.
                    </p>
                </div>
            </div>
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






interface UpdateLivestockFormProps {
    // Record structure from the parent
    record: Omit<LivestockRecord, "image"> & { image?: string | null };
    onClose: () => void;
    onRecordUpdated: () => void;
}

// Helper function to format date to YYYY-MM-DD
const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- Component ---
export const UpdateLivestockForm: React.FC<UpdateLivestockFormProps> = ({ record, onClose, onRecordUpdated }) => {
    
    // State initialization with type casting and safe defaults
    const [formData, setFormData] = useState<UpdateLivestockPayload>({
        specie: record.specie || '',
        breed: record.breed || '',
        // Use a number type and safe default
        numberOfAnimal: record.numberOfAnimal || 1, 
        ageGroup: record.ageGroup || 'Adult',
        feedSchedule: record.feedSchedule || '',
        acquisitionDate: formatDate(record.acquisitionDate) || '',
        // Ensure healthStatus is in lowercase for consistency
        healthStatus: (record.healthStatus?.toLowerCase() || 'good') as UpdateLivestockPayload['healthStatus'], 
        note: record.note || '',
    });
    
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Effect to create and clean up the new image preview URL (Correct)
    useEffect(() => {
        if (!imageFile) {
            setImagePreviewUrl(null);
            return;
        }
        const objectUrl = URL.createObjectURL(imageFile);
        setImagePreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile]);

    // Sync state if record prop changes (for reusable modals)
    useEffect(() => {
        setFormData({
            specie: record.specie || '',
            breed: record.breed || '',
            numberOfAnimal: record.numberOfAnimal || 1,
            ageGroup: record.ageGroup || 'Adult',
            feedSchedule: record.feedSchedule || '',
            acquisitionDate: formatDate(record.acquisitionDate) || '',
            healthStatus: (record.healthStatus?.toLowerCase() || 'good') as UpdateLivestockPayload['healthStatus'],
            note: record.note || '',
        });
        // Clear any pending image upload when the record changes
        setImageFile(null);
    }, [record]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;
        
        // --- Correction 1: Handle number inputs ---
        if (type === 'number') {
            const numValue = parseInt(value, 10) || 0; 
            setFormData(prev => ({ ...prev, [id]: numValue }));
        } else {
            // Ensure healthStatus is stored in lowercase
            const newValue = id === 'healthStatus' ? value.toLowerCase() : value;
            setFormData(prev => ({ ...prev, [id]: newValue }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validation check for number of animals
        if (formData.numberOfAnimal <= 0) {
            setError('The number of animals must be greater than zero.');
            setLoading(false);
            return;
        }

        try {
            if (imageFile) {
                // If a NEW image is present, use FormData (multipart/form-data)
                const data = new FormData();
                data.append('specie', formData.specie.toLowerCase() ?? '');
                data.append('breed', formData.breed.toLowerCase() ?? '');
                data.append('numberOfAnimal', formData.numberOfAnimal.toString());
                data.append('ageGroup', formData.ageGroup ?? '');
                data.append('acquisitionDate', formData.acquisitionDate ?? '');
                data.append('healthStatus', formData.healthStatus.toLowerCase() ?? '');
                data.append('feedSchedule', formData.feedSchedule ?? '');
                data.append('note', formData.note ?? '');
                // Append the new image
                data.append('image', imageFile, imageFile.name); 

                // Await updateLivestockRecord(record.id, data);
                console.log('Submitting FormData for update with image:', Object.fromEntries(data.entries()));

            } else {
                // If NO new image, send the clean JSON payload (application/json)
                const payload: UpdateLivestockPayload = {
                    specie: formData.specie.toLowerCase(),
                    breed: formData.breed.toLowerCase(),
                    numberOfAnimal: formData.numberOfAnimal,
                    ageGroup: formData.ageGroup,
                    acquisitionDate: formData.acquisitionDate,
                    healthStatus: formData.healthStatus.toLowerCase(),
                    feedSchedule: formData.feedSchedule,
                    note: formData.note,
                };
                
                // Await updateLivestockRecord(record.id, payload);
                console.log('Submitting JSON payload for update:', payload);
            }

            // Simulate successful update
            onClose();
            onRecordUpdated();
            
        } catch (err) {
            setError('Failed to update livestock record. Please try again.');
            console.error('Update failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Display Image: New Preview overrides Existing Image */}
            <div className="flex justify-center mb-4">
                {imagePreviewUrl ? (
                    <Image src={imagePreviewUrl} alt="New image preview" width={200} height={200} className="rounded-lg object-cover" />
                ) : (record.image && typeof record.image === 'string') ? (
                    <Image src={record.image} alt={record.specie} width={200} height={200} className="rounded-lg object-cover" />
                ) : (
                    // Placeholder if no image is present/uploaded
                    <div className="w-[200px] h-[200px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">No Image</div>
                )}
            </div>

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
                    <input 
                        type="number" 
                        id="numberOfAnimal" 
                        placeholder="E.g., 10" 
                        value={formData.numberOfAnimal} 
                        onChange={handleChange} 
                        required 
                        min="1" // Added min attribute for client-side validation
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-800" 
                    />
                </div>
                <div>
                    <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                    <select id="ageGroup" value={formData.ageGroup} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md text-gray-800">
                        <option>Adult</option>
                        <option>Young</option>
                        <option>Juvenile</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="acquisitionDate" className="block text-sm font-medium text-gray-700 mb-1">Acquisition Date<span className="text-red-500">*</span></label>
                    <input type="date" id="acquisitionDate" value={formData.acquisitionDate} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
                </div>
                <div>
                    <label htmlFor="healthStatus" className="block text-sm font-medium text-gray-700 mb-1">Health Status</label>
                    <select id="healthStatus" value={formData.healthStatus} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md text-gray-800">
                        {/* Correction 3: Use lowercase options for consistency */}
                        <option value="good">Good</option>
                        <option value="excellent">Excellent</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="feedSchedule" className="block text-sm font-medium text-gray-700 mb-1">Feed Schedule<span className="text-red-500">*</span></label>
                    <input type="text" id="feedSchedule" placeholder="E.g twice a week" value={formData.feedSchedule} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
                </div>
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
            
            {/* Image Upload Block (Correct for single image replacement) */}
            <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Update Livestock Image (Replaces existing image)</div>
                <div className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-gray-300 rounded-md text-gray-500">
                    <Camera className="h-8 w-8 mb-2" />
                    <p className="text-center">Select a new image to replace the current one.</p>
                    <input 
                        type="file" 
                        id="image" 
                        accept="image/*"
                        onChange={handleFileChange} 
                        className="hidden" 
                    />
                    <label htmlFor="image" className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer">
                        Select New Image
                    </label>
                </div>
            </div>

            {loading && <div className="text-center text-green-600">Updating...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}

            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
                <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100" onClick={onClose} disabled={loading}>
                    Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white rounded-md bg-green-600 hover:bg-green-700" disabled={loading}>
                    Update Livestock Record
                </button>
            </div>
        </form>
    );
};