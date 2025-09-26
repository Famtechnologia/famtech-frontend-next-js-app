import { useState, useEffect } from 'react';
import { Camera, TriangleAlert, X} from 'lucide-react';
import Image from 'next/image';

import {
     updateCropRecord, CropRecord,
    createCropRecord, UpdateCropPayload, addCropImages, deleteCropImages} from '../../lib/services/croplivestock';




// --- Interface Definitions ---
interface AddCropFormProps {
    onClose: () => void;
    onRecordAdded: () => void;
}

// Define the shape of the component's state for better type safety
interface CropFormData {
    cropName: string;
    variety: string;
    location: string;
    plantingDate: string;
    expectedHarvestDate: string;
    currentGrowthStage: string;
    healthStatus: string; // Keep as string to match input values
    areaValue: number;
    areaUnit: string;
    seedQuantityValue: number;
    seedQuantityUnit: string;
    note: string;
}

// --- Component ---
export const AddCropForm: React.FC<AddCropFormProps> = ({
    onClose,
    onRecordAdded,
}) => {
    const [formData, setFormData] = useState<CropFormData>({
        cropName: "",
        variety: "",
        location: "",
        plantingDate: "",
        expectedHarvestDate: "",
        currentGrowthStage: "Seeding",
        healthStatus: "good",
        areaValue: 0,
        areaUnit: "ac",
        seedQuantityValue: 0,
        seedQuantityUnit: "kg",
        note: "",
    });

    // State to store the selected file objects
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    // State to store the URL for image previews
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Effect to create and clean up the image preview URLs
    useEffect(() => {
        if (imageFiles.length === 0) {
            setImagePreviewUrls([]);
            return;
        }

        const urls = imageFiles.map(file => URL.createObjectURL(file));
        setImagePreviewUrls(urls);

        // Clean up all created URLs when the component unmounts or files change
        return () => {
            urls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imageFiles]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { id, value, type } = e.target;
        
        // Handle number inputs correctly
        if (type === 'number') {
             // Convert to number, use 0 if conversion fails or is empty string
            const numValue = parseFloat(value) || 0; 
            setFormData((prev) => ({ ...prev, [id]: numValue }));
        } else {
            setFormData((prev) => ({ ...prev, [id]: value }));
        }
    };

    // Handler to accept multiple files
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            // Convert FileList to an array and set the state
            setImageFiles(Array.from(files));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const data = new FormData();
        
        // --- Append Form Data ---
        // Ensuring number fields are correctly appended as strings
        data.append("cropName", formData.cropName.toLowerCase());
        data.append("variety", formData.variety.toLowerCase());
        data.append("location", formData.location.toLowerCase());
        data.append("plantingDate", formData.plantingDate);
        data.append("expectedHarvestDate", formData.expectedHarvestDate);
        data.append("currentGrowthStage", formData.currentGrowthStage.toLowerCase());
        data.append("healthStatus", formData.healthStatus.toLowerCase());
        
        // Area and Quantity fields
        data.append("area.value", formData.areaValue.toString());
        data.append("area.unit", formData.areaUnit);
        data.append("seedQuantity.value", formData.seedQuantityValue.toString());
        data.append("seedQuantity.unit", formData.seedQuantityUnit);
        
        data.append("note", formData.note);

        // --- Append Image Files (The critical part) ---
        // Use the field name 'image' (singular) as indicated by your payload.
        // FormData handles multiple files appended with the same key.
        imageFiles.forEach(file => {
            data.append('image', file, file.name); // Added file.name as third optional argument
        });

        try {
            await createCropRecord(data);
            onClose();
            onRecordAdded();
        } catch (err) {
            console.error("Failed to add crop record:", err);
            // Enhanced error message for user feedback
            setError("Failed to add crop record. Check network and ensure all required fields are valid."); 
        } finally {
            setLoading(false);
        }
    };

    // --- Component JSX (Rendering is identical, provided for context) ---
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                    <label
                        htmlFor="cropName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Crop Name<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="cropName"
                        placeholder="E.g., Maize"
                        value={formData.cropName}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                    />
                </div>
                <div>
                    <label
                        htmlFor="variety"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Variety
                    </label>
                    <input
                        type="text"
                        id="variety"
                        placeholder="E.g., Pioneer Hybrid"
                        value={formData.variety}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                    />
                </div>
                <div>
                    <label
                        htmlFor="location"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Field/Location<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="location"
                        placeholder="E.g., East Field"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                    />
                </div>
                <div>
                    <label
                        htmlFor="plantingDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Planting Date<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        id="plantingDate"
                        value={formData.plantingDate}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                    />
                </div>
                <div>
                    <label
                        htmlFor="expectedHarvestDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Expected Harvest Date
                    </label>
                    <input
                        type="date"
                        id="expectedHarvestDate"
                        value={formData.expectedHarvestDate}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                    />
                </div>
                <div>
                    <label
                        htmlFor="currentGrowthStage"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Current Growth Stage
                    </label>
                    <select
                        id="currentGrowthStage"
                        value={formData.currentGrowthStage}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                    >
                        <option>Seeding</option>
                        <option>Vegetative</option>
                        <option>Flowering</option>
                        <option>Fruiting</option>
                        <option>Maturity</option>
                    </select>
                </div>
                <div>
                    <label
                        htmlFor="healthStatus"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Health Status
                    </label>
                    <select
                        id="healthStatus"
                        value={formData.healthStatus}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                    >
                        <option>Good</option>
                        <option>Fair</option>
                        <option>Poor</option>
                    </select>
                </div>
                <div>
                    <label
                        htmlFor="areaValue"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Area<span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-0">
                        <input
                            type="number"
                            id="areaValue"
                            placeholder="0.00"
                            value={formData.areaValue || ''} // Use || '' to allow the user to clear the input
                            onChange={handleChange}
                            required
                            className="flex-1 p-2 border border-gray-300 rounded-md text-gray-800"
                        />
                        <select
                            id="areaUnit"
                            value={formData.areaUnit}
                            onChange={handleChange}
                            className="p-2 border border-gray-300 rounded-md text-gray-800"
                        >
                            <option>ac</option>
                            <option>ha</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label
                        htmlFor="seedQuantityValue"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Seed Quantity
                    </label>
                    <div className="flex space-x-0">
                        <input
                            type="number"
                            id="seedQuantityValue"
                            placeholder="0.00"
                            value={formData.seedQuantityValue || ''} // Use || '' to allow the user to clear the input
                            onChange={handleChange}
                            className="flex-1 p-2 border border-gray-300 rounded-md text-gray-800"
                        />
                        <select
                            id="seedQuantityUnit"
                            value={formData.seedQuantityUnit}
                            onChange={handleChange}
                            className="p-2 border border-gray-300 rounded-md text-gray-800"
                        >
                            <option>kg</option>
                            <option>lb</option>
                        </select>
                    </div>
                </div>
            </div>
            <div>
                <label
                    htmlFor="note"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Notes
                </label>
                <textarea
                    id="note"
                    rows={3}
                    placeholder="Additional information about this crop..."
                    value={formData.note}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md resize-none text-gray-800"
                ></textarea>
            </div>
            <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Crop Image(s)</div>
                {/* Image upload area */}
                <div className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-gray-300 rounded-md text-gray-500">
                    <Camera className="h-8 w-8 mb-2" />
                    <p className="text-center">
                        Drag and drop image(s) here, or click to select file(s)
                    </p>
                    <input
                        type="file"
                        id="images"
                        accept="image/*"
                        onChange={handleFileChange}
                        multiple
                        className="hidden"
                    />
                    <label
                        htmlFor="images"
                        className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer"
                    >
                        Select Image(s)
                    </label>
                </div>
                {/* Conditional rendering for the image previews */}
                {imagePreviewUrls.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-4 items-center justify-center">
                        <p className="w-full text-center text-sm text-gray-500 mb-2">Image Previews:</p>
                        {imagePreviewUrls.map((url, index) => (
                            <Image
                                key={index}
                                src={url}
                                alt={`Image Preview ${index + 1}`}
                                width={120}
                                height={120}
                                className="rounded-md object-cover"
                            />
                        ))}
                    </div>
                )}
            </div>
            <div
                className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-md"
                role="alert"
            >
                <div className="flex items-center">
                    <TriangleAlert className="h-5 w-5 mr-3" />
                    <p className="text-sm">
                        This record will be used for crop tracking, yield forecasting, and
                        generating reports. Regular updates to growth stage and health
                        status are recommended.
                    </p>
                </div>
            </div>
            {loading && <div className="text-center text-green-600">Adding...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100"
                    onClick={onClose}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white rounded-md bg-green-600 hover:bg-green-700"
                    disabled={loading}
                >
                    Add Crop Record
                </button>
            </div>
        </form>
    );
};







// --- Interface Definitions ---
interface UpdateCropFormProps {
    record: CropRecord;
    onClose: () => void;
    onRecordUpdated: () => void;
}

// Helper function to format date strings to YYYY-MM-DD
const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Ensure date is valid before formatting
    if (isNaN(date.getTime())) return ''; 
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- Component ---
export const UpdateCropForm: React.FC<UpdateCropFormProps> = ({
    record,
    onClose,
    onRecordUpdated,
}) => {
    // State for form data (non-file fields)
    const [formData, setFormData] = useState({
        cropName: record.cropName || '',
        variety: record.variety || '',
        location: record.location || '',
        plantingDate: formatDate(record.plantingDate),
        expectedHarvestDate: formatDate(record.expectedHarvestDate),
        currentGrowthStage: record.currentGrowthStage || 'Seeding',
        healthStatus: record.healthStatus || 'Good',
        areaValue: record.area?.value || 0,
        areaUnit: record.area?.unit || 'ac',
        seedQuantityValue: record.seedQuantity?.value || 0,
        seedQuantityUnit: record.seedQuantity?.unit || 'kg',
        note: record.note || '',
    });

    // State for existing images (for deletion purposes)
    const [existingImages, setExistingImages] = useState(record.cropImages || []);
    // State for newly selected files (to be uploaded)
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
    // State for new image preview URLs
    const [newImagePreviewUrls, setNewImagePreviewUrls] = useState<string[]>([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sync form data state if the record prop changes (Important for modal usage)
    useEffect(() => {
        setFormData({
            cropName: record.cropName || '',
            variety: record.variety || '',
            location: record.location || '',
            plantingDate: formatDate(record.plantingDate),
            expectedHarvestDate: formatDate(record.expectedHarvestDate),
            currentGrowthStage: record.currentGrowthStage || 'Seeding',
            healthStatus: record.healthStatus || 'Good',
            areaValue: record.area?.value || 0,
            areaUnit: record.area?.unit || 'ac',
            seedQuantityValue: record.seedQuantity?.value || 0,
            seedQuantityUnit: record.seedQuantity?.unit || 'kg',
            note: record.note || '',
        });
        setExistingImages(record.cropImages || []); // Also sync existing images
        setNewImageFiles([]); // Clear new files on record change
    }, [record]);

    // Effect to create and clean up the new image preview URLs
    useEffect(() => {
        const urls = newImageFiles.map(file => URL.createObjectURL(file));
        setNewImagePreviewUrls(urls);

        // Cleanup function
        return () => {
            urls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [newImageFiles]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { id, value, type } = e.target;
        
        if (type === 'number') {
            const numValue = parseFloat(value) || 0; 
            setFormData((prev) => ({ ...prev, [id]: numValue }));
        } else {
            setFormData((prev) => ({ ...prev, [id]: value }));
        }
    };

    // Handler to accept multiple files
    const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            // Overwrite existing new files with the new selection
            setNewImageFiles(Array.from(files));
        }
    };
    
    // Handler to remove an existing image
    const handleRemoveExistingImage = async (fileId: string) => {
        setLoading(true);
        setError(null);
        try {
            // 1. Call API to delete the image from the server
            await deleteCropImages(record.id, [fileId]);
            
            // 2. Update local state immediately for a fast UI response
            setExistingImages(prev => prev.filter(img => img.fileId !== fileId));

            // 3. Notify parent component to refresh main data (optional, but good practice)
            onRecordUpdated(); 

        } catch (err) {
            console.error('Failed to delete image:', err);
            setError('Failed to delete image. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    // Handler to remove a newly selected image file from the preview list
    const handleRemoveNewImage = (fileIndex: number) => {
        setNewImageFiles(prev => prev.filter((_, index) => index !== fileIndex));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 1. Prepare JSON payload for non-file fields (UpdateCropPayload)
        const payload: UpdateCropPayload = {
            cropName: formData.cropName.toLowerCase(),
            variety: formData.variety.toLowerCase(),
            location: formData.location.toLowerCase(),
            plantingDate: formData.plantingDate,
            expectedHarvestDate: formData.expectedHarvestDate,
            currentGrowthStage: formData.currentGrowthStage.toLowerCase(),
            healthStatus: formData.healthStatus.toLowerCase() as UpdateCropPayload['healthStatus'],
            area: {
                value: Number(formData.areaValue),
                unit: formData.areaUnit,
            },
            seedQuantity: {
                value: Number(formData.seedQuantityValue),
                unit: formData.seedQuantityUnit,
            },
            note: formData.note,
        };

        try {
            // 2. Perform the main data update first (Always a JSON PUT)
            await updateCropRecord(record.id, payload);
            
            // 3. If new images are present, upload them separately (POST to /images endpoint)
            if (newImageFiles.length > 0) {
                const imageFormData = new FormData();
                // Assumes the backend endpoint accepts files under the key 'image'
                newImageFiles.forEach(file => {
                    imageFormData.append('image', file, file.name);
                });
                await addCropImages(record.id, imageFormData);
            }

            // 4. Close and refresh parent component data
            onClose();
            onRecordUpdated();
            
        } catch (err) {
            console.error('Update failed:', err);
            setError('Failed to update crop record. Please check the form fields and connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* --- Existing Images Display --- */}
            {existingImages.length > 0 && (
                <div className="mb-6 border p-4 rounded-lg bg-gray-50">
                    <p className="text-sm font-medium text-gray-700 mb-3">Existing Images ({existingImages.length})</p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        {existingImages.map((img) => (
                            <div key={img.fileId} className="relative group">
                                <Image
                                    src={img.url}
                                    alt={record.cropName}
                                    width={100}
                                    height={100}
                                    className="rounded-lg object-cover border border-gray-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveExistingImage(img.fileId)}
                                    className="absolute top-0 right-0 -mt-2 -mr-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Remove image"
                                    disabled={loading}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ... (Other form fields like cropName, variety, location, etc. remain the same) */}
                {/* cropName */}
                <div className="sm:col-span-2">
                    <label
                        htmlFor="cropName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Crop Name<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="cropName"
                        placeholder="E.g., Maize"
                        value={formData.cropName}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                    />
                </div>
                {/* variety */}
                <div>
                    <label
                        htmlFor="variety"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Variety
                    </label>
                    <input
                        type="text"
                        id="variety"
                        placeholder="E.g., Pioneer Hybrid"
                        value={formData.variety}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                    />
                </div>
                {/* location */}
                <div>
                    <label
                        htmlFor="location"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Field/Location<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="location"
                        placeholder="E.g., East Field"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                    />
                </div>
                {/* plantingDate */}
                <div>
                    <label
                        htmlFor="plantingDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Planting Date<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        id="plantingDate"
                        value={formData.plantingDate}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                    />
                </div>
                {/* expectedHarvestDate */}
                <div>
                    <label
                        htmlFor="expectedHarvestDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Expected Harvest Date
                    </label>
                    <input
                        type="date"
                        id="expectedHarvestDate"
                        value={formData.expectedHarvestDate}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                    />
                </div>
                {/* currentGrowthStage */}
                <div>
                    <label
                        htmlFor="currentGrowthStage"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Current Growth Stage
                    </label>
                    <select
                        id="currentGrowthStage"
                        value={formData.currentGrowthStage}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                    >
                        <option>Seeding</option>
                        <option>Vegetative</option>
                        <option>Flowering</option>
                        <option>Fruiting</option>
                        <option>Maturity</option>
                    </select>
                </div>
                {/* healthStatus */}
                <div>
                    <label
                        htmlFor="healthStatus"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Health Status
                    </label>
                    <select
                        id="healthStatus"
                        value={formData.healthStatus}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                    >
                        <option>Good</option>
                        <option>Fair</option>
                        <option>Poor</option>
                    </select>
                </div>
                {/* area */}
                <div>
                    <label
                        htmlFor="areaValue"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Area<span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-0">
                        <input
                            type="number"
                            id="areaValue"
                            placeholder="0.00"
                            value={formData.areaValue}
                            onChange={handleChange}
                            required
                            className="flex-1 p-2 border border-gray-300 rounded-md text-gray-800"
                        />
                        <select
                            id="areaUnit"
                            value={formData.areaUnit}
                            onChange={handleChange}
                            className="p-2 border border-gray-300 rounded-md text-gray-800"
                        >
                            <option>ac</option>
                            <option>ha</option>
                        </select>
                    </div>
                </div>
                {/* seed quantity */}
                <div>
                    <label
                        htmlFor="seedQuantityValue"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Seed Quantity
                    </label>
                    <div className="flex space-x-0">
                        <input
                            type="number"
                            id="seedQuantityValue"
                            placeholder="0.00"
                            value={formData.seedQuantityValue}
                            onChange={handleChange}
                            className="flex-1 p-2 border border-gray-300 rounded-md text-gray-800"
                        />
                        <select
                            id="seedQuantityUnit"
                            value={formData.seedQuantityUnit}
                            onChange={handleChange}
                            className="p-2 border border-gray-300 rounded-md text-gray-800"
                        >
                            <option>kg</option>
                            <option>lb</option>
                        </select>
                    </div>
                </div>
            </div>
            
            {/* note */}
            <div>
                <label
                    htmlFor="note"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Notes
                </label>
                <textarea
                    id="note"
                    rows={3}
                    placeholder="Additional information about this crop..."
                    value={formData.note}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md resize-none text-gray-800"
                ></textarea>
            </div>

            {/* --- New Image Upload --- */}
            <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Add New Crop Images</div>
                <div className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-gray-300 rounded-md text-gray-500">
                    <Camera className="h-8 w-8 mb-2" />
                    <p className="text-center">
                        Drag and drop image(s) here, or click to select new files to add
                    </p>
                    <input
                        type="file"
                        id="newImages" // Changed ID for clarity
                        accept="image/*"
                        multiple // Allows multiple new file selection
                        onChange={handleNewFileChange}
                        className="hidden"
                    />
                    <label
                        htmlFor="newImages"
                        className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer"
                    >
                        Select New Image(s)
                    </label>
                </div>
            </div>

            {/* --- New Image Previews --- */}
            {newImagePreviewUrls.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-4 items-center justify-center border p-4 rounded-lg bg-yellow-50">
                    <p className="w-full text-center text-sm font-medium text-gray-600 mb-2">New Image Previews (Will be added on update):</p>
                    {newImagePreviewUrls.map((url, index) => (
                        <div key={url} className="relative group">
                            <Image
                                src={url}
                                alt={`New Image Preview ${index + 1}`}
                                width={100}
                                height={100}
                                className="rounded-md object-cover border border-gray-300"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveNewImage(index)}
                                className="absolute top-0 right-0 -mt-2 -mr-2 p-1 bg-gray-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Remove new image"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            {loading && <div className="text-center text-green-600">Updating...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}

            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100"
                    onClick={onClose}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white rounded-md bg-green-600 hover:bg-green-700"
                    disabled={loading}
                >
                    Update Crop Record
                </button>
            </div>
        </form>
    );
};