import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Leaf, Heart, FileText, HardHat, Grid, X, TriangleAlert, CheckCircle, ListFilter, LayoutGrid, LayoutList, Download } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import { InventoryItem, SeedItem, FeedItem, FertilizerItem, ToolItem, EquipmentPartItem, } from '@/types/inventory';
import { getInventoryItems, createInventoryItem, deleteInventoryItem, updateInventoryItem } from '@/lib/services/inventory';

// Create a union type for all possible new item data, excluding generated fields
type NewInventoryItemData =
  | (Omit<SeedItem, 'id' | 'timestamp'> & { category: 'seeds' })
  | (Omit<FeedItem, 'id' | 'timestamp'> & { category: 'feed' })
  | (Omit<FertilizerItem, 'id' | 'timestamp'> & { category: 'fertilizer' })
  | (Omit<ToolItem, 'id' | 'timestamp'> & { category: 'tools' })
  | (Omit<EquipmentPartItem, 'id' | 'timestamp'> & { category: 'equipment parts' });



// Create a union type for all possible updated item data, including generated fields
type UpdateInventoryItemData =
    SeedItem | FeedItem | FertilizerItem | ToolItem | EquipmentPartItem;

const InventoryManagement: React.FC = () => {
    const [activeInventoryTab, setActiveInventoryTab] = useState<string>('seeds');
    const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);
    const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
   const [formData, setFormData] = useState<NewInventoryItemData>(
  // your initial state, e.g.:
  { category: 'seeds', name: '', quantity: 0, reorderLevel: 0 } as NewInventoryItemData
);
    const [updateFormData, setUpdateFormData] = useState<UpdateInventoryItemData | null>(null);

    useEffect(() => {
        fetchInventoryItems();
    }, []);

    const fetchInventoryItems = async () => {
        try {
            setLoading(true);
            setError(null);
            const items = await getInventoryItems();
            setInventoryItems(items);
        } catch (err) {
            setError('Failed to fetch inventory items');
            console.error('Failed to fetch inventory items:', err);
        } finally {
            setLoading(false);
        }
    };

    const getItemsToDisplay = useMemo(() => {
        let filteredItems = inventoryItems.filter(item => item.category === activeInventoryTab);

        if (searchTerm) {
            filteredItems = filteredItems.filter(item => {
                // Handle nested `toolData` and `equipmentPartData` for search
                if ('tool' in item) {
                    return item.name.toLowerCase().includes(searchTerm.toLowerCase());
                }
                if ('equipmentPart' in item) {
                    return item.name.toLowerCase().includes(searchTerm.toLowerCase());
                }
                // For other items, search the top-level 'name' property
                return item.name.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }

        return filteredItems;
    }, [inventoryItems, activeInventoryTab, searchTerm]);

    const handleTabChange = (category: string) => {
        setActiveInventoryTab(category);
        setFormData({
            category: category,
            name: '',
            quantity: 0,
            reorderLevel: 0,
        } as NewInventoryItemData);
    };
type FormDataType = Record<string, string | number | null | undefined>;
   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
        // Use FormDataType for the local variable to allow dynamic assignment
        const newFormData: FormDataType = { ...prev, [name]: value };
        
        // Use a type guard for the keys that should be numbers
        if (name === 'quantity' || name === 'reorderLevel' || name === 'n' || name === 'p' || name === 'k') {
            newFormData[name] = Number(value);
        }
        
        // Assert the final result back to the expected specific type
        return newFormData as NewInventoryItemData;
    });
};

const handleUpdateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUpdateFormData(prev => {
        if (!prev) return null;
        
        // Use FormDataType for the local variable to allow dynamic assignment
        const newFormData: FormDataType = { ...prev, [name]: value };
        
        // Use a type guard for the keys that should be numbers
        if (name === 'quantity' || name === 'reorderLevel' || name === 'n' || name === 'p' || name === 'k') {
            newFormData[name] = Number(value);
        }
        
        // Assert the final result back to the expected specific type
        return newFormData as unknown as UpdateInventoryItemData;
    });
};
   const handleCreateItem = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    // payload without id, since backend generates it
    let payload: Omit<InventoryItem, "id">;

    switch (formData.category) {
      case "tools": {
        // Narrow to ToolItem
        const {  ...toolData } = formData as ToolItem;
        payload = toolData;
        break;
      }
      case "equipment parts": {
        const {  ...equipmentPartsData } = formData as EquipmentPartItem;
        payload = equipmentPartsData;
        break;
      }
      case "fertilizer": {
        const {  ...fertilizerData } = formData as FertilizerItem;
        payload = fertilizerData;
        break;
      }
      case "feed": {
        const {  ...feedData } = formData as FeedItem;
        payload = feedData;
        break;
      }
      default: {
        const {  ...seedData } = formData as SeedItem;
        payload = seedData;
      }
    }

    const newItem = await createInventoryItem(payload);
    setInventoryItems((prev) => [...prev, newItem]);
    setShowAddItemModal(false);
  } catch (err) {
    console.error("Failed to add item:", err);
  }
};

    const handleUpdateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!updateFormData) return;
        try {
            const updatedItem = await updateInventoryItem(updateFormData.id, updateFormData);
            setInventoryItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
            setShowUpdateModal(false);
            setUpdateFormData(null);
        } catch (err) {
            console.error('Failed to update item:', err);
        }
    };

    const handleDeleteItem = async (id: string) => {
        try {
            await deleteInventoryItem(id);
            setInventoryItems(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            console.error('Failed to delete item:', err);
        }
    };
    
    const handleUpdateClick = (item: InventoryItem) => {
        setUpdateFormData(item);
        setShowUpdateModal(true);
    };

    const getItemStatus = (item: InventoryItem): string => {
        // Handle nested quantity and reorderLevel for tools and equipment parts
        const quantity = ('toolData' in item) ? item.quantity : ('equipmentPartData' in item) ? item.quantity : item.quantity;
        const reorderLevel = ('toolData' in item) ? item.reorderLevel : ('equipmentPartData' in item) ? item.reorderLevel : item.reorderLevel;

        if (quantity === 0) return 'Out of Stock';
        if (quantity <= reorderLevel) return 'Low Stock';
        return 'In Stock';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Out of Stock': return 'bg-red-50 text-red-600';
            case 'Low Stock': return 'bg-yellow-50 text-yellow-600';
            case 'In Stock': return 'bg-green-50 text-green-600';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Out of Stock': return <X className="h-4 w-4 mr-1 text-red-600" />;
            case 'Low Stock': return <TriangleAlert className="h-4 w-4 mr-1 text-yellow-600" />;
            case 'In Stock': return <CheckCircle className="h-4 w-4 mr-1 text-green-600" />;
            default: return null;
        }
    };

    const renderFormFields = (
  data: NewInventoryItemData,
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
) => {
  switch (data.category)  {
            case 'seeds':
                const seedData = data as Omit<SeedItem, '_id' | 'timestamp'>;
                return (
                    <>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Seed Name</label>
                            <input type="text" id="name" name="name" required value={seedData.name} onChange={handleChange} className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., Maize Seeds" />
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity (kg)</label>
                            <input type="number" id="quantity" name="quantity" required value={seedData.quantity} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 250" />
                        </div>
                        <div>
                            <label htmlFor="reorderLevel" className="block text-sm font-medium text-gray-700">Reorder Level (kg)</label>
                            <input type="number" id="reorderLevel" name="reorderLevel" required value={seedData.reorderLevel} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 50" />
                        </div>
                        <div>
                            <label htmlFor="usageRate" className="block text-sm font-medium text-gray-700">Usage Rate (kg/week)</label>
                            <input type="text" id="usageRate" name="usageRate" value={seedData.usageRate || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 10" />
                        </div>
                        <div>
                            <label htmlFor="expireDate" className="block text-sm font-medium text-gray-700">Expiry Date</label>
                            <input type="date" id="expireDate" name="expireDate" value={seedData.expireDate || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" />
                        </div>
                    </>
                );
            case 'feed':
                const feedData = data as Omit<FeedItem, '_id' | 'timestamp'>;
                return (
                    <>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Feed Name</label>
                            <input type="text" id="name" name="name" required value={feedData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., Alfalfa Hay" />
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity (Bags)</label>
                            <input type="number" id="quantity" name="quantity" required value={feedData.quantity} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 50" />
                        </div>
                        <div>
                            <label htmlFor="reorderLevel" className="block text-sm font-medium text-gray-700">Reorder Level (Bags)</label>
                            <input type="number" id="reorderLevel" name="reorderLevel" required value={feedData.reorderLevel} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 10" />
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                            <select id="type" name="type" value={feedData.type} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm">
                                <option value="Concentrate">Concentrate</option>
                                <option value="Hay">Hay</option>
                                <option value="Silage">Silage</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="expireDate" className="block text-sm font-medium text-gray-700">Expiry Date</label>
                            <input type="date" id="expireDate" name="expireDate" value={feedData.expireDate || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" />
                        </div>
                    </>
                );
            case 'fertilizer':
                const fertData = data as Omit<FertilizerItem, '_id' | 'timestamp'>;
                return (
                    <>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Fertilizer Name</label>
                            <input type="text" id="name" name="name" required value={fertData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 10-10-10" />
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity (Bags)</label>
                            <input type="number" id="quantity" name="quantity" required value={fertData.quantity} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 20" />
                        </div>
                        <div>
                            <label htmlFor="reorderLevel" className="block text-sm font-medium text-gray-700">Reorder Level (Bags)</label>
                            <input type="number" id="reorderLevel" name="reorderLevel" required value={fertData.reorderLevel} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 5" />
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                            <select id="type" name="type" value={fertData.type} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm">
                                <option value="Liquid">Liquid</option>
                                <option value="Granular">Granular</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="n" className="block text-sm font-medium text-gray-700">Nitrogen (N %)</label>
                            <input type="number" id="n" name="n" value={fertData.n || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 10" />
                        </div>
                        <div>
                            <label htmlFor="p" className="block text-sm font-medium text-gray-700">Phosphorus (P %)</label>
                            <input type="number" id="p" name="p" value={fertData.p || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 10" />
                        </div>
                        <div>
                            <label htmlFor="k" className="block text-sm font-medium text-gray-700">Potassium (K %)</label>
                            <input type="number" id="k" name="k" value={fertData.k || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 10" />
                        </div>
                        <div>
                            <label htmlFor="expireDate" className="block text-sm font-medium text-gray-700">Expiry Date</label>
                            <input type="date" id="expireDate" name="expireDate" value={fertData.expireDate || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" />
                        </div>
                    </>
                );
            case 'tools':
                const toolData = data as Omit<ToolItem, ''>; // Cast for correct type inference
                return (
                    <>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tool Name</label>
                            <input type="text" id="name" name="name" required value={toolData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., Shovel" />
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity (Units)</label>
                            <input type="number" id="quantity" name="quantity" required value={toolData.quantity} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 5" />
                        </div>
                        <div>
                            <label htmlFor="reorderLevel" className="block text-sm font-medium text-gray-700">Reorder Level (Units)</label>
                            <input type="number" id="reorderLevel" name="reorderLevel" required value={toolData.reorderLevel} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 1" />
                        </div>
                    </>
                );
            case 'equipment parts':
                const equipmentPartData = data as Omit<EquipmentPartItem, ''>; // Cast for correct type inference
                return (
                    <>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Part Name</label>
                            <input type="text" id="name" name="name" required value={equipmentPartData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., Tractor Oil Filter" />
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity (Units)</label>
                            <input type="number" id="quantity" name="quantity" required value={equipmentPartData.quantity} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 3" />
                        </div>
                        <div>
                            <label htmlFor="reorderLevel" className="block text-sm font-medium text-gray-700">Reorder Level (Units)</label>
                            <input type="number" id="reorderLevel" name="reorderLevel" required value={equipmentPartData.reorderLevel} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 1" />
                        </div>
                        <div>
                            <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
                            <input type="text" id="model" name="model" required value={equipmentPartData.model} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., John Deere 404" />
                        </div>
                    </>
                );
            default:
                return null;
        }
    };
    const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${day}-${month}-${year}`;
};


    const inventoryTabs = [
        { name: 'Seeds', icon: <Leaf className="h-4 w-4 mr-2" />, value: 'seeds' },
        { name: 'Feed', icon: <Heart className="h-4 w-4 mr-2" />, value: 'feed' },
        { name: 'Fertilizer', icon: <FileText className="h-4 w-4 mr-2" />, value: 'fertilizer' },
        { name: 'Tools', icon: <HardHat className="h-4 w-4 mr-2" />, value: 'tools' },
        { name: 'Equipment Parts', icon: <Grid className="h-4 w-4 mr-2" />, value: 'equipment parts' },
    ];

    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading inventory...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 flex justify-center items-center min-h-96">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchInventoryItems}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-2 lg:p-6">
            <div className="flex flex-wrap items-center justify-start border-b border-gray-200 mb-6 -mt-2">
                {inventoryTabs.map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => handleTabChange(tab.value)}
                        className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200
                            ${activeInventoryTab === tab.value
                                ? 'border-b-2 border-green-600 text-green-700'
                                : 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-400'}`}
                    >
                        {tab.icon}
                        {tab.name}
                    </button>
                ))}
            </div>

            <div className="md:flex justify-between items-center space-y-4 mb-6">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search inventory..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                </div>
                <div className="flex flex-wrap items-center space-y-2 md:space-y-0 space-x-2 lg:space-x-4">
                    <button className="flex items-center px-4 py-2 text-sm font-medium text-green-600 rounded-md border border-green-600 hover:bg-green-50">
                        <ListFilter className="h-4 w-4 mr-2" />
                    </button>
                    <button className="flex items-center px-4 py-2 text-sm font-medium text-green-600 rounded-md border border-green-600 hover:bg-green-50">
                        <LayoutGrid className="h-4 w-4 mr-2" />
                    </button>
                    <button className="flex items-center px-4 py-2 text-sm font-medium text-green-600 rounded-md border border-green-600 hover:bg-green-50">
                        <LayoutList className="h-4 w-4 mr-2" />
                    </button>
                    <button className="flex items-center px-4 py-2 text-sm font-medium text-green-600 rounded-md border border-green-600 hover:bg-green-50">
                        <Download className="h-4 w-4 mr-2" />
                    </button>
                    <button onClick={() => setShowAddItemModal(true)} className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-md bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" /> Add Item
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {getItemsToDisplay.length > 0 ? (
                    getItemsToDisplay.map((item: InventoryItem) => {
                        const status = getItemStatus(item);
                        return (
                            <Card key={item.id}
                                title={
                                    'toolData' in item ? item.name :
                                        'equipmentPartData' in item ? item.name :
                                            item.name
                                }>
                                <div className="space-y-2">
                                    <p className="flex justify-between text-sm">
                                        <span className="text-gray-500">Quantity:</span>
                                        <span className="font-semibold text-gray-800">
                                            {'toolData' in item ? item.quantity :
                                                'equipmentPartData' in item ? item.quantity :
                                                    item.quantity}
                                        </span>
                                    </p>
                                    <p className="flex justify-between text-sm">
                                        <span className="text-gray-500">Reorder Level:</span>
                                        <span className="font-semibold text-gray-800">
                                            {'toolData' in item ? item.reorderLevel :
                                                'equipmentPartData' in item ? item.reorderLevel :
                                                    item.reorderLevel}
                                        </span>
                                    </p>
                                    {"usageRate" in item && item.usageRate && (
                                        <p className="flex justify-between text-sm">
                                            <span className="text-gray-500">Usage Rate:</span>
                                            <span className="font-semibold text-gray-800">{item.usageRate}</span>
                                        </p>
                                    )}
                                    {"expireDate" in item && item.expireDate && (
                                        <p className="flex justify-between text-sm">
                                            <span className="text-gray-500">Expiry Date:</span>
                                            <span className="font-semibold text-gray-800">
                                                {formatDate(item.expireDate)}
                                            </span>
                                        </p>
                                    )}

                                    {"type" in item && (
                                        <p className="flex justify-between text-sm">
                                            <span className="text-gray-500">Type:</span>
                                            <span className="font-semibold text-gray-800">{item.type}</span>
                                        </p>
                                    )}
                                    {"equipmentPartData" in item && (
                                        <p className="flex justify-between text-sm">
                                            <span className="text-gray-500">Model:</span>
                                            <span className="font-semibold text-gray-800">{item.model}</span>
                                        </p>
                                    )}
                                    {"n" in item && typeof item.n === 'number' && (
                                        <p className="flex justify-between text-sm">
                                            <span className="text-gray-500">N-P-K:</span>
                                            <span className="font-semibold text-gray-800">{item.n}-{item.p}-{item.k}</span>
                                        </p>
                                    )}
                                </div>
                                <div className={`mt-4 px-3 py-2 gap-1 rounded-full text-sm font-medium flex items-center justify-start ${getStatusColor(status)}`}>
                                    {getStatusIcon(status)}
                                    {status}
                                </div>
                                <div className="mt-4 flex justify-between">
                                    <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="text-sm font-medium text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                    <button onClick={() => handleUpdateClick(item)} className="text-sm font-medium text-green-600 hover:underline">
                                        Update
                                    </button>
                                </div>
                            </Card>
                        );
                    })
                ) : (
                    <div className="text-center py-12 col-span-full">
                        <p className="text-gray-500">No {activeInventoryTab} items found.</p>

                    </div>
                )}
            </div>

            <Modal show={showAddItemModal} onClose={() => setShowAddItemModal(false)} title={`Add New ${activeInventoryTab} Item`}>
                <form onSubmit={handleCreateItem} className="space-y-4">
                    {renderFormFields(formData, handleInputChange)}
                    <div className="pt-4 border-t border-gray-200">
                        <button type="submit" className="w-full flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700">
                            Save {activeInventoryTab}
                        </button>
                    </div>
                </form>
            </Modal>
            
            <Modal show={showUpdateModal} onClose={() => setShowUpdateModal(false)} title={`Update ${updateFormData?.name || ''}`}>
                {updateFormData && (
                    <form onSubmit={handleUpdateItem} className="space-y-4">
                        {renderFormFields(updateFormData, handleUpdateInputChange)}
                        <div className="pt-4 border-t border-gray-200">
                            <button type="submit" className="w-full flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700">
                                Update {updateFormData?.category}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default InventoryManagement;
