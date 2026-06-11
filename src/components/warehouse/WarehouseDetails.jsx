import { X, MapPin, Package, Calendar, Tag } from "lucide-react";

const WarehouseDetails = ({ warehouse, onClose }) => {
  if (!warehouse) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative border border-slate-100 animate-in zoom-in-95 duration-200">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-xl transition-all"
        title="Close details"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-green-50 rounded-xl">
          <Package className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Warehouse Details</h2>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-0.5">Location Information</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100/50">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Warehouse Name</p>
            <p className="text-sm font-bold text-slate-800">{warehouse.name}</p>
          </div>
          <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100/50">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Capacity</p>
            <p className="text-sm font-bold text-slate-800">{warehouse.capacity} kg</p>
          </div>
          <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100/50 col-span-2 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</p>
              <p className="text-sm font-semibold text-slate-700">{warehouse.location}</p>
            </div>
          </div>
        </div>

        {/* Products List Section */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Tag className="h-4 w-4 text-slate-400" />
            Stock Products ({warehouse.products?.length || 0})
          </h3>
          
          {warehouse.products && warehouse.products.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {warehouse.products.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50/30 hover:bg-slate-50/70 border border-slate-100 rounded-xl transition-colors">
                  <span className="text-sm font-semibold text-slate-700">{p.name}</span>
                  <span className="text-xs font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-100">
                    {p.quantity} {p.unit}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-50/30 border border-dashed border-slate-200 rounded-xl">
              <p className="text-sm text-slate-400 font-medium">No products currently stored in this location.</p>
            </div>
          )}
        </div>

        {/* Description Section */}
        {warehouse.description && (
          <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100/50">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</p>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">{warehouse.description}</p>
          </div>
        )}

        {/* Footer info */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 pt-4 border-t border-slate-100">
          <Calendar className="h-4 w-4" />
          <span>Created on {formatDate(warehouse.createdAt || warehouse.timestamp)}</span>
        </div>
      </div>
    </div>
  );
};

export default WarehouseDetails;
