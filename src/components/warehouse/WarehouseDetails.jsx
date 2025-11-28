import { X } from "lucide-react";

const WarehouseDetails = ({ warehouse, onClose }) => {
  if (!warehouse) return null;

  return (
    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
      >
        <X className="h-5 w-5" />
      </button>

      <h2 className="text-2xl  text-green-500 font-semibold mb-4">Warehouse Details</h2>

      <div className="space-y-3 text-gray-800">
        <p><strong>Name:</strong> {warehouse.name}</p>
        <p><strong>Location:</strong> {warehouse.location}</p>
        <p><strong>Capacity:</strong> {warehouse.capacity} kg</p>

        {warehouse.products && warehouse.products.length > 0 && (
          <div>
            <strong>Products:</strong>
            <ul className="list-disc pl-6 mt-1">
              {warehouse.products.map((p, i) => (
                <li key={i}>
                  {p.name} — {p.quantity} {p.unit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {warehouse.description && (
          <p><strong>Description:</strong> {warehouse.description}</p>
        )}

        <p><strong>Created:</strong> {new Date(warehouse.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default WarehouseDetails;
