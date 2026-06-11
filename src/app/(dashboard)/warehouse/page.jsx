'use client';
import { useState, useEffect } from "react";
import { Plus, Loader2, Search, Package } from "lucide-react";
import WarehouseCard from "@/components/warehouse/WarehouseCard";
import WarehouseForm from "@/components/warehouse/WarehouseForm";
import WarehouseDetails from "@/components/warehouse/WarehouseDetails";
import { toast } from "react-hot-toast";

import { 
  getAllWarehouses, 
  createWarehouse, 
  updateWarehouse, 
  deleteWarehouse 
} from "@/lib/services/warehouse";
import { useAuth } from "@/lib/hooks/useAuth";
import { useProfile } from "@/lib/hooks/useProfile";

const Warehouse = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfile();

  const [warehouses, setWarehouses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [viewMode, setViewMode] = useState(null); // "view" or "edit"
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch warehouses
  const fetchWarehouses = async () => {
    if (!profile?.id) return;
    try {
      setIsLoading(true);
      const data = await getAllWarehouses(profile.id);
      setWarehouses(data || []);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      toast.error("Failed to load warehouses.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.id && !authLoading) {
      fetchWarehouses();
    }
  }, [profile?.id, authLoading]);

  // Actions
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
        toast.success("Warehouse updated successfully!");
      } else {
        await createWarehouse({ ...formData, manager: profile.id });
        toast.success("Warehouse created successfully!");
      }

      setIsFormOpen(false);
      setSelectedWarehouse(null);
      fetchWarehouses();
    } catch (error) {
      console.error("Error saving warehouse:", error);

      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.msg ||
        (error.message?.includes("11000")
          ? "Warehouse name already exists."
          : "Failed to save warehouse.");

      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteWarehouse(id);
      toast.success("Warehouse deleted successfully");
      fetchWarehouses();
    } catch (error) {
      console.error("Error deleting warehouse:", error);
      toast.error("Failed to delete warehouse.");
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedWarehouse(null);
    setViewMode(null);
  };

  const filteredWarehouses = warehouses.filter(warehouse => 
    warehouse?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse?.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCapacity = warehouses.reduce((sum, w) => sum + (w.capacity || 0), 0);

  // Loading screen
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50/50">
        <Loader2 className="h-10 w-10 text-green-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans relative">
      <div className="container p-4 mx-auto max-w-7xl">
        
        {/* Header Block */}
        <div className="mb-6 bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Warehouse Overview
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Manage your inventory locations and stock levels.
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-green-100/50 w-full sm:w-auto"
          >
            <Plus className="h-4.5 w-4.5 mr-2" />
            Create Warehouse
          </button>
        </div>

        {/* Control bar */}
        {warehouses.length > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search warehouses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-green-100/50 focus:border-green-600 transition-all text-sm bg-white"
              />
            </div>
            
            <div className="flex gap-4 text-xs font-semibold text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-100/50 shadow-sm w-full md:w-auto justify-around">
              <div>
                Total Locations: <span className="text-slate-900 font-bold ml-1">{warehouses.length}</span>
              </div>
              <div className="border-l border-slate-200 h-4" />
              <div>
                Total Capacity: <span className="text-slate-900 font-bold ml-1">{totalCapacity.toLocaleString()} kg</span>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-green-600 animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Loading warehouses...</p>
            </div>
          ) : warehouses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-12 max-w-md mx-auto shadow-sm">
              <div className="bg-green-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No warehouses found</h3>
              <p className="text-slate-500 mb-6 text-sm mt-1.5 leading-relaxed">
                Establish and register your first warehouse site location to begin tracking capacity.
              </p>
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center justify-center px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Warehouse
              </button>
            </div>
          ) : filteredWarehouses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-8 max-w-md mx-auto shadow-sm">
              <p className="text-slate-500 text-base font-semibold">No matching warehouses found</p>
              <p className="text-slate-400 text-xs mt-1">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWarehouses.map((warehouse) => (
                <WarehouseCard
                  key={warehouse._id || warehouse.id}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm transition-all">
          {viewMode === "edit" ? (
            <WarehouseForm
              isOpen={isFormOpen}
              onClose={handleFormClose}
              onSubmit={handleFormSubmit}
              warehouse={selectedWarehouse}
              isLoading={isSubmitting}
            />
          ) : (
            <WarehouseDetails warehouse={selectedWarehouse} onClose={handleFormClose} />
          )}
        </div>
      )}
    </div>
  );
};

export default Warehouse;
