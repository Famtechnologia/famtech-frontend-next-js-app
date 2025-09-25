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

export const AddLivestockForm: React.FC<AddLivestockFormProps> = ({ onClose, onRecordAdded }) => {
    const [formData, setFormData] = useState({
        specie: '',
        breed: '',
        numberOfAnimal: 0,
        ageGroup: 'Adult',
        acquisitionDate: '',
        healthStatus: 'good',
        feedSchedule: '',
        note: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null); // State for image preview

    // Effect to create and clean up the preview URL
    useEffect(() => {
        if (!imageFile) {
            setImagePreviewUrl(null);
            return;
        }
        const objectUrl = URL.createObjectURL(imageFile);
        setImagePreviewUrl(objectUrl);

        // Free memory when the component is unmounted or imageFile changes
        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        const newValue = id === 'healthStatus' ? value.toLowerCase() : value;
        setFormData(prev => ({ ...prev, [id]: newValue }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = new FormData();
        data.append('specie', formData.specie);
        data.append('breed', formData.breed);
        data.append('numberOfAnimal', formData.numberOfAnimal.toString());
        data.append('ageGroup', formData.ageGroup);
        data.append('acquisitionDate', formData.acquisitionDate);
        data.append('healthStatus', formData.healthStatus);
        data.append('feedSchedule', formData.feedSchedule); // Corrected key to match your interface
        data.append('note', formData.note);
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            await createLivestockRecord(data);
            onClose();
            onRecordAdded();
        } catch (error) {
            console.error('Failed to add livestock record:', error);
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
                    <input type="number" id="numberOfAnimal" placeholder="E.g., 10" value={formData.numberOfAnimal} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
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
                    <label htmlFor="acquisitionDate" className="block text-sm font-medium text-gray-700 mb-1">Last Health Checkup:</label>
                    <input type="date" id="acquisitionDate" value={formData.acquisitionDate} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
                </div>
                <div>
                    <label htmlFor="healthStatus" className="block text-lowercase text-sm font-medium text-gray-700 mb-1">Health Status</label>
                    <select id="healthStatus" value={formData.healthStatus} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md text-gray-800">
                        <option>good</option>
                        <option>fair</option>
                        <option>poor</option>
                    </select>
                </div>
                {/* The feedSchedule input is already correct in your code and form state. */}
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
            <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Livestock Images</div>
                <div className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-gray-300 rounded-md text-gray-500">
                    <Camera className="h-8 w-8 mb-2" />
                    <p className="text-center">Drag and drop images here, or click to select files</p>
                    <input type="file" id="image" onChange={handleFileChange} className="hidden" />
                    <label htmlFor="image" className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer">
                        Select Images
                    </label>
                </div>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-md" role="alert">
                <div className="flex items-center">
                    <TriangleAlert className="h-5 w-5 mr-3" />
                    <p className="text-sm">
                        Regular health monitoring and proper record keeping are essential for livestock management. Use the livestock events section to track vaccinations, treatments, and other activities.
                    </p>
                </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
                <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100" onClick={onClose}>
                    Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white rounded-md bg-green-600 hover:bg-green-700">
                    Add Livestock Record
                </button>
            </div>
        </form>
    );
};


interface UpdateLivestockFormProps {
    record: Omit<LivestockRecord, "image"> & { image?: string | null };
    onClose: () => void;
    onRecordUpdated: () => void;
}

// Helper function to format date to YYYY-MM-DD
const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const UpdateLivestockForm: React.FC<UpdateLivestockFormProps> = ({ record, onClose, onRecordUpdated }) => {
    const [formData, setFormData] = useState<UpdateLivestockPayload>({
        specie: record.specie || '',
        breed: record.breed || '',
        numberOfAnimal: record.numberOfAnimal || 0,
        ageGroup: record.ageGroup || '',
        feedSchedule: record.feedSchedule || '',
        acquisitionDate: formatDate(record.acquisitionDate) || '',
        healthStatus: record.healthStatus || 'Good',
        note: record.note || '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Effect to create and clean up the new image preview URL
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
    const { id, value } = e.target;
    let newValue = value;

    // Check if the input ID is 'healthStatus' and convert the value to lowercase
    if (id === 'healthStatus') {
        newValue = value.toLowerCase();
    }
    setFormData(prev => ({ ...prev, [id]: newValue }));
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

        let payload: FormData | UpdateLivestockPayload;

        if (imageFile) {
            const data = new FormData();
            data.append('specie', formData.specie ?? '');
            data.append('breed', formData.breed ?? '');
            data.append('numberOfAnimal', formData.numberOfAnimal.toString());
            data.append('ageGroup', formData.ageGroup ?? '');
            data.append('acquisitionDate', formData.acquisitionDate ?? '');
            data.append('healthStatus', formData.healthStatus ?? '');
            data.append('feedSchedule', formData.feedSchedule ?? '');
            data.append('note', formData.note ?? '');
            data.append('image', imageFile);
            payload = data;
        } else {
            payload = formData;
        }

        try {
            await updateLivestockRecord(record.id, payload);
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
            {imagePreviewUrl ? (
                <div className="flex justify-center mb-4">
                    <Image src={imagePreviewUrl} alt="New image preview" width={200} height={200} className="rounded-lg object-cover" />
                </div>
            ) : record.image && (
                <div className="flex justify-center mb-4">
                    <Image src={record.image as string} alt={record.specie} width={200} height={200} className="rounded-lg object-cover" />
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
                    <input type="number" id="numberOfAnimal" placeholder="E.g., 10" value={formData.numberOfAnimal} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
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
                    <label htmlFor="acquisitionDate" className="block text-sm font-medium text-gray-700 mb-1">Last Health Checkup</label>
                    <input type="date" id="acquisitionDate" value={formData.acquisitionDate} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
                </div>
                <div>
                    <label htmlFor="healthStatus" className="block text-lowercase text-sm font-medium text-gray-700 mb-1">Health Status</label>
                    <select id="healthStatus" value={formData.healthStatus} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md text-gray-800">
                        <option>Good</option>
                        <option>Fair</option>
                        <option>Poor</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="feedSchedule" className="block text-lowercase font-medium text-gray-700 mb-1">Feed Schedule</label>
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
            <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Livestock Images</div>
                <div className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-gray-300 rounded-md text-gray-500">
                    <Camera className="h-8 w-8 mb-2" />
                    <p className="text-center">Drag and drop images here, or click to select files</p>
                    <input type="file" id="image" onChange={handleFileChange} className="hidden" />
                    <label htmlFor="image" className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer">
                        Select Images
                    </label>
                </div>
            </div>

            {loading && <div className="text-center text-green-600">Updating...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}

            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
                <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100" onClick={onClose}>
                    Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white rounded-md bg-green-600 hover:bg-green-700" disabled={loading}>
                    Update Livestock Record
                </button>
            </div>
        </form>
    );
};