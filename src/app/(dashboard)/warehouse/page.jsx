'use client';
import { useState, useEffect } from "react";
import { Plus, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import WarehouseCard from "@/components/warehouse/WarehouseCard";
import WarehouseForm from "@/components/warehouse/WarehouseForm";
import WarehouseDetails from "@/components/warehouse/WarehouseDetails";
import { 
  getAllWarehouses, 
  createWarehouse, 
  updateWarehouse, 
  deleteWarehouse 
} from "@/lib/services/warehouse";
import { useAuth } from "@/lib/hooks/useAuth";

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isError = type === "error";
  return (
    <div
      className={`fixed top-4 right-4 z-[60] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 animate-in slide-in-from-right-5 ${
        isError
          ? "bg-red-50 border-red-200 text-red-800"
          : "bg-green-50 border-green-200 text-green-800"
      }`}
    >
      {isError ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
      <p className="font-medium text-sm">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

const Warehouse = () => {
  const { user, loading: authLoading } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [viewMode, setViewMode] = useState(null); // "view" or "edit"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => setToast({ show: true, message, type });
  const closeToast = () => setToast((prev) => ({ ...prev, show: false }));

  const fetchWarehouses = async () => {
    if (!user?._id) return;
    try {
      setIsLoading(true);
      const data = await getAllWarehouses(user._id);
      setWarehouses(data);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      showToast("Failed to load warehouses.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id && !authLoading) {
      fetchWarehouses();
    }
  }, [user?._id, authLoading]);

  const handleCreateNew = () => {
    setSelectedWarehouse(null);
    setViewMode("edit");
    setIsFormOpen(true);
  };

  const handleEdit = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setViewMode("edit");
    setIsFormOpen(true);
  };

  const handleView = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setViewMode("view");
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);

      if (selectedWarehouse) {
        const warehouseId = selectedWarehouse.id || selectedWarehouse._id;
        await updateWarehouse(warehouseId, formData);
        showToast("Warehouse updated successfully!");
      } else {
        await createWarehouse({ ...formData, manager: user._id });
        showToast("Warehouse created successfully!");
      }

      setIsFormOpen(false);
      setSelectedWarehouse(null);
      fetchWarehouses();
    } catch (error) {
      console.error("Error saving warehouse:", error);
      const errorMsg =
        error.response?.data?.msg ||
        error.response?.data?.message ||
        "Failed to save warehouse.";
      showToast(errorMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteWarehouse(id);
      showToast("Warehouse deleted successfully");
      fetchWarehouses();
    } catch (error) {
      console.error("Error deleting warehouse:", error);
      showToast("Failed to delete warehouse.", "error");
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedWarehouse(null);
    setViewMode(null);
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-10 w-10 text-green-600 animate-spin mb-4" />
        <p className="text-gray-500">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans relative">
      {toast.show && <Toast {...toast} onClose={closeToast} />}

      <div className="container p-0 mx-0 md:mx-auto md:px-4 md:py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Warehouse Overview
              </h1>
              <p className="text-gray-500 mt-1">
                Manage your inventory locations and stock levels.
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center justify-center md:w-30 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Plus className="h-5 w-5 md:mr-2" />
              New
            </button>
          </div>
        </div>

        <div className="mb-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-green-600 animate-spin mb-4" />
              <p className="text-gray-500">Loading warehouses...</p>
            </div>
          ) : warehouses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300 shadow-sm">
              <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No warehouses found</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto mt-2">
                Get started by creating your first warehouse.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {warehouses.map((warehouse) => (
                <WarehouseCard
                  key={warehouse._id}
                  warehouse={warehouse}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all">
          {viewMode === "edit" ? (
            <WarehouseForm
              isOpen={isFormOpen}
              onClose={handleFormClose}
              onSubmit={handleFormSubmit}
              warehouse={selectedWarehouse}
              isLoading={isSubmitting}
            />
          ) : (
            <WarehouseDetails
              warehouse={selectedWarehouse}
              onClose={handleFormClose}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Warehouse;
