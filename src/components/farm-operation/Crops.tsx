import { useState, useEffect } from 'react';
import { Camera, TriangleAlert} from 'lucide-react';
import Image from 'next/image';

import {
     updateCropRecord, CropRecord,
    createCropRecord,} from '../../lib/services/croplivestock';


interface AddCropFormProps {
    onClose: () => void;
    onRecordAdded: () => void;
}

export const AddCropForm: React.FC<AddCropFormProps> = ({
    onClose,
    onRecordAdded,
}) => {
    const [formData, setFormData] = useState({
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

    // State to store the selected file objects (now an array)
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
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    // Updated handler to accept multiple files
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
        data.append("cropName", formData.cropName.toLowerCase());
        data.append("variety", formData.variety.toLowerCase());
        data.append("location", formData.location.toLowerCase());
        data.append("plantingDate", formData.plantingDate);
        data.append("expectedHarvestDate", formData.expectedHarvestDate.toLowerCase());
        data.append("currentGrowthStage", formData.currentGrowthStage.toLowerCase());
        data.append("healthStatus", formData.healthStatus.toLowerCase());
        data.append("area.value", formData.areaValue.toString());
        data.append("area.unit", formData.areaUnit);
        data.append("seedQuantity.value", formData.seedQuantityValue.toString());
        data.append("seedQuantity.unit", formData.seedQuantityUnit);
        data.append("note", formData.note);

        // Append each image file individually to the form data
        // Use the same field name as the backend expects (e.g., 'cropImages[]')
        imageFiles.forEach(file => {
            data.append('image', file);
        });

        try {
            await createCropRecord(data);
            onClose();
            onRecordAdded();
        } catch (err) {
            console.error("Failed to add crop record:", err);
            setError("Failed to add crop record. Please try again.");
        } finally {
            setLoading(false);
        }
    };

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
                        id="images" // Changed from 'image' to 'images' for clarity
                        accept="image/*"
                        onChange={handleFileChange}
                        multiple // Allows multiple file selection
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







interface UpdateCropFormProps {
  record: CropRecord;
  onClose: () => void;
  onRecordUpdated: () => void;
}

// Helper function to format date strings to YYYY-MM-DD
const formatDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const UpdateCropForm: React.FC<UpdateCropFormProps> = ({
  record,
  onClose,
  onRecordUpdated,
}) => {
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

  // Sync state if the record prop changes
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
  }, [record]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a preview URL for the selected image file
  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
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

    // Create the payload as a nested JSON object
    const payload = {
      cropName: formData.cropName,
      variety: formData.variety,
      location: formData.location,
      plantingDate: formData.plantingDate,
      expectedHarvestDate: formData.expectedHarvestDate,
      currentGrowthStage: formData.currentGrowthStage,
      healthStatus: formData.healthStatus,
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
      if (imageFile) {
        // If a new image is selected, send FormData with the image and payload
        const data = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            // Append nested objects as a single, stringified entry
            data.append(key, JSON.stringify(value));
          } else {
            data.append(key, value.toString());
          }
        });
        data.append('image', imageFile);

        await updateCropRecord(record.id, data);

      } else {
        // If no new image, send the clean JSON object
        await updateCropRecord(record.id, payload);
      }

      onClose();
      onRecordUpdated();
    } catch (err) {
      console.error('Update failed:', err);
      setError('Failed to update crop record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Existing image display */}
      {typeof record.image === 'string' && record.image && !imagePreviewUrl && (
        <div className="flex justify-center mb-4">
          <Image
            src={record.image}
            alt={record.cropName}
            width={200}
            height={200}
            className="rounded-lg object-cover"
          />
        </div>
      )}
      {/* New image preview */}
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

      {/* image upload */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">Crop Images</div>
        <div className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-gray-300 rounded-md text-gray-500">
          <Camera className="h-8 w-8 mb-2" />
          <p className="text-center">
            Drag and drop images here, or click to select files
          </p>
          <input
            type="file"
            id="image"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="image"
            className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer"
          >
            Select Images
          </label>
        </div>
      </div>

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