import { useState } from "react";
import { MapPin, Package, Trash2, Edit, Loader2 } from "lucide-react";

const ConfirmDeleteModal = ({ warehouseName, onConfirm, onCancel, isLoading }) => {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={onCancel}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-5 animate-in zoom-in-95 duration-250 border border-slate-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-50 rounded-xl">
                        <Trash2 className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Confirm Deletion</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                    Are you sure you want to permanently delete the warehouse <span className="font-bold text-slate-800">{warehouseName}</span>? This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors text-sm font-semibold disabled:opacity-50 flex items-center justify-center"
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

const WarehouseCard = ({ warehouse, onEdit, onView, onDelete }) => {
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
            await onDelete(warehouse.id || warehouse._id);
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

    const productCount = warehouse.products?.length || 0;
    const totalQuantity = warehouse.products?.reduce((sum, product) => sum + (product.quantity || 0), 0) || 0;

    return (
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full relative group">
            {/* Top Indicator Strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-500 to-emerald-600 opacity-80" />

            {isConfirmOpen && (
                <ConfirmDeleteModal
                    warehouseName={warehouse.name}
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleDeleteCancel}
                    isLoading={isDeleting}
                />
            )}

            <div className="p-5 flex-1 pt-7">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div>
                            <h3 className="font-bold text-slate-800 text-xl leading-snug tracking-tight">
                                {warehouse.name}
                            </h3>
                        </div>
                    </div>

                    {/* Action Icons */}
                    <div className="flex gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={handleEditClick}
                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50/50 rounded-xl transition-all"
                            title="Edit Warehouse"
                        >
                            <Edit className="h-4.5 w-4.5" />
                        </button>
                        <button
                            onClick={handleTriggerDelete}
                            disabled={isDeleting}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50/50 rounded-xl transition-all disabled:opacity-50"
                            title="Delete Warehouse"
                        >
                            <Trash2 className="h-4.5 w-4.5" />
                        </button>
                    </div>
                </div>

                {/* Info Section  */}
                <div className="space-y-3 mt-4">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:text-green-600 transition-colors">
                            <MapPin className="h-4.5 w-4.5" />
                        </div>
                        <span className="truncate font-medium text-slate-700">{warehouse.location}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                            <Package className="h-4.5 w-4.5" />
                        </div>
                        <span className="font-medium text-slate-700">
                            Capacity: <span className="font-bold text-slate-900">{warehouse.capacity} kg</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                            <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                            </div>
                        </div>
                        <span className="font-medium text-slate-700">
                            Products: <span className="font-bold text-slate-900">{productCount}</span>
                            <span className="text-slate-300 mx-2">|</span>
                            Total Qty: <span className="font-bold text-slate-900">{totalQuantity}</span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-4 pt-0 mt-auto">
                <button
                    onClick={() => onView(warehouse)}
                    className="w-full py-2.5 px-4 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 font-semibold rounded-xl transition-all focus:outline-none focus:ring-4 focus:ring-green-100/50 text-sm"
                >
                    View Details
                </button>
            </div>
        </div>
    );
};

export default WarehouseCard;