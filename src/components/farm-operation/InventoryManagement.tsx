import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Leaf, Heart, FileText, HardHat, Grid, X, TriangleAlert, CheckCircle, ListFilter, LayoutGrid, LayoutList, Download, Loader2 } from 'lucide-react';
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
    
    // NEW: State for update/delete loading
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<{ [key: string]: boolean }>({});
    
    const [inventoryItems, setInventoryItems] = useState<UnifiedInventoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    
    // Initial state setup
    const [formData, setFormData] = useState<NewInventoryItemData>({
        category: 'seeds',
        name: '',
        quantity: 0,
        reorderLevel: 0,
        // Assuming your UnifiedInventoryItem includes these optional fields with null/undefined defaults
        // Setting to default/empty values for consistency.
        type: '', // For Feed Type
        usageRate: 0,
        expireDate: '',
        n: 0,
        p: 0,
        k: 0,
        feedType: '', // For Feed Category

        toolData: {
            brand: '',
            price: '' as unknown as number,
            condition: '',
        } as unknown as ToolData,
        equipmentPartData: {
            model: '',
            price: '' as unknown as number,
        } as unknown as EquipmentPartData,
    } as unknown as NewInventoryItemData); 

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

    // --- LOGIC FOR SEARCH AND DISPLAY ---

    const getItemsToDisplay = useMemo(() => {
        let filteredItems = inventoryItems.filter(item => item.category === activeInventoryTab);

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredItems = filteredItems.filter(item => {
                if (item.name.toLowerCase().includes(term)) return true;

                if (item.category === 'tools' && item.toolData) {
                    return Object.values(item.toolData).some(val => 
                        typeof val === 'string' && val.toLowerCase().includes(term));
                }
                
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
            type: '',
            usageRate: 0,
            expireDate: '',
            n: 0,
            p: 0,
            k: 0,
            feedType: '',
            toolData: {
                brand: '',
                price: '' as unknown as number,
                condition: '',
            } as unknown as ToolData,
            equipmentPartData: {
                model: '',
                price: '' as unknown as number,
            } as unknown as EquipmentPartData,
        } as unknown as NewInventoryItemData);
    };

    /**
     * Utility function to clean and parse a value for numeric fields.
     * Returns an empty string if the input is cleared (for display in form).
     * Returns a number (0 if invalid) otherwise (for storage/logic).
     */
    const cleanAndParseNumber = (value: string | number): number | string => {
        if (typeof value === 'number') return value;
        if (value.trim() === '') return ''; 

        // Remove non-numeric characters (except the decimal point) before parsing
        const cleanValue = String(value).replace(/[^0-9.]/g, '');
        const parsedNumber = parseFloat(cleanValue); 
        
        // Return 0 if parsing results in NaN, otherwise return the number.
        return isNaN(parsedNumber) ? 0 : parsedNumber;
    };


    /**
     * Creates a generic input handler that works for state that can be null (Update).
     */
    const createUpdateInputHandler = <T extends UpdateInventoryItemData>(
        targetFormData: React.Dispatch<React.SetStateAction<T | null>>
    ) => {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            
            targetFormData(prev => {
                if (!prev) return null;

                // Fields that should be treated as numbers. 
                const numericKeys = ['quantity', 'reorderLevel', 'n', 'p', 'k', 'price', 'usageRate'];

                const newFormData: FormDataType = { ...prev };
                
                if (name.includes('.')) {
                    const [parentKey, childKey] = name.split('.');
                    
                    const parentObject = (newFormData[parentKey] as FormDataType) || {};

                    if (typeof parentObject === 'object' && parentObject !== null) {
                        const isNumeric = numericKeys.includes(childKey);
                        
                        parentObject[childKey] = isNumeric 
                            ? cleanAndParseNumber(value)
                            : value;

                        (newFormData[parentKey] as any) = { ...parentObject }; 
                    }
                } 
                else {
                    const isNumeric = numericKeys.includes(name);
                    
                    (newFormData[name as keyof T] as FormValue) = isNumeric
                        ? cleanAndParseNumber(value)
                        : value;
                }
                
                // Use a non-type-checked assertion for T since the fields are updated dynamically
                return newFormData as unknown as T; 
            });
        };
    };

    /**
     * Specific input handler for formData (which is never null).
     */
    const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const numericKeys = ['quantity', 'reorderLevel', 'n', 'p', 'k', 'price', 'usageRate'];
            const newFormData: FormDataType = { ...prev };

            if (name.includes('.')) {
                const [parentKey, childKey] = name.split('.');
                const parentObject = (newFormData[parentKey] as FormDataType) || {};

                if (typeof parentObject === 'object' && parentObject !== null) {
                    const isNumeric = numericKeys.includes(childKey);
                    
                    parentObject[childKey] = isNumeric 
                        ? cleanAndParseNumber(value)
                        : value;

                    (newFormData[parentKey] as any) = { ...parentObject }; 
                }
            } else {
                const isNumeric = numericKeys.includes(name);
                
                (newFormData[name as keyof NewInventoryItemData] as FormValue) = isNumeric
                    ? cleanAndParseNumber(value)
                    : value;
            }
            return newFormData as NewInventoryItemData;
        });
    };
    
    const handleUpdateInputChange = createUpdateInputHandler(setUpdateFormData);


    const processPayload = <T extends BaseFormData>(data: T): T => {
        // Recursively convert empty strings in numeric fields back to 0 for API submission
        return JSON.parse(JSON.stringify(data), (key, value) => {
            // Apply this logic to all fields that should be numbers in the final payload
            if (['quantity', 'reorderLevel', 'n', 'p', 'k', 'price', 'usageRate'].includes(key) && value === '') {
                return 0;
            }
            // Ensure any string fields that were empty remain empty strings, not null/undefined
            return value;
        }) as T;
    }

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Note: No loading state here, as it's a quick modal submit
            const payload: NewInventoryItemData = processPayload(formData);
            const newItem = await createInventoryItem(payload);
            setInventoryItems((prev) => [...prev, newItem]);
            setShowAddItemModal(false);
        } catch (err) {
            console.error("Failed to add item:", err);
        }
    };

    const handleUpdateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!updateFormData || isUpdating) return;
        
        setIsUpdating(true); // Start loading
        try {
            const payload: UpdateInventoryItemData = processPayload(updateFormData);
            const updatedItem = await updateInventoryItem(updateFormData.id, payload);
            setInventoryItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
            setShowUpdateModal(false);
            setUpdateFormData(null);
        } catch (err) {
            console.error('Failed to update item:', err);
        } finally {
            setIsUpdating(false); // Stop loading
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (isDeleting[id]) return;

        setIsDeleting(prev => ({ ...prev, [id]: true })); // Start loading
        try {
            await deleteInventoryItem(id);
            setInventoryItems(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            console.error('Failed to delete item:', err);
        } finally {
            setIsDeleting(prev => ({ ...prev, [id]: false })); // Stop loading
        }
    };
    
    const handleUpdateClick = (item: UnifiedInventoryItem) => {
        // Deep clone the item to avoid modifying the array state directly
        const prepareItemForForm = (i: UnifiedInventoryItem): UpdateInventoryItemData => {
            const copy = JSON.parse(JSON.stringify(i));
            
            // Helper to convert 0 or '0' values to an empty string for form pre-filling.
            const setZeroToEmptyString = (obj: any, key: string) => {
                if (obj && (obj[key] === 0 || obj[key] === '0')) {
                    obj[key] = '';
                }
            };
            
            // Core numeric fields
            setZeroToEmptyString(copy, 'quantity');
            setZeroToEmptyString(copy, 'reorderLevel');
            setZeroToEmptyString(copy, 'usageRate');
            setZeroToEmptyString(copy, 'n'); // FIX: Ensure N-P-K prefill correctly
            setZeroToEmptyString(copy, 'p');
            setZeroToEmptyString(copy, 'k');

            // Nested fields
            if (copy.toolData) {
                setZeroToEmptyString(copy.toolData, 'price');
            }
            if (copy.equipmentPartData) {
                setZeroToEmptyString(copy.equipmentPartData, 'price');
            }
            
            // FIX: Ensure feedType (and any other select/string fields that default to '') is set correctly.
            // If the value is null or undefined, set it to an empty string for the select box default.
            if (copy.feedType === null || copy.feedType === undefined) {
                copy.feedType = '';
            }
            
            return copy as UpdateInventoryItemData;
        };

        setUpdateFormData(prepareItemForForm(item));
        setShowUpdateModal(true);
    };

    // --- UTILITIES FOR RENDERING ---
    
    const getItemStatus = (item: UnifiedInventoryItem): string => {
        const quantity = item.quantity ?? 0;
        const reorderLevel = item.reorderLevel ?? 0; 
        
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

    
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${day}-${month}-${year}`;
    };


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
                        const isItemDeleting = isDeleting[item.id];
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
                                    
                                    {item.usageRate !== undefined && item.usageRate !== null && (
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
                                        disabled={isItemDeleting} // Disable while deleting
                                        className="text-sm font-medium text-red-600 hover:underline disabled:text-gray-500 disabled:cursor-not-allowed"
                                    >
                                        {isItemDeleting ? (
                                            <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                                        ) : (
                                            'Delete'
                                        )}
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
                    {renderFormFields(formData, handleAddInputChange)}
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
                            <button 
                                type="submit" 
                                disabled={isUpdating} // Disable while updating
                                className="w-full flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
                            >
                                {isUpdating ? (
                                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Updating...</>
                                ) : (
                                    `Update ${updateFormData?.category}`
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default InventoryManagement;