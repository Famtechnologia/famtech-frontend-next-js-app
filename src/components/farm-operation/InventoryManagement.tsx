import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Leaf, Heart, FileText, HardHat, Grid, X, TriangleAlert, CheckCircle, ListFilter, LayoutGrid, LayoutList, Download } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';

// Use UnifiedInventoryItem for all inventory data
import { UnifiedInventoryItem, ToolData, EquipmentPartData } from '@/types/inventory';
import { getInventoryItems, createInventoryItem, deleteInventoryItem, updateInventoryItem } from '@/lib/services/inventory';
import { renderFormFields } from './Render'; 


// --- NEW TYPE DEFINITIONS FOR STATE ---

// The structure for new item data (excluding generated fields like id, timestamp, userId)
type NewInventoryItemData = Omit<UnifiedInventoryItem, 'id' | 'timestamp' | 'userId'>;

// The structure for update data (must include 'id')
type UpdateInventoryItemData = UnifiedInventoryItem;

// Base type for form state used in the generic input handler
type BaseFormData = NewInventoryItemData | UpdateInventoryItemData;

// Helper type for safely updating state (allowing nested access)
type FormValue = string | number | null | undefined;
type FormDataType = Record<string, FormValue | ToolData | EquipmentPartData | undefined>;


const InventoryManagement: React.FC = () => {
    const [activeInventoryTab, setActiveInventoryTab] = useState<string>('seeds');
    const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);
    const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
    
    // Using UnifiedInventoryItem everywhere inventory is stored
    const [inventoryItems, setInventoryItems] = useState<UnifiedInventoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    
    // Initial state set to the structure of NewInventoryItemData
    const [formData, setFormData] = useState<NewInventoryItemData>({
        category: 'seeds',
        name: '',
        quantity: 0,
        reorderLevel: 0,
        toolData: {},
        equipmentPartData: {},
    } as NewInventoryItemData); 

    const [updateFormData, setUpdateFormData] = useState<UpdateInventoryItemData | null>(null);

    useEffect(() => {
        fetchInventoryItems();
    }, []);

    const fetchInventoryItems = async () => {
        try {
            setLoading(true);
            setError(null);
            // Assuming getInventoryItems now returns UnifiedInventoryItem[]
            const items = await getInventoryItems(); 
            setInventoryItems(items);
        } catch (err) {
            setError('Failed to fetch inventory items');
            console.error('Failed to fetch inventory items:', err);
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC FOR SEARCH AND DISPLAY ---

    const getItemsToDisplay = useMemo(() => {
        let filteredItems = inventoryItems.filter(item => item.category === activeInventoryTab);

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredItems = filteredItems.filter(item => {
                // Search top-level name
                if (item.name.toLowerCase().includes(term)) return true;

                // Search toolData fields
                if (item.category === 'tools' && item.toolData) {
                    return Object.values(item.toolData).some(val => 
                        typeof val === 'string' && val.toLowerCase().includes(term));
                }
                
                // Search equipmentPartData fields
                if (item.category === 'equipment parts' && item.equipmentPartData) {
                    return Object.values(item.equipmentPartData).some(val => 
                        typeof val === 'string' && val.toLowerCase().includes(term));
                }

                return false;
            });
        }

        return filteredItems;
    }, [inventoryItems, activeInventoryTab, searchTerm]);

    // --- HANDLERS ---

    const handleTabChange = (category: string) => {
        setActiveInventoryTab(category);
        setFormData({
            category: category as NewInventoryItemData['category'],
            name: '',
            quantity: 0,
            reorderLevel: 0,
            toolData: {},
            equipmentPartData: {},
        } as NewInventoryItemData);
    };

    /**
     * Creates a generic input handler that works for both formData (NewInventoryItemData)
     * and updateFormData (UnifiedInventoryItem).
     */
    const createInputHandler = <T extends BaseFormData>(
        targetFormData: React.Dispatch<React.SetStateAction<T | null>>
    ) => {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            
            targetFormData(prev => {
                if (!prev) return null;

                // Create a mutable copy of the previous state
                const newFormData: FormDataType = { ...prev };
                
                // Handle nested field updates (e.g., "toolData.brand")
                if (name.includes('.')) {
                    const [parentKey, childKey] = name.split('.');
                    
                    // Safely access and clone the nested object
                    const parentObject = newFormData[parentKey] as FormDataType;

                    if (typeof parentObject === 'object' && parentObject !== null) {
                        const isNumeric = ['quantity', 'reorderLevel', 'n', 'p', 'k', 'price'].includes(childKey);
                        
                        // Update the nested object property
                        parentObject[childKey] = isNumeric ? Number(value) : value;

                        // Reassign the spread object back to the parent key for immutability
                        (newFormData[parentKey] as any) = { ...parentObject }; 
                    }
                } 
                // Handle top-level field updates (e.g., "name", "quantity")
                else {
                    const isNumeric = ['quantity', 'reorderLevel', 'n', 'p', 'k'].includes(name);
                    (newFormData[name as keyof T] as FormValue) = isNumeric ? Number(value) : value;
                }
                
                // Return the updated state, asserted back to the generic type T
                return newFormData as T; 
            });
        };
    };

    const handleInputChange = createInputHandler(setFormData);
    const handleUpdateInputChange = createInputHandler(setUpdateFormData);


    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // formData already holds the correct structure (Omit<UnifiedInventoryItem, id|timestamp|userId>)
            const payload: NewInventoryItemData = formData; 

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
            // updateFormData already holds the complete UnifiedInventoryItem
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
    
    const handleUpdateClick = (item: UnifiedInventoryItem) => {
        setUpdateFormData(item);
        setShowUpdateModal(true);
    };

    // --- UTILITIES FOR RENDERING ---
    
    // Uses top-level quantity and reorderLevel from UnifiedInventoryItem
    const getItemStatus = (item: UnifiedInventoryItem): string => {
        if (item.quantity === 0) return 'Out of Stock';
        // reorderLevel is optional, use 0 as a default if null/undefined
        const reorderLevel = item.reorderLevel || 0; 

        if (item.quantity <= reorderLevel) return 'Low Stock';
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

    
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${day}-${month}-${year}`;
    };


    // Define the type to fix TS7034/TS7005
    type InventoryTab = {
        name: string;
        icon: React.ReactNode;
        value: string;
    };

    const inventoryTabs: InventoryTab[] = [
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
                        <ListFilter className="h-4 w-4 mr-2" /> Filter
                    </button>
                    <button className="flex items-center px-4 py-2 text-sm font-medium text-green-600 rounded-md border border-green-600 hover:bg-green-50">
                        <LayoutGrid className="h-4 w-4 mr-2" /> Grid
                    </button>
                    <button className="flex items-center px-4 py-2 text-sm font-medium text-green-600 rounded-md border border-green-600 hover:bg-green-50">
                        <LayoutList className="h-4 w-4 mr-2" /> List
                    </button>
                    <button className="flex items-center px-4 py-2 text-sm font-medium text-green-600 rounded-md border border-green-600 hover:bg-green-50">
                        <Download className="h-4 w-4 mr-2" /> Export
                    </button>
                    <button onClick={() => setShowAddItemModal(true)} className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-md bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" /> Add Item
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {getItemsToDisplay.length > 0 ? (
                    getItemsToDisplay.map((item: UnifiedInventoryItem) => {
                        const status = getItemStatus(item);
                        return (
                            <Card key={item.id} title={item.name}>
                                <div className="space-y-2">
                                    <p className="flex justify-between text-sm">
                                        <span className="text-gray-500">Quantity:</span>
                                        <span className="font-semibold text-gray-800">{item.quantity}</span>
                                    </p>
                                    <p className="flex justify-between text-sm">
                                        <span className="text-gray-500">Reorder Level:</span>
                                        <span className="font-semibold text-gray-800">{item.reorderLevel ?? 0}</span>
                                    </p>
                                    
                                    {item.usageRate && (
                                        <p className="flex justify-between text-sm">
                                            <span className="text-gray-500">Usage Rate:</span>
                                            <span className="font-semibold text-gray-800">{item.usageRate}</span>
                                        </p>
                                    )}
                                    {item.expireDate && (
                                        <p className="flex justify-between text-sm">
                                            <span className="text-gray-500">Expiry Date:</span>
                                            <span className="font-semibold text-gray-800">
                                                {formatDate(item.expireDate)}
                                            </span>
                                        </p>
                                    )}

                                    {item.type && (
                                        <p className="flex justify-between text-sm">
                                            <span className="text-gray-500">Type:</span>
                                            <span className="font-semibold text-gray-800">{item.type}</span>
                                        </p>
                                    )}
                                    {item.equipmentPartData && item.equipmentPartData.model && (
                                        <p className="flex justify-between text-sm">
                                            <span className="text-gray-500">Model:</span>
                                            <span className="font-semibold text-gray-800">{item.equipmentPartData.model}</span>
                                        </p>
                                    )}
                                    {typeof item.n === 'number' && typeof item.p === 'number' && typeof item.k === 'number' && (
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