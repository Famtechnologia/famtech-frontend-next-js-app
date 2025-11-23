import { useState } from "react";
import { Warehouse, MapPin, Package, Trash2, Edit, Loader2 } from "lucide-react";

// --- Custom Confirmation Modal Component (Remains the same) ---
const ConfirmDeleteModal = ({ warehouseName, onConfirm, onCancel, isLoading }) => {
    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={onCancel}
        >
            <div 
                className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-6 space-y-5 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center space-x-3">
                    <Trash2 className="h-6 w-6 text-red-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
                </div>
                <p className="text-gray-600 text-sm">
                    Are you sure you want to permanently delete the warehouse <b>{warehouseName}</b>? This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Deleting...
                            </>
                        ) : (
                            "Delete"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- WarehouseCard Component ---

// CHANGE 1: Added onViewDetails to the destructured props
const WarehouseCard = ({ warehouse, onEdit, onDelete, onViewDetails }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleTriggerDelete = (e) => {
        e.stopPropagation();
        setIsConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        setIsConfirmOpen(false);
        
        try {
            await onDelete(warehouse.id); 
        } catch (error) {
            console.error("Error deleting warehouse:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setIsConfirmOpen(false);
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        onEdit(warehouse);
    };
    
    // NEW HANDLER: Function to handle the "View Details" click
    const handleViewDetailsClick = () => {
        if (onViewDetails) {
            onViewDetails(warehouse);
        } else {
            // Fallback to onEdit if no separate view handler is provided
            onEdit(warehouse);
        }
    };


    const productCount = warehouse.products?.length || 0;
    const totalQuantity = warehouse.products?.reduce((sum, product) => sum + (product.quantity || 0), 0) || 0;

    return (
        <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
            
            {/* Confirmation Modal Render */}
            {isConfirmOpen && (
                <ConfirmDeleteModal
                    warehouseName={warehouse.name}
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleDeleteCancel}
                    isLoading={isDeleting}
                />
            )}

            <div className="p-5 flex-1">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                       
                        <div>
                            <h3 className="font-semibold text-gray-900 text-2xl leading-tight">
                                {warehouse.name}
                            </h3>
                        </div>
                    </div>
                    
                    {/* Action Icons */}
                    <div className="flex gap-1">
                        <button
                            onClick={handleEditClick}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                            title="Edit Warehouse"
                        >
                            <Edit className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleTriggerDelete}
                            disabled={isDeleting}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                            title="Delete Warehouse"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Info Section (Remains the same) */}
                <div className="space-y-2.5">
                    {/* ... other info ... */}
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                        <MapPin className="h-5 w-5 text-gray-500" />
                        <span className="truncate text-lg">{warehouse.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                        <Package className="h-5 w-5 text-gray-500" />
                        <span className="text-lg">Capacity: <span className="font-medium  text-gray-900">{warehouse.capacity}</span></span>
                    </div>
                    
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                        <div className="h-4 w-4 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                        </div>
                        <span className="text-lg">
                            Products: <span className="font-medium text-gray-900">{productCount}</span> 
                            <span className="text-gray-400 mx-1">|</span> 
                            Total Qty: <span className="font-medium text-gray-900">{totalQuantity}</span>
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                        <div className="h-4 w-4 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                        </div>
                        <span className="text-lg">Manager: <span className="font-medium text-gray-900">{warehouse.manager}</span></span>
                    </div>
                </div>
            </div>

            {/* Footer / Action Button */}
            <div className="p-4 border-t border-gray-100 mt-auto">
                <button
                    // CHANGE 2: Call the new handler
                    onClick={handleViewDetailsClick} 
                    className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                    View Details
                </button>
            </div>
        </div>
    );
};

export default WarehouseCard;